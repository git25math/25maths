# Payhip Presale Decisions Ledger

| Decision ID | Date | Decision | Status | Notes |
| --- | --- | --- | --- | --- |
| PP-D-001 | 2026-02-18 | Kahoot channel structure must be syllabus-aligned and subtopic-first (not chapter-only). | Final | Applied in listing matrix and page data flow. |
| PP-D-002 | 2026-02-18 | CIE 0580 must include both `Core` and `Extended` layers. | Final | Replaced prior partial-only assumptions. |
| PP-D-003 | 2026-02-18 | Edexcel 4MA1 must include both `Foundation` and `Higher` layers. | Final | Replaced prior partial-only assumptions. |
| PP-D-004 | 2026-02-18 | Every subtopic should have both Kahoot link and worksheet Payhip link (presale placeholder allowed). | Final | Basis for L1 SKU model. |
| PP-D-005 | 2026-02-18 | Product ladder is fixed as `L1 -> L2 -> L3 -> L4`. | Final | L1 subtopic, L2 section, L3 unit, L4 all-units. |
| PP-D-006 | 2026-02-18 | Keep pre-release positioning: presale first, full course-package features later. | Final | Current listing copy explicitly states release-deliverables. |
| PP-D-007 | 2026-02-18 | Cover source convention: use `cover-2320x1520-kahoot-minimal` under each subfolder as thumbnail base. | Final | Reflected in listing asset conventions. |
| PP-D-008 | 2026-02-18 | Channel page requires progressive filters by board/tier/subtopic. | Final | CIE and Edexcel filters were added iteratively. |
| PP-D-009 | 2026-02-18 | Remove old legacy offer label `Number (Extended) - Legacy Pre Official`. | Final | Marked as removed from active product path. |
| PP-D-010 | 2026-02-18 | Existing old 3 CIE products must be retired and replaced with structured L1-L4 model. | Final | Presale catalog moved to new hierarchy. |
| PP-D-011 | 2026-02-18 | Bilingual support gift is need-based, not mandatory for all users. | Final | Integrated into retention playbook messaging. |
| PP-D-012 | 2026-02-18 | Bilingual support trigger should not be review-gated by default. | Final | Review incentives can exist, but not as eligibility gate. |
| PP-D-013 | 2026-02-18 | Pricing exploration (`L1 2/3`, `L2 6/8`, `L3 12/16`) rejected. | Rejected | Superseded by final pricing standard. |
| PP-D-014 | 2026-02-18 | Pricing exploration (`L1 3/4`, `L2 12/15`, `L3 20/25`) approved. | Final | Global standard now used in listing data and site-facing pages. |
| PP-D-015 | 2026-02-18 | L4 board-level prices remain board-specific (`CIE 89/119`, `Edexcel 79/99`). | Final | Confirmed in pricing pages and catalog data. |
| PP-D-016 | 2026-02-18 | SVG is canonical cover design source; PNG is operational output for Payhip upload. | Final | PNG rendering pipeline stabilized after black-background/clipping issues. |
| PP-D-017 | 2026-02-18 | Maintain one unified merchant copy pack for all SKUs to reduce operational drift. | Final | Implemented as `kahoot-payhip-merchant-copy-pack.csv`. |
| PP-D-018 | 2026-02-18 | Live price verification must be run against both local build and public URLs. | Final | Applied in pricing audits and page checks. |
| PP-D-019 | 2026-02-18 | Any sensitive token appearing in chat/log must be treated as compromised and redacted in task docs. | Final | No raw token value stored in this task tree. |
| PP-D-020 | 2026-02-18 | Payhip stream must run under isolated task tree to avoid collisions with other repo tracks. | Final | This directory is the dedicated execution boundary. |

