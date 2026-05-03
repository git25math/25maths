# Student Weekly Report System

> Status: Revised for the post-exercise website.
> Created: 2026-02-27.
> Revised: 2026-05-03.

The original report spec queried the retired website exercise product line. That data source is no longer part of the active site.

## Current Scope

Weekly reports, if implemented, should summarize current website activity only:

- Membership and entitlement status.
- Downloaded worksheet/resource packs.
- Recent Kahoot or resource-pack activity where tracked.
- Institution resource plans and follow-up notes.
- Daily activity rows from `user_daily_activity`.

## Non-Goals

- Do not report against deleted online exercise-player sessions.
- Do not depend on retired exercise-catalog question attempts.
- Do not recreate the deleted exercise product line to power reports.

## Future Practice Integration

A future standalone practice platform may publish weekly aggregates into a summary table or analytics service. The website report system should consume those aggregates through a narrow contract instead of directly coupling to raw question-attempt storage.
