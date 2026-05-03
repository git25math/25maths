# 25Maths Website — Handoff

> Last updated: 2026-05-03
> Status: public website active; online exercise product line and legacy exercise-backed schema retired.

## Current Product Surface

Active:

- CIE 0580 and Edexcel 4MA1 free worksheet packs.
- Kahoot practice hubs.
- Paid bundles and Term Practice Pass.
- Membership login, entitlements, downloads, engagement widgets, leaderboard, and parent dashboard.
- Blog, FAQ, legal, and subscription pages.

Retired:

- Online exercise hub and all exercise detail pages.
- Exercise JSON/stub collections.
- Exercise player layout and JS.
- Exercise Functions API routes.
- Institution assignment page that depended on the exercise catalog.
- Supabase `exercise_sessions`, `question_attempts`, `assignments`, and `assignment_submissions` final-schema tables.

Legacy URLs redirect to free-resource pages and are disallowed in `robots.txt`.

## Must-Know Guardrail

`scripts/health/check_exercise_data.py` now verifies retirement, not data integrity. Keep this command in CI. It should fail if any deleted path, public exercise entry point, institution assignment link, or active Supabase seed dependency returns.

## Key Files

| File | Purpose |
|---|---|
| `_config.yml` | Site config and navigation/module defaults |
| `_redirects` | Legacy route redirects, including retired exercise routes |
| `robots.txt` | Retired path crawl disallow |
| `_includes/global-nav.html` | Sitewide navigation |
| `_includes/footer.html` | Sitewide footer |
| `_includes/evidence-strip.html` | Homepage screenshot proof strip |
| `_data/releases.json` | Payhip/member release metadata |
| `_data/kahoot_subtopic_links.json` | Kahoot topic links |
| `functions/_lib/release_registry.js` | Product entitlement lookup |
| `scripts/health/check_exercise_data.py` | Retired exercise guard |
| `docs/DEVELOPMENT-PLAN.md` | Current scope and validation workflow |
| `docs/CONTRIBUTING.md` | Contributor rules |

## Standard Validation

```bash
python3 scripts/health/check_exercise_data.py
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/check_nav_consistency.py
bash scripts/health/check_style_consistency.sh
bash scripts/health/check_bilingual_coverage.sh
env -u JEKYLL_GITHUB_TOKEN bundle exec jekyll build
```

Use `env -u JEKYLL_GITHUB_TOKEN` locally if an invalid token is present in the shell.

## Next Work

Highest leverage:

1. Finish Edexcel 4MA1 paid product metadata and Payhip links.
2. Refresh visual baselines after the exercise retirement changes land.
3. Continue bilingual polish on public pages with low marker density.
4. Keep the retired exercise guard active in every CI path.
