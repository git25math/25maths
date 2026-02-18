# Decisions Ledger - Interactive Exercises

## D-001 (2026-02-17)
Decision: launch a dedicated interactive-exercises product line to complete the learning loop with Kahoot and worksheet assets.
Reason: improve immersion, practice depth, and closed-loop user journey.

## D-002 (2026-02-17)
Decision: generation must follow extracted syllabus structure and ordering exactly.
Reason: ensure alignment with exam-board specification and prevent topic drift.

## D-003 (2026-02-17)
Decision: use Gemini CLI as generation engine, with script-level orchestration and audit.
Reason: keep batch production reproducible and quality-controlled.

## D-004 (2026-02-17)
Decision: current question engine baseline remains `multiple-choice` only.
Reason: stabilize production and validation before adding new interaction types.

## D-005 (2026-02-17)
Decision: LaTeX display can be supported; TikZ should not be rendered directly in browser runtime.
Reason: reliability and performance; diagrams should be converted offline to SVG.

## D-006 (2026-02-17)
Decision: TikzVault linkage is acknowledged and deferred.
Reason: immediate priority is Gemini interactive generation module stability.

## D-007 (2026-02-17)
Decision: integrate interactive-exercise entry points into homepage/navigation/module pages.
Reason: ensure discoverability and practical funnel closure.

## D-008 (2026-02-17)
Decision: add next-in-syllabus continuity on exercise pages.
Reason: reduce drop-off and encourage guided progression.

## D-009 (2026-02-17)
Decision: optimize hub UX with sticky filters, clear-filters control, and resume-last-practice card.
Reason: improve convenience and reduce friction on long lists.

## D-010 (2026-02-18)
Decision: all interactive-exercises context should be migrated into a dedicated task tree.
Reason: isolate from parallel streams and enable safe, long-term continuation.
