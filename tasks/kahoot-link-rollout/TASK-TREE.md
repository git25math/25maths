# Kahoot Link Rollout Task Tree

## Objective

Run Kahoot challenge-link onboarding in an isolated task tree with strict scope boundaries and full auditability.

## Scope

1. Intake user-provided Kahoot challenge links by SubTopic.
2. Map each intake item to the exact `subtopic_id` in data sources.
3. Keep website-facing link data and working CSV in sync.

## Rules Of Execution

1. Execute only Kahoot link onboarding tasks listed in the active plan.
2. Record every meaningful change in `EXECUTION-LOG.md`.
3. Record blockers and fixes in `ISSUES-AND-FIXES.md`.
4. Any scope change must be logged in `CHANGE-CONTROL.md` before execution.
5. For each link change, update both:
- `_data/kahoot_subtopic_links.json`
- `payhip/presale/kahoot-subtopic-links-working.csv`

## Document Map

- Master plan: `tasks/kahoot-link-rollout/MASTER-PLAN.md`
- Next actions: `tasks/kahoot-link-rollout/NEXT-ACTIONS.md`
- Execution log: `tasks/kahoot-link-rollout/EXECUTION-LOG.md`
- Issues and fixes: `tasks/kahoot-link-rollout/ISSUES-AND-FIXES.md`
- Change control: `tasks/kahoot-link-rollout/CHANGE-CONTROL.md`

## Phase Status

- Phase 0: Task-tree setup - Completed
- Phase 1: First link onboarding (CIE 0580 C1.2 Sets CORE) - Completed
- Phase 2: Data validation - Completed
