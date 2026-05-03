# Gemini 互动练习生成模块 - 执行清单

> **版本**: v1.0  
> **日期**: 2026-02-17  
> **状态**: RETIRED 2026-05-03 — 不要继续执行；网页练习产品线已从主站下线。
> **当前范围**: 先完成 Gemini CLI 生成网页互动练习（不开发 TikzVault 联动）

---

## 0) 目标与范围

### 目标
- 基于已提取考纲（micro-topic）批量生成互动练习页，形成闭环：`Kahoot -> Worksheet -> Website Interactive -> Bundle`
- 输出可直接被 Jekyll 站点使用的数据与页面文件

### 当前不做
- TikzVault 与网站联动（延后）
- 新题型引擎改造（先稳定 `multiple-choice`）
- 复杂图形链路（先保证无图题/轻图题可上线）

---

## 1) 输入规范（Input Contract）

### 1.1 必填参数
- `subtopic_id`：格式 `board:section:code-slug`  
  例：`cie0580:number-c1:c1-16-money`
- `lang`：`en` 或 `zh-cn`
- `question_count`：默认 `12`（建议 10-15）
- `model`：默认 `gemini-2.5-pro`

### 1.2 数据来源与路径
- 考纲索引（必须存在其一）：  
  - `_data/kahoot_cie0580_subtopics.json`  
  - `_data/kahoot_edexcel4ma1_subtopics.json`
- 微考点源文件目录：来自 `folder_path`，至少存在 1 个内容文件，建议至少 3 个  
  - `kahoot-question-set.md`
  - `worksheet-student.md`
  - `worksheet-answers.md`
  - `listing-copy.md`
- 闭环链接映射（可选但建议完整）：`_data/kahoot_subtopic_links.json`

### 1.3 输入质量门槛
- 禁止占位内容直接投产：若源文件含占位文本，默认阻断生成  
- 仅在确认可控时使用 `--allow-placeholder`
- 同一 `subtopic_id` 的 `tier/domain/syllabusCode` 必须与索引一致

### 1.4 标准执行命令

```bash
python3 scripts/exercises/orchestrate_gemini_exercise.py \
  --subtopic-id "cie0580:number-c1:c1-16-money" \
  --lang "en" \
  --question-count 12 \
  --model "gemini-2.5-pro"
```

### 1.5 批量执行命令（推荐）

```bash
python3 scripts/exercises/batch_generate_and_audit.py \
  --board cie0580 \
  --section-key number-c1 \
  --lang en \
  --question-count 12 \
  --gen-model gemini-2.5-pro \
  --audit-model gemini-2.5-flash
```

---

## 2) 生成标准（Generation Standard）

### 2.1 产物标准
- 数据文件：`_data/exercises/<topic-slug>.json`
- 页面文件：`_exercises/<topic-slug>.md`
- `topic-slug` 规则：由 `subtopic_id` 统一 slugify（脚本内置）

### 2.2 JSON 结构标准（必须）
- 顶层字段必须包含：
  - `topic` `board` `subtopicId` `syllabusCode` `tier` `domain` `questions`
- `questions` 仅允许 `multiple-choice`（当前版本）
- 每题必须：
  - `questionText` 非空
  - `options` 恰好 4 个且非空
  - `correctAnswer` 为 `0-3`
  - `explanation` 非空、简洁、方法导向

### 2.3 内容质量标准（必须）
- 严格限于目标 micro-topic，不跨考点
- 题干与干扰项要体现真题常见误区
- 题目集合不重复、不仅改数字
- 难度建议：`基础 4 + 标准 6 + 挑战 2`（12 题）
- 语言要求：
  - `en`：英文题干与解析
  - `zh-cn`：简体中文题干与解析

### 2.4 品牌与闭环标准（必须）
- 页面 front matter 统一：
  - `layout: interactive_exercise`
  - `subtopic_id` 与生成参数一致
  - `board/tier/syllabus_code` 与考纲索引一致
- 页面展示闭环入口（若 `_data/kahoot_subtopic_links.json` 存在该键）：
  - `Play Matching Kahoot`
  - `Get Matching Worksheet`
  - `Explore Bundle`（或 section/unit bundle 回退）
- 所有闭环按钮自动附加跟踪参数：
  - `src_page=interactive_exercise`
  - `exercise_topic=<topic-slug>`
  - `exercise_action=<action>`

### 2.5 LaTeX / 图形策略（当前版本）
- 文本数学表达先用纯文本或轻量 TeX 记法（不阻塞上线）
- TikZ 不直接在网页端实时渲染
- 涉及图形题时，当前策略：
  - 优先转为无图可答题
  - 若必须用图，先离线生成 SVG，再在题干中引用

---

## 3) 验收标准（Acceptance Criteria）

### 3.1 生成前验收（Preflight）
- [ ] `subtopic_id` 能在考纲索引中检索到
- [ ] `folder_path` 存在且可读
- [ ] 源文件无占位内容（或已审批 `--allow-placeholder`）
- [ ] 对应 subtopic 的闭环链接已配置（至少 Kahoot 或 Worksheet 其一）

### 3.2 生成后自动验收（Blocking）
- [ ] CLI 退出码为 0
- [ ] JSON 可解析，字段完整
- [ ] 题目数等于 `question_count`
- [ ] 每题均满足 4 选 1 与答案索引合法
- [ ] 输出文件已写入：
  - `_data/exercises/<topic-slug>.json`
  - `_exercises/<topic-slug>.md`

### 3.3 站点验收（Blocking）
- [ ] `bundle exec jekyll build` 通过
- [ ] 页面可访问：`/exercises/<topic-slug>/`
- [ ] 交互流程正常：选择 -> Check Answer -> Next -> 完成页
- [ ] 完成页闭环按钮可点击并带跟踪参数

### 3.4 抽样教研验收（Blocking）
- [ ] 教研抽检至少 3 题：无越纲、无错解、无歧义
- [ ] 干扰项不是明显无效选项
- [ ] 解析逻辑与目标年级难度一致

### 3.5 上线效果验收（Monitoring, 非阻塞）
- [ ] 24 小时内页面可用率正常（无 404/构建回滚）
- [ ] 7 天观察闭环点击：
  - Kahoot 点击率
  - Worksheet 点击率
  - Bundle 点击率
- [ ] 如点击低于预期，回调优化题目难度与 CTA 文案

---

## 4) 执行节奏建议（首批）

### Phase A（先打样 3 个微考点）
- [x] CIE 0580 Core 选 3 个 subtopic 生成 EN 版本（Batch 001: C1-01/C1-02/C1-03）
- [ ] 每个 subtopic 人工抽检后再生成 ZH 版本
- [x] 完成后在 `/exercises/` 可见并可走完闭环（已验证）
- 执行日志：`plan/GEMINI-INTERACTIVE-EXECUTION-LOG.md`

### Phase B（扩到 20 个微考点）
- [x] 按 domain 批量生成并分批验收（已完成 C1-C9 Core+Extended 共 124 个微考点）
- [ ] 每 5 个 subtopic 做一次质量回顾
- [x] 固化失败案例与 prompt 修订规则（已记录 C9-03 与 E1-04 重跑策略）

### Phase C（规模化）
- [x] 进入批量流水线（按 backlog 批次）
- [ ] 增加质量看板（生成成功率、返工率、闭环点击率）
- [ ] 评估是否进入下一阶段（含 TikZ/TikzVault 链路）
