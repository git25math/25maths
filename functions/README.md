# Cloudflare Pages Functions (Member System)

## Routes

- `POST /api/v1/membership/webhook/payhip`
  - File: `functions/api/v1/membership/webhook/payhip.js`
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
2. Hit a payhip release:
   - `GET /api/v1/download/cie0580-free-vocab-bundle-2026w07`
3. Test member route (after member release is active and asset uploaded):
   - `GET /api/v1/download/<release_id>?channel=member` with bearer token.
