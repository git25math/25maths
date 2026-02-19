# Full-Site Bilingual Block Coverage Report

Date: 2026-02-20
Execution Context: `/private/tmp/25maths-i18n-optimization` (`codex/i18n-optimization-hardening`)

## 1) Audit Method

- Marker definition:
  - `bilingual-support-only`
  - `data-bilingual-block`
- Source scanned:
  - Canonical source HTML (excluding `/en/*`, `/zh-cn/*`, `_includes`, `_layouts`, assets, tests, scripts)
  - Targeted core-route checklist for user journeys
- Validation commands:
  - `node --check assets/js/bilingual_support.js`
  - `node --check assets/js/exercise_hub.js`
  - `bash scripts/health/check_bilingual_coverage.sh`
  - `bash scripts/health/check_style_consistency.sh`
  - `bundle exec jekyll build`

## 2) Coverage Snapshot

### A. Core journey routes (priority scope)

All key routes now have bilingual markers (`>0`), including `/exercises/`:

| Route | Marker Count |
| --- | --- |
| `/` | 10 |
| `/about.html` | 5 |
| `/cie0580/` | 12 |
| `/cie0580/products.html` | 8 |
| `/cie0580/pricing.html` | 10 |
| `/cie0580/free/` | 6 |
| `/edx4ma1/` | 5 |
| `/edx4ma1/products.html` | 8 |
| `/edx4ma1/pricing.html` | 10 |
| `/edx4ma1/free/` | 5 |
| `/exercises/` | 12 |
| `/kahoot/` | 4 |
| `/kahoot/cie0580/` | 3 |
| `/kahoot/edexcel-4ma1/` | 3 |
| `/free-gift.html` | 8 |
| `/subscription.html` | 8 |
| `/support.html` | 13 |
| `/blog/` | 2 |

Result: Core journey bilingual visibility is complete.

### B. Canonical source HTML (broad scope)

- Total scanned: `39`
- With markers: `28`
- Zero markers: `11`

Zero-marker pages are concentrated in non-core categories:

1. Redirect stubs / alias routes (expected to stay minimal)
- `cie0580/products/algebra.html`
- `cie0580/products/functions.html`
- `cie0580/products/number.html`
- `products/algebra.html`
- `products/functions.html`
- `products/number.html`
- `products.html`
- `pricing.html`
- `free/index.html`

2. Internal/template pages (non-user-facing)
- `admin/changelog.html`
- `projects/kahoot-channel/_templates/worksheet-pdf-template.html`

## 3) This Round Fix Confirmation

- `/exercises/index.html` marker count: `12` (was `0` in previous audit context).
- Runtime bilingual sync added for dynamic exercise summary/resume fallback text in `assets/js/exercise_hub.js`.
- Added compact bilingual helper copy to legal, thank-you, 404, and membership pages.
- Added CI gate `scripts/health/check_bilingual_coverage.sh` to prevent core bilingual regression.
- Guardrails remain healthy:
  - Bilingual coverage gate: `Failures: 0`
  - Style consistency: `Failures: 0`
  - Jekyll build: success

## 4) Recommended Next Wave (Optional)

1. Keep redirect stubs/template pages in expected-zero whitelist and fail only on unexpected zero-marker canonical pages.
2. Raise low-density pages (currently `blog/index.html`, `404.html`, and utility pages) from 1-2 markers to 3+ if richer bilingual guidance is desired.
3. Consume `bilingual-support:change` event in analytics pipeline to correlate toggle usage with lead/subscription conversion.
