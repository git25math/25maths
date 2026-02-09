# Agent A: Product Detail Pages (Highest Business Impact)

> **Assigned To**: Codex
> **Status**: `pending`
> **Files to CREATE**: `products/functions.html`, `products/number.html`
> **Files to READ (reference only)**: `products/algebra.html`, `PROJECT-PLAN.md`
> **DO NOT TOUCH**: Any other files
> **MANDATORY**: Read and follow `tasks/EXECUTION-PROTOCOL.md` before starting. Save report to `tasks/reports/AGENT-A-report.md`.

---

## IMPORTANT: Source of Truth Rule

When `algebra.html` (template) and `PROJECT-PLAN.md` conflict, **PROJECT-PLAN.md always wins**.

Known conflicts:
- algebra.html has NO mobile menu → use PROJECT-PLAN.md nav
- algebra.html footer is missing Functions/Number links → use PROJECT-PLAN.md footer

---

## Complete HTML Boilerplate

Every new page MUST use this exact `<head>` structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{PAGE TITLE} | 25Maths</title>
    <meta name="description" content="{META DESCRIPTION}">

    <script src="https://cdn.tailwindcss.com"></script>
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

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>

    <!-- Gumroad Embed Script -->
    <script src="https://gumroad.com/js/gumroad.js"></script>
</head>
<body class="bg-gray-50">
```

---

## Standard Navigation (copy exactly)

Product detail pages have NO highlighted nav item.

```html
<!-- Navigation -->
<nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="/" class="text-2xl font-bold text-primary">25Maths</a>
            </div>
            <div class="hidden md:flex items-center space-x-8">
                <a href="/products.html" class="text-gray-700 hover:text-primary transition">Products</a>
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
            <a href="/products.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Products</a>
            <a href="/pricing.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Pricing</a>
            <a href="/about.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">About</a>
            <a href="/support.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Support</a>
        </div>
    </div>
</nav>
```

---

## Standard Full Footer (copy exactly)

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

---

## Standard Mobile Menu JS (add before `</body>`)

```html
<script>
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
</script>
```

---

## Standard "Download Free Sample" JS (add before `</body>`)

```html
<script>
    function downloadSample() {
        alert('Free sample will be available soon! For now, please contact support@25maths.com to request a preview.');
    }
</script>
```

---

## Task 1: Create `products/functions.html`

### Page Meta
- **Title tag**: `Functions & Graphs Complete Bundle | 25Maths`
- **Meta description**: `Functions & Graphs Complete Bundle - 50+ practice questions with bilingual solutions for CIE IGCSE 0580. Includes vocabulary cards, answer keys, and quick reference. £15.00.`

### Breadcrumb (after nav, copy structure from algebra.html lines 54-65)
```html
<div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" class="hover:text-primary">Home</a>
            <span>›</span>
            <a href="/products.html" class="hover:text-primary">Products</a>
            <span>›</span>
            <span class="text-gray-900 font-medium">Functions & Graphs Complete Bundle</span>
        </div>
    </div>
</div>
```

### Product Header (copy structure from algebra.html lines 67-135)

Key differences from Algebra:
- **Hero gradient**: `bg-gradient-to-br from-secondary to-blue-900` (blue, not burgundy)
- **Letter**: `F`
- **Subtitle line 1**: `<div class="text-2xl">Functions & Graphs</div>`
- **Subtitle line 2**: `<div class="text-xl opacity-90">Complete Bundle</div>`
- **H1**: `Functions & Graphs Complete Bundle`
- **Description**: `Complete Bilingual Resource Pack for CIE IGCSE 0580 Mathematics`
- **Rating**: `9.8/10` (stars: ⭐⭐⭐⭐⭐)
- **Price**: `£15.00` in `text-primary`
- **Gumroad link**: `https://gumroad.com/l/25maths-functions`
- **Buy button text**: `Buy Now - £15.00`
- **Trust badges**: Same 3 as algebra (Instant Download, Lifetime Access, 14-Day Guarantee)
- **"Professional cover image placeholder"** text below hero: include it

