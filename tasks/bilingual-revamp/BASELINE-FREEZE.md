# Baseline Freeze

## Freeze Metadata

- Date: `2026-02-18`
- Phase: `Phase 0`
- Purpose: Freeze initial scope, ownership, and guardrails before implementation.

## Inventory Snapshot

1. `en/*.html` total: `14`
2. `zh-cn/*.html` total: `19`
3. Root-level `*.html` total: `13`
4. EN/ZH mirrored page paths: `14`

Mirrored paths:

1. `index.html`
2. `about.html`
3. `support.html`
4. `support-thanks.html`
5. `terms.html`
6. `privacy.html`
7. `subscription.html`
8. `free-gift.html`
9. `gift-thanks.html`
10. `blog/index.html`
11. `cie0580/index.html`
12. `cie0580/products.html`
13. `cie0580/pricing.html`
14. `cie0580/free/index.html`

## Known Language-Coupled Infrastructure

1. Navigation logic in `_includes/global-nav.html`
2. Footer language links in `_includes/footer.html`
3. Canonical/hreflang logic in `_includes/head.html`
4. Language switch metadata (`lang_links`) across root and module pages

## Phase-0 Pilot Freeze

Pilot pages for merge implementation are locked to:

1. `/`
2. `/exercises/`
3. `/cie0580/`
4. `/cie0580/products.html`

## Out-Of-Scope During Freeze

1. Any changes under `projects/kahoot-channel/`
2. Any unrelated pre-existing modified files
3. Non-pilot content redesign

## File Ownership Boundary (Current Cycle)

1. Allowed doc edits only:
   - `tasks/bilingual-revamp/*`
2. Code edits begin only after Phase-0 acceptance is complete and logged.

## Freeze Approval

- Status: `Approved and Active`
- Next Step: Build URL migration map and start Phase-1 implementation plan tasks.

