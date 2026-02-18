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
  const shouldTryMember = preferredChannel === 'member' || hasAuthorization || !hasChannel(release, 'payhip');

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
    if (!membershipAllowed && !entitlementAllowed) {
      return jsonResponse({ error: 'You are not authorized to access this member download.' }, 403);
    }

    if (!release.asset_key) {
      return jsonResponse({ error: 'Release asset_key is not configured.' }, 500);
    }

    try {
      const ttlSeconds = Number(env.DOWNLOAD_SIGN_TTL_SECONDS || 600);
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
