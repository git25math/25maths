import { findReleaseById } from '../../../_lib/release_registry.js';
import { getBearerToken, jsonResponse, redirectResponse } from '../../../_lib/http.js';
import {
  createSignedStorageUrl,
  fetchEntitlement,
  fetchMembershipStatus,
  getUserFromAccessToken,
} from '../../../_lib/supabase_server.js';

function isActiveRelease(release) {
  return String(release?.status || '').toLowerCase() === 'active';
}

function hasChannel(release, channel) {
  return Array.isArray(release?.channels) && release.channels.includes(channel);
}

function isMembershipActive(record) {
  if (!record) return false;
  if (String(record.status || '').toLowerCase() !== 'active') return false;
  if (!record.period_end) return true;
  const until = new Date(record.period_end).getTime();
  if (Number.isNaN(until)) return true;
  return until > Date.now();
}

function isEntitlementValid(record) {
  if (!record) return false;
  if (!record.expires_at) return true;
  const until = new Date(record.expires_at).getTime();
  if (Number.isNaN(until)) return true;
  return until > Date.now();
}

function requiresActiveMembership(release) {
  return String(release?.membership_tier || '').trim().toLowerCase() === 'active';
}

function clampSignedUrlTtl(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 600;
  return Math.max(60, Math.min(900, Math.floor(parsed)));
}

function parseAllowedMemberBuckets(value) {
  const raw = String(value || 'member-files').trim();
  if (!raw) return ['member-files'];
  return raw
    .split(',')
    .map((item) => String(item || '').trim())
    .filter(Boolean);
}

function parseBucketFromAssetKey(assetKey) {
  const normalized = String(assetKey || '').trim().replace(/^\/+/, '');
  const slashIndex = normalized.indexOf('/');
  if (slashIndex <= 0) return '';
  return normalized.slice(0, slashIndex);
}

function isAssetBucketAllowed(assetKey, allowedBuckets) {
  const bucket = parseBucketFromAssetKey(assetKey);
  if (!bucket) return false;
  return allowedBuckets.includes(bucket);
}

export async function onRequestGet(context) {
  const { request, params, env } = context;
  const releaseId = String(params.release_id || '').trim();
  if (!releaseId) {
    return jsonResponse({ error: 'Missing release id.' }, 404);
  }

  const release = findReleaseById(releaseId);
  if (!release || !isActiveRelease(release)) {
    return jsonResponse({ error: 'Release not found or inactive.' }, 404);
  }

  const requestUrl = new URL(request.url);
  const preferredChannel = String(requestUrl.searchParams.get('channel') || '').toLowerCase();
  const hasAuthorization = Boolean(getBearerToken(request));

  if (preferredChannel === 'payhip' && hasChannel(release, 'payhip') && release.payhip_url) {
    return redirectResponse(release.payhip_url, 302);
  }

  const shouldTryMember = preferredChannel === 'member'
    || (preferredChannel !== 'payhip' && (hasAuthorization || !hasChannel(release, 'payhip')));

  if (shouldTryMember && hasChannel(release, 'member')) {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: 'Supabase environment is not fully configured.' }, 500);
    }

    const accessToken = getBearerToken(request);
    if (!accessToken) {
      return jsonResponse({ error: 'Authentication required for member download.' }, 401);
    }

    const user = await getUserFromAccessToken(env, accessToken);
    if (!user || !user.id) {
      return jsonResponse({ error: 'Invalid or expired session token.' }, 401);
    }

    let membership;
    try {
      membership = await fetchMembershipStatus(env, user.id);
    } catch (error) {
      return jsonResponse({ error: `Failed reading membership status: ${error.message}` }, 500);
    }

    let entitlement;
    try {
      entitlement = await fetchEntitlement(env, user.id, releaseId);
    } catch (error) {
      return jsonResponse({ error: `Failed reading entitlement: ${error.message}` }, 500);
    }

    const membershipAllowed = isMembershipActive(membership);
    const entitlementAllowed = isEntitlementValid(entitlement);
    const strictMembershipRequired = requiresActiveMembership(release);

    if (strictMembershipRequired && !membershipAllowed) {
      return jsonResponse({ error: 'Active membership is required for this release.' }, 403);
    }

    if (!strictMembershipRequired && !membershipAllowed && !entitlementAllowed) {
      return jsonResponse({ error: 'You are not authorized to access this member download.' }, 403);
    }

    if (!release.asset_key) {
      return jsonResponse({ error: 'Release asset_key is not configured.' }, 500);
    }

    const allowedBuckets = parseAllowedMemberBuckets(env.ALLOWED_MEMBER_BUCKETS);
    if (!isAssetBucketAllowed(release.asset_key, allowedBuckets)) {
      return jsonResponse({ error: 'Release asset bucket is not allowed for signed download.' }, 403);
    }

    try {
      const ttlSeconds = clampSignedUrlTtl(env.DOWNLOAD_SIGN_TTL_SECONDS);
      const signed = await createSignedStorageUrl(env, release.asset_key, ttlSeconds);
      return jsonResponse({
        release_id: release.release_id,
        download_url: signed.url,
        expires_in: signed.expiresIn,
      });
    } catch (error) {
      return jsonResponse({ error: `Failed generating signed URL: ${error.message}` }, 500);
    }
  }

  if (hasChannel(release, 'payhip') && release.payhip_url) {
    return redirectResponse(release.payhip_url, 302);
  }

  return jsonResponse({ error: 'No available channel for this release.' }, 422);
}
