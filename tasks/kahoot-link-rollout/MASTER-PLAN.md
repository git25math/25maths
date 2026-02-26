# Kahoot Link Rollout Master Plan

## Plan Metadata

- Plan ID: `KAHOOT-LINK-ROLLOUT-2026-02`
- Created On: `2026-02-20`
- Execution Mode: `Isolated task-tree with auditable logs`
- Scope Type: `Kahoot challenge URL onboarding`

## Strategic Goal

Maintain a reliable SubTopic-level Kahoot link map so each directory card opens the exact challenge link intended for that topic and tier.

## Non-Negotiable Constraints

1. Keep link data parity between JSON and working CSV.
2. Do not modify pricing, release dates, or bundle routing fields unless explicitly requested.
3. Use absolute dates (`YYYY-MM-DD`) in all operational logs and change records.
4. Preserve existing `subtopic_id` keys; only update relevant fields.

## Intake Queue

| Link ID | Board | Tier | SubTopic | Target SubTopic ID | Challenge URL | Status |
| --- | --- | --- | --- | --- | --- | --- |
| KL-001 | CIE 0580 | Core | C1.2 Sets | `cie0580:number-c1:c1-02-sets` | `https://kahoot.it/challenge/009357799` | Completed |

## Phase Breakdown

## Phase 0 - Setup

### Tasks

1. Create dedicated task-tree docs for Kahoot link onboarding.
2. Define scope and logging rules.

### Acceptance Criteria

1. Task-tree docs exist and are linked.
2. Scope and governance are explicit.

## Phase 1 - Link Intake And Mapping

### Tasks

1. Parse intake item into board/tier/subtopic identity.
2. Update the mapped `kahoot_url` field in both source files.

### Acceptance Criteria

1. Intake link is stored on the correct `subtopic_id`.
2. JSON and CSV values are identical for the updated row.

## Phase 2 - Validation

### Tasks

1. Run Kahoot data health checks.
2. Confirm no schema or required-field regressions.

### Acceptance Criteria

1. Health check reports pass.
2. No new validation failures introduced by the link update.

## Phase 3 - Batch Expansion

### Tasks

1. Continue onboarding incoming link items in the same format.
2. Keep execution logs and issue tracking current per batch.

### Acceptance Criteria

1. Each batch has auditable records.
2. Source data remains consistent after each batch.
