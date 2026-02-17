# Kahoot Channel Development Project

## Goal
Build a repeatable production framework for two channel lines:
- CIE 0580
- Edexcel 4MA1

Each micro-topic (single syllabus point) must have:
1. Kahoot question set (exam-style, upload-ready)
2. Kahoot listing copy (title/description/keywords)
3. Printable worksheet page (10 questions)
4. Answer key and worked solutions on the next page

## Structure
- `_templates/`: reusable templates for every subtopic
- `cie0580/`: CIE 0580 syllabus mapping and topic workspaces
- `edexcel-4ma1/`: Edexcel 4MA1 syllabus mapping and topic workspaces
- `agent/`: backlog + scripts + operating protocol for full-series production

## Current Execution Track (CIE Number E1.1-E1.18)
- Path: `cie0580/micro-topics/number-e1/`
- Coverage map: `NUMBER-E1-MICROTOPIC-MAP.md`
- Exam-style ratio rule: `KAHOOT-EXAM-STYLE-RATIO.md`
- Completed micro-topic packs:
  - `e1-01-write-numbers/`
  - `e1-02-place-value-order/`
  - `e1-03-rounding-sf/`

## Agentized Full-Series Pipeline
- Protocol: `agent/AGENT-OPERATING-PROTOCOL.md`
- Backlogs:
  - `agent/CIE0580-MICROTOPIC-BACKLOG.csv`
  - `agent/EDEXCEL-4MA1-MICROTOPIC-BACKLOG.csv`
- Generator script:
  - `agent/scripts/generate_microtopic_pack.sh`
- Command guide:
  - `agent/RUN-COMMANDS.md`

## Workflow (Micro-topic-by-Micro-topic)
1. Pick one micro-topic from `TOPIC-INDEX.md`.
2. Map exact syllabus point and define scope boundary.
3. Build Kahoot set using past-paper question-type mapping.
4. Build worksheet (`10` questions) aligned to same objective.
5. Put answer key and worked solutions on the next page.
6. Finalize listing copy and mark status in `TOPIC-INDEX.md`.

## Mandatory Templates
- `/_templates/topic-pack-standard.md`
- `/_templates/kahoot-question-set.template.md`
- `/_templates/worksheet-pack.template.tex`

## Status Labels
- `planned`
- `in_progress`
- `ready_for_build`
- `published`

## Naming Convention
- Topic folder: `NN-topic-slug`
- Kahoot brief: `kahoot-brief.md`
- Worksheet brief: `worksheet-brief.md`
- Answers brief: `answers-brief.md`
