# Bilingual Revamp Master Plan

## Plan Metadata

- Plan ID: `BILINGUAL-REVAMP-2026-02`
- Created On: `2026-02-18`
- Execution Mode: `Strict plan-driven with stop-fix-resume`
- Scope Type: `Large-scale architecture + content + funnel`

## Strategic Goal

Consolidate EN/ZH split pages into one English-primary site with module-level bilingual support toggles, while preserving conversion performance and implementing need-based bilingual vocabulary gift logic.

## Non-Negotiable Constraints

1. No execution outside defined tasks.
2. Every task must have acceptance criteria.
3. Every failure must be logged with root cause and fix result.
4. Plan changes require explicit change record first.
5. Existing unrelated repository changes are out of scope and must not be modified.

## Target Architecture

1. Single primary content path (English-first).
2. Chinese explanations shown via bilingual toggle controls.
3. Toggle default OFF and persisted per user.
4. Need-based gift trigger is independent of review requirement.

## Phases

## Phase 0 - Setup And Baseline Freeze

### Tasks

1. Create dedicated task-tree docs and log templates.
2. Freeze migration scope and file ownership boundaries.
3. Create pilot list and acceptance checklist.

### Acceptance Criteria

1. Task-tree docs created.
2. Execution log and issue ledger initialized.
3. Multi-agent ownership is conflict-free.

## Phase 1 - Toggle Foundation

### Tasks

1. Add global bilingual toggle UI shell.
2. Add client state persistence (default OFF).
3. Add rendering utility classes for bilingual blocks.
4. Add telemetry fields for toggle state on forms.

### Acceptance Criteria

1. Toggle is visible and functional on desktop and mobile.
2. Page reload preserves user toggle state.
3. Default experience remains English-only.

## Phase 2 - Pilot Migration

### Pilot Pages

1. `/`
2. `/exercises/`
3. `/cie0580/`
4. `/cie0580/products.html`

### Tasks

1. Merge EN + ZH presentation into single pages.
2. Convert module text to English-primary + bilingual expansion sections.
3. Remove direct language-switch dependence from pilot pages.

### Acceptance Criteria

1. Pilot pages pass visual and functional checks.
2. No layout break on mobile.
3. All key CTA paths remain valid.

## Phase 3 - Gift Logic Integration

### Tasks

1. Add "support track" capture in post-purchase/lead forms.
2. Implement need-based gift trigger fields.
3. Add coupon ladder metadata fields (L1->L2, L2->L3, L3->Loyalty).
4. Add dedupe identifiers for gift dispatch control.

### Acceptance Criteria

1. Form payload contains support track and order context fields.
2. Bilingual gift eligibility can be identified from submission data alone.
3. No review-gated dependency in trigger path.

## Phase 4 - SEO Migration And Stabilization

### Tasks

1. Build old-to-new URL mapping for `/en/*` and `/zh-cn/*`.
2. Implement redirect strategy.
3. Update sitemap/canonical/hreflang logic.
4. Run regression checks and launch checklist.

### Acceptance Criteria

1. Legacy URLs resolve to target URLs reliably.
2. No high-priority 404 on mapped routes.
3. Sitemap reflects target architecture only.

## Phase 5 - Cloudflare Security Hardening

### Tasks

1. Define a security baseline for Cloudflare that avoids challenge overreach while preserving DDoS/WAF protections.
2. Standardize dashboard-side settings and fallback actions for incident response.
3. Add repeatable verification commands/scripts for:
   - No unintended `403`/`cf-mitigated: challenge` on primary pages.
   - Legacy language redirects still return expected `301`.
4. Record security tuning outcomes and closures in execution/issue ledgers.

### Acceptance Criteria

1. Security baseline playbook exists with clear dashboard mappings and rollback.
2. Automated check script validates both edge accessibility and redirect behavior.
3. Latest production checks pass with:
   - Core pages returning non-challenged responses.
   - Legacy `/en/*` and `/zh-cn/*` routes returning expected `301`.

## Phase 6 - Floating Bilingual Switch UX

### Tasks

1. Keep navigation minimal by removing any bilingual toggle from global nav surfaces.
2. Implement a right-edge pull-out floating bilingual switch with concise explanatory copy.
3. Ensure toggle is available across primary layouts (`global`, `module`, `post`, `interactive_exercise`) and remains mobile-safe.
4. Re-run build and rendered-page verification for:
   - Floating toggle presence.
   - No nav-embedded bilingual toggle regression.

### Acceptance Criteria

1. Bilingual toggle is rendered as a right-edge floating panel and is not present in nav.
2. Toggle default remains OFF and existing state persistence behavior is unchanged.
3. Build succeeds and generated pages include floating panel markup in expected layouts.
4. Execution and change records are fully updated for Phase 6.

## Exit Criteria (Project Complete)

1. All phase acceptance criteria are met.
2. No unresolved P0/P1 issues in issue ledger.
3. Final delivery summary and evidence links added to execution log.
