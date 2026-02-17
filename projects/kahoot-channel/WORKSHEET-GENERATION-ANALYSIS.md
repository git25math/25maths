# Worksheet生成逻辑分析报告

> 分析时间: 2026-02-17  
> 项目: Kahoot Channel - CIE 0580 微主题工作表生成系统

---

## 📋 执行摘要

当前的worksheet生成系统是一个**半自动化的内容生成和PDF编译流程**，包含以下核心组件：

1. **内容规范文档** (`WORKSHEET-GENERATION-SPEC.md`) - 797行详细规范
2. **骨架生成脚本** (`generate_microtopic_pack.sh`) - 创建占位符文件
3. **PDF构建脚本** (`build_worksheet_pdf.sh`) - 将Markdown转换为LaTeX并编译PDF
4. **LaTeX模板** (`worksheet-pdf-template.tex`) - 定义PDF样式和布局

**当前状态**: 
- ✅ Core (C2) 主题: 9/9 已完成内容填充
- ❌ Extended (E2-E9) 主题: 大部分仍为占位符，需要生成90个主题的实际内容

---

## 🏗️ 系统架构

### 1. 文件组织结构

```
kahoot-channel/
├── _templates/
│   └── worksheet-pdf-template.tex          # LaTeX PDF模板
├── cie0580/
│   └── micro-topics/
│       ├── algebra-c2/                     # Core Algebra (已完成)
│       │   ├── c2-01-introduction-to-algebra/
│       │   │   ├── worksheet-student.md    # 学生版工作表
│       │   │   ├── worksheet-answers.md    # 答案版
│       │   │   └── pdf/                    # 生成的PDF输出
│       │   └── ...
│       ├── algebra-e2/                     # Extended Algebra (待生成)
│       │   ├── e2-01-introduction-to-algebra/
│       │   │   ├── worksheet-student.md    # ⚠️ 仅占位符
│       │   │   └── worksheet-answers.md    # ⚠️ 仅占位符
│       │   └── ...
│       └── [其他16个领域目录]
└── agent/
    ├── scripts/
    │   ├── generate_microtopic_pack.sh     # 生成骨架
    │   └── build_worksheet_pdf.sh          # 构建PDF
    ├── CIE0580-MICROTOPIC-BACKLOG.csv      # 主题清单
    └── WORKSHEET-GENERATION-SPEC.md        # 内容生成规范
```

### 2. 工作流程图

```
┌─────────────────────────────────────────────────────────────┐
│ 第1步: 骨架生成 (generate_microtopic_pack.sh)                │
│ 输入: CIE0580-MICROTOPIC-BACKLOG.csv                         │
│ 输出: 占位符 worksheet-student.md + worksheet-answers.md     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 第2步: 内容填充 (手动或AI生成)                               │
│ 参考: WORKSHEET-GENERATION-SPEC.md (797行规范)               │
│ 要求: 严格遵循格式、数学符号、难度分级                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 第3步: PDF编译 (build_worksheet_pdf.sh)                      │
│ 处理流程:                                                     │
│   1. 解析Markdown文件                                        │
│   2. 转义LaTeX特殊字符                                       │
│   3. 转换数学符号 (backticks → $...$ LaTeX)                 │
│   4. 填充LaTeX模板                                           │
│   5. XeLaTeX编译                                             │
│   6. 分离学生版PDF (前2页)                                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 输出: 3页PDF                                                 │
│   - 第1页: 学生工作表 (Q1-Q5)                                │
│   - 第2页: 学生工作表 (Q6-Q10)                               │
│   - 第3页: 答案页                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 核心组件详细分析

### 组件1: `generate_microtopic_pack.sh` - 骨架生成器

**功能**: 从CSV清单批量创建占位符文件

**输入**:
```csv
board,syllabus_code,domain,micro_topic,tier,status,notes
CIE0580,E2.1,Algebra and Graphs,E2.1 syllabus micro-topic,Core|Extended,planned,lock official wording during build
```

**输出示例** (`worksheet-student.md`):
```markdown
# Worksheet (Student)
## E2.1 E2.1 syllabus micro-topic

Name: ____________________   Date: ____________________

## Syllabus focus
- [Fill with exact official wording]

## Tier
- Core|Extended

## Exam reminder
- [Add a one-line exam strategy reminder]

