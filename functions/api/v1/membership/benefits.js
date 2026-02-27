import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import {
  fetchMembershipStatus,
  getUserFromAccessToken,
  listMemberBenefitOffers,
  listRecentSessions,
  listRecentWrongAttempts,
} from '../../../_lib/supabase_server.js';

function isMembershipActive(record) {
  if (!record) return false;
  if (String(record.status || '').toLowerCase() !== 'active') return false;
  if (!record.period_end) return true;
  const until = new Date(record.period_end).getTime();
  if (Number.isNaN(until)) return true;
  return until > Date.now();
}

function toPositiveInteger(value, fallbackValue = 0) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallbackValue;
  return Math.floor(num);
}

function normalizeSkillPrefixes(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);
}

function parseOfferTrigger(rawMetadata) {
  const metadata = rawMetadata && typeof rawMetadata === 'object' ? rawMetadata : {};
  const trigger = metadata.trigger && typeof metadata.trigger === 'object'
    ? metadata.trigger
    : metadata;

  const skillTagPrefixes = normalizeSkillPrefixes(trigger.skill_tag_prefixes);
  const minRecentWrongAttempts = toPositiveInteger(trigger.min_recent_wrong_attempts, 0);
  const minRecentSessions = toPositiveInteger(trigger.min_recent_sessions, 0);
  const lookbackDays = Math.max(1, toPositiveInteger(trigger.lookback_days, 60));
  const minMatchingWrongAttempts = toPositiveInteger(
    trigger.min_matching_wrong_attempts,
    skillTagPrefixes.length ? 1 : 0
  );
  const reasonLabel = String(trigger.reason_label || metadata.reason_label || '').trim();

  return {
    skillTagPrefixes,
    minRecentWrongAttempts,
    minRecentSessions,
    lookbackDays,
    minMatchingWrongAttempts,
    reasonLabel: reasonLabel || null,
  };
}

function isWithinDays(isoString, days) {
  const createdMs = new Date(isoString || '').getTime();
  if (!Number.isFinite(createdMs)) return false;
  const cutoffMs = Date.now() - (days * 24 * 60 * 60 * 1000);
  return createdMs >= cutoffMs;
}

function countRecentSessions(rows, days) {
  return rows.reduce((count, row) => {
    return count + (isWithinDays(row.started_at, days) ? 1 : 0);
  }, 0);
}

function countWrongAttempts(rows, days, skillTagPrefixes = []) {
  let total = 0;
  let matching = 0;

  rows.forEach((row) => {
    if (!isWithinDays(row.created_at, days)) return;
    total += 1;

    if (!skillTagPrefixes.length) {
      matching += 1;
      return;
    }

    const skillTag = String(row.skill_tag || '').trim().toLowerCase();
    if (!skillTag) return;
    if (skillTagPrefixes.some((prefix) => skillTag.startsWith(prefix))) {
      matching += 1;
    }
  });

  return { total, matching };
}

function evaluateOfferEligibility(offer, wrongAttempts, sessions) {
  const trigger = parseOfferTrigger(offer?.metadata || {});
  const hasTriggerRule = (
    trigger.minRecentWrongAttempts > 0
    || trigger.minRecentSessions > 0
    || trigger.minMatchingWrongAttempts > 0
    || trigger.skillTagPrefixes.length > 0
  );

  if (!hasTriggerRule) {
    return {
      eligible: true,
      code: 'active_member_default',
      reason: 'Active member default offer.',
      metrics: {
        lookback_days: trigger.lookbackDays,
        recent_sessions: countRecentSessions(sessions, trigger.lookbackDays),
        recent_wrong_attempts: countWrongAttempts(wrongAttempts, trigger.lookbackDays).total,
      },
    };
  }

  const recentSessions = countRecentSessions(sessions, trigger.lookbackDays);
  const wrongCounts = countWrongAttempts(wrongAttempts, trigger.lookbackDays, trigger.skillTagPrefixes);

  if (recentSessions < trigger.minRecentSessions) {
    return {
      eligible: false,
      code: 'insufficient_recent_sessions',
      reason: `Need at least ${trigger.minRecentSessions} recent sessions.`,
      metrics: {
        lookback_days: trigger.lookbackDays,
        recent_sessions: recentSessions,
      },
    };
  }

  if (wrongCounts.total < trigger.minRecentWrongAttempts) {
    return {
      eligible: false,
      code: 'insufficient_recent_wrong_attempts',
      reason: `Need at least ${trigger.minRecentWrongAttempts} recent wrong attempts.`,
      metrics: {
        lookback_days: trigger.lookbackDays,
        recent_wrong_attempts: wrongCounts.total,
      },
    };
  }

  if (wrongCounts.matching < trigger.minMatchingWrongAttempts) {
    return {
      eligible: false,
      code: 'insufficient_matching_wrong_attempts',
      reason: `Need at least ${trigger.minMatchingWrongAttempts} wrong attempts matching target skills.`,
      metrics: {
        lookback_days: trigger.lookbackDays,
        matching_wrong_attempts: wrongCounts.matching,
        skill_tag_prefixes: trigger.skillTagPrefixes,
      },
    };
  }

  return {
    eligible: true,
    code: 'trigger_matched',
    reason: trigger.reasonLabel || 'Matched your recent weak-point activity.',
    metrics: {
      lookback_days: trigger.lookbackDays,
      recent_sessions: recentSessions,
      recent_wrong_attempts: wrongCounts.total,
      matching_wrong_attempts: wrongCounts.matching,
      skill_tag_prefixes: trigger.skillTagPrefixes,
    },
  };
}

