import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import {
  fetchMembershipStatus,
  getUserFromAccessToken,
  listMemberBenefitOffers,
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

function evaluateOfferEligibility(offer) {
  const trigger = parseOfferTrigger(offer?.metadata || {});
  return {
    eligible: true,
    code: 'active_member_default',
    reason: trigger.reasonLabel || 'Active member default offer.',
    metrics: {
      lookback_days: trigger.lookbackDays,
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
      const eligible = dbOffers
        .map((offer) => {
          const eligibility = evaluateOfferEligibility(offer);
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
