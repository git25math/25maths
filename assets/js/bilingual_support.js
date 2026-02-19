(function() {
    var STORAGE_KEY = 'bilingual_support_enabled';
    var root = document.documentElement;
    var state = false;

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
            // Ignore storage failures.
        }
    }

    function syncToggleUi(enabled) {
        var toggles = document.querySelectorAll('[data-bilingual-toggle]');
        toggles.forEach(function(toggle) {
            toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
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

    function applyState(enabled, persist) {
        state = !!enabled;
        root.classList.toggle('bilingual-support-enabled', state);
        root.setAttribute('data-bilingual-support', state ? 'on' : 'off');
        syncToggleUi(state);
        if (persist) persistState(state);
    }

    function bindToggles() {
        var toggles = document.querySelectorAll('[data-bilingual-toggle]');
        toggles.forEach(function(toggle) {
            if (toggle.dataset.bilingualBound === '1') return;
            toggle.dataset.bilingualBound = '1';

            if (toggle.tagName === 'INPUT' && toggle.type === 'checkbox') {
                toggle.addEventListener('change', function() {
                    applyState(!!toggle.checked, true);
                });
                return;
            }

            toggle.addEventListener('click', function(event) {
                event.preventDefault();
                applyState(!state, true);
            });
        });
    }

    bindToggles();
    applyState(loadState(), false);
})();
