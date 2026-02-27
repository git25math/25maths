import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import {
  isPayhipActivationEvent,
  isPayhipRevocationEvent,
  mapPayhipMembershipStatus,
  parsePayhipEventType,
  parsePayhipPeriodEnd,
  parsePayhipPeriodStart,
  parsePayhipProductId,
  parsePayhipProviderCustomerId,
} from '../../../_lib/payhip_events.js';
import { releaseRegistry } from '../../../_lib/release_registry.js';
import {
  expireEntitlement,
  fetchMembershipStatus,
  getUserFromAccessToken,
  incrementPayhipEventAttempts,
  listPayhipEventsForEmail,
  updatePayhipEventLog,
  upsertEntitlement,
  upsertMembershipStatus,
} from '../../../_lib/supabase_server.js';

function findReleasesByProductId(productId) {
  if (!productId) return [];
  return releaseRegistry.filter((entry) => {
    return String(entry.status || '').toLowerCase() === 'active'
      && String(entry.payhip_product_id || '') === String(productId);
  });
}

async function markHandled(env, eventId) {
  return updatePayhipEventLog(env, eventId, {
    handled_status: 'handled',
    handled_at: new Date().toISOString(),
    last_error: null,
  });
}

async function markFailed(env, eventId, errorMessage) {
  await incrementPayhipEventAttempts(env, eventId).catch(() => null);
  return updatePayhipEventLog(env, eventId, {
    handled_status: 'failed',
    handled_at: new Date().toISOString(),
    last_error: String(errorMessage || 'unknown_error').slice(0, 500),
  }).catch(() => null);
}

async function applyEventToUser(env, authUser, eventRow) {
  const payload = eventRow?.payload || {};
  const eventType = parsePayhipEventType(payload, eventRow?.event_type);
  const status = mapPayhipMembershipStatus(eventType, payload);
  const productId = parsePayhipProductId(payload);
  const providerCustomerId = parsePayhipProviderCustomerId(payload);
  const periodStart = parsePayhipPeriodStart(payload);
  const periodEnd = parsePayhipPeriodEnd(payload);
  const now = new Date().toISOString();
  const effectivePeriodEnd = status === 'cancelled' && !periodEnd ? now : periodEnd;

  if (status) {
    await upsertMembershipStatus(env, {
      user_id: authUser.id,
      status,
      provider: 'payhip',
      provider_customer_id: providerCustomerId || null,
      period_start: periodStart,
      period_end: effectivePeriodEnd,
      updated_at: now,
    });
  }

  const releases = findReleasesByProductId(productId);
  let grantedCount = 0;
  let revokedCount = 0;

  if (isPayhipActivationEvent(eventType) && productId) {
    for (const release of releases) {
      await upsertEntitlement(env, {
        user_id: authUser.id,
        release_id: release.release_id,
        source: 'payhip',
        granted_at: now,
        expires_at: effectivePeriodEnd,
      });
      grantedCount += 1;
    }
  }

  if (isPayhipRevocationEvent(eventType) && productId) {
    for (const release of releases) {
      await expireEntitlement(env, authUser.id, release.release_id, 'payhip', now);
      revokedCount += 1;
    }
  }

  await markHandled(env, eventRow.provider_event_id);
  return {
    provider_event_id: eventRow.provider_event_id,
    status_applied: status,
    product_id: productId || null,
    entitlements_granted: grantedCount,
    entitlements_revoked: revokedCount,
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Supabase environment is not fully configured.' }, 500);
  }

  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return jsonResponse({ error: 'Authentication required.' }, 401);
  }

  const authUser = await getUserFromAccessToken(env, accessToken);
  if (!authUser || !authUser.id || !authUser.email) {
    return jsonResponse({ error: 'Invalid or expired session token.' }, 401);
  }

  // Sync latest membership snapshot first, then replay pending payhip events.
  const membershipBefore = await fetchMembershipStatus(env, authUser.id).catch(() => null);

  let pendingEvents = [];
  try {
    pendingEvents = await listPayhipEventsForEmail(env, authUser.email, {
      statuses: ['pending', 'failed'],
      limit: 50,
    });
  } catch (error) {
    return jsonResponse({ error: `Failed listing payhip events: ${error.message}` }, 500);
  }

  if (!pendingEvents.length) {
    return jsonResponse({
      ok: true,
      user_id: authUser.id,
      customer_email: authUser.email,
      membership_before: membershipBefore,
      replayed: 0,
      failed: 0,
      events: [],
    });
  }

  const events = [];
  let failed = 0;

  for (const row of pendingEvents) {
    try {
      const result = await applyEventToUser(env, authUser, row);
      events.push({ ...result, replay_status: 'handled' });
    } catch (error) {
      failed += 1;
      await markFailed(env, row.provider_event_id, error.message).catch(() => null);
      events.push({
        provider_event_id: row.provider_event_id,
        replay_status: 'failed',
        error: String(error.message || 'unknown_error').slice(0, 500),
      });
    }
  }

  const membershipAfter = await fetchMembershipStatus(env, authUser.id).catch(() => null);

  return jsonResponse({
    ok: failed === 0,
    user_id: authUser.id,
    customer_email: authUser.email,
    membership_before: membershipBefore,
    membership_after: membershipAfter,
    replayed: events.length - failed,
    failed,
    events,
  }, failed === 0 ? 200 : 207);
}
