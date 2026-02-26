# Payhip Presale Baseline Freeze

## Baseline Date

- Freeze date: `2026-02-18`

## Canonical Product Ladder

1. L1: SubTopic MVP
2. L2: Section Bundle
3. L3: Unit Bundle
4. L4: All-Units Mega Bundle

## Pricing Baseline (Global Standard)

- L1: `US$3 / US$4`
- L2: `US$12 / US$15`
- L3: `US$20 / US$25`
- L4:
- CIE 0580: `US$89 / US$119`
- Edexcel 4MA1: `US$79 / US$99`

## Board/Tier Baseline

- `cie0580`: `Core + Extended`
- `edexcel-4ma1`: `Foundation + Higher`

## SKU Inventory Baseline

- `payhip/presale/kahoot-payhip-listings-l1.csv`: `202` rows + header
- `payhip/presale/kahoot-payhip-listings-l2.csv`: `30` rows + header
- `payhip/presale/kahoot-payhip-listings-l3.csv`: `15` rows + header
- `payhip/presale/kahoot-payhip-listings-l4.csv`: `2` rows + header
- `payhip/presale/kahoot-payhip-listings-master.csv`: `249` rows + header

## Merchant Copy Baseline

- Level templates:
- `payhip/presale/kahoot-payhip-l1-copy-template.csv`
- `payhip/presale/kahoot-payhip-l2-copy-template.csv`
- `payhip/presale/kahoot-payhip-l3-copy-template.csv`
- `payhip/presale/kahoot-payhip-l4-copy-template.csv`
- Unified pack:
- `payhip/presale/kahoot-payhip-merchant-copy-pack.csv` (`249` rows + header)
- `payhip/presale/kahoot-payhip-merchant-copy-pack.md`

## Cover Asset Baseline

- Root: `payhip/presale/listing-assets/`
- Manifest: `payhip/presale/listing-assets/payhip-cover-manifest.csv`
- Standard main cover name: `01-cover-main-2320x1520-payhip.(svg|png)`

## Script Baseline

- Matrix generation:
- `scripts/payhip/generate_kahoot_payhip_listing_matrix.py`
- Level copy generation:
- `scripts/payhip/generate_l1_payhip_copy_templates.py`
- `scripts/payhip/generate_l2_payhip_copy_templates.py`
- `scripts/payhip/generate_l3_payhip_copy_templates.py`
- `scripts/payhip/generate_l4_payhip_copy_templates.py`
- Cover generation:
- `scripts/payhip/generate_payhip_listing_cover_images.py`
- Unified merchant copy generation:
- `scripts/payhip/generate_payhip_merchant_copy_pack.py`
- Upload-batch generation:
- `scripts/payhip/generate_payhip_upload_batches.rb`
- Level execution-pack generation:
- `scripts/payhip/generate_payhip_level_execution_pack.rb`

## Site Data Baseline (Payhip-Relevant)

- Catalog: `_data/kahoot_presale_catalog.json`
- Subtopic links: `_data/kahoot_subtopic_links.json` (and working import artifacts under `payhip/presale/`)
