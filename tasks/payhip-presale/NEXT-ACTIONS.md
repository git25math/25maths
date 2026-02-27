# Payhip Presale Next Actions

## Immediate Batch Plan (Operational)

## Step 0 - Use Short Titles For Upload

1. Use `payhip/presale/upload-batches/payhip-title-short-all.csv` as title source of truth.
2. Prefer `listing_title_short_en` for Payhip product title.
3. If title still looks crowded on mobile, use `listing_title_mobile_en`.
4. During upload, record final title used in each `l*/l*-ops-sheet.csv` notes.
5. Fast path: use `payhip/presale/upload-batches/payhip-title-clipboard-all.csv` (`final_title_en`) directly.
6. If you only need `SKU + title`, use `payhip/presale/upload-batches/payhip-title-clipboard-min-all.csv`.
7. Before publish, check `payhip/presale/upload-batches/payhip-title-clipboard-mobile-only.csv`; it should stay empty unless new long titles are added.
8. In per-level execution, use `l*/l*-ops-sheet.csv` column `final_title_en` as the single title source.
9. For series storefront listings, use `payhip/presale/payhip-level-listing-descriptions.csv` (L1/L2/L3/L4).
10. For board+tier channel listings, use `payhip/presale/payhip-series-listing-descriptions.csv` (12 segmented descriptions).

## Step 1 - Upload L3 First

1. Use `payhip/presale/upload-batches/payhip-upload-batch-l3.csv`.
2. Create/update 15 unit products in Payhip.
3. Attach 9-image set per product using `payhip/presale/listing-assets/`.
4. Record operation status in `payhip/presale/upload-batches/l3/l3-ops-sheet.csv`.
5. Capture final URLs in `payhip/presale/upload-batches/l3/l3-url-backfill-template.csv`.

## Step 2 - Upload L4

1. Use `payhip/presale/upload-batches/payhip-upload-batch-l4.csv`.
2. Create/update 2 all-units products.
3. Attach image packs and presale terms.
4. Track progress in `payhip/presale/upload-batches/l4/l4-ops-sheet.csv`.
5. Capture final URLs in `payhip/presale/upload-batches/l4/l4-url-backfill-template.csv`.

## Step 3 - Upload L2

1. Use `payhip/presale/upload-batches/payhip-upload-batch-l2.csv`.
2. Create/update 30 section products.
3. Verify each section points to correct upgrade path.
4. Track progress in `payhip/presale/upload-batches/l2/l2-ops-sheet.csv`.
5. Capture final URLs in `payhip/presale/upload-batches/l2/l2-url-backfill-template.csv`.

## Step 4 - Upload L1

1. Use `payhip/presale/upload-batches/payhip-upload-batch-l1.csv`.
2. Create/update 202 subtopic products.
3. Ensure each L1 item links up to correct L2/L3 products.
4. Track progress in `payhip/presale/upload-batches/l1/l1-ops-sheet.csv`.
5. Capture final URLs in `payhip/presale/upload-batches/l1/l1-url-backfill-template.csv`.

## Step 5 - Backfill Real URLs

1. Replace placeholder Payhip URLs in `_data/kahoot_subtopic_links.json`.
2. Replace placeholder unit/all-unit URLs in `_data/kahoot_presale_catalog.json`.
3. Rebuild site and run link/price checks.

## QA And Release Gate

1. `python3 scripts/health/check_kahoot_data.py`
2. `python3 scripts/health/report_kahoot_funnel.py --strict`
3. `bundle exec jekyll build --trace`
4. Live checks:
- `/kahoot/cie0580/`
- `/kahoot/edexcel-4ma1/`
- `/cie0580/pricing.html`
- `/edx4ma1/pricing.html`

## Weekly Loop

1. Upload one level batch.
2. Backfill URLs same day.
3. Run QA gate.
4. Deploy and spot-check.
5. Log outcomes in `EXECUTION-LOG.md`.
