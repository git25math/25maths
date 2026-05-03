# North Star Vision

> Status: Revised after website exercise retirement.
> Original vision: 2026-02-27.
> Revised: 2026-05-03.

25Maths should become the strongest bilingual IGCSE maths resource system for CIE 0580 and Edexcel 4MA1, with a protected cleaned-content layer that can later support a dedicated question-bank product.

## Current Website Role

The public website is no longer an online exercise product. Its active role is:

- Board-aligned free resource discovery.
- Payhip-backed worksheet and bundle sales.
- Member entitlement and download access.
- Kahoot retrieval-practice distribution.
- Institution resource planning and follow-up.

## Defensible Advantages

| Advantage | Why It Matters |
|---|---|
| Bilingual content quality | EN/CN support is content-level, not only UI translation |
| Exam-board structure | CIE and Edexcel resources can share topic, tier, and release metadata |
| Cleaned source data | Curated question metadata, stems, mark schemes, and asset references can become the private data moat |
| Resource production pipeline | Worksheets, Kahoot packs, and future question-bank outputs can reuse structured metadata |
| Member and entitlement layer | Payhip events, signed downloads, and member status are already live |

## Active Product Metrics

| Category | Metric | Direction |
|---|---|---|
| Growth | Organic search traffic | Increase qualified CIE/Edexcel traffic |
| Activation | First free resource click | Users reach a useful worksheet/Kahoot path quickly |
| Conversion | Free-to-paid product click | Resource pages expose relevant paid packs |
| Retention | Returning member downloads | Members keep using entitlement value |
| Content | Published worksheet/Kahoot packs | Coverage grows by board, tier, and topic |
| Institution | Resource plans created | Teacher workflows use active resources |

## Future Question-Bank Direction

A future CIE/Edexcel practice system should not revive the retired website exercise implementation. It needs a new architecture:

- Dedicated question bank with board, paper, topic, skill, difficulty, and source metadata.
- Explicit shared-stem modeling for compound questions.
- Private cleaned question text, solution, and annotation storage.
- Public/static assets handled separately from private question metadata.
- Server-authorized delivery slices instead of full frontend data dumps.
- Attempt/mastery telemetry owned by the practice product, then summarized back into the website.

## Current Implementation Source

Use `docs/DEVELOPMENT-PLAN.md` for active implementation scope. Use `docs/CONTRIBUTING.md` and `scripts/health/check_exercise_data.py` to enforce the retired-surface boundary.
