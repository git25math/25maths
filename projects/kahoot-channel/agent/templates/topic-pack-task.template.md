# Task: Generate One Full Topic Pack

## Input
- Topic directory: `{topic_dir}`
- Student worksheet: `{student_file}`
- Answer worksheet: `{answers_file}`
- Kahoot set: `{kahoot_file}`
- Listing copy: `{listing_file}`

## Required Output
Create or overwrite all 4 files so the topic is production-ready.

## Worksheet Constraints
1. Student file line 1 must end with `Worksheet (Student)`.
2. Answers file line 1 must end with `Worksheet (Answers)`.
3. Student and answers line 2 must be identical and start with `## `.
4. Student file must include:
- `Name: ____________________   Date: ____________________`
- `## Syllabus focus`
- `## Model example`
- `## Practice (10)`
5. Student file must include exactly questions `1.` to `10.` under `## Practice (10)`.
6. Answers file must include exactly answers `1.` to `10.`.
7. Use backticks for maths expressions, e.g. `` `x^2 + 3x` ``.
8. Do not leave placeholders, empty items, or forbidden sections (`## Tier`, `## Marker notes`).
9. Questions must be self-contained and must not depend on missing visuals (`as shown below`, `from the diagram`, etc.).
10. Do not duplicate question stems.

## Kahoot Constraints
1. Write `kahoot-question-set.md` with a Markdown table using this exact header:
`| # | Question | A | B | C | D | Correct | Type |`
2. Include exactly 15 rows numbered `1` to `15`.
3. `Correct` must be one of `A/B/C/D`.
4. `Type` must be one of `Fluency`, `Method`, `Context`.
5. Type split must be:
- Q1-Q5: Fluency (5)
- Q6-Q11: Method (6)
- Q12-Q15: Context (4)
6. Use plausible distractors that reflect common errors.
7. Keep all questions self-contained (no missing chart/diagram dependency).

## Listing Constraints
1. Write `listing-copy.md` with these sections:
- `## Kahoot Name`
- `## Kahoot Description`
- `## Tags`
2. Description should be exam-oriented and specific to this topic.
3. Provide at least 3 tags in hashtag style.

## Quality Goal
- Tone and difficulty must match the topic tier (Foundation/Higher).
- Ensure strong usability for classroom and independent revision.

## Completion Rule
Return only when all 4 files are fully written and ready to pass quality gates.
