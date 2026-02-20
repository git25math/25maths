# Payhip Presale Execution Log

## Logging Standard

- Use absolute date and 24h time.
- Record only evidence-backed actions.
- Link to concrete file/script outputs.

## Entries

| Date | Time | Phase | Step ID | Action | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-02-18 | 08:10 | Phase 1 | P1-S1 | Standardized L1/L2/L3 pricing to global baseline in listing data and templates. | Completed | `payhip/presale/kahoot-payhip-listings-l1.csv`, `payhip/presale/kahoot-payhip-listings-l2.csv`, `payhip/presale/kahoot-payhip-listings-l3.csv` |
| 2026-02-18 | 08:35 | Phase 1 | P1-S2 | Updated site-facing presale catalog pricing source for CIE/Edexcel unit cards and defaults. | Completed | `_data/kahoot_presale_catalog.json` |
| 2026-02-18 | 09:20 | Phase 2 | P2-S1 | Stabilized cover generation/rendering workflow and regenerated L1-L4 cover outputs. | Completed | `scripts/payhip/generate_payhip_listing_cover_images.py`, `payhip/presale/listing-assets/payhip-cover-manifest.csv` |
| 2026-02-18 | 10:00 | Phase 3 | P3-S1 | Generated level-specific copy templates for Payhip listings. | Completed | `payhip/presale/kahoot-payhip-l1-copy-template.csv`, `payhip/presale/kahoot-payhip-l2-copy-template.csv`, `payhip/presale/kahoot-payhip-l3-copy-template.csv`, `payhip/presale/kahoot-payhip-l4-copy-template.csv` |
| 2026-02-18 | 19:11 | Phase 3 | P3-S2 | Added unified merchant copy pack generator and produced all-SKU merchant copy output (EN+ZH). | Completed | `scripts/payhip/generate_payhip_merchant_copy_pack.py`, `payhip/presale/kahoot-payhip-merchant-copy-pack.csv` |
| 2026-02-18 | 19:12 | Phase 3 | P3-S3 | Updated upload runbook to include unified merchant copy workflow. | Completed | `payhip/presale/kahoot-payhip-listing-upload-plan.md` |
| 2026-02-18 | 19:55 | Phase 0 | P0-S1 | Created dedicated Payhip task tree with governance, baseline, and handoff docs. | Completed | `tasks/payhip-presale/` |
| 2026-02-18 | 20:05 | Phase 0 | P0-S2 | Transferred dialogue context, decisions, safety boundaries, and next-action backlog into isolated Payhip tree. | Completed | `tasks/payhip-presale/CONTEXT-HANDOFF.md`, `tasks/payhip-presale/DECISIONS-LEDGER.md`, `tasks/payhip-presale/NEXT-ACTIONS.md` |
| 2026-02-18 | 20:18 | Phase 3 | P3-S4 | Added upload-batch generator and produced revenue-first batch CSVs (L3/L4/L2/L1) with cover paths. | Completed | `scripts/payhip/generate_payhip_upload_batches.rb`, `payhip/presale/upload-batches/` |
| 2026-02-18 | 20:28 | Phase 3 | P3-S5 | Added level execution-pack generator and produced checklist/ops/backfill packs for L1-L4. | Completed | `scripts/payhip/generate_payhip_level_execution_pack.rb`, `payhip/presale/upload-batches/l1/`, `payhip/presale/upload-batches/l2/`, `payhip/presale/upload-batches/l3/`, `payhip/presale/upload-batches/l4/` |
| 2026-02-19 | 05:36 | Phase 3 | P3-S6 | Batch-generated Payhip short-title outputs (all + per level) and injected short/mobile title fields into level ops sheets. | Completed | `payhip/presale/upload-batches/payhip-title-short-all.csv`, `payhip/presale/upload-batches/payhip-title-short-l1.csv`, `payhip/presale/upload-batches/payhip-title-short-l2.csv`, `payhip/presale/upload-batches/payhip-title-short-l3.csv`, `payhip/presale/upload-batches/payhip-title-short-l4.csv`, `payhip/presale/upload-batches/l3/l3-ops-sheet.csv` |
| 2026-02-19 | 05:49 | Phase 3 | P3-S7 | Added clipboard-title pack generator and produced final title sheets (CSV/TSV/minimal/mobile-review) for all levels. | Completed | `scripts/payhip/generate_payhip_title_clipboard_pack.rb`, `payhip/presale/upload-batches/payhip-title-clipboard-all.csv`, `payhip/presale/upload-batches/payhip-title-clipboard-min-all.csv`, `payhip/presale/upload-batches/payhip-title-clipboard-mobile-only.csv` |
| 2026-02-19 | 05:55 | Phase 3 | P3-S8 | Hand-tuned 5 long Edexcel L2 titles via manual override map and regenerated clipboard pack (no ellipsis, all <= 60 chars). | Completed | `scripts/payhip/generate_payhip_title_clipboard_pack.rb`, `payhip/presale/upload-batches/payhip-title-clipboard-all.csv` |
| 2026-02-19 | 06:02 | Phase 3 | P3-S9 | Wired level execution packs to clipboard titles so ops/checklists now use `final_title_en` directly (including manual overrides). | Completed | `scripts/payhip/generate_payhip_level_execution_pack.rb`, `payhip/presale/upload-batches/l2/l2-ops-sheet.csv`, `payhip/presale/upload-batches/l2/l2-upload-execution-checklist.md` |
| 2026-02-20 | 07:56 | Phase 3 | P3-S10 | Added series-level Payhip description generator and produced both `L1-L4 level pack` (4 rows) and `board+tier pack` (12 rows) in EN+ZH. | Completed | `scripts/payhip/generate_payhip_series_descriptions.rb`, `payhip/presale/payhip-level-listing-descriptions.csv`, `payhip/presale/payhip-series-listing-descriptions.csv` |
| 2026-02-20 | 08:25 | Phase 4 | P4-S1 | Backfilled final Payhip URL for `L1-CIE0580-C1-01` (`CIE 0580 C1-01 Types Of Number (Core)`) into website link data and L1 ops/backfill trackers. | Completed | `_data/kahoot_subtopic_links.json`, `payhip/presale/upload-batches/l1/l1-url-backfill-template.csv`, `payhip/presale/upload-batches/l1/l1-ops-sheet.csv`, `payhip/presale/kahoot-subtopic-links-working.csv` |
| 2026-02-20 | 10:10 | Phase 4 | P4-S2 | Backfilled final Payhip URL for `L1-CIE0580-C1-02` (`CIE 0580 C1-02 Sets (Core)`) and verified live response. | Completed | `_data/kahoot_subtopic_links.json`, `payhip/presale/upload-batches/l1/l1-url-backfill-template.csv`, `payhip/presale/upload-batches/l1/l1-ops-sheet.csv`, `payhip/presale/kahoot-subtopic-links-working.csv`, `curl -I -L https://payhip.com/b/fgJ9w` |
