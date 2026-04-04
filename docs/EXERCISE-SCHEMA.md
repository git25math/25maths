# Exercise JSON Schema — CIE 0580 & Edexcel 4MA1 Unified

> Version: 2.1 (supports both exam boards)
> Created: 2026-04-02
> Updated: 2026-04-02
> Status: Active

## Overview

All exercise JSON files in `_data/exercises/` follow this unified schema,
supporting the full range of question types for both exam boards:

- **CIE 0580** (2025-2027 syllabus): short-answer + structured + legacy MCQ
- **Edexcel 4MA1** (Spec A): structured only (no MCQ, no standalone short-answer)

## Board Comparison

| Feature | CIE 0580 | Edexcel 4MA1 |
|---------|----------|-------------|
| Tiers | Core / Extended | Foundation / Higher |
| Calculator | Paper 1,3 = No; Paper 2,4 = Yes | **Both papers = Yes** |
| Question types | Short-answer + Structured | **Structured only** |
| MCQ | None (removed 2025) | None |
| Grades | C-G (Core) / A*-E (Ext) | 1-5 (F) / 4-9 (H) |
| Papers per tier | 2 (80-100 marks each) | 2 (100 marks each) |
| Mark types | M / A / B / E / SC | M / A / B (same system) |
| Command words | Calculate, Show that, Explain | **Work out**, Show, Give a reason |
| Calculus | No | **Higher only** (differentiation) |
| Unique | Linear programming, set depth | Completing the square, calculus |

### Edexcel Tier-Only Topics

Some Edexcel sub-topics exist only at Higher tier:
- **3.4 Calculus** — Higher only (F3-04 file kept for structural completeness, `_higherOnly: true`)
- **5.1 Vectors** — Higher only (F5-01 file kept for structural completeness, `_higherOnly: true`)

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

| Status | 含义 | 入口条件 | 出口条件（晋级金标准） |
|--------|------|----------|----------------------|
| `coming_soon` | 仅元数据，`questions: []` | 文件创建时 | 填入 ≥3 道题 + markScheme |
| `draft` | 题目已填，未经人工审查 | 自动化填充后 | 通过下方 **Review Checklist** 全部项 |
| `review` | 人工审查中 | 审查者标记 | 审查者确认签字 |
| `live` | 已发布，学生可见 | 审查通过 | — |

## Quality Gate: Draft → Review Checklist

每个文件从 `draft` 晋级 `review` 前，**必须**通过以下全部检查：

### A. 数学正确性（最高优先级）

- [ ] **算术验证**: 每道题的 correctAnswer 已用计算器/Python 反向验算
- [ ] **"show that" 验证**: 每步推导无跳跃、无错误，最终等式确实成立
- [ ] **单位一致**: 题目要求的单位与 correctAnswer 的单位匹配
- [ ] **容差合理**: numeric 类型的 tolerance 与 "3sf" / "1dp" 等精度要求吻合
- [ ] **整数/分数检查**: integer 类型答案确实为整数，fraction 确实为最简分数

### B. Mark Scheme 合规

- [ ] **分值总和**: 各 part marks 之和 = question totalMarks = file totalMarks
- [ ] **Mark 类型正确**: M mark 用于方法、A mark 依赖 M mark、B mark 独立
- [ ] **ft/cao 标注**: 需要 follow-through 的标了 ft，不允许的标了 cao
- [ ] **与真题一致**: mark 分配模式参照 CIE/EDX 真题 mark scheme 风格

### C. 题目风格

- [ ] **Board 匹配**: CIE 用 "Calculate/Find/Show that"，EDX 用 "Work out/Give a reason"
- [ ] **Tier 难度**: Core/Foundation 不含 Extended/Higher-only 内容（如微积分、向量几何证明）
- [ ] **题型覆盖**: 每个文件至少包含 1 道 structured 多部分题
- [ ] **情境合理**: 实际场景题的数字和设定符合常识（如速度、距离、货币）

### D. Schema 合规

- [ ] **JSON 有效**: `JSON.parse()` 无错误
- [ ] **必填字段**: 每道题有 id, type, totalMarks, markScheme, workingSteps
- [ ] **Structured 题**: 每个 part 有 label, questionText, marks, answerType
- [ ] **Status**: 标记为 `review`（表示已提交审查）

## Exercise Authoring Workflow

填充或更新练习题的标准工作流程：

### Phase A: 准备

1. 读取 `docs/EXERCISE-SCHEMA.md`（本文档）了解 schema
2. 读取 `docs/examples/exercise-variants-showcase.json` 了解 9 种变式风格
3. 确认目标文件的 board/tier/domain/topic 元数据
4. 查阅真题 mark scheme 了解该知识点的典型出题方式

### Phase B: 填充

1. 每个文件填入 3-5 道题，混合 short-answer + structured
2. Core/Foundation: 简单题为主（1-3 分 short-answer + 4-7 分 structured）
3. Extended/Higher: 复杂题为主（2-4 分 short-answer + 6-10 分 structured，含 show-that/hence）
4. **用 Python/计算器验证所有算术**
5. 设置 `totalMarks` = 所有题目分值之和
6. 设置 `status: "draft"`

### Phase C: 验证 → 提交 → 合并

1. **验证**: 运行 mark total 校验脚本，确认 0 mismatches
2. **提交**: `git commit` with descriptive message（含文件数 + 题数 + 分值）
3. **推送**: `git push` to feature branch
4. **PR**: 创建 Pull Request with summary table
5. **合并**: Squash merge to main
6. **文档**: 更新 `DEVELOPMENT-PLAN.md` 进度 + `exercise_registry.json`

### Phase D: 质量审查（draft → review → live）

1. 人工逐题审查（按上方 Review Checklist）
2. 修正发现的问题
3. 标记 `status: "review"` → 二次确认 → `status: "live"`
4. 重新生成 `exercise_registry.json`

## Mark Total Validation Script

快速验证所有文件 mark totals 的脚本：

```python
import json, os
for f in sorted(os.listdir('_data/exercises')):
    if not f.endswith('.json'): continue
    with open(f'_data/exercises/{f}') as fh: d = json.load(fh)
    nq = len(d.get('questions', []))
    if nq == 0: continue
    calc = sum(
        q['totalMarks'] if q['type'] != 'structured'
        else sum(p['marks'] for p in q.get('parts', []))
        for q in d['questions']
    )
    stated = d.get('totalMarks', 0)
    if calc != stated:
        print(f"MISMATCH {d['syllabusCode']}: stated={stated}, calc={calc}")
```

## Migration Notes (v1 → v2)

- v1 had no `schemaVersion`, `status`, `paperType`, `calculator`, or `totalMarks`
- v1 `questions[].type` was always `"multiple-choice"` → rename to `"mcq"`
- v1 had no mark schemes or working steps
- All 202 files batch-migrated to v2 with `status: "coming_soon"` and `questions: []`
- Round 11 (2026-04): All 202 files filled with sample questions, status: `draft`
