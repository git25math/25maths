# Exercise JSON Schema — CIE 0580 Style

> Version: 2.0 (replaces v1 MCQ-only format)
> Created: 2026-04-02
> Status: Active

## Overview

All exercise JSON files in `_data/exercises/` follow this unified schema,
supporting the full range of CIE 0580 (2025-2027 syllabus) question types:
short-answer, structured multi-part, and legacy MCQ.

## File-Level Schema

```jsonc
{
  // ── Metadata (preserved from v1) ──
  "topic": "string",                    // e.g. "introduction to algebra"
  "board": "CIE 0580 | Edexcel 4MA1",
  "subtopicId": "string",               // e.g. "cie0580:algebra-c2:c2-01-introduction-to-algebra"
  "syllabusCode": "string",             // e.g. "C2-01"
  "tier": "Core | Extended | Foundation | Higher",
  "domain": "string",                   // e.g. "algebra"

  // ── v2 New Fields ──
  "schemaVersion": 2,
  "status": "coming_soon | draft | review | live",
  "paperType": "short-answer | structured | mixed",
  "calculator": true | false | null,    // null = both allowed
  "totalMarks": 0,                      // sum of all question marks (auto-calculated)
  "estimatedMinutes": 0,                // suggested time

  // ── Questions ──
  "questions": []                        // see Question Schema below
}
```

## Question Schema

Each question in the `questions` array follows one of the type-specific
schemas below. All types share a common base.

### Common Base Fields

```jsonc
{
  "id": "C2-01-Q1",                     // unique within file: {syllabusCode}-Q{n}
  "type": "short-answer | structured | mcq",
  "totalMarks": 4,                      // total marks for this question
  "calculator": true | false | null,     // override file-level setting if needed
  "commandWord": "calculate | show | determine | explain | write-down | construct | sketch | plot | describe | find | solve | simplify | factorise | expand",
  "topic": "string",                    // optional: specific sub-skill tag
  "difficulty": "easy | medium | hard",  // estimated difficulty within tier
  "context": "string | null"            // optional shared context/scenario text
}
```

### Type: `short-answer`

For Paper 1 (Core) / Paper 2 (Extended) style questions.
Typically 1-4 marks, single or two-part.

```jsonc
{
  "id": "C2-01-Q1",
  "type": "short-answer",
  "totalMarks": 2,
  "commandWord": "simplify",
  "questionText": "Simplify $4a + 5a - 2a$.",
  "answerType": "expression",
  "correctAnswer": "$7a$",
  "tolerance": null,                     // for numeric: e.g. 0.05
  "unit": null,                          // e.g. "cm", "cm²"
  "markScheme": [
    { "mark": "B1", "desc": "Correct collection of terms" },
    { "mark": "B1", "desc": "$7a$ cao" }
  ],
  "workingSteps": [
    "4a + 5a = 9a",
    "9a - 2a = 7a"
  ],
  "explanation": "Combine like terms: 4 + 5 - 2 = 7, giving $7a$."
}
```

### Type: `structured`

For Paper 3 (Core) / Paper 4 (Extended) style questions.
Multi-part, 4-12 marks total.

