(() => {
  const container = document.querySelector('[data-benefits-root]');
  if (!container) return;

  function escapeHtml(rawValue) {
    return String(rawValue ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const state = {
    userId: '',
    loading: false,
    loadedOffers: null,
  };

  function togglePaidOnlyBlocks(visible) {
    document.querySelectorAll('[data-visible="paid-only"]').forEach((node) => {
      node.classList.toggle('hidden', !visible);
    });
  }

  function renderLockedState() {
    togglePaidOnlyBlocks(false);
    container.innerHTML = `<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p class="text-sm text-gray-700">Upgrade to paid membership to unlock targeted coupons and subscription offers.</p>
      <a href="/membership/" class="mt-3 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition">View membership plan</a>
    </div>`;
  }

  function renderLoadingState() {
    togglePaidOnlyBlocks(true);
    container.innerHTML = `<div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <p class="text-sm text-blue-900 font-semibold">Loading member benefits...</p>
      <p class="mt-1 text-sm text-blue-800">Checking your active offers and coupon eligibility.</p>
    </div>`;
  }

  function renderActiveState(offers) {
    togglePaidOnlyBlocks(true);

    if (!Array.isArray(offers) || offers.length === 0) {
      container.innerHTML = `<div class="space-y-3">
        <article class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p class="text-sm font-semibold text-emerald-900">Active Member Benefit</p>
          <p class="mt-1 text-sm text-emerald-800">Your account is active. Trigger-based offers will appear when your recent learning profile matches an offer rule.</p>
        </article>
        <article class="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p class="text-sm font-semibold text-blue-900">How to unlock more offers</p>
          <p class="mt-1 text-sm text-blue-800">Keep using the worksheet and Kahoot resource loop. The system checks recent weak-point and activity rules to unlock targeted coupons.</p>
        </article>
      </div>`;
      return;
    }

    container.innerHTML = offers.map((offer) => {
      const title = String(offer?.title || 'Member Benefit');
      const description = String(offer?.description || '').trim();
      const ctaLabel = String(offer?.cta_label || '').trim();
      const ctaUrl = String(offer?.cta_url || '').trim();
      const couponCode = String(offer?.coupon_code || '').trim();
      const eligibilityReason = String(offer?.eligibility_reason || '').trim();
      const eligibilityCode = String(offer?.eligibility_code || '').trim();

      return `<article class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p class="text-sm font-semibold text-emerald-900">${escapeHtml(title)}</p>
        ${description ? `<p class="mt-1 text-sm text-emerald-800">${escapeHtml(description)}</p>` : ''}
        ${couponCode ? `<p class="mt-2 text-xs font-semibold inline-flex rounded bg-white border border-emerald-300 text-emerald-800 px-2 py-1">Coupon: ${escapeHtml(couponCode)}</p>` : ''}
        ${(eligibilityReason || eligibilityCode) ? `<p class="mt-2 text-xs text-emerald-900">Eligibility: ${escapeHtml(eligibilityReason || eligibilityCode)}</p>` : ''}
        ${(ctaLabel && ctaUrl) ? `<div class="mt-3"><a href="${escapeHtml(ctaUrl)}" class="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition">${escapeHtml(ctaLabel)}</a></div>` : ''}
      </article>`;
    }).join('');
  }

  async function fetchBenefits() {
    if (!window.memberSupabase) return null;
    const { data } = await window.memberSupabase.auth.getSession();
    const accessToken = String(data?.session?.access_token || '').trim();
    if (!accessToken) return null;

    const response = await fetch('/api/v1/membership/benefits', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) return null;
    return response.json();
  }

  async function apply(detail) {
    if (!detail || !detail.loaded || detail.error) {
      state.userId = '';
      state.loadedOffers = null;
      renderLockedState();
      return;
    }

    if (!detail.membershipActive) {
      state.userId = String(detail.userId || '');
      state.loadedOffers = [];
      renderLockedState();
      return;
    }

    const nextUserId = String(detail.userId || '');
    if (!nextUserId) {
      renderLockedState();
      return;
    }

    if (state.userId === nextUserId && Array.isArray(state.loadedOffers)) {
      renderActiveState(state.loadedOffers);
      return;
    }

    if (state.loading) return;
    state.loading = true;
    renderLoadingState();

    try {
      const payload = await fetchBenefits();
      const offers = Array.isArray(payload?.offers) ? payload.offers : [];
      state.userId = nextUserId;
      state.loadedOffers = offers;
      renderActiveState(offers);
    } catch (_error) {
      state.userId = nextUserId;
      state.loadedOffers = [];
      renderActiveState([]);
    } finally {
      state.loading = false;
    }
  }

  window.addEventListener('member-dashboard-data', (event) => {
    apply(event?.detail || null).catch(() => {
      renderLockedState();
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderLockedState();
  });
})();
