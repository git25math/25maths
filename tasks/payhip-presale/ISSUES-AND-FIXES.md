# Payhip Presale Issues And Fixes

| Issue ID | Date | Severity | Symptom | Root Cause | Fix | Verification | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PP-ISS-001 | 2026-02-18 | High | Live pages still showed old `US$12 / US$16` in some unit cards. | Source-of-truth data (`_data/kahoot_presale_catalog.json`) still contained stale unit pricing. | Updated catalog pricing fields and unit prices to latest standard. | Local build + live URL checks showed `US$20 / US$25` on affected cards. | Closed |
| PP-ISS-002 | 2026-02-18 | High | Generated PNG covers showed black background / clipping in some outputs. | SVG-to-PNG rendering path had transparency/background handling inconsistency under prior conversion path. | Adjusted rendering pipeline and regenerated outputs from canonical SVG. | Sample L1/L2/L3/L4 PNGs visually validated after regeneration. | Closed |
| PP-ISS-003 | 2026-02-18 | Medium | CIE scope initially surfaced Extended-only in listing logic. | Incomplete tier handling during early page listing iteration. | Rebuilt list logic and data flow for `Core + Extended`. | CIE pages and listing data now include both tiers. | Closed |
| PP-ISS-004 | 2026-02-18 | Medium | Potential secret exposure risk from token being shared in conversation context. | Manual token paste outside secure secret manager workflow. | Redacted from task docs; enforced no-token-in-repo rule in this task tree. | No raw token value stored under `tasks/payhip-presale/`. | Closed |

