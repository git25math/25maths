# Payhip Presale Task Tree

## Objective

Run all Payhip listing work in an isolated task tree, with strict scope boundaries and full execution traceability, so this stream can continue independently without conflicting with other parallel streams.

## Rules Of Execution

1. Execute only work related to Payhip listing and connected Kahoot presale data flow.
2. Record every meaningful change in `EXECUTION-LOG.md`.
3. Record every decision in `DECISIONS-LEDGER.md` before large batch execution.
4. Stop on blockers and log in `ISSUES-AND-FIXES.md`.
5. Any scope change must be registered in `CHANGE-CONTROL.md` first.
6. Do not modify files owned by unrelated task trees unless explicitly approved.

## Document Map

- Master plan: `tasks/payhip-presale/MASTER-PLAN.md`
- Baseline freeze: `tasks/payhip-presale/BASELINE-FREEZE.md`
- Decision ledger: `tasks/payhip-presale/DECISIONS-LEDGER.md`
- Execution log: `tasks/payhip-presale/EXECUTION-LOG.md`
- Issues and fixes: `tasks/payhip-presale/ISSUES-AND-FIXES.md`
- Change control: `tasks/payhip-presale/CHANGE-CONTROL.md`
- Parallel safety rules: `tasks/payhip-presale/PARALLEL-SAFETY.md`
- Context transfer + handoff: `tasks/payhip-presale/CONTEXT-HANDOFF.md`
- Next actions: `tasks/payhip-presale/NEXT-ACTIONS.md`

## Phase Status

- Phase 0: Task-tree setup and baseline freeze - Completed
- Phase 1: Catalog architecture and pricing standardization - Completed
- Phase 2: Cover asset pipeline and QA hardening - Completed
- Phase 3: Merchant copy and upload pack generation - Completed
- Phase 4: Payhip upload execution + URL backfill + verification - Pending
- Phase 5: Conversion and retention iteration - Pending

