# Blog Optimization Master Plan

## Goal

Make homepage navigation cleaner by removing top-nav Blog on home routes while preserving Blog access in lower-page sections.

## Work Breakdown

| Phase | Task ID | Task | Status | Owner |
| --- | --- | --- | --- | --- |
| 0 | P0-A1 | Create isolated blog-optimization task tree documents | Completed | Codex |
| 1 | P1-A1 | Add homepage route detection in global nav include | Completed | Codex |
| 1 | P1-A2 | Hide Blog link on desktop navigation for homepage routes only | Completed | Codex |
| 1 | P1-A3 | Hide Blog link on mobile navigation for homepage routes only | Completed | Codex |
| 2 | P2-A1 | Verify homepage lower Blog entry links remain unchanged (`index.html`, `en/index.html`, `zh-cn/index.html`) | Completed | Codex |

## Acceptance Criteria

1. On `/`, `/en/`, and `/zh-cn/`, top navigation has no Blog link (desktop + mobile).
2. On non-home pages, Blog link remains available in top navigation.
3. Homepage Latest Articles section still provides Blog access links.

