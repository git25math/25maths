# 25Maths Website - Project Plan

> **Last Updated**: 2026-02-10
> **Status**: DEPLOYED (Modular Restructure Complete)
> **Website**: https://www.25maths.com (GitHub Pages + Jekyll)
> **Tech Stack**: Jekyll + Tailwind CSS CDN + Google Fonts (Inter)

---

## Project Overview

25Maths is a modular static website (Jekyll on GitHub Pages) selling bilingual (English/Chinese) mathematics resources for multiple international exam boards. The site uses a per-module architecture where each exam board has independent pages for products, pricing, and free resources.

## Current State (as of 2026-02-10)

### Site Architecture

```
www.25maths.com/                  → Portal (module selector)
www.25maths.com/cie0580/          → CIE 0580 module (active)
www.25maths.com/edx4ma1/          → Edexcel 4MA1 module (active)
www.25maths.com/amc8/             → AMC 8 module (coming soon)
www.25maths.com/edx-ial-p1/       → IAL Pure 1 module (coming soon)
www.25maths.com/edx-ial-p2/       → IAL Pure 2 module (coming soon)
www.25maths.com/about.html        → Global page
www.25maths.com/support.html      → Global page
www.25maths.com/terms.html        → Global page
www.25maths.com/privacy.html      → Global page
```

### Module Status

| Module | Status | Products | Free Resources | Pricing |
|--------|--------|----------|----------------|---------|
| CIE 0580 | Active | 3 (Algebra £15, Functions £15, Number £12) | 8 vocab card sets | Live |
| Edexcel 4MA1 | Active (free only) | 0 (coming soon) | 6 vocab card sets | Coming soon |
| AMC 8 | Coming Soon | — | — | — |
| IAL Pure 1 | Coming Soon | — | — | — |
| IAL Pure 2 | Coming Soon | — | — | — |

### Page Inventory

| Page | Path | Status |
|------|------|--------|
| Portal homepage | `index.html` | ✅ Live |
| CIE 0580 homepage | `cie0580/index.html` | ✅ Live |
| CIE 0580 products | `cie0580/products.html` | ✅ Live |
| CIE 0580 pricing | `cie0580/pricing.html` | ✅ Live |
| CIE 0580 free resources | `cie0580/free/index.html` | ✅ Live |
| CIE 0580 Algebra detail | `cie0580/products/algebra.html` | ✅ Live |
| CIE 0580 Functions detail | `cie0580/products/functions.html` | ✅ Live |
| CIE 0580 Number detail | `cie0580/products/number.html` | ✅ Live |
| Edexcel 4MA1 homepage | `edx4ma1/index.html` | ✅ Live |
| Edexcel 4MA1 products | `edx4ma1/products.html` | ✅ Placeholder |
| Edexcel 4MA1 pricing | `edx4ma1/pricing.html` | ✅ Placeholder |
| Edexcel 4MA1 free resources | `edx4ma1/free/index.html` | ✅ Live |
| AMC 8 landing | `amc8/index.html` | ✅ Coming soon |
| IAL P1 landing | `edx-ial-p1/index.html` | ✅ Coming soon |
| IAL P2 landing | `edx-ial-p2/index.html` | ✅ Coming soon |
| About | `about.html` | ✅ Live |
| Support | `support.html` | ✅ Live |
| Terms | `terms.html` | ✅ Live |
| Privacy | `privacy.html` | ✅ Live |
| 404 | `404.html` | ✅ Live |

## Design System

```
Colors (Tailwind config in _includes/head.html):
  primary:   '#8B1538'  (Burgundy — CIE 0580)
  secondary: '#2563EB'  (Blue — Edexcel 4MA1)
  warning:   '#F59E0B'  (Amber — AMC 8)
  success:   '#10B981'  (Green — IAL)

Font: Inter (weights: 400, 500, 600, 700, 800)
CDN: https://cdn.tailwindcss.com
```

## Jekyll Architecture

