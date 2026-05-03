# Member Learning Platform Execution Plan

> Status: Revised after website exercise retirement.
> Original plan: 2026-02-18.
> Revised: 2026-05-03.

The original plan assumed an online exercise player, raw question attempts, and exercise-session telemetry. Those surfaces have been removed from `25maths-website`. This plan now covers the active member system only.

## Current Scope

1. Free members
- Register and sign in.
- See resource recommendations for CIE 0580 and Edexcel 4MA1.
- Access free worksheet packs and Kahoot paths.

2. Paid members
- Receive Payhip-backed entitlements.
- Download protected worksheet/resource packs through signed access.
- See membership status, downloads, and lightweight engagement summaries.

3. Operations
- Sync Payhip events into `membership_status` and `entitlements`.
- Summarize non-retired activity into `user_daily_activity`.
- Keep recommendations pointed at active resources, not retired exercise pages.

## Architecture Baseline

1. Frontend: Jekyll + Cloudflare Pages.
2. Identity/Data: Supabase Auth + Postgres + RLS.
3. Billing Sync: Payhip webhook -> membership status + entitlements.
4. Access Gateway: `/api/v1/download/:release_id`.
5. Activity: `user_daily_activity` + entitlement/download/resource signals.

## Delivery Phases

| Phase | Scope | Done When |
|---|---|---|
| P0 | Auth and entitlement bootstrap | Login, profile, Payhip reconciliation, and member shell are stable |
| P1 | Free resource guidance | Member pages route to free packs, Kahoot, and board resource pages |
| P2 | Paid download access | Active entitlements can obtain short-lived signed download links |
| P3 | Resource recommendation layer | Recommendations are based on board, tier, downloads, and current resource metadata |
| P4 | Engagement summary | `user_daily_activity` powers streak/achievement-style views without raw question attempts |
| P5 | Hardening | Health checks, rollback notes, and manual verification stay current |

## Non-Goals

- No online exercise player.
- No raw question-attempt storage in the website.
- No exercise-session completion endpoint.
- No institution homework flow backed by the retired exercise catalog.
- No member benefit trigger that depends on retired exercise telemetry.

## Future Practice Integration

If a new practice/question-bank product is built later, it should publish narrow aggregate signals into the website. The website member system should consume those aggregates instead of owning raw question stems, attempts, or adaptive-selection logic.
