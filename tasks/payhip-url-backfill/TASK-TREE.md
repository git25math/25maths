# Payhip URL Backfill Task Tree

## Objective

Run Payhip listing URL backfill in an isolated task tree with strict scope and full execution traceability.

## Scope

1. Intake confirmed final Payhip product URLs.
2. Map each URL to exact SKU and subtopic key.
3. Backfill URLs into site data and ops trackers.
4. Verify each final URL is live.

## Rules Of Execution

1. Execute only URL backfill work in this task tree.
2. For each L1 item, update both site data files:
- `_data/kahoot_subtopic_links.json`
- `payhip/presale/kahoot-subtopic-links-working.csv`
3. For each L1 item, update both ops files:
- `payhip/presale/upload-batches/l1/l1-url-backfill-template.csv`
- `payhip/presale/upload-batches/l1/l1-ops-sheet.csv`
4. Record every change in `EXECUTION-LOG.md` with concrete evidence.
5. Record blockers in `ISSUES-AND-FIXES.md`.
6. Log scope changes in `CHANGE-CONTROL.md` before execution.

## Document Map

- Master plan: `tasks/payhip-url-backfill/MASTER-PLAN.md`
- Next actions: `tasks/payhip-url-backfill/NEXT-ACTIONS.md`
- Execution log: `tasks/payhip-url-backfill/EXECUTION-LOG.md`
- Issues and fixes: `tasks/payhip-url-backfill/ISSUES-AND-FIXES.md`
- Change control: `tasks/payhip-url-backfill/CHANGE-CONTROL.md`

## Phase Status

- Phase 0: Task-tree setup - Completed
- Phase 1: First intake URL backfill (`L1-CIE0580-C1-02`) - Completed
- Phase 2: Additional URL intake and verification - In Progress
