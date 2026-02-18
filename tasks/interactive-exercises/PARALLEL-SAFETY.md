# Parallel Safety - Interactive Exercises

## Purpose

Prevent this stream from conflicting with parallel workstreams in a dirty monorepo.

## Allowed Change Zones (Default)

- `scripts/exercises/`
- `_data/exercises/`
- `_exercises/`
- `exercises/`
- `zh-cn/exercises/`
- `_layouts/interactive_exercise.html`
- `assets/js/exercise_engine.js`
- interactive task-tree docs under `tasks/interactive-exercises/`

## Restricted Zones (Need Explicit Approval)

- Payhip upload and pricing assets
- Member system backend/auth files
- Legal/compliance pages
- Unrelated task trees and agent command-center files

## Commit Safety Rules

1. Use explicit file-path staging only.
2. Never use `git add .` or `git commit -a`.
3. Run minimal checks relevant to touched files before push.
4. Record commit IDs and purpose in `EXECUTION-LOG.md`.

## Push Gate

Push only when:
1. scope is cleanly isolated
2. required checks pass
3. docs in this task tree are updated
