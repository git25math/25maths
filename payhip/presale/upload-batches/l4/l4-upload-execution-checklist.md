# L4 Upload Execution Checklist

Use this checklist while creating/updating Payhip listings for `L4`.

## Batch Summary

- Level: `L4`
- SKU count: `2`
- Input batch CSV: `payhip/presale/upload-batches/payhip-upload-batch-l4.csv`
- Ops sheet: `payhip/presale/upload-batches/l4/l4-ops-sheet.csv`
- URL backfill template: `payhip/presale/upload-batches/l4/l4-url-backfill-template.csv`

## Per-SKU Required Steps

1. Create/update Payhip product with `final_title_en`.
2. Set price (`price_early_bird` + `price_regular`).
3. Paste description + subtitle + SEO fields.
4. Upload 9 images (`main_cover_png` first, then 8 supporting images).
5. Publish product and paste `final_payhip_url` in ops sheet.
6. Mark all status columns for that SKU.

## SKU Checklist

### 1. L4-CIE0580-ALLUNITS - CIE 0580 All-Units Mega Bundle

- [ ] Product created/updated
- [ ] 9 images uploaded
- [ ] Copy pasted
- [ ] SEO configured
- [ ] Pricing confirmed: US$89 / US$119
- [ ] Published
- [ ] Final URL captured
- Final title: `CIE 0580 All-Units Bundle`
- Title variant: `short`
- Short title: `CIE 0580 All-Units Bundle`
- Mobile title: `CIE 0580 All-Units Bundle`
- Cover: `payhip/presale/listing-assets/l4/l4-cie0580-allunits/01-cover-main-2320x1520-payhip.png`
- Image folder: `payhip/presale/listing-assets/l4/l4-cie0580-allunits`

### 2. L4-EDX4MA1-ALLUNITS - Edexcel 4MA1 All-Units Mega Bundle

- [ ] Product created/updated
- [ ] 9 images uploaded
- [ ] Copy pasted
- [ ] SEO configured
- [ ] Pricing confirmed: US$79 / US$99
- [ ] Published
- [ ] Final URL captured
- Final title: `Edexcel 4MA1 All-Units Bundle`
- Title variant: `short`
- Short title: `Edexcel 4MA1 All-Units Bundle`
- Mobile title: `Edexcel 4MA1 All-Units Bundle`
- Cover: `payhip/presale/listing-assets/l4/l4-edx4ma1-allunits/01-cover-main-2320x1520-payhip.png`
- Image folder: `payhip/presale/listing-assets/l4/l4-edx4ma1-allunits`

## Completion Gate

1. All SKU rows in ops sheet have `status_published = yes`.
2. URL backfill template has `final_payhip_url` for every SKU.
3. Backfill to data source completed and verified.

