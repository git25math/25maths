# Agent D: Products Listing + Pricing Pages

> **Assigned To**: Claude Code
> **Status**: `pending`
> **Files to MODIFY**: `products.html`, `pricing.html`
> **DO NOT TOUCH**: Any other files
> **MANDATORY**: Read and follow `tasks/EXECUTION-PROTOCOL.md` before starting. Save report to `tasks/reports/AGENT-D-report.md`.

---

## Task 1: Modify `products.html`

### Change 1.1: Replace Navigation with Mobile Menu (Lines 30-44)

Replace the entire `<nav>...</nav>` (lines 30-44) with the standard nav below. Products should be highlighted.

```html
<nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="/" class="text-2xl font-bold text-primary">25Maths</a>
            </div>
            <div class="hidden md:flex items-center space-x-8">
                <a href="/products.html" class="text-primary font-semibold">Products</a>
                <a href="/pricing.html" class="text-gray-700 hover:text-primary transition">Pricing</a>
                <a href="/about.html" class="text-gray-700 hover:text-primary transition">About</a>
                <a href="/support.html" class="text-gray-700 hover:text-primary transition">Support</a>
            </div>
            <div class="md:hidden flex items-center">
                <button id="mobile-menu-button" class="text-gray-700">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
        <div class="px-4 pt-2 pb-4 space-y-2">
            <a href="/products.html" class="block px-3 py-2 text-primary font-semibold hover:bg-gray-100 rounded">Products</a>
            <a href="/pricing.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Pricing</a>
            <a href="/about.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">About</a>
            <a href="/support.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Support</a>
        </div>
    </div>
</nav>
```

### Change 1.2: Replace Functions Card (Lines 85-110)

Replace the entire Functions card block with:

```html
<!-- Functions - Available -->
<div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2">
    <div class="bg-secondary h-48 flex items-center justify-center text-white text-6xl font-bold">
        F
    </div>
    <div class="p-6">
        <div class="inline-block bg-success text-white text-xs px-3 py-1 rounded-full font-bold mb-3">
            ✓ AVAILABLE NOW
        </div>
        <h3 class="text-2xl font-bold mb-2">Functions & Graphs Bundle</h3>
        <div class="flex items-center mb-3">
            <span class="text-yellow-500">⭐⭐⭐⭐⭐</span>
            <span class="ml-2 text-gray-600">9.8/10</span>
        </div>
        <div class="text-3xl font-bold text-primary mb-4">£15.00</div>
        <ul class="space-y-2 mb-6 text-gray-600 text-sm">
            <li>✓ 50+ Practice Questions</li>
            <li>✓ 20 Bilingual Terms</li>
            <li>✓ Composites & Inverses</li>
            <li>✓ 3 Difficulty Levels</li>
        </ul>
        <a href="/products/functions.html" class="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-opacity-90 transition">
            View Details →
        </a>
    </div>
</div>
```

**Note on badge strategy**: The products.html listing uses a SINGLE inline badge (`<div class="inline-block bg-success...">`) in the card body — NOT a badge on the hero image. This matches the existing Algebra card pattern (see line 64-66 of current products.html).

### Change 1.3: Replace Number Card (Lines 112-137)

Replace the entire Number card block with:

```html
<!-- Number - Available -->
<div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2">
    <div class="bg-success h-48 flex items-center justify-center text-white text-6xl font-bold">
        N
    </div>
    <div class="p-6">
        <div class="inline-block bg-success text-white text-xs px-3 py-1 rounded-full font-bold mb-3">
            ✓ AVAILABLE NOW
        </div>
        <h3 class="text-2xl font-bold mb-2">Number System Starter Pack</h3>
        <div class="flex items-center mb-3">
            <span class="text-yellow-500">⭐⭐⭐⭐⭐</span>
            <span class="ml-2 text-gray-600">9.7/10</span>
        </div>
        <div class="text-3xl font-bold text-primary mb-4">£12.00</div>
        <ul class="space-y-2 mb-6 text-gray-600 text-sm">
            <li>✓ 45+ Practice Questions</li>
            <li>✓ 40+ Bilingual Terms</li>
            <li>✓ Complete Answer Key</li>
            <li>✓ Perfect for Foundation</li>
        </ul>
        <a href="/products/number.html" class="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-opacity-90 transition">
            View Details →
        </a>
    </div>
</div>
```

### Change 1.4: Replace Bundle Deal Section (Lines 140-147)

Replace the inner content of the bundle deal `<div>`:

```html
<h2 class="text-3xl font-bold mb-4">Complete Package — Save £10!</h2>
<p class="text-xl mb-6 opacity-90">Get all 3 bundles for just £35 (individually £45)</p>
<a href="/pricing.html" class="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:shadow-lg transition inline-block">
    View Pricing →
</a>
```

### Change 1.5: Replace Footer (Lines 151-186)

Replace the entire `<footer>...</footer>` with the standard full footer:

