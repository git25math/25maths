# Free Sample Sets Task Tree (Isolated)

## Task Tree Metadata
- Tree name: `free-sample-sets`
- Branch: `codex/free-sample-sets-task-tree`
- Worktree path: `/tmp/25maths-free-sample-sets-wt`
- Base commit: `fe97691` (Free Sample Sets layout + filtering update)
- Created: 2026-02-18

## Purpose
This tree is dedicated to all follow-up work for the `/kahoot/` page section `Free Sample Sets (Live Now)`, so that ongoing edits do not collide with other parallel tasks in the main workspace.

## Transferred Context (From Prior Conversation)

### 1) Scope and goals
- Optimize the `Free Sample Sets (Live Now)` section UX on `/kahoot/`.
- Improve findability (filtering/searching), reduce card clutter, and fix image display expectations.
- Keep implementation data-driven via existing `_data/kahoot_free_samples.json`.

### 2) Implemented page changes
Primary file changed:
- `/tmp/25maths-free-sample-sets-wt/kahoot/index.html`

Key updates already included in this task tree base commit:
- Added richer filter controls for free samples:
  - Batch filter (`Batch 1/2/3/All`)
  - Board filter (`All Boards/CIE/Edexcel`)
  - Keyword search input
  - Reset button
- Added dynamic summary and empty-state handling.
- Added per-board visible count badge updates.
- Improved accessibility with `aria-live` on summary.
- Updated card visual hierarchy and density.
- Reworked image display logic based on requirement:
  - Ensure whole image is visible (no crop)
  - Show as compact thumbnail instead of full-width banner
  - Final structure: fixed small thumbnail block + text to the right on larger screens.

### 3) Validation done
- Local build check passed during previous work:
  - `bundle exec jekyll build`

### 4) Commit and push record (already done before this tree)
- Commit: `fe97691`
- Message: `Improve Kahoot free sample card layout and filtering UX`
- Pushed branch: `origin/codex/exercises-main-sync`

## Safety / Isolation Practices Already Set Up (Local Repo-Level)
These were configured in the source repository clone to reduce accidental mixed pushes:
- Local skip list: `.git/push-skip.lst`
- Local exclude noise: `.git/info/exclude` includes `.DS_Store` and `Interactive`
- Local push gate: `.git/hooks/pre-push` (blocks skip-list paths and suspected key leaks)

Note:
- The above are local `.git` policies and apply at repository level, not as tracked project files.

## Working Agreement For This Task Tree
- Do all future Free Sample Sets work in:
  - Branch: `codex/free-sample-sets-task-tree`
  - Path: `/tmp/25maths-free-sample-sets-wt`
- Do not mix this work with other in-progress topic trees.
- Keep commits narrowly scoped to Free Sample Sets changes.

## Fast Start Commands
```bash
cd /tmp/25maths-free-sample-sets-wt
git status
bundle exec jekyll build
```

## Next Recommended Backlog In This Tree
1. Add URL sync for free-sample filters (batch/board/q) to support shareable state.
2. Add lightweight smoke test checklist for free-sample section (desktop + mobile).
3. Tune thumbnail size variants (`h-16/h-20/h-24`) by breakpoint with one visual review pass.
