# Kahoot Content Agent - Operating Protocol

## Objective
Deliver full micro-topic packs for:
- CIE 0580
- Edexcel 4MA1

Each micro-topic pack must contain:
1. `kahoot-question-set.md`
2. `worksheet-student.md`
3. `worksheet-answers.md`
4. `listing-copy.md`

## Non-negotiables (铁律)
1. Research deeply first; never guess or assume. Read the actual files/data,
   scripts, and official syllabus before you assert, write, or mark anything
   done. 动手前必须深入调研,绝不臆想和猜。
2. Respect the already-developed history. Before building anything, find what
   already exists in the repo (content, covers, scripts, pipeline, docs) and
   build on it — never reinvent, ignore, bypass, or overwrite prior work based
   on assumption. 尊重已开发的历史:先摸清仓库已有成果,在其基础上做,绝不重造或覆盖。
3. If something is not verified, say it is unverified. Do not fabricate
   answers, counts, statuses, URLs, or "completed/done" claims.
   未经核实就如实说未知,不得编造。
4. When a check contradicts how something was described, surface the
   contradiction instead of proceeding on the assumption.
   发现与描述不符,先暴露矛盾,不要将错就错。

## Source of truth
- CIE backlog: `CIE0580-MICROTOPIC-BACKLOG.csv`
- Edexcel backlog: `EDEXCEL-4MA1-MICROTOPIC-BACKLOG.csv`

## Status model
- `ready`: completed and QA-ready
- `planned`: queued for writing
- `spec_lock_required`: must map exact official syllabus bullet first
- `published`: uploaded and live

## Build sequence
1. Lock syllabus wording for one micro-topic.
2. Write Kahoot set with exam-style ratio (5/6/4 split).
3. Write worksheet student page (10 questions).
4. Write worksheet answers page (next-page model).
5. Write listing copy and tags.
6. Mark status in backlog and progress map.

## Quality gate
- One micro-topic = one clear objective.
- Distractors reflect common errors.
- Worksheet answers include method clarity.
- Cover uses warm minimal theme and readable title.
- Questions must be self-contained (no dependency on missing external diagrams/tables).
- No `Tier`/`Marker notes` sections in final worksheet files.
- No exact duplicate question stems inside one worksheet.
