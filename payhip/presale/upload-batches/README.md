# Payhip Upload Batches

Revenue-first upload order:
1. L3
2. L4
3. L2
4. L1

## Batch Counts

- L3: 15
- L4: 2
- L2: 30
- L1: 202
- Total: 249

## Output Files

- `payhip/presale/upload-batches/payhip-upload-batch-all.csv`
- `payhip/presale/upload-batches/payhip-upload-batch-l1.csv`
- `payhip/presale/upload-batches/payhip-upload-batch-l2.csv`
- `payhip/presale/upload-batches/payhip-upload-batch-l3.csv`
- `payhip/presale/upload-batches/payhip-upload-batch-l4.csv`
- `payhip/presale/upload-batches/payhip-title-short-all.csv`
- `payhip/presale/upload-batches/payhip-title-short-l1.csv`
- `payhip/presale/upload-batches/payhip-title-short-l2.csv`
- `payhip/presale/upload-batches/payhip-title-short-l3.csv`
- `payhip/presale/upload-batches/payhip-title-short-l4.csv`
- `payhip/presale/upload-batches/payhip-title-clipboard-all.csv`
- `payhip/presale/upload-batches/payhip-title-clipboard-all.tsv`
- `payhip/presale/upload-batches/payhip-title-clipboard-min-all.csv`
- `payhip/presale/upload-batches/payhip-title-clipboard-mobile-only.csv`
- `payhip/presale/upload-batches/payhip-title-clipboard-l1.csv`
- `payhip/presale/upload-batches/payhip-title-clipboard-l2.csv`
- `payhip/presale/upload-batches/payhip-title-clipboard-l3.csv`
- `payhip/presale/upload-batches/payhip-title-clipboard-l4.csv`

Title fields:
- `listing_title`: original
- `listing_title_short_en`: short version for Payhip product title
- `listing_title_mobile_en`: extra-compact mobile fallback

Clipboard title fields:
- `final_title_en`: final recommended Payhip title
- `title_variant_used`: `short` or `mobile` or `manual`
- `payhip-title-clipboard-min-*.csv`: minimal `sku + title` paste sheet

Use `main_cover_png` and `image_folder` to locate your upload images quickly.
