# Cloudflare Pages Functions (Member System)

## Routes

- `POST /api/v1/exercise/session/start`
  - File: `functions/api/v1/exercise/session/start.js`
- `POST /api/v1/exercise/session/:id/attempt`
  - File: `functions/api/v1/exercise/session/[id]/attempt.js`
- `POST /api/v1/exercise/session/:id/complete`
  - File: `functions/api/v1/exercise/session/[id]/complete.js`
- `POST /api/v1/membership/webhook/payhip`
  - File: `functions/api/v1/membership/webhook/payhip.js`
- `POST /api/v1/membership/reconcile`
  - File: `functions/api/v1/membership/reconcile.js`
- `GET /api/v1/membership/benefits`
  - File: `functions/api/v1/membership/benefits.js`
- `GET /api/v1/download/:release_id`
  - File: `functions/api/v1/download/[release_id].js`

## Required Environment Variables

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYHIP_API_KEY` (preferred)

Optional:

- `PAYHIP_WEBHOOK_SECRET` (legacy alias of `PAYHIP_API_KEY`)
- `DOWNLOAD_SIGN_TTL_SECONDS` (default `600`)
- `ALLOWED_MEMBER_BUCKETS` (default `member-files`, comma-separated)
- `MEMBER_BENEFITS_JSON` (optional, JSON array of active-member benefit objects)
- `MEMBER_SUBSCRIPTION_DISCOUNT_LABEL` (optional fallback)
- `MEMBER_SUBSCRIPTION_DISCOUNT_DESC` (optional fallback)
- `MEMBER_SUBSCRIPTION_DISCOUNT_CTA_LABEL` (optional fallback)
- `MEMBER_SUBSCRIPTION_DISCOUNT_CTA_URL` (optional fallback)
- `MEMBER_COURSEPACK_COUPON_TITLE` (optional fallback)
- `MEMBER_COURSEPACK_COUPON_DESC` (optional fallback)
- `MEMBER_COURSEPACK_COUPON_CODE` (optional fallback)
- `MEMBER_COURSEPACK_COUPON_CTA_LABEL` (optional fallback)
- `MEMBER_COURSEPACK_COUPON_CTA_URL` (optional fallback)

If `public.member_benefit_offers` has active rows, `/api/v1/membership/benefits` prefers DB offers.
If DB offers are empty/unavailable, it falls back to env-based offers.

## Webhook Signature Verification

`/api/v1/membership/webhook/payhip` supports two verification modes:

1. Preferred: `X-Payhip-*` signature header present -> verify HMAC-SHA256(raw_body, `PAYHIP_API_KEY`).
2. Legacy fallback: payload field `signature` -> verify `sha256(PAYHIP_API_KEY)`.

## Release Registry

- Runtime registry: `functions/_lib/release_registry.js`
- Planning registry: `_data/releases.json`

Keep both files aligned when adding new releases.

Sync command:

```bash
node scripts/member/sync_release_registry.js
```

## Quick Local Verification

1. Start local preview (if you use Cloudflare Pages tooling).
2. Start an exercise session (member token required):
   - `POST /api/v1/exercise/session/start`
3. Record one question attempt:
   - `POST /api/v1/exercise/session/<session_id>/attempt`
4. Complete exercise session:
   - `POST /api/v1/exercise/session/<session_id>/complete`
5. Hit a payhip release:
   - `GET /api/v1/download/cie0580-free-vocab-bundle-2026w07`
6. Test member route (after member release is active and asset uploaded):
   - `GET /api/v1/download/<release_id>?channel=member` with bearer token.
7. Reconcile pending member events:
   - `POST /api/v1/membership/reconcile` with bearer token.
8. Fetch paid-member benefits:
   - `GET /api/v1/membership/benefits` with bearer token.

## Member Benefit Offers Table (Optional but Recommended)

Table: `public.member_benefit_offers`

Used to manage paid-member offers without editing Cloudflare env vars every time.
Recommended columns to set per offer:

- `id` (text, unique)
- `title` (text)
- `kind` (text; e.g. `coursepack_coupon`, `subscription_discount`)
- `description` (text, optional)
- `cta_label` / `cta_url` (optional)
- `coupon_code` (optional)
- `available_for` (`paid` / `all` / `free`)
- `is_active` (boolean)
- `priority` (integer, lower shows first)
- `starts_at` / `ends_at` (optional window)
