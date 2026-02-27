# URL Migration Map (Validated v2)

## Purpose

Define legacy language routes and their target consolidated routes for phased migration and release enforcement.

## Rule

Map both `/en/*` and `/zh-cn/*` to the English-primary canonical path unless a page is intentionally retained as a dedicated localized utility page.

## Draft Mapping Table

| Legacy URL | Target URL | Migration Type | Notes |
| --- | --- | --- | --- |
| `/en/` | `/` | Redirect | Consolidate to primary homepage |
| `/zh-cn/` | `/` | Redirect | Chinese support moves to bilingual toggle |
| `/en/about.html` | `/about.html` | Redirect | |
| `/zh-cn/about.html` | `/about.html` | Redirect | |
| `/en/support.html` | `/support.html` | Redirect | |
| `/zh-cn/support.html` | `/support.html` | Redirect | |
| `/en/support-thanks.html` | `/support-thanks.html` | Redirect | |
| `/zh-cn/support-thanks.html` | `/support-thanks.html` | Redirect | |
| `/en/terms.html` | `/terms.html` | Redirect | |
| `/zh-cn/terms.html` | `/terms.html` | Redirect | |
| `/en/privacy.html` | `/privacy.html` | Redirect | |
| `/zh-cn/privacy.html` | `/privacy.html` | Redirect | |
| `/en/subscription.html` | `/subscription.html` | Redirect | |
| `/zh-cn/subscription.html` | `/subscription.html` | Redirect | |
| `/en/free-gift.html` | `/free-gift.html` | Redirect | |
| `/zh-cn/free-gift.html` | `/free-gift.html` | Redirect | |
| `/en/gift-thanks.html` | `/gift-thanks.html` | Redirect | |
| `/zh-cn/gift-thanks.html` | `/gift-thanks.html` | Redirect | |
| `/en/blog/` | `/blog/` | Redirect | Keep post-level route strategy unchanged until Phase 4 |
| `/zh-cn/blog/` | `/blog/` | Redirect | |
| `/en/cie0580/` | `/cie0580/` | Redirect | |
| `/zh-cn/cie0580/` | `/cie0580/` | Redirect | |
| `/en/cie0580/products.html` | `/cie0580/products.html` | Redirect | |
| `/zh-cn/cie0580/products.html` | `/cie0580/products.html` | Redirect | |
| `/en/cie0580/pricing.html` | `/cie0580/pricing.html` | Redirect | |
| `/zh-cn/cie0580/pricing.html` | `/cie0580/pricing.html` | Redirect | |
| `/en/cie0580/free/` | `/cie0580/free/` | Redirect | |
| `/zh-cn/cie0580/free/` | `/cie0580/free/` | Redirect | |
| `/zh-cn/exercises/` | `/exercises/` | Redirect | Keep query passthrough in final redirect rules |
| `/zh-cn/kahoot/` | `/kahoot/` | Redirect | |
| `/zh-cn/cie0580/products/algebra.html` | `/cie0580/products.html` | Redirect | Legacy leaf page consolidated into products hub |
| `/zh-cn/cie0580/products/number.html` | `/cie0580/products.html` | Redirect | Legacy leaf page consolidated into products hub |
| `/zh-cn/cie0580/products/functions.html` | `/cie0580/products.html` | Redirect | Legacy leaf page consolidated into products hub |

## Implementation Notes

1. Edge-level HTTP 301 is implemented via root `_redirects` (Cloudflare Pages): `/en/*` and `/zh-cn/*` to canonical primary routes.
2. Jekyll compatibility is enforced by `_config.yml` include rule for `_redirects` so built output also contains the same redirect table.
3. Legacy `redirect_to` on `en/*` and `zh-cn/*` pages remains as secondary safety net.
4. Canonical handling is aligned in `_includes/head.html` by preferring `page.redirect_to` when present.
5. `hreflang` emission has been removed from head include to match single-path bilingual architecture.

## Status

- Current state: `Validated v2`
- Production mirror paths confirmed and mapped.
- Infrastructure note: true 301 behavior in production requires Cloudflare edge activation (see `BR-005`).