```jsonc
{
  "id": "E6-01-Q1",
  "type": "structured",
  "totalMarks": 10,
  "context": "Triangle ABC has AB = 8 cm, angle BAC = 42° and angle ABC = 78°.",
  "diagram": null,                       // future: path to SVG/PNG
  "parts": [
    {
      "label": "a",
      "questionText": "Find the length of BC.",
      "marks": 3,
      "commandWord": "find",
      "answerType": "numeric",
      "correctAnswer": "5.47",
      "tolerance": 0.01,
      "unit": "cm",
      "markScheme": [
        { "mark": "M1", "desc": "Sine rule stated: BC/sin42 = 8/sin(180-42-78)" },
        { "mark": "M1", "desc": "Correct substitution: BC = 8 × sin42/sin60" },
        { "mark": "A1", "desc": "5.47 or 5.472..." }
      ],
      "workingSteps": [
        "Angle ACB = 180 - 42 - 78 = 60°",
        "BC / sin42 = 8 / sin60  (sine rule)",
        "BC = 8 × sin42 / sin60",
        "BC = 8 × 0.6691 / 0.8660",
        "BC = 6.18 (3sf)"
      ]
    },
    {
      "label": "b.i",
      "questionText": "Calculate the area of triangle ABC.",
      "marks": 2,
      "commandWord": "calculate",
      "answerType": "numeric",
      "correctAnswer": "21.4",
      "tolerance": 0.1,
      "unit": "cm²",
      "markScheme": [
        { "mark": "M1", "desc": "½ × 8 × their BC × sin42" },
        { "mark": "A1", "desc": "21.4 or better, ft their BC" }
      ],
      "workingSteps": [
        "Area = ½ × AB × BC × sinB",
        "Area = ½ × 8 × 6.18 × sin78",
        "Area = 24.2 (3sf)"
      ]
    },
    {
      "label": "b.ii",
      "questionText": "Hence find the shortest distance from A to the line BC.",
      "marks": 2,
      "commandWord": "find",
      "answerType": "numeric",
      "correctAnswer": "7.83",
      "tolerance": 0.01,
      "unit": "cm",
      "markScheme": [
        { "mark": "M1", "desc": "their area = ½ × their BC × h" },
        { "mark": "A1", "desc": "7.83 or better" }
      ],
      "workingSteps": [
        "Area = ½ × base × height",
        "24.2 = ½ × 6.18 × h",
        "h = 2 × 24.2 / 6.18 = 7.83 cm"
      ]
    },
    {
      "label": "c",
      "questionText": "Show that the perimeter of triangle ABC is 22.0 cm, correct to 3 significant figures.",
      "marks": 3,
      "commandWord": "show",
      "answerType": "show-that",
      "correctAnswer": "22.0",
      "markScheme": [
        { "mark": "M1", "desc": "Finds AC using sine rule or cosine rule" },
        { "mark": "A1", "desc": "AC = 7.80 or 7.799..." },
        { "mark": "A1", "desc": "8 + 6.18 + 7.80 = 21.98... → 22.0 (3sf)" }
      ],
      "workingSteps": [
        "AC / sin78 = 8 / sin60",
        "AC = 8 × sin78 / sin60 = 9.03",
        "Perimeter = 8 + 6.18 + 9.03 = 23.2 (3sf)"
      ]
    }
  ]
}
```

### Type: `mcq` (legacy / Paper 1 style)

Kept for backward compatibility with existing exercise engine.

```jsonc
{
  "id": "C1-01-Q1",
  "type": "mcq",
  "totalMarks": 1,
  "questionText": "What is the value of $2^5$?",
  "options": ["10", "25", "32", "64"],
  "correctAnswer": 2,                   // 0-based index
  "explanation": "$2^5 = 2 × 2 × 2 × 2 × 2 = 32$"
}
```

## Answer Types

| `answerType` | Description | Auto-gradable | Example |
|-------------|-------------|---------------|---------|
| `numeric` | Number ± tolerance | Yes | `12.4` |
| `integer` | Exact integer | Yes | `7` |
| `fraction` | Fraction | Yes | `3/7` |
| `decimal-exact` | Exact decimal | Yes | `0.375` |
| `expression` | Algebraic expression | Needs CAS | `3x + 2` |
| `coordinate` | Coordinate pair | Yes | `(2, -3)` |
| `set-notation` | Set | Yes | `{1, 2, 3}` |
| `inequality` | Inequality | Needs parser | `x > 3` |
| `vector` | Vector | Yes | column vector |
| `show-that` | Proof (given answer) | No | — |
| `explain` | Written explanation | No | — |
| `draw` | Drawing/construction | No | — |
| `graph-read` | Read from graph | Yes | `3.5` |
| `table-fill` | Fill in table cells | Yes | array of values |

## Mark Scheme Mark Types

| Mark | Name | Rule |
|------|------|------|
| `M1`-`M3` | Method | Correct method shown |
| `A1`-`A2` | Accuracy | Correct answer (requires M marks) |
| `B1`-`B4` | Independent | No dependency on M marks |
| `E1` | Explanation | For "explain" / "show that" |
| `SC1` | Special case | Partial credit |

Suffix conventions:
- `ft` — follow through from earlier error
- `dep` — depends on a specific prior mark
- `cao` — correct answer only
- `oe` — or equivalent
- `isw` — ignore subsequent working

## Status Lifecycle

```
coming_soon → draft → review → live
```

- `coming_soon`: Metadata only, `questions: []`, shown as "Coming Soon" on site
- `draft`: Questions being authored, not visible to students
- `review`: Quality review pending
- `live`: Published and available to students

## Migration Notes (v1 → v2)

- v1 had no `schemaVersion`, `status`, `paperType`, `calculator`, or `totalMarks`
- v1 `questions[].type` was always `"multiple-choice"` → rename to `"mcq"`
- v1 had no mark schemes or working steps
- All 202 files batch-migrated to v2 with `status: "coming_soon"` and `questions: []`
