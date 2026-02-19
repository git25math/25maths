# Visual Snapshot Baseline

This folder stores Playwright screenshot baselines used by:

- `scripts/health/check_visual_regression.sh`
- CI workflow (`.github/workflows/ci.yml`)
- Scheduled site health workflow (`.github/workflows/site-health-check.yml`)

## Update baseline

```bash
bash scripts/health/update_visual_baseline.sh
```

## Snapshot routes

- `/`
- `/cie0580/`
- `/cie0580/products.html`
- `/cie0580/pricing.html`
- `/cie0580/free/`
- `/edx4ma1/`
- `/edx4ma1/products.html`
- `/edx4ma1/pricing.html`
- `/edx4ma1/free/`
- `/kahoot/`

Each route is captured in both desktop and mobile profiles.
Snapshots are requested with `?visual=1`, which enables a deterministic rendering mode (animations off + fixed fallback font) for stable CI diffs.

## Run regression check locally

```bash
bash scripts/health/check_visual_regression.sh
```

If the check fails and the visual change is intentional, update the baseline and commit the refreshed images under `tests/visual/baseline/`.
