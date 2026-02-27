import {
  constantTimeEqualHex,
  getPayhipSignatureHeader,
  hmacSha256Hex,
  sha256Hex,
} from '../../../../_lib/crypto.js';
import { jsonResponse } from '../../../../_lib/http.js';
import {
  isPayhipActivationEvent,
  isPayhipRevocationEvent,
  isPayhipSubscriptionEvent,
  mapPayhipMembershipStatus,
  parsePayhipEmail,
  parsePayhipEventId,
  parsePayhipEventType,
  parsePayhipPeriodEnd,
  parsePayhipPeriodStart,
  parsePayhipProductId,
  parsePayhipProviderCustomerId,
} from '../../../../_lib/payhip_events.js';
import {
  expireEntitlement,
  findAuthUserByEmail,
  incrementPayhipEventAttempts,
  insertPayhipEventLog,
  updatePayhipEventLog,
  upsertEntitlement,
  upsertMembershipStatus,
} from '../../../../_lib/supabase_server.js';
import { releaseRegistry } from '../../../../_lib/release_registry.js';

function findReleasesByProductId(productId) {
  if (!productId) return [];
  return releaseRegistry.filter((entry) => {
    return String(entry.status || '').toLowerCase() === 'active'
      && String(entry.payhip_product_id || '') === String(productId);
  });
}

async function verifyPayhipSignature(request, payload, rawBody, payhipCredential) {
  const headerSignature = getPayhipSignatureHeader(request);
  if (headerSignature) {
    const computedHeaderSignature = await hmacSha256Hex(payhipCredential, rawBody);
    return constantTimeEqualHex(headerSignature, computedHeaderSignature);
  }

  const payloadSignature = String(payload?.signature || '').trim();
  if (!payloadSignature) return false;

  const computedPayloadSignature = await sha256Hex(payhipCredential);
  return constantTimeEqualHex(payloadSignature, computedPayloadSignature);
}

async function safeUpdatePayhipLog(env, providerEventId, patch) {
  try {
    return await updatePayhipEventLog(env, providerEventId, patch);
  } catch (_error) {
    return null;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Payhip signature model:
  // payload.signature = sha256(api_key)
  // Prefer PAYHIP_API_KEY; keep PAYHIP_WEBHOOK_SECRET as backward-compatible alias.
  const payhipCredential = String(env.PAYHIP_API_KEY || env.PAYHIP_WEBHOOK_SECRET || '').trim();
  if (!payhipCredential) {
    return jsonResponse({ error: 'PAYHIP_API_KEY is not configured.' }, 500);
  }

  let rawBody = '';
  try {
    rawBody = await request.text();
  } catch (_error) {
    return jsonResponse({ error: 'Failed to read request body.' }, 400);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (_error) {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400);
  }

  const isValidSignature = await verifyPayhipSignature(request, payload, rawBody, payhipCredential);
  if (!isValidSignature) {
    return jsonResponse({ error: 'Invalid webhook signature.' }, 403);
  }

  const eventType = parsePayhipEventType(payload);
  const providerEventId = parsePayhipEventId(payload);
  const customerEmail = parsePayhipEmail(payload);
  const status = mapPayhipMembershipStatus(eventType, payload);
  const providerCustomerId = parsePayhipProviderCustomerId(payload);
  const productId = parsePayhipProductId(payload);
  const periodStart = parsePayhipPeriodStart(payload);
  const periodEnd = parsePayhipPeriodEnd(payload);

  const now = new Date().toISOString();

  let insertedLog = null;
  try {
    insertedLog = await insertPayhipEventLog(env, {
      provider_event_id: providerEventId,
      provider: 'payhip',
      event_type: eventType || 'unknown',
      customer_email: customerEmail || null,
      payload,
      processed_at: now,
    });
  } catch (error) {
    return jsonResponse({ error: `Failed logging webhook event: ${error.message}` }, 500);
  }

  if (!insertedLog) {
    await safeUpdatePayhipLog(env, providerEventId, {
      handled_status: 'ignored',
      handled_at: now,
    });
    return jsonResponse({
      ok: true,
      duplicate: true,
      provider_event_id: providerEventId,
    });
  }

  if (!customerEmail) {
    await safeUpdatePayhipLog(env, providerEventId, {
      handled_status: 'pending',
      attempts: 1,
      last_error: 'missing_customer_email',
    });
    return jsonResponse({
      accepted: true,
      reason: 'No customer email in webhook payload. Logged for manual reconciliation.',
      provider_event_id: providerEventId,
    }, 202);
  }

  let authUser = null;
  try {
    authUser = await findAuthUserByEmail(env, customerEmail);
  } catch (error) {
    await incrementPayhipEventAttempts(env, providerEventId).catch(() => null);
    await safeUpdatePayhipLog(env, providerEventId, {
      handled_status: 'failed',
      handled_at: new Date().toISOString(),
      last_error: `find_auth_user_failed: ${error.message}`,
    });
    return jsonResponse({ error: `Failed querying auth users: ${error.message}` }, 500);
  }

  if (!authUser) {
    await safeUpdatePayhipLog(env, providerEventId, {
      handled_status: 'pending',
      attempts: 1,
      last_error: 'user_not_found',
    });
    return jsonResponse({
      accepted: true,
      reason: 'User not found in Supabase Auth yet. Logged for delayed reconciliation.',
      provider_event_id: providerEventId,
      customer_email: customerEmail,
    }, 202);
  }

  try {
    const isSubscription = isPayhipSubscriptionEvent(eventType, payload);
    let effectivePeriodEnd;
    if (status === 'cancelled' && !periodEnd) {
      effectivePeriodEnd = now;
    } else if (!isSubscription && !periodEnd) {
      // One-time purchase: grant 12-week access window
      const termEnd = new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000);
      effectivePeriodEnd = termEnd.toISOString();
    } else {
      effectivePeriodEnd = periodEnd;
    }

    if (status) {
      await upsertMembershipStatus(env, {
        user_id: authUser.id,
        status,
        provider: 'payhip',
        provider_customer_id: providerCustomerId || null,
        period_start: periodStart || now,
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
          // One-time purchases get perpetual entitlements; subscriptions expire
          expires_at: isSubscription ? effectivePeriodEnd : null,
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

    await safeUpdatePayhipLog(env, providerEventId, {
      handled_status: 'handled',
      handled_at: now,
      attempts: 1,
      last_error: null,
    });

    return jsonResponse({
      ok: true,
      provider_event_id: providerEventId,
      user_id: authUser.id,
      status_applied: status,
      product_id: productId || null,
      entitlements_granted: grantedCount,
      entitlements_revoked: revokedCount,
    });
  } catch (error) {
    await incrementPayhipEventAttempts(env, providerEventId).catch(() => null);
    await safeUpdatePayhipLog(env, providerEventId, {
      handled_status: 'failed',
      handled_at: new Date().toISOString(),
      last_error: error.message,
    });
    return jsonResponse({ error: `Webhook processing failed: ${error.message}` }, 500);
  }
}
