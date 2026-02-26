function normalizeEventType(eventType) {
  return String(eventType || '')
    .trim()
    .toLowerCase()
    .replace(/[.\s-]+/g, '_');
}

export function parsePayhipEventType(payload, fallbackEventType = '') {
  return String(payload?.event_type || payload?.event || payload?.type || fallbackEventType || '').trim();
}

export function parsePayhipEventId(payload) {
  const raw = payload?.event_id || payload?.id || payload?.sale_id || payload?.subscription_id || '';
  if (String(raw).trim()) return String(raw).trim();
  return `payhip-${Date.now()}`;
}

export function parsePayhipEmail(payload) {
  return String(
    payload?.customer_email
    || payload?.buyer_email
    || payload?.email
    || ''
  ).trim().toLowerCase();
}

export function parsePayhipProductId(payload) {
  const candidate = payload?.product_id || payload?.product?.id || payload?.listing_id || '';
  return String(candidate || '').trim();
}

export function parsePayhipProviderCustomerId(payload) {
  const candidate = payload?.customer_id || payload?.subscription_id || payload?.member_id || '';
  return String(candidate || '').trim();
}

export function parsePayhipPeriodStart(payload) {
  return payload?.period_start || payload?.subscription_start || payload?.created_at || null;
}

export function parsePayhipPeriodEnd(payload) {
  return payload?.next_billing_date || payload?.period_end || payload?.subscription_end || null;
}

export function isPayhipSubscriptionEvent(eventType, payload = null) {
  const normalized = normalizeEventType(eventType);
  if (normalized.includes('subscription')) return true;
  if (payload && String(payload?.subscription_id || '').trim()) return true;
  return false;
}

export function isPayhipActivationEvent(eventType) {
  const normalized = normalizeEventType(eventType);
  if (!normalized) return false;
  if (normalized === 'subscription_created') return true;
  if (normalized === 'subscription_payment_succeeded') return true;
  if (normalized === 'renewal_payment_succeeded') return true;
  if (normalized === 'sale_completed') return true;
  if (normalized === 'paid') return true;
  if (normalized.includes('renew')) return true;
  if (normalized.includes('payment') && !normalized.includes('failed')) return true;
  if (normalized.includes('sale') && !normalized.includes('refund')) return true;
  return false;
}

export function isPayhipRevocationEvent(eventType) {
  const normalized = normalizeEventType(eventType);
  if (!normalized) return false;
  if (normalized.includes('refund')) return true;
  if (normalized.includes('subscription_deleted')) return true;
  if (normalized.includes('cancel')) return true;
  if (normalized.includes('paused') || normalized.includes('pause')) return true;
  return false;
}

export function mapPayhipMembershipStatus(eventType, payload = null) {
  const normalized = normalizeEventType(eventType);
  if (!normalized) return null;

  if (normalized.includes('pause')) return 'paused';
  if (normalized.includes('refund') || normalized.includes('cancel') || normalized.includes('deleted')) return 'cancelled';

  // Membership status should be driven by subscription context only.
  if (!isPayhipSubscriptionEvent(eventType, payload)) return null;

  if (
    normalized === 'subscription_created'
    || normalized === 'subscription_payment_succeeded'
    || normalized === 'renewal_payment_succeeded'
    || normalized === 'paid'
    || normalized.includes('renew')
    || normalized.includes('payment')
  ) {
    return 'active';
  }

  return null;
}

