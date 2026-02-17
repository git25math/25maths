# Agent Run Commands

## Generate skeleton packs from backlog
```bash
projects/kahoot-channel/agent/scripts/generate_microtopic_pack.sh \
  projects/kahoot-channel/agent/CIE0580-MICROTOPIC-BACKLOG.csv
```

```bash
projects/kahoot-channel/agent/scripts/generate_microtopic_pack.sh \
  projects/kahoot-channel/agent/EDEXCEL-4MA1-MICROTOPIC-BACKLOG.csv
```

## Current generated skeleton counts
- CIE 0580: `72` total micro-topics (8 ready + 64 skeleton)
- Edexcel 4MA1: `72` skeleton micro-topics (spec lock required)

## Execution batch recommendation
- Batch A: CIE E1.9-E1.13
- Batch B: CIE E1.14-E1.18
- Batch C: CIE E2.1-E2.6
- Then continue by domain blocks.

## Interactive exercise generation (Gemini CLI)
```bash
python3 scripts/exercises/batch_generate_and_audit.py \
  --board cie0580 \
  --section-key number-c1 \
  --lang en \
  --question-count 12 \
  --gen-model gemini-2.5-pro \
  --audit-model gemini-2.5-flash
```

```bash
python3 scripts/exercises/batch_generate_and_audit.py \
  --board cie0580 \
  --section-key algebra-c2 \
  --lang en \
  --question-count 12 \
  --gen-model gemini-2.5-pro \
  --audit-model gemini-2.5-flash
```

## Commander quality-first pipeline (serial, stop on first failure)

### 0) Run one full quality cycle (recommended)
```bash
projects/kahoot-channel/agent/scripts/run_quality_cycle.sh \
  --max-topics 3 \
  --model gpt-5-mini
```

Dry-run (no Codex consumption):
```bash
projects/kahoot-channel/agent/scripts/run_quality_cycle.sh \
  --max-topics 3 \
  --model gpt-5-mini \
  --dry-run
```

### 1) Build queue of pending CIE topics (full scan + quality check)
```bash
projects/kahoot-channel/agent/scripts/build_pending_queue.sh
```

### 2) Validate one topic manually
```bash
projects/kahoot-channel/agent/scripts/validate_worksheet.py \
  /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics/algebra-c2/c2-01-introduction-to-algebra
```

### 3) Gate one topic (validate + quality check + pdf build + page-count checks)
```bash
projects/kahoot-channel/agent/scripts/run_topic_gate.sh \
  /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics/algebra-c2/c2-01-introduction-to-algebra \
  --skip-generation
```
or
```bash
projects/kahoot-channel/agent/scripts/run_topic_gate.sh \
  --topic /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics/algebra-c2/c2-01-introduction-to-algebra \
  --skip-generation
```

### 4) Run serial batch (validation/build only)
```bash
projects/kahoot-channel/agent/scripts/run_batch_serial.sh \
  /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/queues/cie-pending.txt \
  --skip-generation
```

### 5) Run serial batch (Codex generator mode)
```bash
projects/kahoot-channel/agent/scripts/run_batch_serial.sh \
  /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/queues/cie-pending.txt \
  --generator-cmd 'projects/kahoot-channel/agent/scripts/run_codex_generator.sh --topic "{topic_dir}"'
```

### 6) Full regression check (all topic folders)
```bash
find /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics -mindepth 2 -maxdepth 2 -type d | sort > /tmp/cie-all-topics.txt
projects/kahoot-channel/agent/scripts/run_batch_serial.sh /tmp/cie-all-topics.txt --skip-generation
```

## Edexcel full-pack pipeline (worksheet + kahoot + listing)

### 1) Build Edexcel queue with full-pack checks
```bash
projects/kahoot-channel/agent/scripts/build_pending_queue.sh \
  --out projects/kahoot-channel/agent/queues/edexcel-pending.txt \
  --base /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/edexcel-4ma1/micro-topics \
  --require-full-pack
```

### 2) Run serial full generation (local deterministic generator)
```bash
projects/kahoot-channel/agent/scripts/run_batch_serial.sh \
  projects/kahoot-channel/agent/queues/edexcel-pending.txt \
  --require-full-pack \
  --generator-cmd 'python3 projects/kahoot-channel/agent/scripts/run_local_fullpack_generator.py --topic "{topic_dir}" --force' \
  --max-topics 200
```

### 3) Edexcel one-cycle command
```bash
projects/kahoot-channel/agent/scripts/run_quality_cycle.sh \
  --queue projects/kahoot-channel/agent/queues/edexcel-pending.txt \
  --base /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/edexcel-4ma1/micro-topics \
  --report projects/kahoot-channel/agent/reports/edexcel-quality-cycle-latest.md \
  --require-full-pack \
  --generator-cmd 'python3 projects/kahoot-channel/agent/scripts/run_local_fullpack_generator.py --topic "{topic_dir}" --force' \
  --max-topics 20
```

## Script Notes (2026-02-17)
- `run_topic_gate.sh` now accepts both positional topic path and `--topic/--topic-dir` to avoid parameter misuse.
- `build_pending_queue.sh` now defaults to `agent/queues/cie-pending.txt`; no required positional args.
- Queue generation now scans all CIE topic folders under the base path and includes both structural + quality checks.
- `run_quality_cycle.sh` now orchestrates: pre-scan queue -> serial run -> post-scan -> report output.
- `run_quality_cycle.sh` treats empty queue as healthy pass (`status=no-pending`) and still writes a report for traceability.
- `quality_check_topic_pack.py` adds Kahoot/listing quality gates; enable via `--require-full-pack`.
- `run_batch_serial.sh`, `run_topic_gate.sh`, `run_quality_cycle.sh`, and `build_pending_queue.sh` now support `--require-full-pack`.
- `run_local_fullpack_generator.py` is the zero-quota fallback generator for Edexcel full-pack production.
- `run_local_fullpack_generator.py` now normalizes inline-backtick answer text before building MCQ options to avoid malformed Kahoot cells.
- Quality checker will reject questions that depend on missing external visuals (e.g. `as shown below`, `from the diagram`).
- Avoid exact duplicate question text; close variants with different formula content are allowed.
- If a batch stops, inspect the latest `.agent-gate/*.log` file in the failed topic folder, fix that topic first, then resume with `--start-from`.

## Codex Quota Controls
- Prefer the cycle runner for controlled progress and logging:
```bash
projects/kahoot-channel/agent/scripts/run_quality_cycle.sh \
  --max-topics 3 \
  --model gpt-5-mini
```
- First run in small batches:
```bash
projects/kahoot-channel/agent/scripts/run_batch_serial.sh \
  /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/queues/cie-pending.txt \
  --generator-cmd 'projects/kahoot-channel/agent/scripts/run_codex_generator.sh --topic "{topic_dir}"' \
  --max-topics 3
```
- `run_codex_generator.sh` skips Codex calls for topics that already pass structure + quality checks.
- Use `--start-from N` to resume exactly where a batch stopped instead of rerunning earlier topics.
- Optional (if your account supports it): pass a lighter model to reduce token burn, e.g.
  `--generator-cmd 'projects/kahoot-channel/agent/scripts/run_codex_generator.sh --topic "{topic_dir}" --model gpt-5-mini'`.