function normalizeBenefit(raw, index, eligibility = null) {
  const id = String(raw?.id || `benefit-${index + 1}`).trim();
  const title = String(raw?.title || '').trim();
  const description = String(raw?.description || '').trim();
  const ctaLabel = String(raw?.cta_label || raw?.ctaLabel || '').trim();
  const ctaUrl = String(raw?.cta_url || raw?.ctaUrl || '').trim();
  const couponCode = String(raw?.coupon_code || raw?.couponCode || '').trim();
  const kind = String(raw?.kind || raw?.type || 'benefit').trim().toLowerCase();

  if (!title) return null;
  return {
    id,
    kind,
    title,
    description,
    cta_label: ctaLabel || null,
    cta_url: ctaUrl || null,
    coupon_code: couponCode || null,
    eligibility_code: eligibility?.code || null,
    eligibility_reason: eligibility?.reason || null,
    eligibility_metrics: eligibility?.metrics || null,
  };
}

function fallbackBenefitsFromEnv(env) {
  const offers = [];

  const subscriptionLabel = String(env.MEMBER_SUBSCRIPTION_DISCOUNT_LABEL || '').trim();
  if (subscriptionLabel) {
    offers.push({
      id: 'subscription-discount',
      kind: 'subscription_discount',
      title: subscriptionLabel,
      description: String(env.MEMBER_SUBSCRIPTION_DISCOUNT_DESC || '').trim() || null,
      cta_label: String(env.MEMBER_SUBSCRIPTION_DISCOUNT_CTA_LABEL || '').trim() || null,
      cta_url: String(env.MEMBER_SUBSCRIPTION_DISCOUNT_CTA_URL || '').trim() || null,
      coupon_code: null,
      eligibility_code: 'env_fallback',
      eligibility_reason: 'Loaded from environment fallback.',
      eligibility_metrics: null,
    });
  }

  const couponCode = String(env.MEMBER_COURSEPACK_COUPON_CODE || '').trim();
  if (couponCode) {
    offers.push({
      id: 'coursepack-coupon',
      kind: 'coursepack_coupon',
      title: String(env.MEMBER_COURSEPACK_COUPON_TITLE || 'Course Pack Coupon').trim(),
      description: String(env.MEMBER_COURSEPACK_COUPON_DESC || '').trim() || null,
      cta_label: String(env.MEMBER_COURSEPACK_COUPON_CTA_LABEL || '').trim() || null,
      cta_url: String(env.MEMBER_COURSEPACK_COUPON_CTA_URL || '').trim() || null,
      coupon_code: couponCode,
      eligibility_code: 'env_fallback',
      eligibility_reason: 'Loaded from environment fallback.',
      eligibility_metrics: null,
    });
  }

  return offers;
}

function resolveBenefits(env) {
  const raw = String(env.MEMBER_BENEFITS_JSON || '').trim();
  if (!raw) return fallbackBenefitsFromEnv(env);

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallbackBenefitsFromEnv(env);
    const offers = parsed
      .map((item, index) => normalizeBenefit(item, index))
      .filter(Boolean);
    return offers.length ? offers : fallbackBenefitsFromEnv(env);
  } catch (_error) {
    return fallbackBenefitsFromEnv(env);
  }
}

function resolveMaxLookbackDays(offers) {
  const days = offers.map((offer) => parseOfferTrigger(offer?.metadata || {}).lookbackDays);
  const max = days.length ? Math.max(...days) : 60;
  return Math.max(1, max);
}

async function resolveBenefitsWithSource(env, userId) {
  try {
    const dbOffers = await listMemberBenefitOffers(env, {
      availableFor: ['all', 'paid'],
      limit: 200,
    });
    if (Array.isArray(dbOffers) && dbOffers.length) {
      const maxLookbackDays = resolveMaxLookbackDays(dbOffers);
      const [wrongAttempts, sessions] = await Promise.all([
        listRecentWrongAttempts(env, userId, { lookbackDays: maxLookbackDays, limit: 1000 }),
        listRecentSessions(env, userId, { lookbackDays: maxLookbackDays, limit: 300 }),
      ]);

      const eligible = dbOffers
        .map((offer) => {
          const eligibility = evaluateOfferEligibility(offer, wrongAttempts, sessions);
          return { offer, eligibility };
        })
        .filter((item) => item.eligibility.eligible)
        .map((item, index) => normalizeBenefit(item.offer, index, item.eligibility))
        .filter(Boolean);

      return {
        offers: eligible,
        source: 'database',
      };
    }
  } catch (_error) {
    // Keep env fallback as resilient path if DB table is not ready.
  }

  return {
    offers: resolveBenefits(env),
    source: 'env',
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Supabase environment is not fully configured.' }, 500);
  }

  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return jsonResponse({ error: 'Authentication required.' }, 401);
  }

  const authUser = await getUserFromAccessToken(env, accessToken);
  if (!authUser || !authUser.id) {
    return jsonResponse({ error: 'Invalid or expired session token.' }, 401);
  }

  let membership = null;
  try {
    membership = await fetchMembershipStatus(env, authUser.id);
  } catch (error) {
    return jsonResponse({ error: `Failed reading membership status: ${error.message}` }, 500);
  }

  const membershipActive = isMembershipActive(membership);
  const benefits = membershipActive
    ? await resolveBenefitsWithSource(env, authUser.id)
    : { offers: [], source: 'none' };

  return jsonResponse({
    ok: true,
    user_id: authUser.id,
    membership_active: membershipActive,
    membership_status: membership?.status || null,
    membership_period_end: membership?.period_end || null,
    offers: benefits.offers,
    offer_count: Array.isArray(benefits.offers) ? benefits.offers.length : 0,
    benefit_source: benefits.source,
    generated_at: new Date().toISOString(),
  });
}