```
_config.yml             → Module definitions (drives navigation rendering)
_includes/
  head.html             → <head> (Tailwind, fonts, OG tags, favicon)
  global-nav.html       → Top dark nav bar (all modules + About/Support)
  module-nav.html       → White sub-nav (Overview/Products/Pricing/Free)
  footer.html           → 5-column footer (brand/boards/free/company/legal)
  mobile-menu-js.html   → Mobile menu toggle + smooth scroll
_layouts/
  global.html           → Layout for portal + global pages
  module.html           → Layout for module pages (adds module-nav)
```

### Front Matter Convention

**Module pages:**
```yaml
layout: module
title: "Page Title"
description: "Meta description"
module: cie0580        # matches key in _config.yml
active_page: products  # highlights in module-nav
```

**Global pages:**
```yaml
layout: global
title: "Page Title"
description: "Meta description"
active_global: about   # highlights in global-nav
```

## Product Data

### Algebra (LIVE)
- **Price**: £15.00 | **Rating**: 9.5/10
- **Content**: 20 bilingual vocab cards + 45+ practice questions (3 levels) + answer key = 39 pages
- **Gumroad**: `https://gumroad.com/l/25maths-algebra`

### Functions (LIVE)
- **Price**: £15.00 | **Rating**: 9.8/10
- **Content**: 20 bilingual vocab cards + 50+ practice questions (3 levels) = 41 pages
- **Gumroad**: `https://gumroad.com/l/25maths-functions`

### Number (LIVE)
- **Price**: £12.00 | **Rating**: 9.7/10
- **Content**: 40+ bilingual vocab cards + 45+ practice questions (3 levels) = 27 pages
- **Gumroad**: `https://gumroad.com/l/25maths-number`

## Completed Milestones

| Date | Milestone |
|------|-----------|
| 2026-02-09 | Initial website launch — all CIE 0580 products, legal pages, SEO, free resources |
| 2026-02-09 | Added 6 Edexcel 4MA1 vocabulary cards |
| 2026-02-10 | **Modular restructure** — Jekyll templates, per-exam-board architecture, 5 modules |
| 2026-02-10 | Bug fixes — footer links, redirect layouts, ARIA, favicon, OG tags, PDF cleanup |
| 2026-02-10 | Removed subscription forms (Formspree not yet configured) |

## Next Steps

### Short-term
1. **Formspree integration** — Register at formspree.io, create form, add subscription sections back with real form ID
2. **Google Search Console** — Submit sitemap.xml, verify site ownership
3. **Edexcel 4MA1 products** — Create premium bundles when content is ready, update products.html and pricing.html

### Medium-term
4. **Tailwind build pipeline** — Replace CDN with CLI-built CSS for production (< 10KB vs ~300KB)
5. **AMC 8 content** — Create resources, update module status in _config.yml from coming_soon to active
6. **IAL Pure content** — Same as above for IAL P1 and P2
7. **favicon.ico / apple-touch-icon.png** — Generate from favicon.svg for broader browser support

### Long-term
8. **Subscription model** — Add subscription_price to module config, implement on pricing pages
9. **Migrate hosting** — Consider Cloudflare Pages/Netlify for true 301 redirects
10. **Analytics** — Add privacy-friendly analytics (Plausible/Umami)

## How to Add a New Module

1. Add module definition in `_config.yml` under `modules:`
2. Create directory: `module-name/index.html`
3. Navigation auto-updates via Liquid loop in `global-nav.html`
4. When ready: add `products.html`, `pricing.html`, `free/index.html`
5. Update `sitemap.xml` with new URLs
6. Change status from `coming_soon` to `active` in `_config.yml`

## How to Add a New Product (to existing module)

1. Copy `cie0580/products/algebra.html` as template
2. Update: hero gradient, product data, FAQ, Gumroad link
3. Add card to module's `products.html`
4. Add URL to `sitemap.xml`
5. Update `product_count` in `_config.yml`
