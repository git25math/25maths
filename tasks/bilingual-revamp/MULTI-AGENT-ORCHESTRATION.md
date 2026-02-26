# Multi-Agent Orchestration - Bilingual Revamp

## Operating Model

Use isolated file ownership per agent to avoid merge conflicts and enforce deterministic execution.

## Agent Matrix

| Agent | Workstream | Primary Scope | Deliverables |
| --- | --- | --- | --- |
| Agent-A | Toggle Foundation | `_includes/`, `assets/js/`, `assets/css/` | UI toggle, state persistence, helper classes |
| Agent-B | Pilot Content Merge | `index.html`, `exercises/index.html`, `cie0580/*.html` | English-primary pages with bilingual sections |
| Agent-C | Gift Logic | `free-gift.html`, `subscription.html`, support forms | Need-based gift fields and payload updates |
| Agent-D | SEO Migration | `sitemap.xml`, redirect-related pages/templates | URL mapping and migration-safe metadata |
| Agent-E | QA/Debug | checks and validation scripts | Regression checks, issue reproduction logs |
| Agent-F | Documentation Control | this task tree docs | Progress ledger, issue closure verification |

## Conflict Control

1. No two agents edit the same file in the same cycle.
2. Integration order:
   1. Agent-A
   2. Agent-B
   3. Agent-C
   4. Agent-D
   5. Agent-E
   6. Agent-F
3. If integration fails, open issue and stop downstream agent execution.

## Execution Cycle

1. Pick current phase from `MASTER-PLAN.md`.
2. Execute assigned tasks only.
3. Run validation.
4. Log result in `EXECUTION-LOG.md`.
5. If failed, record in `ISSUES-AND-FIXES.md`, fix, and re-validate.

## Debug Policy

1. Stop-on-failure is mandatory.
2. Every defect entry must include:
   - Defect type
   - Root cause
   - Fix action
   - Validation result
3. No task can be marked complete without validation evidence.

