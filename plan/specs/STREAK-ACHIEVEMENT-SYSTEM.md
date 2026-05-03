# Daily Streak & Achievement System

> Status: Revised for the post-exercise website.
> Created: 2026-02-27.
> Revised: 2026-05-03.

The original version of this spec tied streaks, XP, and achievements to completed online exercise sessions. That integration is retired with the website exercise product line.

## Current Scope

The website may keep lightweight engagement records when they are fed by active product surfaces:

- Account creation and profile completion.
- Member downloads.
- Payhip entitlement activation.
- Resource page visits where tracking is explicitly implemented.
- Kahoot or worksheet-pack engagement signals when backed by current product data.
- Institution resource-planning activity.

`user_daily_activity` is the canonical daily summary table for the current website. Streak, XP, and achievement views should read from current activity summaries and active entitlement/download data, not from retired exercise-player events.

## Non-Goals

- No website exercise player completion screen.
- No exercise-catalog mastery graph.
- No exercise-catalog homework completion dependency.
- No revival of deleted exercise routes, layouts, runtime JavaScript, or telemetry tables.

## Future Direction

If 25Maths later ships a new CIE/Edexcel practice platform, its attempt telemetry should be designed in that product's own schema and then summarized into `user_daily_activity` for website-level engagement. The website should consume the summary, not own the full question-attempt event stream.
