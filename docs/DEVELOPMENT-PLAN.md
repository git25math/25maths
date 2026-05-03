# 25Maths Website — Development Plan

> Last updated: 2026-05-03
> Current state: online exercise product line retired; Free Packs, Kahoot, membership downloads, and Term Practice Pass remain active.

## Product Scope

25Maths.com is the public commerce and resource hub for CIE 0580 and Edexcel 4MA1 mathematics:

- Free worksheet packs for both boards.
- Kahoot practice hubs with topic links.
- Paid worksheet bundles and Term Practice Pass delivery.
- Membership login, entitlement checks, downloads, engagement widgets, and parent/member dashboards.

The previous online exercise product line has been fully retired from the website. Do not restore the deleted collection, data files, player layout, runtime JS, Functions API routes, or public `/exercises/` entry points. Legacy URLs are handled only through redirects.

## Current Priorities

| Priority | Workstream | Status |
|---|---|---|
| P0 | Keep retired exercise product offline | Guarded by `scripts/health/check_exercise_data.py` |
| P0 | Free Packs + Kahoot public flows | Active |
| P0 | Payhip/member download delivery | Active |
| P1 | Edexcel 4MA1 paid product completion | In progress |
| P1 | Bilingual polish on public pages | In progress |
| P2 | Visual regression baseline refresh | As needed after visual changes |

## Required Validation

Run these before shipping website changes:

```bash
python3 scripts/health/check_exercise_data.py
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/check_nav_consistency.py
bash scripts/health/check_style_consistency.sh
bash scripts/health/check_bilingual_coverage.sh
env -u JEKYLL_GITHUB_TOKEN bundle exec jekyll build
```

`check_exercise_data.py` is intentionally still named for CI continuity, but its role is now a retirement guard. It verifies that the retired exercise paths are absent and that public source files do not reintroduce exercise entry points.

## Retired Exercise Line

Removed surface area:

- `_exercises/`
- `_data/exercises/`, `_data/exercises_backup/`, `_data/exercise_registry.json`
- `exercises/`, `zh-cn/exercises/`
- `_layouts/interactive_exercise.html`
- `assets/js/exercise_engine.js`, `assets/js/exercise_hub.js`
- `functions/api/v1/exercise/`
- `institution/assignments.html`

Preserved behavior:

- `/exercises/*` redirects to `/cie0580/free/`.
- `/zh-cn/exercises/*` redirects to `/zh-cn/cie0580/free/`.
- `robots.txt` disallows the retired path.
- Health checks fail if public navigation, sitemap, screenshots, or content links bring the line back.

## Shipping Workflow

1. Work on a branch or clean worktree.
2. Keep edits scoped to the requested product surface.
3. Run the required validation commands.
4. Commit with a descriptive message.
5. Push and open a PR for review.
6. Merge only after CI confirms the retirement guard and build are green.