### What's Included (copy structure from algebra.html lines 137-193)

**Card 1**: 📚 20 Bilingual Vocabulary Cards | 12 pages, English/Chinese | "Master essential functions & graphs terminology with clear definitions and examples in both languages."

**Card 2**: ✏️ 50+ Practice Questions | 25 pages, 3 difficulty levels | Foundation Level (18 questions), Higher Level (22 questions), Challenge Problems (12 questions)

**Card 3**: ✅ Complete Answer Key | Step-by-step solutions | Same 4 bullets as algebra template

**Card 4**: 📄 Quick Reference Sheet | 2 pages | "All essential formulas at a glance", "Key function rules and properties", "Exam tips and strategies"

**Summary bar** (same structure as algebra lines 185-192):
- Text: `Total: 41 pages of premium content`
- Subtitle: `High-quality PDF (249KB) • Professional LaTeX typesetting • Lifetime access + free updates`

### Topics Covered (copy structure from algebra.html lines 196-309)

**Foundation Level** (blue badge `bg-blue-100 text-blue-800`):
- Function notation and vocabulary
- Evaluating functions
- Domain and range
- Linear functions and graphs
- Plotting coordinates
- Reading graphs
- Distance-time graphs

**Higher Level** (purple badge `bg-purple-100 text-purple-800`):
- Quadratic functions and graphs
- Composite functions
- Inverse functions
- Exponential functions
- Graph transformations
- Solving equations graphically
- Gradient and rate of change

**Challenge Level** (red badge `bg-red-100 text-red-800`):
- Advanced graph transformations
- Optimization using graphs
- Complex composite/inverse problems
- Mathematical reasoning with functions
- Sketch and interpret graphs
- Multi-step function problems

### Perfect For (copy EXACTLY from algebra.html lines 312-362)

Same 4 cards: Students, Teachers, Parents, Schools. Copy the entire section including all HTML, emoji, and text.

### FAQs (copy structure from algebra.html lines 365-401)

Same 6 questions. Only change FAQ #4 answer:
- "Yes! The bundle includes 18 Foundation-level questions designed for grades 3-5 (C-E). There are also Higher and Challenge questions for extension work."

### Guarantee Section (copy structure from algebra.html lines 404-416)

Change "Algebra Bundle" to "Functions & Graphs Bundle" in both paragraph texts.

### Final CTA Section

```html
<section class="py-16 bg-gradient-to-br from-secondary to-blue-900 text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-bold mb-4">Ready to Master IGCSE Functions & Graphs?</h2>
        <p class="text-xl mb-8 opacity-90">
            Join hundreds of students who've improved their skills with 25Maths resources.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://gumroad.com/l/25maths-functions" class="gumroad-button bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition transform hover:-translate-y-1">
                Buy Now - £15.00
            </a>
            <button onclick="downloadSample()" class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition">
                Download Free Sample
            </button>
        </div>
        <p class="mt-6 text-sm opacity-75">
            ✓ Instant download  ✓ 14-day guarantee  ✓ Lifetime access
        </p>
    </div>
</section>
```

Then: Standard Footer → Standard Mobile Menu JS → Standard Download Sample JS → `</body></html>`

---

## Task 2: Create `products/number.html`

### Page Meta
- **Title tag**: `Number System Starter Pack | 25Maths`
- **Meta description**: `Number System Starter Pack - 45+ practice questions with bilingual solutions for CIE IGCSE 0580. Includes 40+ vocabulary cards, answer keys, and quick reference. £12.00.`

### Breadcrumb
Same structure, last item: `Number System Starter Pack`

### Product Header

