# 25Maths Website - Multi-Agent Parallel Execution Plan

> **Last Updated**: 2026-02-09
> **Status**: IN PROGRESS
> **Website**: www.25maths.com (GitHub Pages)
> **Tech Stack**: Pure HTML + Tailwind CSS CDN + Google Fonts (Inter)

---

## Project Overview

25Maths is a static website selling bilingual (English/Chinese) IGCSE Mathematics resources via Gumroad. Three products exist (Algebra, Functions, Number) but only Algebra is live on the website. This plan deploys all products and fixes critical gaps.

## Current State

| Page | Path | Status |
|------|------|--------|
| Homepage | `index.html` | Needs update (Functions/Number still "Coming Soon") |
| Products listing | `products.html` | Needs update (same issue) |
| Pricing | `pricing.html` | Needs update (bundles "Coming Soon") |
| About | `about.html` | Missing mobile menu + full footer |
| Support | `support.html` | Missing mobile menu + full footer |
| Algebra product | `products/algebra.html` | Live but missing mobile menu |
| Functions product | `products/functions.html` | **DOES NOT EXIST** |
| Number product | `products/number.html` | **DOES NOT EXIST** |
| Terms of Service | `terms.html` | **DOES NOT EXIST** (footer links 404) |
| Privacy Policy | `privacy.html` | **DOES NOT EXIST** (footer links 404) |
| Free Resources | `free/index.html` | **DOES NOT EXIST** |
| sitemap.xml | `sitemap.xml` | **DOES NOT EXIST** |
| robots.txt | `robots.txt` | **DOES NOT EXIST** |

## Design System

```
Colors (Tailwind config):
  primary:   '#8B1538'  (Burgundy)
  secondary: '#2563EB'  (Blue)
  warning:   '#F59E0B'  (Amber)
  success:   '#10B981'  (Green)

Font: Inter (weights: 400, 500, 600, 700, 800)
CDN: https://cdn.tailwindcss.com
```

### Standard Tailwind Config Block (use in every HTML file)
```html
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
```

### Standard Navigation (Desktop + Mobile)
```html
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

**Mobile menu JS** (add before `</body>`):
```html
<script>
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
</script>
```

**Active page highlight**: Change the current page's nav link from `text-gray-700 hover:text-primary transition` to `text-primary font-semibold`.

### Standard Full Footer
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

## Product Data

### Algebra (LIVE)
- **Title**: Algebra Complete Bundle
- **Price**: £15.00 | **Rating**: 9.5/10
- **Content**: 20 bilingual vocab cards + 45+ practice questions (3 levels) + answer key + quick reference = 39 pages
- **Hero**: `bg-gradient-to-br from-primary to-purple-900`, letter "A"
- **Gumroad**: `https://gumroad.com/l/25maths-algebra`

### Functions (TO CREATE)
- **Title**: Functions & Graphs Complete Bundle
- **Price**: £15.00 | **Rating**: 9.8/10
- **Content**: 20 bilingual vocab cards + 50+ practice questions (3 levels) + quick reference = 41 pages
- **Hero**: `bg-gradient-to-br from-secondary to-blue-900`, letter "F"
- **Gumroad**: `https://gumroad.com/l/25maths-functions`

### Number (TO CREATE)
- **Title**: Number System Starter Pack
- **Price**: £12.00 | **Rating**: 9.7/10
- **Content**: 40+ bilingual vocab cards + 45+ practice questions (3 levels) + quick reference = 27 pages
- **Hero**: `bg-gradient-to-br from-success to-emerald-900`, letter "N"
- **Gumroad**: `https://gumroad.com/l/25maths-number`

## Free Resources (8 PDFs to copy)

Source: `/Users/zhuxingzhe/Project/ExamBoard/25Maths/products/freebies/`
Target: `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/free/`

| File | Source Subfolder |
|------|-----------------|
| Algebra-Vocab-Cards.pdf | vocab-algebra/ |
| Coordinate-Geometry-Vocab-Cards.pdf | vocab-coordinate/ |
| Geometry-Vocab-Cards.pdf | vocab-geometry/ |
| Mensuration-Vocab-Cards.pdf | vocab-mensuration/ |
| Number-Vocab-Cards.pdf | vocab-number/ |
| Statistics-Vocab-Cards.pdf | vocab-statistics/ |
| Trigonometry-Vocab-Cards.pdf | vocab-trigonometry/ |
| Vectors-Vocab-Cards.pdf | vocab-vectors/ |

## Key Decisions

- **Gumroad**: Products not yet created on Gumroad. Use placeholder links (`25maths-algebra`, `25maths-functions`, `25maths-number`). User replaces later.
- **Email Collection**: Use **Formspree** with placeholder `{FORM_ID}`. User registers at formspree.io and replaces before deploy.
- **Free Resources Count**: Keep "14 Free Resources" stat. Currently 8 PDFs available, rest to be added later.

---

## Execution Architecture

### Wave 1: 5 Parallel Agents (Zero File Conflicts)

| Agent | Files Owned | AI Assignment |
|-------|------------|---------------|
| A | `products/functions.html` (CREATE), `products/number.html` (CREATE) | **Codex** |
| B | `terms.html`, `privacy.html`, `sitemap.xml`, `robots.txt` (all CREATE) | **Gemini CLI** |
| C | `index.html` (MODIFY) | **Claude Code** |
| D | `products.html`, `pricing.html` (MODIFY) | **Claude Code** |
| E | `about.html`, `support.html` (MODIFY), `free/*` (CREATE) | **Claude Code** |

### Wave 2: Consistency Check

| Agent | Scope | AI Assignment |
|-------|-------|---------------|
| F | All files - footer/nav/mobile menu consistency | **Claude Code** |

## Progress Tracking

| Agent | Task | Status | Assigned To |
|-------|------|--------|-------------|
| A | Create Functions + Number product pages | `pending` | Codex |
| B | Create legal pages + SEO files | `pending` | Gemini CLI |
| C | Update homepage (index.html) | `pending` | Claude Code |
| D | Update products.html + pricing.html | `pending` | Claude Code |
| E | Update about/support + create free resources | `pending` | Claude Code |
| F | Full-site consistency audit | `blocked` (needs Wave 1) | Claude Code |

---

## How to Use This Plan

**For any AI tool starting work:**
1. Read this `PROJECT-PLAN.md` first for full context
2. Read your specific task doc in `tasks/AGENT-{X}-*.md`
3. Read `products/algebra.html` as the template reference
4. Only modify files listed in YOUR agent's ownership
5. After completing, update the Progress Tracking table above

**For the human operator:**
1. Assign each agent doc to the appropriate AI tool
2. Wave 1 agents can run simultaneously (no file conflicts)
3. After Wave 1 completes, run Agent F for consistency check
4. Replace `{FORM_ID}` with real Formspree endpoint before deploy
5. Create Gumroad products and update placeholder links