## Model example
- [Add one worked example]

## Practice (10)
1. 
2. 
...
10. 
```

**关键逻辑**:
- 跳过 `status != "planned"` 的条目
- 跳过包含占位符文本的 `micro_topic` (除非设置 `ALLOW_PLACEHOLDER=1`)
- 使用 `slugify` 函数生成目录名: `c2-01-introduction-to-algebra`
- 为每个主题创建4个文件:
  1. `kahoot-question-set.md`
  2. `worksheet-student.md`
  3. `worksheet-answers.md`
  4. `listing-copy.md`

**问题**:
- ⚠️ 生成的占位符格式与最终规范不完全一致
- ⚠️ 包含已废弃的 `## Tier` 和 `## Marker notes` 字段

---

### 组件2: `WORKSHEET-GENERATION-SPEC.md` - 内容生成规范

**规模**: 797行，包含90个主题的详细指导

**核心规范**:

#### 2.1 文件格式要求

**学生版** (`worksheet-student.md`):
```markdown
# CIE 0580 Worksheet (Student)
## {CODE} {Topic Name}

Name: ____________________   Date: ____________________

## Syllabus focus
- {一句话描述教学大纲目标}

## Model example
{简短的示例解题过程}

## Practice (10)
1. {问题1}
2. {问题2}
...
10. {问题10}
```

**答案版** (`worksheet-answers.md`):
```markdown
# CIE 0580 Worksheet (Answers)
## {CODE} {Topic Name}

1. {答案1}
2. {答案2}
...
10. {答案10}
```

**关键格式规则**:
- ✅ 第4行必须是: `Name: ____________________   Date: ____________________` (3个空格)
- ✅ 不能有 `## Tier` 行 (旧格式)
- ✅ 不能有 `## Marker notes` (仅在答案文件中)
- ✅ 答案文件不能有 Name/Date 行

#### 2.2 数学符号约定

使用**Markdown反引号**包裹数学表达式，构建脚本会自动转换为LaTeX:

| Markdown输入 | LaTeX输出 | 渲染效果 |
|-------------|----------|---------|
| `` `x^2 + 3x - 4` `` | `$x^2 + 3x - 4$` | x² + 3x − 4 |
| `` `sqrt(12)` `` | `$\sqrt{12}$` | √12 |
| `` `2/3` `` | `$\frac{2}{3}$` | ²⁄₃ |
| `` `3 x 5` `` | `$3 \times 5$` | 3 × 5 |
| `$5.60` | `$5.60` | $5.60 (货币符号在反引号外) |

