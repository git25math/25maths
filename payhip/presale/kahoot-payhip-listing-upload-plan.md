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

## 11) L1 Copy Template Generation

Generate subtopic-MVP (L1) listing copy templates:

```bash
python3 scripts/payhip/generate_l1_payhip_copy_templates.py
```

Outputs:

- `payhip/presale/kahoot-payhip-l1-copy-template.csv`
- `payhip/presale/kahoot-payhip-l1-copy-template.md`

Use CSV for structured paste/import workflows, and Markdown for manual copy into Payhip editor.

## 12) L1-L4 Main Cover Image Generation

Generate Payhip main cover image (#1 in your 9-image set) for all listings:

```bash
python3 scripts/payhip/generate_payhip_listing_cover_images.py --levels l1,l2,l3,l4 --skip-existing
```

Outputs:

- `payhip/presale/listing-assets/l1/<sku>/01-cover-main-2320x1520-payhip.svg`
- `payhip/presale/listing-assets/l1/<sku>/01-cover-main-2320x1520-payhip.png`
- `payhip/presale/listing-assets/l2/<sku>/01-cover-main-2320x1520-payhip.svg`
- `payhip/presale/listing-assets/l2/<sku>/01-cover-main-2320x1520-payhip.png`
- `payhip/presale/listing-assets/l3/<sku>/01-cover-main-2320x1520-payhip.svg`
- `payhip/presale/listing-assets/l3/<sku>/01-cover-main-2320x1520-payhip.png`
- `payhip/presale/listing-assets/l4/<sku>/01-cover-main-2320x1520-payhip.svg`
- `payhip/presale/listing-assets/l4/<sku>/01-cover-main-2320x1520-payhip.png`
- `payhip/presale/listing-assets/payhip-cover-manifest.csv`

`payhip-cover-manifest.csv` can be used as the upload checklist and source of exact image paths.

## 13) Unified Merchant Copy Pack (All SKUs)

Generate one all-in-one merchant copy file for all levels (`L1-L4`, total `249` SKUs):

```bash
python3 scripts/payhip/generate_payhip_merchant_copy_pack.py
```

Outputs:

- `payhip/presale/kahoot-payhip-merchant-copy-pack.csv`
- `payhip/presale/kahoot-payhip-merchant-copy-pack.md`

The CSV includes:

- EN + ZH subtitle
- EN + ZH short description
- EN + ZH full markdown description
- SEO title/description
- CTA labels
- Pricing, dates, and all product links

Use this unified CSV when you want one master source for Payhip listing copy, instead of working level-by-level.

## 14) Upload Batch CSV Generation (Revenue-First)

Generate upload-ready batch files (L3 -> L4 -> L2 -> L1), with copy + pricing + cover paths in one place:

```bash
ruby scripts/payhip/generate_payhip_upload_batches.rb
```

Outputs:

- `payhip/presale/upload-batches/payhip-upload-batch-all.csv`
- `payhip/presale/upload-batches/payhip-upload-batch-l3.csv`
- `payhip/presale/upload-batches/payhip-upload-batch-l4.csv`
- `payhip/presale/upload-batches/payhip-upload-batch-l2.csv`
- `payhip/presale/upload-batches/payhip-upload-batch-l1.csv`
- `payhip/presale/upload-batches/README.md`

Each row contains:

- Listing copy fields (EN + ZH)
- Pricing and date fields
- CTA and SEO fields
- `main_cover_png`, `main_cover_svg`, and `image_folder` pointers
- Key link fields (`kahoot_url`, worksheet URL, bundle URLs)

## 15) Level Execution Pack (Checklist + Ops + Backfill)

Generate a per-level execution pack with:

- upload checklist (`*.md`)
- operations tracker (`*-ops-sheet.csv`)
- URL backfill template (`*-url-backfill-template.csv`)

Single level example (`L3`):

```bash
ruby scripts/payhip/generate_payhip_level_execution_pack.rb --level l3
```

Generate all levels:

```bash
for lv in l3 l4 l2 l1; do
  ruby scripts/payhip/generate_payhip_level_execution_pack.rb --level "$lv"
done
```

Outputs (examples):

- `payhip/presale/upload-batches/l3/l3-upload-execution-checklist.md`
- `payhip/presale/upload-batches/l3/l3-ops-sheet.csv`
- `payhip/presale/upload-batches/l3/l3-url-backfill-template.csv`

Use these files during live Payhip operations to avoid skipped SKUs and missing URL backfill.

## 16) Series Description Pack (L1-L4 + Board/Tier Segments)

Generate reusable Payhip description packs for:

- level-only series pages (`L1`, `L2`, `L3`, `L4`)
- segmented board+tier pages (12 groups)

```bash
ruby scripts/payhip/generate_payhip_series_descriptions.rb
```

Outputs:

- `payhip/presale/payhip-level-listing-descriptions.csv` (4 rows)
- `payhip/presale/payhip-level-listing-descriptions.md`
- `payhip/presale/payhip-series-listing-descriptions.csv` (12 rows)
- `payhip/presale/payhip-series-listing-descriptions.md`

Each row includes:

- Payhip title (EN + ZH)
- short description (EN + ZH)
- full markdown description (EN + ZH)
- CTA (EN + ZH)
- price + early-bird end + release date
