# 25Maths Website — 开发计划

> **最后更新**: 2026-04-04
> **当前状态**: 练习 v2 100% (613q/3203m) | 会员 ~98% | B2B 组卷 35% | 生态 Phase 0-1 待执行
> **网站**: https://www.25maths.com
> **仓库**: `git25math/25maths`

---

## 一、愿景

### 产品愿景

> **25Maths** 是面向 IGCSE 学生和教培机构的一站式数学练习平台，
> 覆盖 CIE 0580 和 Edexcel 4MA1 两大考试局，
> 提供 CIE 真题风格的互动练习 + 教师组卷 + 学生追踪 + 家长报告。

### 技术愿景

| 维度 | 目标 |
|------|------|
| **内容引擎** | 202+ 练习文件，v2 schema 支持 short-answer / structured / mcq |
| **做题引擎** | exercise_engine.js 渲染 v2 全题型 + 自动判分 + mark scheme 展示 |
| **B2B 平台** | 教师组卷 → 学生做题 → 数据追踪 → 报告生成 |
| **生态系统** | 主站 + Play + ExamHub + Dashboard 共享 Supabase 用户体系 |

### 北极星指标

| 指标 | 当前 | 目标 |
|------|------|------|
| 练习文件（v2 filled） | 202 (draft) | 202 (live, 人工审查通过) |
| 题目总数 | 613 | 2,000+ |
| 月活学生 | — | 1,000 |
| 付费教师 | — | 50 |

---

## 二、当前进度

### 模块完成度 (2026-04-04)

```
Jekyll 架构        ████████████  100%
互动练习 (v2)      ████████████  100%  (202/202 全填充, 613q/3203m, all draft)
博客系统           ████████████  100%  (8 EN + 8 ZH)
双语支持           ██████████░░   85%  ← Kahoot Hub 零中文 + JS ~8 处
会员认证/支付       ████████████  100%  (Supabase Auth + Payhip Webhook)
CIE 商业产品       ████████████  100%  (26 releases, $24.99 Term Pass)
EDX 商业产品       ░░░░░░░░░░░░    0%  ← releases.json 零 EDX 产品
下载权限网关       ████████████  100%  (E2E 26/26 PASS)
会员中心 UX        █████████░░░   80%  ← 登录流程死循环 bug
做题引擎 v2        ░░░░░░░░░░░░    0%  ← exercise_engine.js 仅支持 MCQ
B2B 组卷模块       ████░░░░░░░░   35%  (UI 完成, API 待开发)
Engagement        ███████████░   95%  (Streak + XP + 成就 — 剩余: 阈值审查)
CI/CD             ████████████  100%  (2 workflows + 视觉回归)
```

### 数据规模

| 维度 | 数量 |
|------|------|
| 练习 JSON | 202 个（CIE 124 + EDX 78），v2 schema |
| 题目/分值 | 613 题, 3203 分 (all status: draft) |
| 博客文章 | 16 (8 EN + 8 ZH) |
| API 端点 | 14 |
| DB 表 | 18 (public) |
| Health Check 脚本 | 6 |
| 前端 JS 文件 | 14 |

### 生态项目状态

| 项目 | 状态 | 说明 |
|------|------|------|
| 主站 (25maths.com) | ✅ 生产运行 | ~90% 完成 |
| Play (games-legends) | ❌ 空仓库 | 待产品定义 |
| ExamHub (keywords) | ❌ 空仓库 | 待产品定义 |
| Dashboard | 状态不明 | 需确认 |
| CIE 分析流水线 | ✅ | 已产出 202 JSON |

---

## 三、工作流

### 标准开发循环

每个功能/修复遵循以下流程：

```
1. Plan    → 分析需求，探索代码，输出实施计划
2. Execute → 按计划逐步实施，遇错自动诊断
3. Validate → 构建零错误 + 测试通过 + mark 验证
4. Ship    → commit → push → PR → merge
5. Document → 更新 DEVELOPMENT-PLAN.md + DECISIONS.md（如适用）
```

### 练习填充工作流

