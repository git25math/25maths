# Kahoot Cover Generation Task Tree

This is an isolated task tree for all work related to Kahoot cover generation and course-pack packaging.

## Goal
- Keep Kahoot-cover work decoupled from other parallel tasks.
- Continue future edits inside this tree first.
- Sync to live paths only when explicitly ready.

## Scope Included
- `snapshot/free-showcase/` (free sample assets, logs, handoff notes)
- `snapshot/cie0580/course-packs/` (C1-C9 + E1-E9 course packs)
- `snapshot/edexcel-4ma1/course-packs/` (F1-F6 + H1-H6 course packs)
- `snapshot/_templates/coming-soon/` (placeholder covers)
- `snapshot/course-pack-listing-copy-all.md` (consolidated listing copy)
- `snapshot/cie0580/COURSE-PACK-TOPICS.md`
- `snapshot/edexcel-4ma1/COURSE-PACK-TOPICS.md`
- `snapshot/edexcel-4ma1/OFFICIAL-SUBHEADINGS-4MA1.md`

## Working Rule
1. Edit files under this task tree first.
2. Validate changes here.
3. Use sync script to push only selected outputs to live workspace.

## Quick Start
- Read: `TASK-STATE.md`
- Read: `RUNBOOK.md`
- Refresh snapshot from live: `scripts/sync_from_live.sh`
- Apply snapshot back to live: `scripts/sync_to_live.sh`
