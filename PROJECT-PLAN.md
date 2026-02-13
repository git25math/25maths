# 25Maths Website - Project Plan

> **Last Updated**: 2026-02-13
> **Status**: DEPLOYED (Modular Restructure Complete)
> **Website**: https://www.25maths.com (GitHub Pages + Jekyll)
> **Tech Stack**: Jekyll + Tailwind CSS CDN + Google Fonts (Inter)
> **Payment**: Payhip (5% fee, built-in email marketing)
> **Pricing**: USD ($17/$17/$12)

---

## Project Overview

25Maths is a modular static website (Jekyll on GitHub Pages) selling bilingual (English/Chinese) mathematics resources for multiple international exam boards. The site uses a per-module architecture where each exam board has independent pages for products, pricing, and free resources. A weekly membership model ($9.99/month) provides ongoing topical practice packs.

## Current State (as of 2026-02-11)

### Site Architecture

```
www.25maths.com/                  → Portal (module selector)
www.25maths.com/subscription.html → Weekly membership (CIE 0580)
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
| CIE 0580 | Active | 3 (Algebra $17, Functions $17, Number $12) | 8 vocab card sets | Live |
| Edexcel 4MA1 | Active (free only) | 0 (coming soon) | 6 vocab card sets | Coming soon |
| AMC 8 | Coming Soon | — | — | — |
| IAL Pure 1 | Coming Soon | — | — | — |
| IAL Pure 2 | Coming Soon | — | — | — |

### Page Inventory

| Page | Path | Status |
|------|------|--------|
| Portal homepage | `index.html` | ✅ Live |
| Membership | `subscription.html` | ✅ Live |
| Waitlist thank-you | `thanks.html` | ✅ Live |
| Blog index | `blog/index.html` | ✅ Live |
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
- **Price**: $17.00 | **Rating**: 9.5/10
- **Content**: 20 bilingual vocab cards + 45+ practice questions (3 levels) + answer key = 39 pages
- **Payhip**: `https://payhip.com/b/{PRODUCT_ID}` (to be updated)

### Functions (LIVE)
- **Price**: $17.00 | **Rating**: 9.8/10
- **Content**: 20 bilingual vocab cards + 50+ practice questions (3 levels) = 41 pages
- **Payhip**: `https://payhip.com/b/{PRODUCT_ID}` (to be updated)

### Number (LIVE)
- **Price**: $12.00 | **Rating**: 9.7/10
- **Content**: 40+ bilingual vocab cards + 45+ practice questions (3 levels) = 27 pages
- **Payhip**: `https://payhip.com/b/{PRODUCT_ID}` (to be updated)

### Free Resources
- CIE 0580: https://payhip.com/b/5j2Sz (8 vocab card sets)
- Edexcel 4MA1: https://payhip.com/b/JzU7h (6 vocab card sets)

## Completed Milestones

| Date | Milestone |
|------|-----------|
| 2026-02-09 | Initial website launch — all CIE 0580 products, legal pages, SEO, free resources |
| 2026-02-09 | Added 6 Edexcel 4MA1 vocabulary cards |
| 2026-02-10 | **Modular restructure** — Jekyll templates, per-exam-board architecture, 5 modules |
| 2026-02-10 | Bug fixes — footer links, redirect layouts, ARIA, favicon, OG tags, PDF cleanup |
| 2026-02-10 | **Payment platform migration** — Switched from Gumroad to Payhip (5% vs 12.5% fees) |
| 2026-02-10 | **Pricing strategy update** — Changed from GBP to USD ($17/$17/$12 for global market) |
| 2026-02-10 | Free resources → Payhip email gate (CIE + 4MA1) |
| 2026-02-10 | Refund policy: all sales final + quality promise |
| 2026-02-10 | Currency migration: GBP → USD site-wide |
| 2026-02-10 | Admin changelog (admin/changelog.html) |
| 2026-02-10 | Strategic framework integration (30-60-90, IP, constraints) |
| 2026-02-11 | **Membership launch prep** — subscription page, waitlist flow, email templates |
| 2026-02-11 | **Blog launch** — blog index, post layout, starter articles |
| 2026-02-11 | **Homepage update** — latest articles section + blog navigation |
| 2026-02-11 | **Multilingual rollout** — EN/简体/繁體 home, subscription, blog, starter posts |
| 2026-02-11 | **CIE 0580 multilingual expansion** — localized module pages + product detail pages |
| 2026-02-11 | **Language simplification** — streamlined to EN + 简体双语站点 |
| 2026-02-11 | **Scope change** — removed AMC8 and IAL modules from active site |

## Next Steps

### Short-term
1. **Complete Payhip integration** — Upload 3 paid products, replace remaining Gumroad purchase links
2. **Google Search Console** — Submit sitemap.xml, verify site ownership
3. **Edexcel 4MA1 products** — Create premium bundles when content is ready, update products.html and pricing.html

### Medium-term
5. **Tailwind build pipeline** — Replace CDN with CLI-built CSS for production (< 10KB vs ~300KB)
6. **AMC 8 content** — Create resources, update module status in _config.yml from coming_soon to active
7. **IAL Pure content** — Same as above for IAL P1 and P2
8. **favicon.ico / apple-touch-icon.png** — Generate from favicon.svg for broader browser support

### Long-term
9. **Subscription model** — Add subscription_price to module config, implement on pricing pages
10. **Migrate hosting** — Consider Cloudflare Pages/Netlify for true 301 redirects
11. **Analytics** — Add privacy-friendly analytics (Plausible/Umami)

## How to Add a New Module

1. Add module definition in `_config.yml` under `modules:`
2. Create directory: `module-name/index.html`
3. Navigation auto-updates via Liquid loop in `global-nav.html`
4. When ready: add `products.html`, `pricing.html`, `free/index.html`
5. Update `sitemap.xml` with new URLs
6. Change status from `coming_soon` to `active` in `_config.yml`

## How to Add a New Product (to existing module)

1. Create product in Payhip, upload files, get product URL
2. Copy `cie0580/products/algebra.html` as template
3. Update: hero gradient, product data, FAQ, Payhip link
4. Add card to module's `products.html`
5. Add URL to `sitemap.xml`
6. Update `product_count` in `_config.yml`

## Waitlist Data Pipeline (2026-02-12)

- **Collection endpoint**: one Google Apps Script Web App URL (configured in `_config.yml` `waitlist.endpoint`)
- **Form scope**: CIE 0580 product pages + support forms + free gift survey pages
- **Metadata fields**: `topic`, `module`, `lang`, `source_page`, `redirect_url`, `entry_point`
- **Dedupe rule**: primary key `email`; topic intent tracked with `email + topic`
- **Gift survey fields**: `persona`, `exam_board_interest`, `target_exam_session`, `consent_updates`
- **Implementation files**:
  - Plan: `plan/WAITLIST-GSHEETS-PLAN.md`
  - GAS template: `plan/WAITLIST-GSHEETS.gs`
