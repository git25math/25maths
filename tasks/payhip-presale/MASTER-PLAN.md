# Payhip Presale Master Plan

## Plan Metadata

- Plan ID: `PAYHIP-PRESALE-2026-02`
- Created On: `2026-02-18`
- Execution Mode: `Isolated task-tree with auditable logs`
- Scope Type: `Catalog + pricing + copy + listing ops`

## Strategic Goal

Build and operate a complete Payhip presale commerce layer for Kahoot-aligned products across:

1. CIE 0580 (`Core` + `Extended`)
2. Edexcel 4MA1 (`Foundation` + `Higher`)

with a stable ladder:

1. `L1` SubTopic MVP
2. `L2` Section Bundle
3. `L3` Unit Bundle
4. `L4` All-Units Mega Bundle

## Non-Negotiable Constraints

1. Pricing standards are global and must remain consistent in data, site, and assets.
2. All presale pages must use absolute dates (`YYYY-MM-DD`) in data source.
3. Placeholder products must include explicit release and early-bird dates.
4. Bilingual support gifting must be need-based, not review-gated.
5. Sensitive tokens/credentials are never stored in repository artifacts.

## Phase Breakdown

## Phase 0 - Setup And Baseline Freeze

### Tasks

1. Create dedicated Payhip task tree.
2. Freeze current baseline inventory (SKUs, files, script outputs).
3. Define conflict-safe ownership boundaries.

### Acceptance Criteria

1. Task-tree docs exist and are linked.
2. Baseline inventory and counts are recorded.
3. Parallel safety policy is documented.

## Phase 1 - Catalog And Pricing Standardization

### Tasks

1. Align L1/L2/L3 pricing policy in source data and templates.
2. Confirm board/tier model:
- CIE 0580 -> Core + Extended
- Edexcel 4MA1 -> Foundation + Higher
3. Remove deprecated legacy offers from active catalog logic.

### Acceptance Criteria

1. Site-facing data source reflects latest pricing policy.
2. No stale legacy pricing on key pages.
3. Catalog structure maps to subtopic-based workflow.

## Phase 2 - Cover Assets Pipeline

### Tasks

1. Stabilize SVG -> PNG rendering behavior.
2. Generate and verify L1-L4 cover assets.
3. Maintain manifest for upload traceability.

### Acceptance Criteria

1. No clipping/black background issues in generated PNGs.
2. All required SKU cover sets are generated.
3. Manifest is complete and consistent.

## Phase 3 - Merchant Copy And Upload Pack

### Tasks

1. Generate L1/L2/L3/L4 copy templates.
2. Generate unified merchant copy pack (all SKUs, EN + ZH blocks).
3. Document upload sequence and QA checklist.

### Acceptance Criteria

1. Copy templates exist and are parseable.
2. Unified copy pack covers all active SKUs.
3. Upload plan references current paths and scripts.

## Phase 4 - Payhip Upload Operations

### Tasks

1. Create/update Payhip products by level.
2. Backfill final Payhip URLs into site data sources.
3. Run health checks and deploy verification.

### Acceptance Criteria

1. Product URLs are fully backfilled.
2. Health checks return pass status.
3. Live pages show current pricing and valid links.

## Phase 5 - Retention And Conversion Iteration

### Tasks

1. Apply coupon ladder and upgrade-path messaging.
2. Roll out need-based bilingual support flow.
3. Monitor conversion and repeat-purchase indicators.

### Acceptance Criteria

1. Purchase path from L1 -> L4 is coherent.
2. Bilingual gift flow is explicit and optional-by-need.
3. KPI review cadence is defined.

