# Agent C: Homepage Overhaul (index.html)

> **Assigned To**: Claude Code
> **Status**: `pending`
> **File to MODIFY**: `index.html`
> **DO NOT TOUCH**: Any other files
> **MANDATORY**: Read and follow `tasks/EXECUTION-PROTOCOL.md` before starting. Save report to `tasks/reports/AGENT-C-report.md`.

---

## Change 1: Update Functions Product Card

**Location**: Lines 188-229 (from `<!-- Product 2 - Functions (Coming Soon) -->` to the closing `</div>` before `<!-- Product 3 - Number`)

**Action**: Replace the ENTIRE block with this HTML:

```html
<!-- Product 2 - Functions (Available) -->
<div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2">
    <div class="bg-secondary h-48 flex items-center justify-center text-white text-6xl font-bold relative">
        F
        <div class="absolute top-4 right-4 bg-success text-white text-xs px-3 py-1 rounded-full font-bold">
            ✓ AVAILABLE NOW
        </div>
    </div>
    <div class="p-6">
        <h3 class="text-2xl font-bold mb-2">Functions & Graphs Bundle</h3>
        <div class="flex items-center mb-3">
            <span class="text-yellow-500">⭐⭐⭐⭐⭐</span>
            <span class="ml-2 text-gray-600">9.8/10</span>
        </div>
        <div class="text-3xl font-bold text-primary mb-4">£15.00</div>

        <ul class="space-y-2 mb-6 text-gray-600">
            <li class="flex items-start">
                <svg class="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                50+ Practice Questions
            </li>
            <li class="flex items-start">
                <svg class="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                20 Bilingual Vocabulary Terms
            </li>
            <li class="flex items-start">
                <svg class="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Complete Answer Key
            </li>
            <li class="flex items-start">
                <svg class="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Foundation to Challenge Levels
            </li>
        </ul>

        <a href="/products/functions.html" class="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-opacity-90 transition">
            Learn More →
        </a>
    </div>
</div>
```

---

## Change 2: Update Number Product Card

**Location**: Lines 231-272 (from `<!-- Product 3 - Number (Coming Soon) -->` to the closing `</div>` before `</div> </div> </section>`)

**Action**: Replace the ENTIRE block with this HTML:

```html
<!-- Product 3 - Number (Available) -->
<div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2">
    <div class="bg-success h-48 flex items-center justify-center text-white text-6xl font-bold relative">
        N
        <div class="absolute top-4 right-4 bg-success text-white text-xs px-3 py-1 rounded-full font-bold">
            ✓ AVAILABLE NOW
        </div>
    </div>
    <div class="p-6">
        <h3 class="text-2xl font-bold mb-2">Number System Starter Pack</h3>
        <div class="flex items-center mb-3">
            <span class="text-yellow-500">⭐⭐⭐⭐⭐</span>
            <span class="ml-2 text-gray-600">9.7/10</span>
        </div>
        <div class="text-3xl font-bold text-primary mb-4">£12.00</div>

        <ul class="space-y-2 mb-6 text-gray-600">
            <li class="flex items-start">
                <svg class="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                45+ Practice Questions
            </li>
            <li class="flex items-start">
                <svg class="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                40+ Bilingual Terms
            </li>
            <li class="flex items-start">
                <svg class="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Complete Answer Key
            </li>
            <li class="flex items-start">
                <svg class="w-5 h-5 text-success mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Perfect for Foundation Level
            </li>
        </ul>

        <a href="/products/number.html" class="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-opacity-90 transition">
            Learn More →
        </a>
    </div>
</div>
```

---

## Change 3: Update Hero "Browse Free Resources" Button

**Location**: Lines 89-91 (the `<a href="/products.html"...>Browse Free Resources</a>` element)

**Action**: Change `href="/products.html"` to `href="/free/"`. Keep everything else the same.

Specifically, find:
```html
<a href="/products.html" class="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition transform hover:-translate-y-1">
    Browse Free Resources
</a>
```

Replace with:
```html
<a href="/free/" class="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition transform hover:-translate-y-1">
    Browse Free Resources
</a>
```

