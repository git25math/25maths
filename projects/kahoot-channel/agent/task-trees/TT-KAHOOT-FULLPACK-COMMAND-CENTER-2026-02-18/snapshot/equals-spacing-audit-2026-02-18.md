# Equals Spacing Audit (2026-02-18)

## Scope
- Path: `projects/kahoot-channel/cie0580/micro-topics`
- Path: `projects/kahoot-channel/edexcel-4ma1/micro-topics`
- Files scanned: `826` markdown files

## Global Counts
- Total `=` found: `2318`
- `=` inside inline formula/code spans: `1861`
- `=` outside formula/code spans: `457`

## Inline Formula `=` Spacing Pattern
- Both sides spaced (`x = 2`): `1262`
- No spaces (`f(x)=2x-3`): `511`
- Right-side-only space: `88` (all sampled cases are inequality forms like `>= 4.4`)
- Left-side-only space: `0`

## By Board
- CIE 0580:
- files: `514`
- total `=`: `1438`
- inline both-spaced: `670`
- inline no-space: `401`
- inline right-only: `88`
- Edexcel 4MA1:
- files: `312`
- total `=`: `880`
- inline both-spaced: `592`
- inline no-space: `110`
- inline right-only: `0`

## By File Type
- `worksheet-student.md`:
- files: `202`
- total `=`: `717`
- inline both-spaced: `492`
- inline no-space: `203`
- `worksheet-answers.md`:
- files: `202`
- total `=`: `294`
- inline both-spaced: `272`
- inline no-space: `0`
- `kahoot-question-set.md`:
- files: `202`
- total `=`: `1295`
- inline both-spaced: `498`
- inline no-space: `308`
- `listing-copy.md`:
- files: `202`
- total `=`: `0`

## Large-Space Check
- Double-space patterns around `=` inside inline formulas (`\\s{2,}=\\s{2,}`): `0`
- Any side using 2+ spaces around `=` inside inline formulas: `0`

## Root Cause
The visible “large gap” around `=` in PDF is primarily LaTeX math relation spacing (not multiple literal spaces in markdown text). Inline formulas are converted to math mode during PDF rendering, and `=` gets relation spacing by default.

## Fix Applied
- Updated `projects/kahoot-channel/agent/scripts/build_worksheet_pdf.sh`:
- In math normalization, standalone `=` is rendered as `\\!=\\!` to tighten visual spacing.
- `>=` and `<=` are preserved (not altered).

## Verification
- Topic gate pass after fix:
- CIE sample: `c2-01-introduction-to-algebra` PASS
- Edexcel sample: `f2-01-use-of-symbols` PASS
- Generated TeX confirms tightened equations, e.g. `x \\!=\\! 7`, `5x - 6 \\!=\\! 29`.

## Full Rebuild Verification
- Full-pack gate rerun after spacing fix:
- CIE: `124/124` PASS
- Edexcel: `78/78` PASS
- Residual math-segment standalone `=` check in built TeX:
- math segments scanned: `3882`
- residual standalone `=` (not in `>=`, `<=`, and not tightened form): `0`
- Topics containing tightened `\\!=\\!` output: `136/202` (remaining topics contain no standalone equation `=` in rendered math content).
