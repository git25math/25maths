# Task: Generate One Worksheet Topic

## Input
- Topic directory: `{topic_dir}`
- Student file: `{topic_dir}/worksheet-student.md`
- Answer file: `{topic_dir}/worksheet-answers.md`

## Required Output
Overwrite both files with complete, production-ready content.

## Hard Constraints
1. Keep line 1 and line 2 headers in both files.
2. Student file must include:
- `Name: ____________________   Date: ____________________`
- `## Syllabus focus`
- `## Model example`
- `## Practice (10)`
3. Student file must contain exactly questions `1.` to `10.`.
4. Answer file must contain exactly answers `1.` to `10.`.
5. Use backticks for maths expressions, e.g. `` `x^2 + 3x` ``.
6. Do not leave placeholders or empty numbered items.
7. Do not add `## Tier`, `## Marker notes`, or extra sections at the end.
8. Every question must be self-contained; do not reference missing visuals such as `as shown below` or `from the diagram`.
9. Do not write duplicate question stems.

## Quality Constraints
1. Q1-Q3 easy direct application.
2. Q4-Q6 standard exam-style.
3. Q7-Q9 multi-step/context.
4. Q10 challenge item.
5. Answer numbering must match student numbering exactly.

## Completion Rule
Return only when both files are fully written and ready to pass validator/build gates.