| Phase | 步骤 | 产出 |
|-------|------|------|
| A. 准备 | 读 EXERCISE-SCHEMA.md + 查真题 mark scheme | 知识点理解 |
| B. 填充 | 3-5 题/文件，混合 short-answer + structured | JSON 文件 |
| C. 验证 | 算术校验 + mark total 校验 + JSON 校验 | 零错误 |
| D. 提交 | commit → push → PR → merge | main 更新 |
| E. 审查 | 人工逐题审查（下方金标准） | draft → review → live |

### 每步验收工作流

完成任何一批任务后：

```
完成 → 验证（mark totals + JSON valid）
     → 提交推送（descriptive commit message）
     → 合并（squash merge to main）
     → 更新文档（DEVELOPMENT-PLAN 进度 + 任务状态）
     → 推送文档（push main）
     → 下一步
```

---

## 四、金标准

### 练习文件质量门禁 (draft → review → live)

每个练习 JSON 从 `draft` 晋级必须通过 **4 类 16 项检查**：

#### A. 数学正确性（最高优先级）

- [ ] 每道题 correctAnswer 已用计算器/Python 反向验算
- [ ] "show that" 每步推导无跳跃无错误
- [ ] 题目单位与 correctAnswer 单位匹配
- [ ] numeric tolerance 与精度要求吻合
- [ ] integer/fraction 类型答案确实为整数/最简分数

#### B. Mark Scheme 合规

- [ ] 各 part marks 之和 = question totalMarks = file totalMarks
- [ ] M mark 用于方法、A mark 依赖 M mark、B mark 独立
- [ ] ft/cao 标注正确
- [ ] mark 分配模式参照 CIE/EDX 真题风格

#### C. 题目风格

- [ ] CIE 用 "Calculate/Find/Show that"，EDX 用 "Work out/Give a reason"
- [ ] Core/Foundation 不含 Extended/Higher-only 内容
- [ ] 每个文件至少 1 道 structured 多部分题
- [ ] 实际场景的数字和设定符合常识

#### D. Schema 合规

- [ ] JSON.parse() 无错误
- [ ] 每道题有 id, type, totalMarks, markScheme, workingSteps
- [ ] Structured 题每个 part 有 label, questionText, marks, answerType

### 代码质量标准

| 维度 | 标准 |
|------|------|
| 构建 | `jekyll build` 零错误 |
| 测试 | 73/73 PASS（当存在测试时） |
| CSS | 仅 Tailwind 类名，无自定义 CSS |
| API | 所有端点验证 Authorization header |
| 双语 | 新增 UI 文案必须提供 EN + ZH |

### Mark Total 验证脚本

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
    if calc != d.get('totalMarks', 0):
        print(f"MISMATCH {d['syllabusCode']}: stated={d['totalMarks']}, calc={calc}")