Key differences from Algebra:
- **Hero gradient**: `bg-gradient-to-br from-success to-emerald-900` (green)
- **Letter**: `N`
- **Subtitle line 1**: `<div class="text-2xl">Number System</div>`
- **Subtitle line 2**: `<div class="text-xl opacity-90">Starter Pack</div>`
- **H1**: `Number System Starter Pack`
- **Description**: `Complete Bilingual Resource Pack for CIE IGCSE 0580 Mathematics`
- **Rating**: `9.7/10` (stars: ⭐⭐⭐⭐⭐)
- **Price**: `£12.00` in `text-primary`
- **Gumroad link**: `https://gumroad.com/l/25maths-number`
- **Buy button text**: `Buy Now - £12.00`

### What's Included

**Card 1**: 📚 40+ Bilingual Vocabulary Cards | 10 pages, English/Chinese | "Master essential number system terminology with clear definitions and examples in both languages."

**Card 2**: ✏️ 45+ Practice Questions | 14 pages, 3 difficulty levels | Foundation Level (15 questions), Higher Level (20 questions), Challenge Problems (10 questions)

**Card 3**: ✅ Complete Answer Key | Step-by-step solutions | Same 4 bullets as algebra

**Card 4**: 📄 Quick Reference Sheet | 2 pages | "All essential formulas at a glance", "Key number system rules", "Exam tips and strategies"

**Summary bar**: `Total: 27 pages of premium content` | `High-quality PDF (223KB) • Professional LaTeX typesetting • Lifetime access + free updates`

### Topics Covered

**Foundation Level** (blue badge):
- Types of numbers (integers, primes, etc.)
- Place value and ordering
- Factors, multiples, HCF, LCM
- Fractions, decimals, percentages
- Ratio and proportion
- Rounding and estimation
- Basic index notation

**Higher Level** (purple badge):
- Standard form (scientific notation)
- Surds and irrational numbers
- Upper and lower bounds
- Percentage increase/decrease
- Reverse percentages
- Compound interest
- Set notation and Venn diagrams

**Challenge Level** (red badge):
- Advanced bounds problems
- Complex ratio problems
- Recurring decimals to fractions
- Mathematical proof with numbers
- Multi-step problem solving
- Real-world applications

### Perfect For
Copy EXACTLY from algebra.html (same 4 cards).

### FAQs
Same 6 questions as algebra. FAQ #4 answer: "Yes! The bundle includes 15 Foundation-level questions designed for grades 3-5 (C-E)..."

### Guarantee Section
Change "Algebra Bundle" to "Number System Starter Pack".

### Final CTA Section

```html
<section class="py-16 bg-gradient-to-br from-success to-emerald-900 text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-bold mb-4">Ready to Master IGCSE Number System?</h2>
        <p class="text-xl mb-8 opacity-90">
            Join hundreds of students who've improved their skills with 25Maths resources.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://gumroad.com/l/25maths-number" class="gumroad-button bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition transform hover:-translate-y-1">
                Buy Now - £12.00
            </a>
            <button onclick="downloadSample()" class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition">
                Download Free Sample
            </button>
        </div>
        <p class="mt-6 text-sm opacity-75">
            ✓ Instant download  ✓ 14-day guarantee  ✓ Lifetime access
        </p>
    </div>
</section>
```

Then: Standard Footer → Standard Mobile Menu JS → Standard Download Sample JS → `</body></html>`

---

## Verification Checklist

- [ ] Both files have complete `<head>` with all 4 Tailwind colors, Google Fonts (5 weights), Gumroad script
- [ ] Both files have `<html lang="en">` and viewport meta
- [ ] Both files have working mobile menu (button + panel + JS)
- [ ] Both files have the standard full 4-column footer with all links
- [ ] Functions page: blue gradient (`from-secondary to-blue-900`), letter "F", price £15.00
- [ ] Number page: green gradient (`from-success to-emerald-900`), letter "N", price £12.00
- [ ] Breadcrumb links to `/` and `/products.html` work
- [ ] Gumroad buttons use correct placeholder links
- [ ] "Download Free Sample" button triggers alert
- [ ] All footer links point to correct pages
- [ ] No nav item is highlighted
- [ ] Page titles follow format: `{Product Name} | 25Maths`
