# Blog Optimization Master Plan

## Goal

Make navigation cleaner by removing top-nav Blog and Support site-wide while preserving lower-page Blog entry points and footer Support entry points.

## Work Breakdown

| Phase | Task ID | Task | Status | Owner |
| --- | --- | --- | --- | --- |
| 0 | P0-A1 | Create isolated blog-optimization task tree documents | Completed | Codex |
| 1 | P1-A1 | Add homepage route detection in global nav include | Completed | Codex |
| 1 | P1-A2 | Hide Blog link on desktop navigation for homepage routes only | Completed | Codex |
| 1 | P1-A3 | Hide Blog link on mobile navigation for homepage routes only | Completed | Codex |
| 2 | P2-A1 | Verify homepage lower Blog entry links remain unchanged (`index.html`, `en/index.html`, `zh-cn/index.html`) | Completed | Codex |
| 3 | P3-A1 | Remove Blog link from desktop top navigation on all routes | Completed | Codex |
| 3 | P3-A2 | Remove Blog link from mobile menu on all routes | Completed | Codex |
| 3 | P3-A3 | Verify non-home pages no longer render Blog in top navigation | Completed | Codex |
| 4 | P4-A1 | Remove Support link from desktop top navigation on all routes | Completed | Codex |
| 4 | P4-A2 | Remove Support link from mobile menu on all routes | Completed | Codex |
| 4 | P4-A3 | Verify footer Support entry remains available across language routes | Completed | Codex |

## Acceptance Criteria

1. On all pages, top navigation has no Blog link (desktop + mobile).
2. On all pages, top navigation has no Support link (desktop + mobile).
3. Homepage Latest Articles section still provides Blog access links.
4. Footer Support links remain available (`/support.html`, `/en/support.html`, `/zh-cn/support.html`).