```

---

## 五、下一步任务

### P0 — 进行中 (2026-04 R11 续)

| # | 任务 | 状态 | 说明 |
|---|------|------|------|
| 0a | ~~练习 v2 样板题填充~~ | **完成** | 202/202 文件, 613 题, 3203 分 |
| 0b | **exercise_engine.js 适配 v2 schema** | 待开发 | 渲染 short-answer + structured 题型 |
| 0c | **exercise_registry.json 最终更新** | 待开发 | 质量审查后 status: draft → live |
| 0d | **B2B 组卷 API 端点** | 待开发 | POST /api/v1/institution/assignments |

### Phase 0 — 立即修复

| # | 任务 | 严重度 | 状态 |
|---|------|--------|------|
| F1 | 会员中心登录死循环修复 | Critical | 待修复 |
| F2 | EDX 首页措辞修正 | High | 待决策 |
| F3 | Kahoot Hub 中文补全 | Medium | 待开发 |
| F4 | JS 动态文案 i18n (~8 处) | Medium | 待开发 |

### Phase 1 — 兑现承诺 (2026 Q2)

| # | 任务 | 说明 |
|---|------|------|
| 1.1 | EDX Term Practice Pass 产品化 | releases.json + Payhip + subscription 页 |
| 1.2 | 成就阈值 + 等级统一最终审查 | Engagement → 100% |
| 1.3 | KaTeX 86 边缘用例修复 | 负数上标、嵌套 sqrt |
| 1.4 | 产品间交叉链接补全 | Worksheets ↔ Exercises ↔ Kahoot |

### Phase 2 — 产品定义（需人工决策）

| # | 任务 | 说明 |
|---|------|------|
| 2.1 | Play 产品定义 | 类型 + 主题 + 商业模式 |
| 2.2 | ExamHub 产品定义 | 核心功能 + 数据源 + 商业模式 |
| 2.3 | 域名架构决策 | 子路径(推荐) vs 子域名 |

### Phase 3-4 — 重构 + 扩张

| # | 任务 |
|---|------|
| 3.1 | 导航重构：Practice + Exam Boards 下拉 |
| 3.2 | 首页重构：产品矩阵 + How It Works |
| 4.1 | B2B 教师系统完整 API |
| 4.2 | Play / ExamHub MVP |
| 4.3 | GA4 事件追踪 |
| 4.4 | Email 周报模板 |

> 详细生态分析见 `docs/ECOSYSTEM-ANALYSIS.md`

### 已知陷阱清单

| # | 陷阱 | 触发场景 | 后果 | 防范 |
|---|------|----------|------|------|
| T1 | Mark total 不匹配 | 手动计算 parts 分值时漏加 | 前端显示错误分数 | 每次用 Python 脚本验证 |
| T2 | "show that" 算术错误 | 内联生成复杂代数推导 | 学生无法完成证明 | 预先用 Python 验算每步 |
| T3 | EDX 用 CIE command words | 复制 CIE 模板改 EDX 时忘改 | 不符合真题风格 | 检查 board 字段后对照 |
| T4 | Foundation 题含 Higher 内容 | 如微积分放入 F3-04 | 超纲 | 检查 _higherOnly 标记 |
| T5 | exercise_registry.json 过时 | 填完题但忘记重新生成 | 组卷模块显示错误数据 | 每次填充后运行生成脚本 |
| T6 | calculator=null 用于 EDX | 从 CIE 模板复制 | EDX 两张卷都允许计算器 | EDX 固定 calculator: true |
| T7 | JSON 语法错误 | 手动编辑 JSON 时 | 页面崩溃 | 每次用 JSON.parse() 验证 |
| T8 | Root package.json 加依赖 | 安装 npm 包时 | Cloudflare Pages 部署失败 | 仅允许 Tailwind 依赖 |

### 端到端示例：填充一个练习文件

以 `cie0580-trigonometry-c6-c6-01-pythagoras-theorem.json` 为例，展示从空文件到 draft 的完整流程：

**Step 1: 读取元数据**
```bash
cat _data/exercises/cie0580-trigonometry-c6-c6-01-pythagoras-theorem.json
# → topic: "Pythagoras' Theorem", tier: Core, status: coming_soon, questions: []
```

**Step 2: 参考真题风格**
- 读 `docs/EXERCISE-SCHEMA.md` → short-answer + structured 格式
- 读 `docs/examples/exercise-variants-showcase.json` → 9 种变式
- Core 层级 → 简单整数题为主，1-3 分 short-answer + 4-7 分 structured

**Step 3: 编写题目**（5 道）
- Q1: short-answer 2m — 求斜边 (6, 8 → 10)
- Q2: short-answer 3m — 求短边 (13, 5 → 12)
- Q3: short-answer 3m — 矩形对角线 (15, 8 → 17)
- Q4: structured 7m — 三角形 (a)求AC (b)中点 (c)求AD
- Q5: short-answer 4m — show that 判断直角 (7, 24, 25)

**Step 4: 算术验证**
```python
import math
assert math.sqrt(6**2 + 8**2) == 10      # Q1 ✓
assert math.sqrt(13**2 - 5**2) == 12     # Q2 ✓
assert math.sqrt(15**2 + 8**2) == 17     # Q3 ✓
assert 7**2 + 24**2 == 25**2             # Q5 ✓
```

**Step 5: 设置元数据**
- totalMarks = 2+3+3+7+4 = 19
- estimatedMinutes = 22
- status = "draft"

**Step 6: 验证 + 提交**
```bash
python3 mark_validation_script.py  # 0 mismatches
git add _data/exercises/cie0580-trigonometry-c6-c6-01-*.json
git commit -m "feat: C6-01 Pythagoras 5q/19m"
git push
```

---

## 六、制约条件

| 制约 | 说明 | 影响 |
|------|------|------|
| **Jekyll 构建环境** | 需要 Ruby + Bundler + github-pages gem | CI 上可用，本地环境可能缺失 |
| **Cloudflare Pages 部署** | push main 自动触发，root package.json 敏感 | AP-3 |
| **Supabase 共享** | 3 个项目共享同一数据库 | 改 schema 需同步评估 |
| **B2B API 未建** | DB schema 就绪，Cloudflare Workers 端点未开发 | 组卷 UI 是 demo 模式 |
| **练习 status: draft** | 202 文件均为样板题，未经人工质量审查 | 不能直接标记 live 上线 |
| **EDX 产品空白** | releases.json 零 EDX 产品 | EDX 学生无法购买/下载 |
| **exercise_engine.js** | 仅支持 MCQ 渲染 | v2 的 short-answer/structured 题无法展示 |

---

## 七、版本历程

### Round 11 — 组卷模块重构 + 练习 v2 Schema (2026-04)

| Commit | 内容 |
|--------|------|
| `7476cb9` | feat: 重构组卷模块 — 统一模板系统 + 动态练习选择器 |
| `a99fa18` | feat: 全部 202 练习迁移至 CIE 真题风格 v2 schema |
| `a5c22b0` | fix: 修正 32 个 Edexcel 4MA1 练习文件的 topic 字段 |
| `fc55b0d` | fix: EDX calculator=true + 标记 Higher-only topics + schema v2.1 |
| `ee30cba`→`cdf5a1b` | feat: Phase 1-11 — 全部 202 文件填充样板题 (613题/3203分) |

**关键成果**:
- 组卷页面从零重建：8 个预设模板 + Board/Tier/Domain 三级筛选
- 202 文件从 v1 (MCQ-only) → v2 (short-answer + structured + mcq)
- 新增 EXERCISE-SCHEMA.md (v2.1) + exercise_registry.json
- EDX 元数据修正：32 topic + 78 calculator + 2 _higherOnly
- **里程碑: 202/202 文件已填题, 613 题, 3203 分**

### Round 11b — 生态系统分析 (2026-04-03)

- 5 项目集成分析，发现 Play/ExamHub 空仓库
- 审计修正：双语 85%、EDX 产品 0%、登录 bug
- 制定 4 Phase 路线图

### Round 10 — 会员收尾 + 双语补全 (2026-03)

- 技术债 TD-2/7/8 清理
- 会员页面 70 处双语补全
- 测试框架 73/73 PASS

### Round 9 — KaTeX Phase 3-4 (2026-03)

- 202 JSON, 8,731 LaTeX 表达式, 0 错误
- 三层自动化修复管道 (~1,094 处)

### Round 8 — 会员 E2E (2026-02)

- Webhook → Entitlements → 签名 URL → PDF，26/26 PASS

### Round 1-7 — 基础建设 (2026-02 初)

Blog → SEO → 审计 → 性能 → 无障碍 → LaTeX Phase 1-2

---

## 八、技术债台账

| # | 项目 | 状态 | 备注 |
|---|------|------|------|
| TD-1 | `payhip_events.js` 函数过长 | 待拆分 | 低优先级 |
| TD-2 | `weekly.js` import `computeLevel` | ✅ R10 | |
| TD-7 | streak 逻辑提取至 `streak_utils.js` | ✅ R10 | |
| TD-8 | 日期函数提取至 `date_utils.js` | ✅ R10 | |
| TD-9 | 练习筛选器 `<select>` 无障碍 id | 待修复 | WCAG 合规 |
