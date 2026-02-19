# Visual Snapshot Baseline

This folder stores Playwright screenshot baselines used by:

- `scripts/health/check_visual_regression.sh`
- CI workflow (`.github/workflows/ci.yml`)
- Scheduled site health workflow (`.github/workflows/site-health-check.yml`)

## Update baseline

```bash
bash scripts/health/update_visual_baseline.sh
```

## Run regression check locally

```bash
bash scripts/health/check_visual_regression.sh
```

If the check fails and the visual change is intentional, update the baseline and commit the refreshed images under `tests/visual/baseline/`.
