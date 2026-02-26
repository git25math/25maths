# Core Worksheet QC Report (C3.6 to C9.4)

## Scope
This report covers the 23 generated Core worksheets:
C3.6, C4.1-C4.7, C5.1-C5.5, C6.1-C6.2, C7.1, C8.1-C8.3, C9.1-C9.4.

## QA Sequence
1. Format checks (automated): PDF existence, page count, section structure, 15 questions, 15 answer rows, URL fields, placeholder scan.
2. Difficulty checks (manual): topic alignment against corresponding `*-Listing.md` and Core-level progression.
3. Answer checks (manual): question-answer pair validation per worksheet.
4. Completeness checks (automated): file coverage and final integrity summary.

## Per-Worksheet Results
| Worksheet | Format | Difficulty Match | Answer Correctness | Notes |
|---|---|---|---|---|
| C3.6 | Pass | Pass | Pass | Parallel-lines gradient/equation progression is appropriate for Core. |
| C4.1 | Pass | Pass | Pass | Geometry vocabulary scope matches listing. |
| C4.2 | Pass | Pass | Pass | Construction terminology and logic are internally consistent. |
| C4.3 | Pass | Pass | Pass | Scale-factor and unit-conversion items are coherent and correct. |
| C4.4 | Pass | Pass | Pass | Similarity, scale, ratio, and area-scale questions match topic. |
| C4.5 | Pass | Pass | Pass | Reflection/rotation symmetry items are correct and level-appropriate. |
| C4.6 | Pass | Pass | Pass | Angle-property sequence (line/point/parallel/polygon) is aligned. |
| C4.7 | Pass | Pass | Pass | Circle-theorem items are correct and aligned with listed skills. |
| C5.1 | Pass | Pass | Pass | Unit-conversion and context questions are consistent and correct. |
| C5.2 | Pass | Pass | Pass | Area/perimeter formulas and applied items are valid. |
| C5.3 | Pass | Pass | Pass | Circle/arc/sector calculations are correct with stated pi values. |
| C5.4 | Pass | Pass | Pass | Surface area/volume set is coherent and formula-correct. |
| C5.5 | Pass | Pass | Pass | Compound-shape decomposition and perimeter logic are correct. |
| C6.1 | Pass | Pass | Pass | Pythagoras direct/inverse/context items are correct. |
| C6.2 | Pass | Pass | Pass | Trig ratio basics + right-triangle applications are correct. |
| C7.1 | Pass | Pass | Pass | Coordinate transformations and images are correct. |
| C8.1 | Pass | Pass | Pass | Intro probability and sample-space questions are appropriate. |
| C8.2 | Pass | Pass | Pass | Relative/expected frequency computations are correct. |
| C8.3 | Pass | Pass | Pass | Combined-event probability rules and calculations are correct. |
| C9.1 | Pass | Pass | Pass | Data-type classification is accurate and consistent. |
| C9.2 | Pass | Pass | Pass | Statistical-interpretation items are coherent and correct. |
| C9.3 | Pass | Pass | Pass | Mean/median/mode/range answers are correct. |
| C9.4 | Pass | Pass | Pass | Chart/diagram interpretation and selection are aligned. |

## Format QA Evidence (Automated)
- All 23 worksheets have both `.tex` and `.pdf` present.
- All 23 worksheets contain Sections A/B/C and answer-key structure.
- All 23 worksheets contain exactly 15 worksheet questions and 15 answer rows.
- Placeholder text is cleared in scope files.
- Page counts are stable (4-5 pages per worksheet).

## Link Update Status
Originally placeholder Kahoot links were replaced and recompiled for:
- C5.4
- C6.2
- C8.3
Now all three use:
`https://create.kahoot.it/channels/25maths/igcse-maths`

## Completeness Analysis
- Scope coverage completeness: **23/23 worksheets** fully checked.
- Format pass rate: **23/23 (100%)**.
- Difficulty alignment pass rate: **23/23 (100%)**.
- Answer correctness pass rate: **23/23 (100%)**.
- Blocking defects found: **0**.
- Recommended immediate remediation: **None**.
