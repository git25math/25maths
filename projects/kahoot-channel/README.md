# Kahoot Channel Development Project

## Goal
Build a repeatable production framework for two channel lines:
- CIE 0580
- Edexcel 4MA1

Each subtopic should have:
1. Kahoot quiz design brief
2. Kahoot listing copy (title/description/keywords)
3. Printable worksheet design brief
4. Answer key and worked-solution design brief

## Structure
- `_templates/`: reusable templates for every subtopic
- `cie0580/`: CIE 0580 syllabus mapping and topic workspaces
- `edexcel-4ma1/`: Edexcel 4MA1 syllabus mapping and topic workspaces

## Workflow (Topic-by-Topic)
1. Pick one subtopic from `TOPIC-INDEX.md`.
2. Duplicate template sections into the topic files.
3. Finalize Kahoot blueprint first (question flow + distractors).
4. Create worksheet blueprint aligned to same objective.
5. Create answers/solutions blueprint.
6. Mark status in `TOPIC-INDEX.md`.

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