```html
<footer class="bg-gray-900 text-gray-300 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
            <div>
                <h3 class="text-white text-2xl font-bold mb-4">25Maths</h3>
                <p class="text-sm">Premium Bilingual IGCSE Mathematics Resources</p>
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
            <p class="mt-2"><a href="mailto:support@25maths.com" class="hover:text-white transition">support@25maths.com</a></p>
        </div>
    </div>
</footer>
```

### Change 1.6: Add Mobile Menu JS (before `</body>`)

```html
<script>
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
</script>
```

---

## Task 2: Modify `pricing.html`

### Change 2.1: Replace Tailwind Config (Line 8)

Find:
```html
<script>tailwind.config={theme:{extend:{colors:{primary:'#8B1538'}}}}</script>
```

Replace with:
```html
<script>
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    primary: '#8B1538',
                    secondary: '#2563EB',
                    warning: '#F59E0B',
                    success: '#10B981',
                }
            }
        }
    }
</script>
```

### Change 2.2: Replace Navigation (Lines 13-23)

Replace the entire `<nav>...</nav>` with standard nav, Pricing highlighted:

```html
<nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="/" class="text-2xl font-bold text-primary">25Maths</a>
            </div>
            <div class="hidden md:flex items-center space-x-8">
                <a href="/products.html" class="text-gray-700 hover:text-primary transition">Products</a>
                <a href="/pricing.html" class="text-primary font-semibold">Pricing</a>
                <a href="/about.html" class="text-gray-700 hover:text-primary transition">About</a>
                <a href="/support.html" class="text-gray-700 hover:text-primary transition">Support</a>
            </div>
            <div class="md:hidden flex items-center">
                <button id="mobile-menu-button" class="text-gray-700">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
        <div class="px-4 pt-2 pb-4 space-y-2">
            <a href="/products.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Products</a>
            <a href="/pricing.html" class="block px-3 py-2 text-primary font-semibold hover:bg-gray-100 rounded">Pricing</a>
            <a href="/about.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">About</a>
            <a href="/support.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Support</a>
        </div>
    </div>
</nav>
```

### Change 2.3: Replace 2-Bundle Deal Card (Lines 49-63)

Replace the entire card with:

```html
<div class="bg-white rounded-xl shadow-lg p-8 text-center border-4 border-primary relative">
    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">BEST FOR 2 TOPICS</div>
    <h3 class="text-2xl font-bold mb-4">2-Bundle Deal</h3>
    <div class="text-4xl font-bold text-primary mb-2">£25</div>
    <p class="text-success font-semibold mb-4">Save £5</p>
    <p class="text-gray-600 mb-6">Great for comprehensive prep</p>
    <ul class="text-left space-y-3 mb-8">
        <li>✓ Choose any 2 bundles</li>
        <li>✓ 90+ questions total</li>
        <li>✓ All materials included</li>
        <li>✓ Bilingual support</li>
        <li>✓ Lifetime access</li>
    </ul>
    <a href="mailto:support@25maths.com?subject=2-Bundle%20Deal%20Inquiry" class="block w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition">
        Contact to Purchase
    </a>
</div>
```

**Why mailto instead of Gumroad?** Bundle deals require custom configuration (customer chooses which 2 bundles). These will be handled via email until Gumroad bundle products are created.

### Change 2.4: Replace Complete Package Button (Line 78)

Find:
```html
<button class="block w-full bg-gray-400 text-white py-3 rounded-lg font-semibold">Coming Soon</button>
```

Replace with:
```html
<a href="mailto:support@25maths.com?subject=Complete%20Package%20Inquiry" class="block w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition">
    Contact to Purchase
</a>
```

### Change 2.5: Replace Footer (Lines 95-100)

Replace the entire `<footer>...</footer>` with the same standard full footer as used in products.html above (Change 1.5).

### Change 2.6: Add Mobile Menu JS (before `</body>`)

```html
<script>
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
</script>
```

---

## Verification Checklist

### products.html
- [ ] All 3 cards show "AVAILABLE NOW" green inline badge (single badge per card, no hero badges)
- [ ] All prices in `text-primary` color (not gray)
- [ ] All "View Details →" link to correct product pages
- [ ] No `opacity-90` on any product card
- [ ] No `alert()` or `onclick` handlers on any button
- [ ] Bundle deal says "Save £10!" with link to pricing.html
- [ ] Mobile menu button visible and functional
- [ ] Full 4-column footer present

### pricing.html
- [ ] Full Tailwind config with all 4 colors
- [ ] 2-Bundle Deal badge says "BEST FOR 2 TOPICS" (not "COMING SOON")
- [ ] 2-Bundle Deal button is mailto link (not disabled gray)
- [ ] Complete Package button is mailto link (not "Coming Soon" gray)
- [ ] Mobile menu button visible and functional
- [ ] Full 4-column footer present
