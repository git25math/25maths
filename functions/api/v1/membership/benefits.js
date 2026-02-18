import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import { fetchMembershipStatus, getUserFromAccessToken, listMemberBenefitOffers } from '../../../_lib/supabase_server.js';

function isMembershipActive(record) {
  if (!record) return false;
  if (String(record.status || '').toLowerCase() !== 'active') return false;
  if (!record.period_end) return true;
  const until = new Date(record.period_end).getTime();
  if (Number.isNaN(until)) return true;
  return until > Date.now();
}

function normalizeBenefit(raw, index) {
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

async function resolveBenefitsWithSource(env) {
  try {
    const dbOffers = await listMemberBenefitOffers(env, {
      availableFor: ['all', 'paid'],
      limit: 200,
    });
    if (Array.isArray(dbOffers) && dbOffers.length) {
      const offers = dbOffers
        .map((item, index) => normalizeBenefit(item, index))
        .filter(Boolean);
      if (offers.length) {
        return {
          offers,
          source: 'database',
        };
      }
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
    ? await resolveBenefitsWithSource(env)
    : { offers: [], source: 'none' };

  return jsonResponse({
    ok: true,
    user_id: authUser.id,
    membership_active: membershipActive,
    membership_status: membership?.status || null,
    membership_period_end: membership?.period_end || null,
    offers: benefits.offers,
    benefit_source: benefits.source,
    generated_at: new Date().toISOString(),
  });
}
