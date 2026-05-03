# Member System Command Center

> Status: Revised after website exercise retirement.
> Original command center: 2026-02-18.
> Revised: 2026-05-03.

The member system is active, but the old online exercise telemetry and exercise-catalog assignment model is retired. Current work must use auth, entitlements, downloads, resource signals, and `user_daily_activity`.

## North Star

Build a membership layer that turns free resource discovery into paid resource access and ongoing engagement without depending on raw question attempts inside the website.

## Active Capabilities

1. Free members
- Email login and profile state.
- Resource recommendations for worksheet packs, Kahoot, and board pages.
- Lightweight activity summary.

2. Paid members
- Payhip-backed membership and release entitlements.
- Signed download access.
- Member dashboard surfaces for status, downloads, and active resource paths.

3. Operations
- Payhip webhook reconciliation.
- Release registry and entitlement consistency.
- Health checks that keep retired exercise routes, schema, and catalog dependencies offline.

## Delivery Streams

| Stream | Scope |
|---|---|
| S1 Identity | Supabase Auth, profiles, session handling |
| S2 Entitlements | `membership_status`, `entitlements`, Payhip reconciliation |
| S3 Downloads | Signed resource delivery and non-member denial |
| S4 Engagement | `user_daily_activity`, streak/achievement-style summaries from current activity |
| S5 Recommendations | Board/tier/resource recommendations, not retired exercise attempts |
| S6 Hardening | CI health checks, rollback notes, and evidence logs |

## Phase Gates

| Gate | Definition |
|---|---|
| A Free MVP | Login works, member shell loads, free resources are reachable |
| B Paid MVP | Payhip events grant entitlements and downloads work through signed links |
| C Resource Personalization | Recommendations are explainable through board, tier, release, and resource metadata |
| D Production Readiness | Smoke tests, health checks, and rollback notes are current |

## Non-Negotiables

- Do not query or recreate `exercise_sessions`, `question_attempts`, `assignments`, or `assignment_submissions`.
- Do not point member navigation to retired `/exercises/` routes.
- Do not add benefit triggers based on retired exercise completion or mistake counts.
- Do not reintroduce the exercise player, exercise JS, or exercise Functions API.

## Evidence Sources

- `docs/DEVELOPMENT-PLAN.md`
- `docs/CONTRIBUTING.md`
- `plan/MEMBER-SYSTEM-WORKBOARD.md`
- `plan/MEMBER-SYSTEM-API-CONTRACTS.md`
- `scripts/health/check_exercise_data.py`
