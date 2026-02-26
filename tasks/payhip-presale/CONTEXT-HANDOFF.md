# Payhip Presale Context Transfer And Handoff

## Transfer Scope

This document captures the full actionable context from the current dialogue stream, focused on Payhip listing operations and dependent website pricing/link synchronization.

## A) User Intent Continuum (Consolidated)

1. Build syllabus-aligned Kahoot channels for:
- CIE 0580
- Edexcel 4MA1
2. Use SubTopic-level granularity (micro-topics), not only chapter aggregates.
3. Ensure tier completeness:
- CIE: Core + Extended
- Edexcel: Foundation + Higher
4. For each sellable node, attach:
- Kahoot link
- Worksheet Payhip link (presale allowed)
5. Establish product ladder and future-ready architecture:
- L1 SubTopic MVP
- L2 Section Bundle
- L3 Unit Bundle
- L4 All-Units Mega Bundle
6. Build presale funnel with clear release dates, early-bird windows, and later upgrade logic.
7. Build retention logic with optional bilingual support and upgrade incentives.

## B) Key Decisions Confirmed In Dialogue

1. Deprecated listing removed:
- `Number (Extended) - Legacy Pre Official`
2. Presale architecture preferred over waiting for full course package completion.
3. Bilingual support gifting is need-based, not mandatory for all users.
4. Review incentives can exist, but should not be hard eligibility gate for bilingual help.
5. Final global pricing standard confirmed:
- L1: `US$3 / US$4`
- L2: `US$12 / US$15`
- L3: `US$20 / US$25`
- L4 board-level remains:
- CIE: `US$89 / US$119`
- Edexcel: `US$79 / US$99`

## C) Technical/Operational Events Captured

1. Local Jekyll build chain validated after environment confusion (`Gemfile` path issue resolved by changing cwd).
2. Live mismatch event (`12/16`) traced to stale catalog source and corrected via `_data/kahoot_presale_catalog.json`.
3. PNG rendering problems occurred during SVG conversion:
- black background
- clipping/cropping
- resolved via pipeline adjustment and regeneration
4. Live pricing audit executed and showed updated values on key pages.
5. Sensitive token was pasted in conversation context once.
- Security handling in this task tree is redacted-only.
- No raw token value is kept in task docs.

## D) Artifacts Created/Updated For Payhip Stream

## Data And Listing Matrices

- `payhip/presale/kahoot-payhip-listings-l1.csv`
- `payhip/presale/kahoot-payhip-listings-l2.csv`
- `payhip/presale/kahoot-payhip-listings-l3.csv`
- `payhip/presale/kahoot-payhip-listings-l4.csv`
- `payhip/presale/kahoot-payhip-listings-master.csv`

## Level Copy Templates

- `payhip/presale/kahoot-payhip-l1-copy-template.csv`
- `payhip/presale/kahoot-payhip-l2-copy-template.csv`
- `payhip/presale/kahoot-payhip-l3-copy-template.csv`
- `payhip/presale/kahoot-payhip-l4-copy-template.csv`

## Unified Merchant Copy Pack (All SKUs)

- `payhip/presale/kahoot-payhip-merchant-copy-pack.csv`
- `payhip/presale/kahoot-payhip-merchant-copy-pack.md`

## Cover Assets

- Root: `payhip/presale/listing-assets/`
- Manifest: `payhip/presale/listing-assets/payhip-cover-manifest.csv`

## Script Layer

- `scripts/payhip/generate_kahoot_payhip_listing_matrix.py`
- `scripts/payhip/generate_l1_payhip_copy_templates.py`
- `scripts/payhip/generate_l2_payhip_copy_templates.py`
- `scripts/payhip/generate_l3_payhip_copy_templates.py`
- `scripts/payhip/generate_l4_payhip_copy_templates.py`
- `scripts/payhip/generate_payhip_listing_cover_images.py`
- `scripts/payhip/generate_payhip_merchant_copy_pack.py`

## Runbooks

- `payhip/presale/kahoot-payhip-listing-upload-plan.md`
- `payhip/presale/kahoot-subtopic-link-import-guide.md`
- `payhip/presale/bilingual-retention-playbook.md`

## E) Current State Snapshot

1. SKU coverage:
- L1: 202
- L2: 30
- L3: 15
- L4: 2
- Total: 249
2. Pricing standard is aligned in generated merchant copy pack.
3. Task-tree isolation for Payhip stream is now established under `tasks/payhip-presale/`.

## F) What Is Pending (Execution-Critical)

1. Payhip side product creation/update in upload order:
- L3 -> L4 -> L2 -> L1
2. Backfill real Payhip product URLs into data sources:
- `_data/kahoot_subtopic_links.json`
- `_data/kahoot_presale_catalog.json`
3. Post-backfill verification:
- data health scripts
- Jekyll build
- live URL spot checks

## G) Safety Notes For Next Agent

1. Use `tasks/payhip-presale/` as single source of governance.
2. Do not edit out-of-scope paths listed in `PARALLEL-SAFETY.md`.
3. Record all new actions in `EXECUTION-LOG.md`.
4. Register any scope change in `CHANGE-CONTROL.md` first.

