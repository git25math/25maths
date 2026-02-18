# Master Plan - Interactive Exercises

## 1) Core Principles

1. Syllabus-first generation: strict ordering by board, tier, section, and syllabus code.
2. Quality before scale: every batch must pass structural and pedagogical gates.
3. Closed-loop consistency: each exercise must connect back to Kahoot/Worksheet/Bundle where available.
4. Isolation: this stream should not block or be blocked by unrelated tasks.

## 2) Input Contract (Generation)

- Required fields:
  - `subtopic_id` (`board:section:code-slug`)
  - `lang` (`en` or `zh-cn`)
  - `question_count` (default 12)
  - `model` (default `gemini-2.5-pro`)
- Required sources:
  - subtopic index JSON for the target board
  - micro-topic source folder with at least one valid content file
- Blocking checks:
  - no unresolved placeholder content
  - board/tier/domain/syllabus consistency with index

## 3) Generation Standard

- Output files:
  - `_data/exercises/<topic-slug>.json`
  - `_exercises/<topic-slug>.md`
- Question schema baseline:
  - only `multiple-choice` in current phase
  - exactly 4 options
  - single correct answer index (`0..3`)
  - non-empty explanation
- Pedagogical baseline:
  - no off-syllabus drift
  - no duplicate or trivial number-swaps only
  - maintain intended difficulty spread

## 4) Acceptance Standard

### A. Preflight
- subtopic resolvable from syllabus index
- source folder readable and qualified
- link mapping available for closed loop (at least one matching endpoint)

### B. Post-generation
- CLI exits successfully
- JSON schema valid
- item count equals requested count
- output files written to expected paths

### C. Site behavior
- Jekyll build passes
- page URL renders and supports full question flow
- completion stage shows valid loop links with tracking parameters

### D. Content sampling
- teacher QA spot-check (minimum 3 items per batch)
- no wrong answer key / no ambiguous stem

## 5) UX Execution Plan

### P0 (must-have)
- stable discoverability from homepage + global nav
- filter usability (sticky + clear + URL state)
- continuation flow (next-in-syllabus + resume last practice)

### P1 (should-have)
- zh-cn copy consistency on exercise hubs and detail pages
- zero-results recovery and recommendation cards
- stronger progression cues for syllabus journey

### P2 (later)
- telemetry dashboard for CTR and completion
- personalized recommendations based on weak tags

## 6) TikZ/TikzVault Policy (Current)

- Web runtime does not directly compile TikZ.
- For diagram-required questions, convert offline to SVG first.
- TikzVault integration is tracked but deferred until current module stabilizes.

## 7) Release Gate

Push only when all of the following are true:
1. no blocking QA issues remain open
2. required health checks pass
3. this task tree logs are updated for traceability
