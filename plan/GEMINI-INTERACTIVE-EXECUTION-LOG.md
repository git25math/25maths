# Gemini 互动练习执行日志

> **开始日期**: 2026-02-17  
> **执行策略**: 按考纲顺序推进 + 每批自动审校（generate -> audit -> validate）

---

## 流程升级

- 生成脚本：`scripts/exercises/orchestrate_gemini_exercise.py`
  - 已增加约束：每题必须且仅有 1 个正确选项，并要求模型输出前自检
- 批处理审校脚本：`scripts/exercises/batch_generate_and_audit.py`
  - 能力：按 section 批量生成、逐题审校、结构校验、输出批报告
- 批报告目录：`plan/gemini-batch-reports/`

---

## Batch 001（手动打样）

### 范围
- `C1-01 types of number`
- `C1-02 sets`
- `C1-03 powers and roots`

### 结果
- 3/3 生成成功
- 发现并修复 1 处数学错误（`C1-02` 交集题）

---

## Batch 002（自动批处理）

### 范围
- `C1-04 fractions decimals percentages`
- `C1-05 ordering`

### 报告
- `plan/gemini-batch-reports/batch-cie0580-20260217T030837Z.json`

### 结果
- requested=2, success=2, failed=0, corrected=0, warnings=0

---

## Batch 003（自动批处理）

### 范围
- `C1-06` -> `C1-16`（Core Number 剩余全部）

### 报告
- `plan/gemini-batch-reports/batch-cie0580-20260217T031115Z.json`

### 结果
- requested=11, success=11, failed=0, corrected=3, warnings=0
- 被审校模型修正：`C1-06`, `C1-14`, `C1-15`

---

## Batch 004（自动批处理）

### 范围
- `algebra-c2` 全部可用 Core 微考点（9 个）  
  - `C2-01`, `C2-02`, `C2-04`, `C2-05`, `C2-06`, `C2-07`, `C2-09`, `C2-10`, `C2-11`

### 报告
- `plan/gemini-batch-reports/batch-cie0580-20260217T032632Z.json`

### 结果
- requested=9, success=9, failed=0, corrected=1, warnings=0
- 被审校模型修正：`C2-07`

---

## Batch 005（自动批处理）

### 范围
- `coordinate-c3` 全部可用 Core 微考点（5 个）  
  - `C3-01`, `C3-02`, `C3-03`, `C3-05`, `C3-06`

### 报告
- `plan/gemini-batch-reports/batch-cie0580-20260217T033852Z.json`

### 结果
- requested=5, success=5, failed=0, corrected=0, warnings=0

---

## Batch 006（自动批处理）

### 范围
- `geometry-c4` 全部 Core 微考点（7 个）
  - `C4-01` -> `C4-07`

### 报告
- `plan/gemini-batch-reports/batch-cie0580-20260217T041248Z.json`

### 结果
- requested=7, success=7, failed=0, corrected=2, warnings=0
- 被审校模型修正：`C4-05`, `C4-07`

---

## Batch 007（自动批处理）

### 范围
- `mensuration-c5` 全部 Core 微考点（5 个）
  - `C5-01` -> `C5-05`

### 报告
- `plan/gemini-batch-reports/batch-cie0580-20260217T042012Z.json`

### 结果
- requested=5, success=5, failed=0, corrected=1, warnings=0
- 被审校模型修正：`C5-05`

---

## Batch 008（自动批处理）

### 范围
- `trigonometry-c6` 全部 Core 微考点（2 个）
  - `C6-01`, `C6-02`

### 报告
- `plan/gemini-batch-reports/batch-cie0580-20260217T042539Z.json`

### 结果
- requested=2, success=2, failed=0, corrected=1, warnings=0
- 被审校模型修正：`C6-02`

---

## Batch 009（自动批处理）

### 范围
- `transformations-c7` 全部 Core 微考点（1 个）
  - `C7-01`

### 报告
- `plan/gemini-batch-reports/batch-cie0580-20260217T042811Z.json`

### 结果
- requested=1, success=1, failed=0, corrected=0, warnings=0

---

## Batch 010（自动批处理）

### 范围
- `probability-c8` 全部 Core 微考点（3 个）
  - `C8-01` -> `C8-03`

### 报告
- `plan/gemini-batch-reports/batch-cie0580-20260217T042911Z.json`

### 结果
- requested=3, success=3, failed=0, corrected=0, warnings=0

---

## Batch 011（自动批处理）

### 范围
- `statistics-c9` 全部 Core 微考点（4 个）
  - `C9-01` -> `C9-04`

### 报告
- `plan/gemini-batch-reports/batch-cie0580-20260217T043233Z.json`

### 结果
- requested=4, success=4, failed=0, corrected=1, warnings=1
- 审校警告：`C9-03` 第 6 题存在重复选项

---

## Batch 012（单点重跑修复）

### 范围
- `statistics-c9` / `C9-03 averages and range`（仅 1 个）

### 报告
- 失败尝试：`plan/gemini-batch-reports/batch-cie0580-20260217T043738Z.json`
- 成功重跑：`plan/gemini-batch-reports/batch-cie0580-20260217T043840Z.json`

### 结果
- 第一次失败原因：模型输出 `14` 题（校验要求 `12` 题）
- 第二次成功：requested=1, success=1, failed=0, corrected=0, warnings=0
- 修复结论：`C9-03` 重复选项问题已消除

---

## 累计进度（截至 2026-02-17）

- 已生成并落地互动练习微考点：`52`（CIE 0580 Core 全覆盖）
  - C1 Number Core：`16`
  - C2 Algebra Core：`9`
  - C3 Coordinate Core：`5`
  - C4 Geometry Core：`7`
  - C5 Mensuration Core：`5`
  - C6 Trigonometry Core：`2`
  - C7 Transformations Core：`1`
  - C8 Probability Core：`3`
  - C9 Statistics Core：`4`
- 累计批处理成功：`49/49`（Batch 002-011）
- 累计自动修正：`9`（Batch 003-008, 011）
- 额外人工修正：`1`（Batch 001 的 C1-02）
- 结构验收：通过（每页 12 题、4 选 1、答案索引合法、无重复选项）
- 闭环链接验收：通过（C1-C9 已生成项在 `_data/kahoot_subtopic_links.json` 均可匹配）

---

## 构建与发布验证

- 已修复默认构建阻塞：
  - 在 `_config.yml` 中排除 `projects/kahoot-channel/WORKSHEET-GENERATION-ANALYSIS.md`
  - `bundle exec jekyll build` 默认配置通过
- 健康检查：
  - `bash scripts/health/check_site.sh` -> Failures: 0, Warnings: 0
  - `python3 scripts/health/check_kahoot_data.py` -> Failures: 0, Warnings: 0
- 本地构建后已验证：
  - `/exercises/` 列表包含新增 C4-C9 条目
  - `_site/exercises/` 下 CIE 0580 Core 共 `52` 个目录页
