# Kahoot Link Rollout Next Actions

## Intake Format (Use This Template)

`Board | SubTopic Code | Topic Title | Tier Track: <challenge_url>`

Example:
`CIE 0580 | C1.2 | Sets | Core Track: https://kahoot.it/challenge/009357799`

## Operational Steps For Each New Link

1. Resolve to exact `subtopic_id` in `_data/kahoot_*_subtopics.json`.
2. Update `kahoot_url` in `_data/kahoot_subtopic_links.json`.
3. Update matching row in `payhip/presale/kahoot-subtopic-links-working.csv`.
4. Run `python3 scripts/health/check_kahoot_data.py`.
5. Append execution evidence to `tasks/kahoot-link-rollout/EXECUTION-LOG.md`.

## Current Queue

1. KL-001 (CIE 0580 C1.2 Sets CORE) - Completed on 2026-02-20.
