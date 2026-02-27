# Payhip Presale Parallel Safety Rules

## Purpose

Prevent cross-task conflicts by defining hard file ownership boundaries for the Payhip stream.

## In-Scope Paths (Primary Ownership)

- `payhip/presale/**`
- `scripts/payhip/**`
- `_data/kahoot_presale_catalog.json`
- `_data/kahoot_subtopic_links.json` (only Payhip link fields)
- `tasks/payhip-presale/**`

## Shared Paths (Edit With Caution)

- `kahoot/**` (only if directly required to reflect Payhip pricing/link updates)
- `cie0580/**` and `edx4ma1/**` pricing/products pages (Payhip pricing/link sync only)

## Out-Of-Scope Paths (Do Not Touch In This Task Tree)

- Membership system paths: `membership/**`, `scripts/member/**`, `supabase/**`
- Non-Payhip marketing pages unrelated to listing funnels
- Other active task trees unless explicitly requested

## Conflict Avoidance Checklist

1. Before edit, confirm file belongs to in-scope ownership list.
2. If shared path is required, record reason in `EXECUTION-LOG.md`.
3. Never mass-edit non-Payhip directories from this task stream.
4. If unexpected external modifications appear, pause and request direction.

## Branch Naming Convention

- Recommended: `codex/payhip-presale-*`
- One feature/fix per branch where possible.

## Secret Safety

1. Never store API tokens in repository files.
2. If token is pasted in chat, treat as compromised and rotate out-of-band.
3. Keep all task docs token-free (redacted references only).

