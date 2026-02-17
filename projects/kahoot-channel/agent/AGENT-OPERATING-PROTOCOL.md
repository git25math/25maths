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
