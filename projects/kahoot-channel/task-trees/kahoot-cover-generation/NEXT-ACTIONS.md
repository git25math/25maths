# Next Actions (Kahoot Cover Generation)

## Completed
1. CSV export utility is ready:
- `scripts/export_kahoot_csv.py`
- Outputs: `snapshot/exports/kahoot_free_showcase.csv`, `snapshot/exports/kahoot_course_packs.csv`, `snapshot/exports/kahoot_all_upload_copy.csv`

2. Free-sample variant switch utility is ready:
- `scripts/set_free_sample_variant.sh <balanced|contrast10> [snapshot|live|both]`

3. Publish tracker initialized:
- `snapshot/free-showcase/PUBLISH-TRACKER.csv`
- Includes 16 free items split into Batch 1 / Batch 2 / Batch 3.

## Immediate
1. Confirm final active free-sample look for publishing:
- Recommended: `balanced`
- Stronger option: `contrast10`

2. Start publishing by tracker order:
- Batch 1 -> Batch 2 -> Batch 3
- Update `status` and `kahoot_url` per item in `PUBLISH-TRACKER.csv`

3. After snapshot edits, sync selected outputs to live:
- `scripts/sync_to_live.sh`

## Release Safety
1. Keep work inside `snapshot/` first.
2. Run `scripts/verify_snapshot.sh` before syncing.
3. Use `scripts/sync_to_live.sh` only when outputs are validated.
4. Do minimal git add/commit scope after sync.
