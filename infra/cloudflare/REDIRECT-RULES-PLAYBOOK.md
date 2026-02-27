# Cloudflare Redirect Rules Playbook (BR-005)

## Goal

Enable true HTTP 301 for legacy language paths while keeping the current English-primary route architecture:

- `/en/*` -> canonical primary route
- `/zh-cn/*` -> canonical primary route
- `/zh-cn/cie0580/products/*` -> `/cie0580/products.html`

## Preconditions

1. DNS for `www.25maths.com` is proxied by Cloudflare (orange cloud).
2. You can access Cloudflare dashboard for the `25maths.com` zone.
3. Current repository already contains fallback redirect pages and `_redirects`.
4. Use the free-plan compatible expressions below (`substring`), not `regex_replace` (entitlement-gated).

## Dashboard Steps

1. Cloudflare Dashboard -> `25maths.com` -> `Rules` -> `Redirect Rules`.
2. Create rules in the exact order below (top to bottom priority).

## Rule 1: Legacy zh-cn product leafs -> products hub

- Name: `legacy-zh-products-to-hub`
- If incoming requests match:
  - Expression:
    - `starts_with(http.request.uri.path, "/zh-cn/cie0580/products/")`
- Then:
  - Type: `Dynamic`
  - URL:
    - `concat("https://www.25maths.com", "/cie0580/products.html")`
  - Status code: `301`
  - Preserve query string: `On`

## Rule 2: /en root -> home

- Name: `legacy-en-root-to-home`
- If incoming requests match:
  - Expression:
    - `http.request.uri.path eq "/en"`
- Then:
  - Type: `Dynamic`
  - URL:
    - `concat("https://www.25maths.com", "/")`
  - Status code: `301`
  - Preserve query string: `On`

## Rule 3: /en prefix -> canonical root paths

- Name: `legacy-en-prefix-to-canonical`
- If incoming requests match:
  - Expression:
    - `starts_with(http.request.uri.path, "/en/")`
- Then:
  - Type: `Dynamic`
  - URL:
    - `concat("https://www.25maths.com", substring(http.request.uri.path, 3))`
  - Status code: `301`
  - Preserve query string: `On`

## Rule 4: /zh-cn root -> home

- Name: `legacy-zh-root-to-home`
- If incoming requests match:
  - Expression:
    - `http.request.uri.path eq "/zh-cn"`
- Then:
  - Type: `Dynamic`
  - URL:
    - `concat("https://www.25maths.com", "/")`
  - Status code: `301`
  - Preserve query string: `On`

## Rule 5: /zh-cn prefix -> canonical root paths

- Name: `legacy-zh-prefix-to-canonical`
- If incoming requests match:
  - Expression:
    - `starts_with(http.request.uri.path, "/zh-cn/")`
- Then:
  - Type: `Dynamic`
  - URL:
    - `concat("https://www.25maths.com", substring(http.request.uri.path, 6))`
  - Status code: `301`
  - Preserve query string: `On`

## Post-Apply Validation

Run:

```bash
scripts/health/check_redirect_301_live.sh https://www.25maths.com
```

Expected output:

- `PASS: 301` for all checks
- Final line: `Result: PASSED`

If you still get HTTP 200, inspect diagnostics:

- `server=GitHub.com` and `cf-ray=n/a`: traffic is bypassing Cloudflare proxy.
- Action: Cloudflare Dashboard -> `DNS` -> set `www` (and apex `@` if used directly) to **Proxied** (orange cloud), then re-test.
- Re-validate:
  - `curl -I https://www.25maths.com/en/` (should show Cloudflare headers once proxy is active)
  - `scripts/health/check_redirect_301_live.sh https://www.25maths.com`

If you get HTTP 403 with `cf-mitigated: challenge`:

- This is Cloudflare security challenge (not redirect-rule syntax failure).
- Check `Security -> Events`, search by `Ray ID` from response header.
- Most common fixes:
  - Turn off `Under Attack Mode` in `Security -> Settings`.
  - Relax or disable any custom WAF rule using `Managed Challenge` on this host.
  - If enabled, turn off `Bot Fight Mode` temporarily and re-test.
- After changing security policy, re-run:
  - `scripts/health/check_redirect_301_live.sh https://www.25maths.com`

## CLI Apply Option (API Token)

You can apply the same rules via API instead of dashboard clicks:

```bash
export CF_API_TOKEN="***"
export CF_ZONE_ID="***"
export CF_CANONICAL_ORIGIN="https://www.25maths.com"
scripts/deploy/apply_cloudflare_redirect_rules.sh
```

Required token scope:

- Zone -> Rulesets -> Edit

## Rollback

If any unexpected behavior occurs:

1. Disable Rule 2 and Rule 3 first.
2. Keep Rule 1 enabled (safe consolidation of deprecated leaf pages).
3. Re-run:
   - `scripts/health/check_site.sh`
   - `scripts/health/check_redirect_301_live.sh https://www.25maths.com`
