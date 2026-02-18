# Context Handoff - Interactive Exercises

## Handoff Objective

Allow a new Codex/Gemini executor to continue this stream without reopening historical chat context.

## Canonical Entry

1. `tasks/interactive-exercises/TASK-TREE.md`
2. `tasks/interactive-exercises/TASK-STATE.md`
3. `tasks/interactive-exercises/COMMUNICATION-TRANSFER.zh-CN.md`
4. `tasks/interactive-exercises/NEXT-ACTIONS.md`

## Quick Bootstrap

```bash
cd /Users/zhuxingzhe/Project/ExamBoard/25maths-website
git fetch origin --prune
git checkout codex/gemini-exercise-loop
git pull --ff-only origin codex/gemini-exercise-loop
```

## Generation Commands

Single topic:

```bash
python3 scripts/exercises/orchestrate_gemini_exercise.py \
  --subtopic-id "cie0580:number-c1:c1-16-money" \
  --lang en \
  --question-count 12 \
  --model gemini-2.5-pro
```

Batch:

```bash
python3 scripts/exercises/batch_generate_and_audit.py \
  --board cie0580 \
  --section-key number-c1 \
  --lang en \
  --question-count 12 \
  --gen-model gemini-2.5-pro \
  --audit-model gemini-2.5-flash
```

## Minimal Verification

```bash
node --check assets/js/exercise_engine.js
bundle exec jekyll build
```

Manual spot URLs:
- `/exercises/`
- `/zh-cn/exercises/`
- `/exercises/cie0580-number-c1-c1-16-money/`

## Open Risk

- Repo is often a dirty tree with many unrelated changes.
- Strictly use whitelist staging to avoid cross-stream contamination.

## Deferred Work Marker

TikzVault integration is intentionally deferred. Do not start runtime linkage unless scope is explicitly reopened.
