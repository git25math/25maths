(function() {
    var STORAGE_KEY = 'bilingual_support_enabled';
    var root = document.documentElement;
    var TOGGLE_EVENT_NAME = 'bilingual-support:change';
    var state = false;
    var lastEmittedState = null;

    function loadState() {
        try {
            return localStorage.getItem(STORAGE_KEY) === '1';
        } catch (_) {
            return false;
        }
    }

    function persistState(enabled) {
        try {
            localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
        } catch (_) {
            // Ignore storage failures (private mode or restricted env).
        }
    }

    function setHiddenField(form, name, value) {
        var input = form.querySelector('input[name="' + name + '"]');
        if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            form.appendChild(input);
        }
        input.value = value;
    }

    function normalizeOrderTier(value) {
        var text = String(value || '').trim().toUpperCase();
        if (text.indexOf('L1') === 0) return 'L1';
        if (text.indexOf('L2') === 0) return 'L2';
        if (text.indexOf('L3') === 0) return 'L3';
        return 'UNKNOWN';
    }

    function couponPathForTier(tier) {
        if (tier === 'L1') return 'L1_TO_L2';
        if (tier === 'L2') return 'L2_TO_L3';
        if (tier === 'L3') return 'L3_TO_NEXT';
        return 'NONE';
    }

    function normalizeSupportTrack(value, fallbackEnabled) {
        var text = String(value || '').trim().toLowerCase();
        if (text.indexOf('bilingual') !== -1 || text.indexOf('双语') !== -1) return 'bilingual';
        if (text.indexOf('standard') !== -1 || text.indexOf('english') !== -1 || text.indexOf('标准') !== -1) return 'standard';
        return fallbackEnabled ? 'bilingual' : 'standard';
    }

    function getSupportTrackChoice(form, fallbackEnabled) {
        var selectedRadio = form.querySelector('input[name="support_track_choice"]:checked');
        if (selectedRadio && selectedRadio.value) return normalizeSupportTrack(selectedRadio.value, fallbackEnabled);

        var select = form.querySelector('select[name="support_track_choice"]');
        if (select && select.value) return normalizeSupportTrack(select.value, fallbackEnabled);

        var textInput = form.querySelector('input[name="support_track_choice"]');
        if (textInput && textInput.value) return normalizeSupportTrack(textInput.value, fallbackEnabled);

        return fallbackEnabled ? 'bilingual' : 'standard';
    }

    function enrichGiftFields(form, enabled) {
        var track = getSupportTrackChoice(form, enabled);
        var orderTierInput = form.querySelector('[name="order_tier"]');
        var orderTier = normalizeOrderTier(orderTierInput ? orderTierInput.value : '');
        var emailInput = form.querySelector('input[name="email"]');
        var email = emailInput && emailInput.value ? emailInput.value.trim().toLowerCase() : 'no-email';
        var orderRefInput = form.querySelector('[name="order_ref"]');
        var orderRef = orderRefInput && orderRefInput.value ? orderRefInput.value.trim().toLowerCase() : 'no-order';
        var entryPointInput = form.querySelector('[name="entry_point"]');
        var entryPoint = entryPointInput && entryPointInput.value
            ? entryPointInput.value.trim().toLowerCase()
            : 'unknown-entry';

        setHiddenField(form, 'support_track', track);
        setHiddenField(form, 'gift_trigger_policy', 'need_based_track');
        setHiddenField(form, 'bilingual_gift_eligible', track === 'bilingual' ? '1' : '0');
        setHiddenField(form, 'order_tier_normalized', orderTier);
        setHiddenField(form, 'coupon_ladder_path', couponPathForTier(orderTier));
        setHiddenField(form, 'gift_dedupe_key', email + '|' + orderRef + '|' + track + '|' + entryPoint);
    }

    function bindGiftEnrichment() {
        var forms = document.querySelectorAll('form[action*="script.google.com/macros/s/"]');
        forms.forEach(function(form) {
            if (form.dataset.bilingualGiftBound === '1') return;
            form.dataset.bilingualGiftBound = '1';
            form.addEventListener('submit', function() {
                enrichGiftFields(form, state);
            });
        });
    }

    function syncFormTelemetry(enabled) {
        var forms = document.querySelectorAll('form[action*="script.google.com/macros/s/"]');
        var label = enabled ? 'on' : 'off';
        var flag = enabled ? '1' : '0';
        forms.forEach(function(form) {
            setHiddenField(form, 'bilingual_support_state', label);
            setHiddenField(form, 'bilingual_support_enabled', flag);
            enrichGiftFields(form, enabled);
        });
    }

    function emitToggleTelemetry(enabled, source) {
        var payload = {
            event: 'bilingual_toggle_change',
            bilingual_support_state: enabled ? 'on' : 'off',
            bilingual_support_enabled: enabled ? 1 : 0,
            source: source || 'unknown',
            emitted_at: new Date().toISOString()
        };

        if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push(payload);
        }

        if (typeof window.dispatchEvent === 'function' && typeof window.CustomEvent === 'function') {
            window.dispatchEvent(new CustomEvent(TOGGLE_EVENT_NAME, { detail: payload }));
        }
    }

    function detectFloatingPanelCollision() {
        return !!(
            document.querySelector('#hubspot-messages-iframe-container') ||
            document.querySelector('.crisp-client') ||
            document.querySelector('#tidio-chat') ||
            document.querySelector('iframe[title*="chat"]') ||
            document.querySelector('iframe[src*="intercom"]')
        );
    }

    function syncFloatingDockOffset() {
        var dock = document.querySelector('[data-bilingual-dock]');
        if (!dock) return;
        dock.style.setProperty('--bilingual-chat-offset', detectFloatingPanelCollision() ? '5rem' : '0px');
    }

    function bindFloatingDockSelfHeal() {
        var dock = document.querySelector('[data-bilingual-dock]');
        if (!dock) return;

        syncFloatingDockOffset();
        window.addEventListener('resize', syncFloatingDockOffset, { passive: true });
        window.addEventListener('load', syncFloatingDockOffset, { once: true });
        setTimeout(syncFloatingDockOffset, 1200);
        setTimeout(syncFloatingDockOffset, 3500);

        if (typeof MutationObserver !== 'function' || !document.body) return;

        var rafQueued = false;
        var observer = new MutationObserver(function() {
            if (rafQueued) return;
            rafQueued = true;
            window.requestAnimationFrame(function() {
                rafQueued = false;
                syncFloatingDockOffset();
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    function syncToggleUi(enabled) {
        var toggles = document.querySelectorAll('[data-bilingual-toggle]');
        toggles.forEach(function(toggle) {
            toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
            if (toggle.getAttribute('role') === 'switch') {
                toggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
            }
            toggle.classList.toggle('bilingual-toggle-on', enabled);
            if (toggle.tagName === 'INPUT' && toggle.type === 'checkbox') {
                toggle.checked = enabled;
            }
        });

        var labels = document.querySelectorAll('[data-bilingual-toggle-label]');
        labels.forEach(function(labelNode) {
            var onLabel = labelNode.getAttribute('data-label-on') || 'ON';
            var offLabel = labelNode.getAttribute('data-label-off') || 'OFF';
            labelNode.textContent = enabled ? onLabel : offLabel;
        });
    }

    function applyState(enabled, persist, source) {
        state = !!enabled;
        root.classList.toggle('bilingual-support-enabled', state);
        root.setAttribute('data-bilingual-support', state ? 'on' : 'off');
        syncToggleUi(state);
        syncFormTelemetry(state);
        if (persist) persistState(state);
        if (lastEmittedState !== state) {
            emitToggleTelemetry(state, source || (persist ? 'user-action' : 'boot'));
            lastEmittedState = state;
        }
    }

    function bindToggles() {
        var toggles = document.querySelectorAll('[data-bilingual-toggle]');
        toggles.forEach(function(toggle) {
            if (toggle.dataset.bilingualBound === '1') return;
            toggle.dataset.bilingualBound = '1';

            if (toggle.tagName === 'INPUT' && toggle.type === 'checkbox') {
                toggle.addEventListener('change', function() {
                    applyState(!!toggle.checked, true, toggle.getAttribute('data-bilingual-toggle-source') || 'checkbox');
                    if (typeof toggle.blur === 'function') {
                        toggle.blur();
                    }
                });
                return;
            }

            toggle.addEventListener('click', function(event) {
                event.preventDefault();
                applyState(!state, true, toggle.getAttribute('data-bilingual-toggle-source') || 'button');
                if (typeof toggle.blur === 'function') {
                    toggle.blur();
                }
            });
        });
    }

    bindToggles();
    bindGiftEnrichment();
    bindFloatingDockSelfHeal();
    applyState(loadState(), false, 'init');
})();
