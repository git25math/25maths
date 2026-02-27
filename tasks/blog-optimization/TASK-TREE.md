# Blog Optimization Task Tree

## Objective

Run Blog optimization work in an isolated task tree, with explicit scope and traceable execution, to simplify homepage navigation and keep Blog discovery through lower-page entry points.

## Scope

1. Remove Blog from top navigation on homepage routes only: `/`, `/en/`, `/zh-cn/`.
2. Keep homepage lower-page Blog entry points in the Latest Articles section.
3. Keep Blog navigation behavior unchanged on non-home pages.
Run Blog optimization work in an isolated task tree, with explicit scope and traceable execution, to simplify global navigation and keep Blog discovery through lower-page entry points.

## Scope

1. Remove Blog from top navigation on all routes (desktop and mobile menus).
2. Keep homepage lower-page Blog entry points in the Latest Articles section.
3. Keep Blog pages reachable by direct URL and homepage lower entry points.
4. Remove Support from top navigation on all routes (desktop and mobile menus), while keeping footer Support entry points.
5. Remove About from top navigation on all routes (desktop and mobile menus), while keeping footer About entry points.
6. Remove EN/ZH-CN language switch entries from top navigation on all routes (desktop and mobile menus).

## Rules Of Execution

1. Execute only tasks listed in the approved `MASTER-PLAN.md`.
2. Record each meaningful action in `EXECUTION-LOG.md`.
3. Record blockers and fixes in `ISSUES-AND-FIXES.md`.
4. Any scope change must be logged in `CHANGE-CONTROL.md` before execution.

## Document Map

- Master plan: `tasks/blog-optimization/MASTER-PLAN.md`
- Execution log: `tasks/blog-optimization/EXECUTION-LOG.md`
- Issues and fixes: `tasks/blog-optimization/ISSUES-AND-FIXES.md`
- Change control: `tasks/blog-optimization/CHANGE-CONTROL.md`

## Phase Status

- Phase 0: Task-tree setup - Completed
- Phase 1: Homepage top-nav Blog removal - Completed
- Phase 2: Regression check for homepage Blog lower entry - Completed

- Phase 3: Site-wide top-nav Blog removal - Completed
- Phase 4: Site-wide top-nav Support removal - Completed
- Phase 5: Site-wide top-nav About removal - Completed
- Phase 6: Site-wide top-nav EN/ZH-CN removal - Completed
