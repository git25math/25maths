# Agent Run Commands

## Quality-first loop (fix -> update logic -> recheck)

### 1) Build CIE full-pack queue
```bash
projects/kahoot-channel/agent/scripts/build_pending_queue.sh \
  --out projects/kahoot-channel/agent/queues/cie-pending-fullpack.txt \
  --base /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics \
  --require-full-pack
```

### 2) Build Edexcel full-pack queue
```bash
projects/kahoot-channel/agent/scripts/build_pending_queue.sh \
  --out projects/kahoot-channel/agent/queues/edexcel-pending.txt \
  --base /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/edexcel-4ma1/micro-topics \
  --require-full-pack
```

### 3) Gate one topic end-to-end
```bash
projects/kahoot-channel/agent/scripts/run_topic_gate.sh \
  --topic /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics/algebra-c2/c2-01-introduction-to-algebra \
  --require-full-pack
```

### 4) Regenerate + gate by queue (deterministic local generator)
```bash
projects/kahoot-channel/agent/scripts/run_batch_serial.sh \
  projects/kahoot-channel/agent/queues/cie-pending-fullpack.txt \
  --require-full-pack \
  --generator-cmd 'python3 projects/kahoot-channel/agent/scripts/run_local_fullpack_generator.py --topic "{topic_dir}" --force'
```

```bash
projects/kahoot-channel/agent/scripts/run_batch_serial.sh \
  projects/kahoot-channel/agent/queues/edexcel-pending.txt \
  --require-full-pack \
  --generator-cmd 'python3 projects/kahoot-channel/agent/scripts/run_local_fullpack_generator.py --topic "{topic_dir}" --force'
```

### 5) Full regression (all topics, skip generation)
```bash
find /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics -mindepth 2 -maxdepth 2 -type d | sort > /tmp/cie-all-topics-fullpack.txt
projects/kahoot-channel/agent/scripts/run_batch_serial.sh /tmp/cie-all-topics-fullpack.txt --skip-generation --require-full-pack
```

```bash
find /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/edexcel-4ma1/micro-topics -mindepth 2 -maxdepth 2 -type d | sort > /tmp/edexcel-all-topics-fullpack.txt
projects/kahoot-channel/agent/scripts/run_batch_serial.sh /tmp/edexcel-all-topics-fullpack.txt --skip-generation --require-full-pack
```

## Script Notes (2026-02-18)
- `run_local_fullpack_generator.py` is now board-aware for both `CIE 0580` and `Edexcel 4MA1` (headers, metadata, tier mapping).
- Domain mapping is board-specific, preventing cross-board fallback (for example CIE algebra/coordinate no longer degrades into statistics templates).
- Math generation correctness fixes:
- fraction simplification always uses full gcd reduction
- simultaneous equations keep exact arithmetic (no floor truncation)
- rounding questions output explicit final values
- inequality template fixed to preserve valid variable-solving form
- `validate_worksheet.py` now enforces board line consistency with topic path:
- `# CIE 0580 Worksheet (...)` for CIE folders
- `# Edexcel 4MA1 Worksheet (...)` for Edexcel folders
- `quality_check_topic_pack.py` now enforces board consistency in:
- Kahoot metadata (`- Board: ...`)
- listing text (name/description must match expected board)
- `quality_check_worksheet.py` adds deterministic answer checks for known generated patterns:
- simplified fractions are fully reduced
- simultaneous equation answers match exact solutions
- arithmetic evaluate patterns and rounding answers are numerically consistent
- `build_worksheet_pdf.sh` now tightens standalone `=` spacing in LaTeX math rendering (`\!=\!`) to avoid visually oversized equation gaps in PDFs, while keeping `>=`/`<=` unchanged.
- Full-pack gate rule remains strict:
- student PDF = 2 pages
- full pack PDF (student + answers) = 3 pages
- If a batch fails: inspect the latest `.agent-gate/*.log` in that topic, fix root cause, update generator or validator, then resume with `--start-from`.

## Codex Quota Controls
- Prefer small cycles with logs:
```bash
projects/kahoot-channel/agent/scripts/run_quality_cycle.sh \
  --max-topics 3 \
  --require-full-pack \
  --generator-cmd 'python3 projects/kahoot-channel/agent/scripts/run_local_fullpack_generator.py --topic "{topic_dir}" --force'
```
- Resume precisely after failure:
```bash
projects/kahoot-channel/agent/scripts/run_batch_serial.sh \
  projects/kahoot-channel/agent/queues/cie-pending-fullpack.txt \
  --require-full-pack \
  --generator-cmd 'python3 projects/kahoot-channel/agent/scripts/run_local_fullpack_generator.py --topic "{topic_dir}" --force' \
  --start-from 12
```
