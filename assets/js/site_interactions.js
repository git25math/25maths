// Global navigation mobile menu
var globalMenuButton = document.getElementById('global-menu-button');
if (globalMenuButton) {
    globalMenuButton.addEventListener('click', function() {
        var menu = document.getElementById('global-mobile-menu');
        if (!menu) return;
        menu.classList.toggle('hidden');
        var expanded = !menu.classList.contains('hidden');
        this.setAttribute('aria-expanded', expanded);
        this.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var menu = document.getElementById('global-mobile-menu');
            if (menu && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
                globalMenuButton.setAttribute('aria-expanded', 'false');
                globalMenuButton.setAttribute('aria-label', 'Open menu');
                globalMenuButton.focus();
            }
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Keep users on site domain: submit waitlist via fetch, then redirect locally.
document.querySelectorAll('form[action*="script.google.com/macros/s/"]').forEach(function(form) {
    if ((form.method || '').toUpperCase() !== 'POST') return;
    if (form.dataset.waitlistBound === '1') return;
    form.dataset.waitlistBound = '1';

    form.addEventListener('submit', function(e) {
        var redirectInput = form.querySelector('input[name="redirect_url"]');
        if (!redirectInput || !redirectInput.value) return;

        e.preventDefault();
        var redirectUrl = redirectInput.value;
        var data = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            mode: 'no-cors',
            body: data
        }).then(function() {
            window.location.assign(redirectUrl);
        }).catch(function() {
            // Fallback to standard form POST if fetch fails.
            form.submit();
        });
    });
});

// Form submit button guard (disable + feedback while submitting)
document.addEventListener('submit', function(e) {
    var btn = e.target.querySelector('button[type="submit"]');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = btn.closest('[lang="zh-CN"]') || document.documentElement.lang === 'zh-CN' ? '\u63D0\u4EA4\u4E2D\u2026' : 'Sending\u2026';
    setTimeout(function() { btn.disabled = false; btn.textContent = btn.dataset.originalText; }, 8000);
});
