# Runbook - Isolated Workflow

## Fast Start
Run:
```bash
./scripts/start_session.sh
```

## Common Ops
1. Export upload copy CSV:
```bash
./scripts/export_kahoot_csv.py
```

2. Switch active free-sample cover variant:
```bash
# default scope=snapshot
./scripts/set_free_sample_variant.sh balanced
./scripts/set_free_sample_variant.sh contrast10

# optional: apply to live paths too
./scripts/set_free_sample_variant.sh balanced both
```

## A) Refresh snapshot from live workspace
Run:
```bash
./scripts/sync_from_live.sh
```

## B) Work only inside snapshot
Examples:
- `snapshot/free-showcase/...`
- `snapshot/cie0580/course-packs/...`
- `snapshot/edexcel-4ma1/course-packs/...`

## C) Validate outputs
- Check counts in `snapshot/COUNTS.txt`
- Spot-check `listing-copy.md` and `cover-2320x1520-kahoot-minimal.png`
- Check publish tracker: `snapshot/free-showcase/PUBLISH-TRACKER.csv`
- Check CSV exports: `snapshot/exports/*.csv`
- Run integrity check:
```bash
./scripts/verify_snapshot.sh
```

## D) Apply snapshot back to live (controlled)
Run:
```bash
./scripts/sync_to_live.sh
```

This script syncs only Kahoot-cover related paths.
