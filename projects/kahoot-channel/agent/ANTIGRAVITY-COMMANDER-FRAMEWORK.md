# Antigravity Commander Framework

## Goal
Run worksheet production in strict serial order:
1. One topic at a time.
2. Validate immediately.
3. Build PDF immediately.
4. Stop on first failure.
5. Fix failure before moving to the next topic.

This framework is designed for quality-first execution, not speed-first batching.

## Non-Negotiable Constraints
- One micro-topic per run.
- `worksheet-student.md` and `worksheet-answers.md` must both exist.
- For full-pack mode: `kahoot-question-set.md` and `listing-copy.md` must also pass checks.
- Student sheet must contain exactly 10 numbered questions under `## Practice (10)`.
- Answer sheet must contain exactly 10 numbered answers.
- Placeholder text is forbidden in finished content.
- Build gate must produce:
  - `*-worksheet-pack.pdf` with 3 pages.
  - `*-worksheet-student.pdf` with 2 pages.
- If any gate fails, the batch runner exits immediately.

## Required Templates
- `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/templates/worksheet-student.template.md`
- `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/templates/worksheet-answers.template.md`
- `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/templates/antigravity-task.template.md`

## Execution Protocol
1. Build a queue of pending topics.
2. For each topic:
   - Ask generator runner (Codex) to fill student/answer files.
   - Run structural validator.
   - Run quality checker.
   - (Optional full-pack mode) Run topic-pack quality checker.
   - Run PDF builder.
   - Check page counts.
3. On failure:
   - Save failure log.
   - Stop.
   - Fix the topic.
   - Re-run that same topic until pass.
4. Resume queue only after the failed topic passes.

Recommended wrapper:
- `run_quality_cycle.sh` executes one bounded cycle:
  - pre-scan queue
  - serial run with `--max-topics`
  - post-scan queue
  - markdown report output

## Script Notes (Lessons Learned)
- Prefer `run_topic_gate.sh --topic <topic-dir>` when orchestrating from wrappers to avoid positional-argument mistakes.
- `build_pending_queue.sh` now supports zero-arg mode and writes to default queue path.
- Queue scope must be full folder scan, not hard-coded domain subsets, otherwise hidden unqualified topics can escape.
- `run_quality_cycle.sh` should be preferred for day-to-day operation because it always emits pre/post scan status and a report file.
- Empty queue must be treated as healthy pass (`status=no-pending`) to avoid unnecessary generation runs.
- Quality rules should reject only external-visual dependency phrases (for example `as shown below`), not generic words like `diagram`.
- Duplicate detection should use exact question text matching to avoid false positives on algebraically different formulas.
- Use `--max-topics` in batch runs to cap token spend per run.
- `run_codex_generator.sh` skips already-valid topics by default to avoid unnecessary Codex usage.
- `--require-full-pack` enables kahoot/listing quality gates end-to-end (queue, gate, batch, cycle).
- Keep a local deterministic generator (`run_local_fullpack_generator.py`) as fallback when external model auth/quota is unavailable.
- Normalize answer text before MCQ option rendering (remove raw backticks) to avoid malformed Kahoot table cells.

## Suggested Command Flow
1. Run one bounded quality cycle:
```bash
projects/kahoot-channel/agent/scripts/run_quality_cycle.sh \
  --max-topics 3 \
  --model gpt-5-mini
```
2. Generate pending queue manually:
```bash
projects/kahoot-channel/agent/scripts/build_pending_queue.sh
```
3. Run serial batch manually:
```bash
projects/kahoot-channel/agent/scripts/run_batch_serial.sh \
  /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/queues/cie-pending.txt \
  --generator-cmd 'projects/kahoot-channel/agent/scripts/run_codex_generator.sh --topic "{topic_dir}"' \
  --max-topics 3
```
4. Resume after failures or quota cut:
```bash
projects/kahoot-channel/agent/scripts/run_batch_serial.sh \
  /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/queues/cie-pending.txt \
  --generator-cmd 'projects/kahoot-channel/agent/scripts/run_codex_generator.sh --topic "{topic_dir}"' \
  --start-from <N> \
  --max-topics 3
```

If you are running generation manually, omit `--generator-cmd` and run:
```bash
projects/kahoot-channel/agent/scripts/run_topic_gate.sh <topic-dir>
```
