# Kahoot Payhip Listing Upload Plan (L1-L4)

This plan turns current Kahoot presale data into a practical Payhip upload workflow.

## 1) Generated Listing Matrix

Regenerate at any time:

```bash
python3 scripts/payhip/generate_kahoot_payhip_listing_matrix.py
```

Output files:

- `payhip/presale/kahoot-payhip-listings-master.csv`
- `payhip/presale/kahoot-payhip-listings-l1.csv` (202 rows)
- `payhip/presale/kahoot-payhip-listings-l2.csv` (30 rows)
- `payhip/presale/kahoot-payhip-listings-l3.csv` (15 rows)
- `payhip/presale/kahoot-payhip-listings-l4.csv` (2 rows)

Total planned listings: `249`.

## 2) Upload Order (Revenue-first)

1. Upload `L3` first (15 unit bundles)
2. Upload `L4` next (2 all-units bundles)
3. Upload `L2` after that (30 section bundles)
4. Upload `L1` last (202 subtopic worksheet MVP items)

Why: high-ticket offers go live first, then lower-level offers fill the upgrade ladder.

## 3) Core CSV Fields for Payhip

Use these fields from matrix as your primary source:

- `sku`
- `listing_title`
- `price_early_bird`
- `price_regular`
- `early_bird_end_date`
- `release_date`
- `payhip_url` (placeholder URL now; replace with final product URL after creation)
- `deliver_now`
- `deliver_on_release`
- `presale_notes`
- `tags`

## 4) URL Backfill Rules After Upload

After creating actual Payhip products, backfill final URLs with this mapping:

1. `L1` -> `_data/kahoot_subtopic_links.json` field `worksheet_payhip_url`
2. `L2` -> `_data/kahoot_subtopic_links.json` fields `section_bundle_payhip_url` and `bundle_url`
3. `L3` ->
- `_data/kahoot_subtopic_links.json` field `unit_bundle_payhip_url`
- `_data/kahoot_presale_catalog.json` board `units[].presale_url`
4. `L4` -> `_data/kahoot_presale_catalog.json` board `all_units_bundle.presale_url`

## 5) Presale Copy Checklist (Every listing)

- What is delivered now (presale placeholder entitlement)
- What is delivered on release
- Early-bird end date (absolute date)
- Official release date (absolute date)
- Upgrade path (L1 -> L2 -> L3)
- Bilingual support logic (need-based, not review-gated)

## 6) QA Gate Before Publish

Run after each batch (L3/L4/L2/L1):

```bash
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/report_kahoot_funnel.py --strict
bundle exec jekyll build --trace
```

Expected status before publish:

- `Failures: 0`
- No missing required link fields for active SubTopics
- Funnel report remains internally consistent

## 7) Recommended Weekly Ops Rhythm

1. Batch upload in one level only (for controlled QA)
2. Backfill URLs same day
3. Run health checks
4. Deploy site
5. Spot-check 5 random listing links from each updated level

This keeps the catalog coherent while scaling up to the full 249-SKU matrix.

## 8) L2 Copy Template Generation

Generate section-bundle (L2) listing copy templates:

```bash
python3 scripts/payhip/generate_l2_payhip_copy_templates.py
```

Outputs:

- `payhip/presale/kahoot-payhip-l2-copy-template.csv`
- `payhip/presale/kahoot-payhip-l2-copy-template.md`

Use CSV for structured paste/import workflows, and Markdown for manual copy into Payhip editor.

## 9) L3 Copy Template Generation

Generate unit-bundle (L3) listing copy templates:

```bash
python3 scripts/payhip/generate_l3_payhip_copy_templates.py
```

Outputs:

- `payhip/presale/kahoot-payhip-l3-copy-template.csv`
- `payhip/presale/kahoot-payhip-l3-copy-template.md`

Use CSV for structured paste/import workflows, and Markdown for manual copy into Payhip editor.

## 10) L4 Copy Template Generation

Generate all-units mega-bundle (L4) listing copy templates:

```bash
python3 scripts/payhip/generate_l4_payhip_copy_templates.py
```

Outputs:

- `payhip/presale/kahoot-payhip-l4-copy-template.csv`
- `payhip/presale/kahoot-payhip-l4-copy-template.md`

Use CSV for structured paste/import workflows, and Markdown for manual copy into Payhip editor.