**转换逻辑** (在 `build_worksheet_pdf.sh` 中):
```python
# 1. 恢复 ^ 符号 (之前被转义为 \textasciicircum{})
s = s.replace(r'\textasciicircum{}', '^')

# 2. 转换 sqrt() 函数
s = re.sub(r'sqrt\(([^()]+)\)', lambda m: '\\sqrt{' + m.group(1) + '}', s)

# 3. 将反引号包裹的内容转换为 $...$
s = re.sub(f'`([^`]+)`', lambda m: f"${m.group(1)}$", s)

# 4. 在数学模式中转换乘号
seg = re.sub(r'(?<=\d)\s*[xX]\s*(?=\d)', lambda _m: '\\times ', seg)

# 5. 转换分数
seg = frac_pattern.sub(lambda m: '\\frac{' + m.group(1) + '}{' + m.group(2) + '}', seg)
```

#### 2.3 内容质量标准

**难度校准**:
- **Core (C前缀)**: IGCSE基础/核心级别
  - 直接应用公式
  - 整数或简单小数答案
  - 1-2步问题
  
- **Extended (E前缀)**: IGCSE扩展级别
  - 多步骤推理问题
  - 可能包含根式、代数分数、复杂运算
  - 2-3步问题

**问题难度曲线** (10题):
- Q1-Q3: 直接应用 (1步，回忆/应用)
- Q4-Q6: 标准应用 (1-2步)
- Q7-Q9: 多步骤或情境问题 (2-3步)
- Q10: 挑战/扩展 (最难，可能结合多个技能)

**问题类型组合**:
- 至少2题: 纯计算
- 至少2题: 概念/解释 (如 "Is X prime? Explain.")
- 至少2题: 应用/文字题 (真实情境)
- 至少1题: 逆向/反向问题 (给定答案，求输入)

#### 2.4 主题内容指南

规范文档包含所有90个主题的详细指导，例如:

**C2.1 Introduction to algebra**:
- Focus: Use letters to represent unknowns, substitute values and simplify expressions.
- Key: substitution, collecting like terms, simple expressions
- Example model: Substitute `x=3` into `2x+5` → `2(3)+5 = 11`

**E2.5 Equations**:
- Focus: Solve quadratic equations by factorising, completing the square, and using the formula.
- Key: quadratic formula, completing the square, forming and solving
- Example model: Solve `x^2 - 5x + 6 = 0` → `(x-2)(x-3) = 0`, `x = 2` or `x = 3`

---

### 组件3: `build_worksheet_pdf.sh` - PDF构建引擎

**功能**: 将Markdown工作表转换为专业的LaTeX PDF

**处理流程**:

#### 3.1 元数据提取
```bash
# 提取标题行
title_line=$(grep -m1 '^## ' "$student_md" | sed 's/^##[[:space:]]*//')

# 提取代码 (如 C2.1, E6.5)
raw_code=$(echo "$title_line" | awk '{print $1}')

# 确定难度
difficulty="Core"
if [[ "$code" =~ ^[Ee] ]]; then
  difficulty="Extended"
fi

# 提取教学大纲焦点
syllabus_focus=$(extract_section_line "Syllabus focus" "$student_md")

# 提取10个问题
student_items=$(awk 'tolower($0) ~ /^## .*practice \(10/{flag=1;next} ...' "$student_md")

# 提取10个答案
answers_items=$(awk '/^[0-9]+\. /{sub(/^[0-9]+\. /,""); print}' "$answers_md")
```

#### 3.2 LaTeX转义
```bash
escape_tex() {
  sed -E \
    -e 's/\\/\\textbackslash{}/g' \
    -e 's/&/\\&/g' \
    -e 's/%/\\%/g' \
    -e 's/#/\\#/g' \
    -e 's/_/\\_/g' \
    -e 's/\$/\\$/g' \
    -e 's/\^/\\textasciicircum{}/g' \
    -e 's/\{/\\{/g' \
    -e 's/\}/\\}/g'
}
```

#### 3.3 Python数学符号处理

**关键函数** `render_math()`:
```python
def render_math(s: str) -> str:
    # 1. 恢复 ^ 符号
    s = s.replace(r'\textasciicircum{}', '^')
    
    # 2. 转换 sqrt() 函数
    s = re.sub(r'sqrt\(([^()]+)\)', lambda m: '\\sqrt{' + m.group(1) + '}', s)
    
    # 3. 将反引号转换为 $...$
    s = re.sub(f'`([^`]+)`', lambda m: f"${m.group(1)}$", s)
    
    # 4. 分离数学/非数学片段
    segments = []
    in_math = False
    for ch in s:
        if ch == '$' and (i == 0 or s[i-1] != '\\'):
            in_math = not in_math
    
    # 5. 在数学模式中处理:
    #    - 乘号: 7 x 3 → 7 \times 3
    #    - 分数: a/b → \frac{a}{b}
    seg = re.sub(r'(?<=\d)\s*[xX]\s*(?=\d)', lambda _m: '\\times ', seg)
    seg = frac_pattern.sub(lambda m: '\\frac{' + m.group(1) + '}{' + m.group(2) + '}', seg)
    
    # 6. 在非数学模式中处理单位: cm^2 → cm$^{2}$
    out.append(unit_pattern.sub(lambda m: m.group(1) + '$^{' + m.group(2) + '}$', seg))
    
    return s
```

#### 3.4 模板填充

```python
# 替换标题
lines[i] = rf'\newcommand{{\WorksheetTitle}}{{{title}}}'
lines[i] = rf'\newcommand{{\WorksheetSubtitle}}{{{subtitle}}}'
lines[i] = rf'\newcommand{{\BoardLabel}}{{{board}}}'

# 替换教学大纲焦点框
tex = tex[:after_marker] + ' ' + focus + '\n' + tex[end:]

# 生成问题框
for i in range(10):
    q = questions[i] if i < len(questions) else f'Question {i+1}.'
    lines = max(2, min(4, (len(q) // 75) + 1))
    question_boxes.append(
        f"\\begin{{qbox}}{{Q{i+1}}}\n{q}\n\\answerlines{{{lines}}}\n\\end{{qbox}}\n"
    )

# 分页: Q1-Q5 在第1页, Q6-Q10 在第2页
first_student_page = "\n".join(question_boxes[:5])
second_student_page = "\n".join(question_boxes[5:])

# 添加答案页 (第3页)
answer_items = "\n".join([f"\\item {a}" for a in answers[:10]])
answers_page = f"""
\\newpage
\\SetFooterLabel{{Answer Key}}
\\noindent{{\\Large\\bfseries\\color{{BrandPrimary}}Answer Keys}}
...
\\begin{{enumerate}}
{answer_items}
\\end{{enumerate}}
"""
```

#### 3.5 PDF编译和分离

```bash
# XeLaTeX编译
cd "$workdir" && xelatex -interaction=nonstopmode -halt-on-error worksheet-pack.tex

# 生成完整PDF (3页)
cp "$workdir/worksheet-pack.pdf" "$outdir/${code}-worksheet-pack.pdf"

# 使用qpdf或pdfseparate提取学生版 (前2页)
qpdf "$full_pdf" --pages "$full_pdf" 1-2 -- "$student_pdf"

# 验证页数
if [[ "$pages" != "3" ]]; then
  echo "Warning: expected 3 pages (2 student + 1 answer), got $pages pages."
fi
```

---

### 组件4: `worksheet-pdf-template.tex` - LaTeX模板

**设计特点**:

#### 4.1 品牌配色方案
```latex
\definecolor{BrandPrimary}{HTML}{A02050}   % 温暖的栗色
\definecolor{BrandSecondary}{HTML}{4A7FD4} % 柔和的蓝色
\definecolor{BrandGold}{HTML}{C9A56A}      % 金色
\definecolor{BrandSoft}{HTML}{F8F2E7}      % 柔和的米色
\definecolor{Ink}{HTML}{2D3748}            % 温暖的炭灰色
\definecolor{Muted}{HTML}{8794A3}          % 柔和的灰色
\definecolor{Line}{HTML}{E2E8F0}           % 浅边框色
```

#### 4.2 自定义环境

**顶部横幅框**:
```latex
\newtcolorbox{topbandbox}{
  colback=BrandSoft,
  colframe=BrandGold,
  arc=2.2mm,
  boxrule=0.5pt,
  ...
}
```

**教学大纲焦点框** (蓝色):
```latex
\newtcolorbox{focusbox}{
  colback=BrandSecondary!4!white,
  colframe=BrandSecondary!55!white,
  arc=2.0mm,
  boxrule=0.5pt,
  ...
}
```

**考试提醒框** (金色):
```latex
\newtcolorbox{notesbox}{
  colback=BrandSoft!50!white,
  colframe=BrandGold!70!white,
  arc=2.0mm,
  boxrule=0.4pt,
  ...
}
```

**问题框**:
```latex
\newtcolorbox{qbox}[2][]{
  enhanced,
  breakable,
  width=\linewidth,
  colback=white,
  colframe=Line,
  arc=2.0mm,
  boxrule=0.4pt,
  title={\textbf{#2}},
  coltitle=BrandPrimary,
  ...
}
```

#### 4.3 页面布局

```latex
\usepackage[a4paper,margin=14mm]{geometry}
\setmainfont{Arial}

% 页脚
\fancyfoot[L]{\footnotesize\color{Muted}\href{https://www.25maths.com}{www.25maths.com}}
\fancyfoot[R]{\footnotesize\color{Muted}Student Sheet 1/2}

% 品牌边框
\draw[BrandPrimary!70!white,line width=0.9pt,rounded corners=2.0mm] 
  ([xshift=8mm,yshift=-8mm]current page.north west) 
  rectangle 
  ([xshift=-8mm,yshift=8mm]current page.south east);
```

#### 4.4 答题线生成

```latex
\newcommand{\ansline}{\textcolor{Line!80!white}{\rule{\linewidth}{0.24pt}}}
\newcommand{\answerlines}[1]{%
  \vspace{1.4mm}
  \begingroup
  \setlength{\parskip}{2.4mm}
  \setlength{\parindent}{0pt}
  \foreach \n in {1,...,#1}{\ansline\par}
  \endgroup
}
```

使用示例:
```latex
\begin{qbox}{Q1}
Simplify ~$3a + 2a - a$~.
\answerlines{2}  % 生成2条答题线
\end{qbox}
```

---

## 📊 当前状态评估

### 已完成的内容

**Algebra Core (C2)** - 9个主题 ✅:
```
c2-01-introduction-to-algebra      ✅ 完整内容
c2-02-algebraic-manipulation        ✅ 完整内容
c2-04-indices-ii                    ✅ 完整内容
c2-05-equations                     ✅ 完整内容
c2-06-inequalities                  ✅ 完整内容
c2-07-sequences                     ✅ 完整内容
c2-09-graphs-in-practical-situations ✅ 完整内容
c2-10-graphs-of-functions           ✅ 完整内容
c2-11-sketching-curves              ✅ 完整内容
```

**示例内容质量** (C2.1):
```markdown
# CIE 0580 Worksheet (Student)
## C2.1 Introduction to algebra

Name: ____________________   Date: ____________________

## Syllabus focus
- Use letters to represent unknowns, substitute values into expressions and simplify.

## Model example
Substitute `x = 3` into `2x + 5`:
`2(3) + 5 = 6 + 5 = 11`.

## Practice (10)
1. Simplify `3a + 2a - a`.
2. Simplify `4x + 3y - x + 2y`.
3. Find the value of `3n + 7` when `n = 4`.
...
10. If `a = -2` and `b = 5`, find the value of `a^2 + 2b`.
```

**答案文件**:
```markdown
# CIE 0580 Worksheet (Answers)
## C2.1 Introduction to algebra

1. `4a`
2. `3x + 5y`
3. `19`
...
10. `14`
```

### 待生成的内容

**Extended主题** - 90个主题需要生成 ❌:

| 领域 | 代码范围 | 数量 | 状态 |
|-----|---------|------|------|
| Algebra Extended | E2.1 – E2.13 | 13 | ⚠️ 占位符 |
| Coordinate Extended | E3.1 – E3.7 | 7 | ⚠️ 占位符 |
| Geometry Extended | E4.1 – E4.8 | 8 | ⚠️ 占位符 |
| Mensuration Extended | E5.1 – E5.5 | 5 | ⚠️ 占位符 |
| Trigonometry Extended | E6.1 – E6.6 | 6 | ⚠️ 占位符 |
| Transformations Extended | E7.1 – E7.4 | 4 | ⚠️ 占位符 |
| Probability Extended | E8.1 – E8.4 | 4 | ⚠️ 占位符 |
| Statistics Extended | E9.1 – E9.7 | 7 | ⚠️ 占位符 |
| **其他Core主题** | C3-C9 | 36 | ⚠️ 部分占位符 |

**占位符示例** (E2.1):
```markdown
# CIE 0580 Worksheet (Student)
## E2.1 Introduction to algebra

## Tier
- Extended
```

**问题**: 
- ❌ 缺少 `Name: ____   Date: ____` 行
- ❌ 缺少 `## Syllabus focus`
- ❌ 缺少 `## Model example`
- ❌ 缺少 `## Practice (10)` 和10个问题
- ❌ 包含已废弃的 `## Tier` 字段

---

## 🚨 发现的问题

### 问题1: 骨架生成器与规范不一致

**问题**: `generate_microtopic_pack.sh` 生成的占位符格式与 `WORKSHEET-GENERATION-SPEC.md` 要求的最终格式不匹配。

**生成的格式** (旧):
```markdown
# Worksheet (Student)
## E2.1 E2.1 syllabus micro-topic

Name: ____________________   Date: ____________________

## Syllabus focus
- [Fill with exact official wording]

## Tier              ← ❌ 应删除
- Extended

## Exam reminder     ← ❌ 应删除
- [Add a one-line exam strategy reminder]

## Model example
- [Add one worked example]

## Practice (10)
1. 
...
```

**规范要求的格式** (新):
```markdown
# CIE 0580 Worksheet (Student)
## E2.1 Introduction to algebra

Name: ____________________   Date: ____________________

## Syllabus focus
- Use letters to represent unknowns, substitute values into expressions and simplify.

## Model example
Substitute `x = 3` into `2x + 5`:
`2(3) + 5 = 6 + 5 = 11`.

## Practice (10)
1. Simplify `3a + 2a - a`.
...
```

**影响**:
- 需要手动删除 `## Tier` 和 `## Exam reminder` 字段
- 标题格式不一致: `# Worksheet (Student)` vs `# CIE 0580 Worksheet (Student)`

**建议修复**: 更新 `generate_microtopic_pack.sh` 第98-127行以匹配新规范。

---

### 问题2: CSV清单中的占位符主题名称

**问题**: `CIE0580-MICROTOPIC-BACKLOG.csv` 中大部分主题名称仍为占位符。

**示例**:
```csv
CIE0580,E2.1,Algebra and Graphs,E2.1 syllabus micro-topic,Core|Extended,planned,lock official wording during build
CIE0580,E2.2,Algebra and Graphs,E2.2 syllabus micro-topic,Core|Extended,planned,lock official wording during build
```

**应该是**:
```csv
CIE0580,E2.1,Algebra and Graphs,Introduction to algebra,Extended,planned,
CIE0580,E2.2,Algebra and Graphs,Algebraic manipulation,Extended,planned,
```

**影响**:
- 无法自动生成有意义的目录名
- 无法自动填充主题标题

**解决方案**: 需要根据 `WORKSHEET-GENERATION-SPEC.md` 第255-689行的主题指南更新CSV。

---

### 问题3: 缺少自动内容生成逻辑

**问题**: 当前系统只能生成骨架，没有AI辅助的内容生成脚本。

**当前流程**:
```
CSV → 骨架生成 → ❌ 手动填充内容 → PDF构建
```

**理想流程**:
```
CSV → 骨架生成 → ✅ AI生成内容 → 人工审核 → PDF构建
```

**缺失的组件**:
- 没有调用AI API的脚本
- 没有批量生成的自动化流程
- 没有质量检查脚本

**建议**: 创建 `generate_worksheet_content.py` 脚本，使用Gemini API根据规范生成内容。

---

## 💡 优化建议

### 建议1: 创建统一的生成脚本

**目标**: 一键生成所有90个主题的完整内容

**新脚本**: `agent/scripts/batch_generate_worksheets.sh`

```bash
#!/usr/bin/env bash
# 批量生成所有worksheet内容

for domain in algebra-e2 coordinate-e3 geometry-e4 ...; do
  for topic_dir in cie0580/micro-topics/$domain/*/; do
    if is_placeholder "$topic_dir/worksheet-student.md"; then
      # 调用AI生成内容
      python3 generate_worksheet_content.py \
        --topic-dir "$topic_dir" \
        --spec WORKSHEET-GENERATION-SPEC.md \
        --api-key "$GEMINI_API_KEY"
      
      # 构建PDF验证
      bash build_worksheet_pdf.sh "$topic_dir"
      
      # 质量检查
      python3 validate_worksheet.py "$topic_dir"
    fi
  done
done
```

---

### 建议2: 创建AI内容生成器

**新脚本**: `agent/scripts/generate_worksheet_content.py`

**功能**:
1. 读取主题代码 (如 E2.1)
2. 从 `WORKSHEET-GENERATION-SPEC.md` 提取该主题的指南
3. 调用Gemini API生成10个问题和答案
4. 验证格式和数学符号
5. 写入 `worksheet-student.md` 和 `worksheet-answers.md`

**伪代码**:
```python
import google.generativeai as genai

def generate_worksheet(topic_code, spec_guide):
    prompt = f"""
    根据以下规范生成CIE 0580工作表:
    
    主题代码: {topic_code}
    主题指南: {spec_guide}
    
    要求:
    1. 严格遵循WORKSHEET-GENERATION-SPEC.md格式
    2. 生成10个问题，难度递增 (Q1-Q3简单, Q4-Q6中等, Q7-Q9复杂, Q10挑战)
    3. 包含至少2个计算题、2个概念题、2个应用题、1个逆向题
    4. 使用反引号包裹数学表达式
    5. 提供准确的答案
    
    输出格式:
    [worksheet-student.md内容]
    ---SEPARATOR---
    [worksheet-answers.md内容]
    """
    
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content(prompt)
    
    student_md, answers_md = response.text.split('---SEPARATOR---')
    
    # 验证格式
    validate_format(student_md, answers_md)
    
    return student_md, answers_md
```

---

### 建议3: 创建质量验证脚本

**新脚本**: `agent/scripts/validate_worksheet.py`

**检查项**:
```python
def validate_worksheet(topic_dir):
    student_md = read_file(f"{topic_dir}/worksheet-student.md")
    answers_md = read_file(f"{topic_dir}/worksheet-answers.md")
    
    checks = [
        # 格式检查
        check_header_format(student_md, "# CIE 0580 Worksheet (Student)"),
        check_name_date_line(student_md),
        check_section_headers(student_md, ["Syllabus focus", "Model example", "Practice (10)"]),
        check_no_tier_field(student_md),
        
        # 内容检查
        check_question_count(student_md, 10),
        check_answer_count(answers_md, 10),
        check_math_notation(student_md),  # 检查是否使用反引号
        
        # 数学正确性检查
        check_answers_correctness(student_md, answers_md),
        
        # 难度检查
        check_difficulty_progression(student_md),
    ]
    
    return all(checks)
```

---

### 建议4: 更新CSV清单

**任务**: 将 `CIE0580-MICROTOPIC-BACKLOG.csv` 中的占位符替换为实际主题名称

**脚本**: `agent/scripts/update_backlog_from_spec.py`

```python
import csv
import re

# 从WORKSHEET-GENERATION-SPEC.md提取主题映射
spec_content = read_file("WORKSHEET-GENERATION-SPEC.md")

topic_map = {
    "E2.1": "Introduction to algebra",
    "E2.2": "Algebraic manipulation",
    "E2.3": "Algebraic fractions",
    # ... 从规范文档自动提取
}

# 更新CSV
with open("CIE0580-MICROTOPIC-BACKLOG.csv", "r") as f:
    rows = list(csv.DictReader(f))

for row in rows:
    code = row["syllabus_code"]
    if code in topic_map:
        row["micro_topic"] = topic_map[code]

# 写回CSV
with open("CIE0580-MICROTOPIC-BACKLOG.csv", "w") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)
```

---

## 📈 执行计划

### 阶段1: 准备工作 (1-2小时)

1. ✅ 分析现有系统 (已完成)
2. ⬜ 更新CSV清单 - 填充实际主题名称
3. ⬜ 修复 `generate_microtopic_pack.sh` - 匹配新规范格式
4. ⬜ 创建 `validate_worksheet.py` - 质量检查脚本

### 阶段2: AI生成器开发 (2-3小时)

1. ⬜ 创建 `generate_worksheet_content.py`
   - 集成Gemini API
   - 实现提示词工程
   - 添加格式验证
2. ⬜ 测试单个主题生成 (如 E2.1)
3. ⬜ 人工审核生成质量
4. ⬜ 迭代优化提示词

### 阶段3: 批量生成 (按领域分批)

**推荐顺序** (与规范文档一致):

1. ⬜ **Algebra E2** (13主题) → 验证 → 提交
2. ⬜ **Coordinate C3** (5) + **E3** (7) → 验证 → 提交
3. ⬜ **Geometry C4** (7) + **E4** (8) → 验证 → 提交
4. ⬜ **Mensuration C5** (5) + **E5** (5) → 验证 → 提交
5. ⬜ **Trigonometry C6** (2) + **E6** (6) → 验证 → 提交
6. ⬜ **Transformations C7** (1) + **E7** (4) → 验证 → 提交
7. ⬜ **Probability C8** (3) + **E8** (4) → 验证 → 提交
8. ⬜ **Statistics C9** (4) + **E9** (7) → 验证 → 提交

**每批次流程**:
```bash
# 1. 生成内容
python3 generate_worksheet_content.py --domain algebra-e2

# 2. 验证质量
python3 validate_all_worksheets.py --domain algebra-e2

# 3. 构建PDF
for dir in cie0580/micro-topics/algebra-e2/*/; do
  bash build_worksheet_pdf.sh "$dir"
done

# 4. 人工抽查 (至少检查每个领域的3个主题)
# 5. 提交到版本控制
```

### 阶段4: 质量保证 (持续)

1. ⬜ 人工审核所有生成的内容
2. ⬜ 验证数学答案正确性
3. ⬜ 检查难度分级是否合理
4. ⬜ 确保PDF编译无错误
5. ⬜ 更新backlog状态为 `ready`

---

## 🔧 技术细节

### 依赖项

**Shell脚本**:
- `bash` >= 4.0
- `awk`, `sed`, `grep`
- `ripgrep` (rg) - 用于占位符检测

**Python脚本**:
- Python 3.8+
- `google-generativeai` - Gemini API客户端

**LaTeX编译**:
- `xelatex` - XeLaTeX编译器
- `pdfinfo` - PDF元数据读取
- `qpdf` 或 `pdfseparate`/`pdfunite` - PDF页面分离

**LaTeX包**:
```latex
fontspec, amsmath, amssymb, enumitem, xcolor, tikz, 
tcolorbox, ragged2e, fancyhdr, eso-pic, array, 
tabularx, hyperref
```

### 文件路径约定

**基础路径**:
```
/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/
```

**主题目录结构**:
```
cie0580/micro-topics/{domain}-{tier}/{code}-{slug}/
├── worksheet-student.md
├── worksheet-answers.md
├── kahoot-question-set.md
├── listing-copy.md
├── .build/                    # 临时构建文件
│   ├── worksheet-pack.tex
│   └── worksheet-pack.pdf
└── pdf/                       # 最终输出
    ├── {code}-worksheet-pack.pdf      # 3页完整版
    └── {code}-worksheet-student.pdf   # 2页学生版
```

### 数学符号转换规则

| 输入 | 中间处理 | 最终LaTeX |
|-----|---------|----------|
| `` `x^2` `` | `$x^2$` | `$x^2$` |
| `` `sqrt(12)` `` | `$sqrt(12)$` | `$\sqrt{12}$` |
| `` `2/3` `` | `$2/3$` | `$\frac{2}{3}$` |
| `` `7 x 3` `` | `$7 x 3$` | `$7 \times 3$` |
| `cm^2` (非数学模式) | `cm^2` | `cm$^{2}$` |

---

## 📚 参考文档

1. **WORKSHEET-GENERATION-SPEC.md** (797行)
   - 第1-56行: 范围和文件位置
   - 第57-127行: 文件格式规范
   - 第128-151行: 数学符号约定
   - 第152-201行: 内容质量标准
   - 第202-689行: 90个主题的详细指南
   - 第690-797行: 验证清单和常见错误

2. **build_worksheet_pdf.sh** (314行)
   - 第1-76行: 元数据提取
   - 第78-109行: LaTeX转义和规范化
   - 第111-281行: Python数学符号处理
   - 第283-314行: PDF编译和分离

3. **worksheet-pdf-template.tex** (226行)
   - 第1-16行: 包导入
   - 第18-24行: 品牌配色
   - 第26-109行: 自定义环境定义
   - 第111-226行: 文档结构

---

## ✅ 总结

### 系统优势

1. ✅ **完善的规范文档** - 797行详细指导覆盖所有90个主题
2. ✅ **专业的PDF输出** - 品牌化设计，3页布局 (2页学生+1页答案)
3. ✅ **灵活的数学符号系统** - Markdown反引号自动转换为LaTeX
4. ✅ **模块化架构** - 骨架生成、内容填充、PDF构建分离

### 主要挑战

1. ❌ **90个主题待生成** - 大部分Extended主题仍为占位符
2. ❌ **缺少自动化内容生成** - 需要手动或AI辅助填充
3. ❌ **格式不一致** - 骨架生成器与最终规范不匹配
4. ❌ **CSV占位符** - 主题名称需要更新

### 下一步行动

**立即可做**:
1. 更新CSV清单 - 填充实际主题名称
2. 修复骨架生成器 - 匹配新规范格式
3. 创建质量验证脚本

**需要开发**:
1. AI内容生成器 (`generate_worksheet_content.py`)
2. 批量生成脚本 (`batch_generate_worksheets.sh`)
3. 自动化测试套件

**预计工作量**:
- 脚本开发: 4-6小时
- 批量生成: 2-3小时 (AI生成) + 4-6小时 (人工审核)
- 质量保证: 8-10小时
- **总计**: 约18-25小时

---

*报告生成于 2026-02-17 by Antigravity*
