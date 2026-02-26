# Free Sample Badge Issue Log

Date: 2026-02-16
Scope: `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/free-showcase/**/cover-2320x1520-kahoot-free-sample.png`

## Summary
This log records all issues found during the Free Sample capsule badge refinement process and the final stable fix.

## Issue 1: Overall visual mismatch (badge too large / too intrusive)
- Symptom:
  - Badge looked visually disconnected from the cover layout.
  - It competed with main heading hierarchy.
- Root cause:
  - Capsule size and placement were too aggressive relative to the 2320x1520 composition.
- Fix:
  - Reduced capsule visual weight.
  - Moved badge to a safer zone (top-right inner area) with more balanced margins.
  - Reduced stroke and decoration intensity.
- Result:
  - Badge no longer dominates the cover.

## Issue 2: Text not centered inside capsule
- Symptom:
  - `FREE SAMPLE` appeared offset relative to capsule center.
- Root cause:
  - Text positioning relied on absolute annotation offsets and font baseline behavior.
- Fix attempts:
  - Attempt A: `-annotate` with absolute coordinates.
  - Attempt B: transparent canvas + centered label compositing.
- Why unstable:
  - Different compose paths caused inconsistent baseline/anchor behavior.

## Issue 3: Text disappeared completely (critical)
- Symptom:
  - `FREE SAMPLE` not visible.
  - In one stage, output became identical to `minimal` image.
- Root cause:
  - A compose branch produced a fully transparent overlay.
  - `annotate` path in current runtime was silently ignored in target step.
- Verification evidence:
  - `magick compare -metric AE minimal free-sample` returned `0 (0)` in failed stage.
- Final fix:
  - Switched to deterministic method:
    - Generate text as standalone label image.
    - Measure text size (`identify -format '%w %h'`).
    - Compute exact center position in capsule area (`680x150` at `+1560+350`).
    - Composite text layer onto base image.
- Final parameters used:
  - Capsule area: `680x150`
  - Capsule origin: `+1560+350`
  - Measured text size: `513x83`
  - Final text position: `+1643+383`
- Result:
  - Text visible and centered reliably.

## Batch Update Record
- Total files updated: `16`
- File pattern:
  - `cover-2320x1520-kahoot-free-sample.png`
- Location:
  - `.../free-showcase/cie0580/*/`
  - `.../free-showcase/edexcel-4ma1/*/`

## Stable Implementation Rule (Do Not Revert)
1. Keep original cover unchanged.
2. Draw capsule with fixed geometry (do not change unless layout change is intentional).
3. Render text as separate label layer.
4. Center text by measured width/height calculation, then composite.
5. Validate with one sample first, then batch apply.

## QA Checklist
- [x] Badge is visible.
- [x] Text is centered in capsule.
- [x] Other cover elements are unchanged.
- [x] Batch output count matches expected (`16`).
