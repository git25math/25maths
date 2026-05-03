# Contributing to 25Maths Website

> Last updated: 2026-05-03

This repository powers the public 25Maths website: free worksheet packs, Kahoot hubs, paid bundles, membership downloads, engagement widgets, and supporting legal/SEO pages.

## Current Product Boundary

The former online exercise product line is retired. New work must not restore:

- `_exercises/`
- `_data/exercises/`
- `_data/exercises_backup/`
- `_data/exercise_registry.json`
- `exercises/` or `zh-cn/exercises/`
- `_layouts/interactive_exercise.html`
- `assets/js/exercise_engine.js`
- `assets/js/exercise_hub.js`
- `functions/api/v1/exercise/`
- `institution/assignments.html`

Legacy `/exercises/*` URLs are handled by redirects only. Public CTAs should point to `/cie0580/free/`, `/edx4ma1/free/`, `/kahoot/`, or membership/product pages.

## Development Rules

- Use Tailwind utility classes and existing includes before adding custom CSS.
- If CSS source changes, edit `styles/site.tailwind.css` and rebuild the generated CSS.
- Keep bilingual content English-first with Simplified Chinese support through existing bilingual helper patterns.
- Never expose Supabase service role keys or other secrets in front-end code.
- Cloudflare Pages Functions must follow the existing `onRequest` pattern and validate auth where required.
- Do not add root package dependencies that could break Cloudflare Pages builds.
- Preserve unrelated user changes in the worktree.

## Required Checks

Run these before commit:

```bash
python3 scripts/health/check_exercise_data.py
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/check_nav_consistency.py
bash scripts/health/check_style_consistency.sh
bash scripts/health/check_bilingual_coverage.sh
env -u JEKYLL_GITHUB_TOKEN bundle exec jekyll build
```

`check_exercise_data.py` is now the exercise-retirement guard. A failure means the retired product line has been reintroduced or a deleted path came back.

## Important Files

| File | Purpose |
|---|---|
| `_config.yml` | Jekyll config, navigation defaults, module metadata |
| `_includes/global-nav.html` | Sitewide navigation |
| `_includes/footer.html` | Sitewide footer |
| `_includes/evidence-strip.html` | Homepage evidence screenshots |
| `_data/releases.json` | Product and member release registry |
| `_data/kahoot_subtopic_links.json` | Kahoot topic link source |
| `functions/_lib/supabase_server.js` | Server-side Supabase helper |
| `functions/_lib/release_registry.js` | Release lookup and entitlement mapping |
| `scripts/health/check_exercise_data.py` | Guard that the retired exercise product line stays offline |

## Shipping Workflow

1. Start from the latest `main`.
2. Make the smallest coherent change.
3. Run the required checks.
4. Review `git diff --check` and the staged diff.
5. Commit, push, and open a PR.
6. Merge only after CI passes.
