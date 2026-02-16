# Kahoot SubTopic Link CSV Import Guide

Use this guide to batch-update `/_data/kahoot_subtopic_links.json` with a CSV file.

## 1) Export working CSV (recommended)

```bash
python3 scripts/kahoot/export_subtopic_links_csv.py
```

Default output:

- `payhip/presale/kahoot-subtopic-links-working.csv`

Optional filters:

```bash
python3 scripts/kahoot/export_subtopic_links_csv.py --board cie0580 --tier Core
python3 scripts/kahoot/export_subtopic_links_csv.py --board edexcel-4ma1 --tier Higher
```

## 2) Prepare CSV

Start from template:

- `payhip/presale/kahoot-subtopic-link-import-template.csv`

Required column:

- `id`

Supported update columns:

- `kahoot_url`
- `worksheet_payhip_url`
- `section_bundle_payhip_url`
- `unit_bundle_payhip_url`
- `bundle_url`
- `past_paper_analysis_url`
- `variant_practice_url`
- `presale_release_date` (`YYYY-MM-DD`)
- `presale_early_bird_end_date` (`YYYY-MM-DD`)
- `presale_notes`
- `status` (`planned|presale|live|archived`)
- `notes`

Context columns like `board`, `tier`, `section_code`, `subtopic_code`, `title`, `section_key`, `unit_key` are allowed in CSV and ignored by the importer.

## 3) Dry-run first

```bash
python3 scripts/kahoot/import_subtopic_links_csv.py \
  --csv payhip/presale/kahoot-subtopic-link-import-template.csv \
  --dry-run
```

## 4) Apply updates (safe mode)

`fill-empty` is default: only fills empty fields, does not overwrite existing values.

```bash
python3 scripts/kahoot/import_subtopic_links_csv.py \
  --csv <your-file>.csv
```

## 5) Force overwrite when needed

```bash
python3 scripts/kahoot/import_subtopic_links_csv.py \
  --csv <your-file>.csv \
  --mode overwrite
```

## 6) Strict validation mode

Stops on unknown IDs/columns and invalid values.

```bash
python3 scripts/kahoot/import_subtopic_links_csv.py \
  --csv <your-file>.csv \
  --strict
```

## 7) Post-import checks

```bash
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/report_kahoot_funnel.py
bundle exec jekyll build --trace
```

Generated report:

- `payhip/presale/kahoot-funnel-health.md`
- Optional machine summary: `python3 scripts/health/report_kahoot_funnel.py --json-out payhip/presale/kahoot-funnel-health.json`

## 8) Generate Payhip upload matrix (L1-L4)

```bash
python3 scripts/payhip/generate_kahoot_payhip_listing_matrix.py
```

Outputs:

- `payhip/presale/kahoot-payhip-listings-master.csv`
- `payhip/presale/kahoot-payhip-listings-l1.csv`
- `payhip/presale/kahoot-payhip-listings-l2.csv`
- `payhip/presale/kahoot-payhip-listings-l3.csv`
- `payhip/presale/kahoot-payhip-listings-l4.csv`

Execution plan:

- `payhip/presale/kahoot-payhip-listing-upload-plan.md`