---

## Change 4: Fix Email Subscription Form

**Location**: Lines 308-319 (the entire `<form>` element through closing `</form>`)

**Action**: Replace the ENTIRE form (from `<form` to `</form>`) with:

```html
<form class="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto" action="https://formspree.io/f/{FORM_ID}" method="POST">
    <input type="hidden" name="_next" value="https://www.25maths.com/">
    <input
        type="email"
        name="email"
        placeholder="Your email address"
        required
        class="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
    >
    <button type="submit" class="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-1">
        Subscribe →
    </button>
</form>
```

**NOTE**: `{FORM_ID}` is an INTENTIONAL placeholder. Do NOT replace it with a real value. The user will register at formspree.io and replace this before deploying.

---

## Change 5: Replace Footer

**Location**: Lines 327-367 (from `<footer` to `</footer>`)

**Action**: Replace the ENTIRE footer with the standard full footer. Here it is:

```html
<footer class="bg-gray-900 text-gray-300 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
            <div>
                <h3 class="text-white text-2xl font-bold mb-4">25Maths</h3>
                <p class="text-sm">
                    Premium Bilingual IGCSE Mathematics Resources. Empowering international students to excel.
                </p>
            </div>
            <div>
                <h4 class="text-white font-semibold mb-4">Products</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/products.html" class="hover:text-white transition">All Products</a></li>
                    <li><a href="/products/algebra.html" class="hover:text-white transition">Algebra Bundle</a></li>
                    <li><a href="/products/functions.html" class="hover:text-white transition">Functions Bundle</a></li>
                    <li><a href="/products/number.html" class="hover:text-white transition">Number Pack</a></li>
                    <li><a href="/pricing.html" class="hover:text-white transition">Pricing</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-semibold mb-4">Company</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/about.html" class="hover:text-white transition">About</a></li>
                    <li><a href="/support.html" class="hover:text-white transition">Support</a></li>
                    <li><a href="/free/" class="hover:text-white transition">Free Resources</a></li>
                    <li><a href="mailto:support@25maths.com" class="hover:text-white transition">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-semibold mb-4">Legal</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/terms.html" class="hover:text-white transition">Terms of Service</a></li>
                    <li><a href="/privacy.html" class="hover:text-white transition">Privacy Policy</a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 25Maths. All rights reserved.</p>
            <p class="mt-2">
                <a href="mailto:support@25maths.com" class="hover:text-white transition">support@25maths.com</a>
            </p>
        </div>
    </div>
</footer>
```

---

## Change 6: Clean Up JavaScript

**Location**: Lines 370-405 (the `<script>` block before `</body>`)

**Action**: Replace the ENTIRE `<script>` block with:

```html
<script>
    // Mobile menu toggle
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        const menu = document.getElementById('mobile-menu');
        menu.classList.toggle('hidden');
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
</script>
```

This REMOVES `notifyMe()` and `subscribeEmail()` functions, and KEEPS mobile menu toggle + smooth scrolling.

---

## Verification Checklist

- [ ] Functions card: no `opacity-90`, green "AVAILABLE NOW" badge, price in `text-primary` (not gray), "Learn More →" links to `/products/functions.html`
- [ ] Number card: no `opacity-90`, green "AVAILABLE NOW" badge, price `£12.00` in `text-primary` (not gray), "Learn More →" links to `/products/number.html`
- [ ] All 3 product cards have green SVG checkmarks (`text-success`), no gray checkmarks
- [ ] Hero button links to `/free/` not `/products.html`
- [ ] Email form has `action="https://formspree.io/f/{FORM_ID}"` and `method="POST"` — `{FORM_ID}` is kept as placeholder
- [ ] Form has hidden `_next` redirect field
- [ ] Form input has `name="email"` (not just `id`)
- [ ] No `notifyMe()` or `subscribeEmail()` functions in JavaScript
- [ ] Mobile menu toggle still works
- [ ] Smooth scrolling still works
- [ ] Footer has Functions Bundle + Number Pack + Free Resources links
