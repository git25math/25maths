# Member System Workboard

> Status: Revised after website exercise retirement.
> Original workboard: 2026-03-01.
> Revised: 2026-05-03.

## Sprint Objective

Keep the active member system focused on auth, entitlements, downloads, resource guidance, and non-retired engagement summaries.

## Stream Board

| ID | Stream | Status | Definition of Done |
|---|---|---|---|
| W1 | Auth + profile | done | Login, session, and profile bootstrap are stable |
| W2 | Payhip webhook | done | Sale/refund/cancel events update membership and entitlements idempotently |
| W3 | Download gateway | done | Members receive short-lived signed links; non-members are denied |
| W4 | Member dashboard | active | Status, downloads, and resource paths point only to active surfaces |
| W5 | Engagement summary | active | `user_daily_activity` powers summaries without retired exercise telemetry |
| W6 | Resource recommendations | active | Recommendations use board, tier, release, and resource metadata |
| W7 | Health gates | active | CI keeps retired exercise pages, JS, APIs, and schema offline |

## Current Notes

- Old exercise progress, mistake clustering, and question-attempt recommendations are retired.
- Teacher homework pages backed by the old exercise catalog are retired.
- Engagement API work must use current activity summaries, not raw question attempts.
- Future practice products should publish aggregates into the website through a deliberate contract.

## Recently Completed

1. Retired online exercise pages, data collections, player layout, runtime JS, and Functions APIs.
2. Removed old Supabase final-schema tables through the retirement migration.
3. Repointed institution scope to resource planning and follow-up.
4. Rewrote member and B2B specs for the post-exercise website.
5. Added guard checks to keep retired paths and schema from returning.

## Next Checks

1. Keep `python3 scripts/health/check_exercise_data.py` passing.
2. Keep member navigation pointed to free packs, Kahoot, resource pages, and member downloads.
3. Audit new Supabase migrations for any post-retirement attempt to recreate old tables.
4. Audit new Payhip/listing copy for language that implies the retired website exercise product is live.
