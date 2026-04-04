# 25Maths Website — 版本历程与开发计划

> **最后更新**: 2026-04-03
> **当前状态**: 主站 ~90% | 202 练习 (v2 schema, 37/202 已填题) | 生态规划 Phase 2 待决策
> **网站**: https://www.25maths.com
> **开发规范**: `docs/CONTRIBUTING.md`

---

## 版本历程

### Round 11b — 生态系统分析 + 完成度审计 (2026-04-03)

| Commit | 内容 |
|--------|------|
| `2f30a79` | docs: R11b 生态系统分析报告 + 开发计划更新 (#40) |

**关键成果**:
- 完成 25maths 生态 5 个项目（主站 + Play + ExamHub + Dashboard + CIE 分析）的集成分析
- 审计修正主站完成度：双语 100% → 85%，新增 EDX 商业空白（0%）、会员中心登录 bug
- 发现 Play/ExamHub 仅有空仓库，零规格零代码，明确列出待决策问题
- 制定 4 Phase 路线图：修复 → 兑现 → 定义 → 重构 → 扩张
- 产出 `docs/ECOSYSTEM-ANALYSIS.md` 完整分析文档

**待决策项（阻塞 Phase 2-4）**:
- Play 产品定义（4 个核心问题）
- ExamHub 产品定义（4 个核心问题）
- 域名架构（子路径 vs 子域名）

### Round 11 — 组卷模块重构 + 练习 v2 Schema (2026-04-03)

| Commit | 内容 |
|--------|------|
| `7476cb9` | feat: 重构组卷模块 — 统一模板系统 + 动态练习选择器 |
| `a99fa18` | feat: 全部 202 练习迁移至 CIE 真题风格 v2 schema |
| `a5c22b0` | fix: 修正 32 个 Edexcel 4MA1 练习文件的 topic 字段 |
| `fc55b0d` | fix: EDX calculator=true + 标记 Higher-only topics + schema v2.1 |
| `ee30cba` | feat: Phase 1 — Trigonometry 8 文件 (37题/166分) |
| `4a33629` | feat: Phase 2 — Probability 7 文件 (24题/130分) |
| `ad4ccb9` | feat: Phase 3 — Mensuration 10 文件 (35题/181分) |
| `6eb87ea` | feat: Phase 4 — Coordinate 12 文件 (37题/178分) |
| `c1576f1` | feat: Phase 5-6 — Transformations 9 + Algebra 22 文件 (125题/672分) |
| `d2e7138` | feat: Phase 7-8 — EDX Equations 16 + Sequences 8 文件 (73题/530分) |
| `cdf5a1b` | feat: Phase 9-11 — Statistics 17 + Geometry 37 + Number 56 (259题/1190分) |

**关键成果**:
- 组卷页面从零重建：8 个预设模板 + Board/Tier/Domain 三级筛选 + 关键词搜索
- 全部 202 个练习文件从 v1 (MCQ-only) 迁移至 v2 schema (short-answer + structured + mcq)
- 新增 `docs/EXERCISE-SCHEMA.md` — 统一 schema 规范 (v2.1, 支持 CIE + EDX 双 board)
- 新增 `_data/exercise_registry.json` — 202 练习元数据注册表
- EDX 元数据修正：32 个 topic 修正 + 78 个 calculator=true + 2 个 _higherOnly 标记
- **全部 11 个 domain 已填充样板题** — 里程碑达成
- 最终：**202/202 文件已填题 (613 题, 3203 分)**，0 文件待填充
- exercise_registry.json 已重新生成，全部 status: draft

### Round 10 — 会员系统收尾 + 双语补全 (2026-03-01)

| Commit | 内容 |
|--------|------|
| `c5cf22e` | docs: 更新 PLAN.md — 标记双语 + EDX 对齐完成 |
| `73adf90` | feat: Edexcel 4MA1 页面对齐 CIE 0580 (5 项快速修复) |
| `e8ca831` | i18n: 会员页面双语补全 60 处 |
| `1482e30` | fix: 移除 root package.json 修复 Cloudflare Pages 部署 |
| `ede8b3f` | fix: profiles PK + target_board 约束 + 测试框架 |
| `fdede24` | Phase 1: LEVEL_THRESHOLDS 统一 + P0 双语文案 10 处 |
| `b554b2b` | fix: profiles PK + 成就定义 + 技术债 TD-2/7/8 + Settings 入口 |

**关键成果**:
- 技术债 TD-2/7/8 清理（computeLevel import + streak_utils + date_utils 提取）
- 会员页面 70 处双语补全（P0: 10 + P1.3: 60）
- 测试框架 73/73 PASS
- Edexcel 4MA1 页面与 CIE 0580 对齐

### Round 9 — KaTeX Phase 3-4 (2026-03-01)

| Commit | 内容 |
|--------|------|
| `c40b494` | docs: LaTeX Phase 4 KaTeX 质量保证记录 |
| `121ccd9` | fix: LaTeX Phase 4 — 102 个 JSON 文件 ~1,094 处修复 |
| `3982506` | fix: normalizeInlineMath 跳过简单数学表达式 |
| `f411886` | docs: LaTeX Phase 3 记录同步 |
| `3f1f420` | docs: 6 份项目文档同步至最新进度 |
| `9cb4c59` | feat: 批量转换练习题数学表达式为 KaTeX (161 JSON, 4,574 新表达式) |

**关键成果**:
- Phase 3: 6 大类批量转换（分数/角度/幂次/根号/希腊/代数）
- Phase 4: 三层自动化修复管道（合并伪影 547 + 断裂 218 + 嵌套 329 + 人工 18）
- 最终: 202 个 JSON 文件，8,731 LaTeX 表达式，0 错误

### Round 8 — 会员系统 E2E (2026-02-28)

| Commit | 内容 |
|--------|------|
| `f6bb787` | docs: 会员系统 E2E 完成标记 |
| `ece6c11` | docs: 双语覆盖报告 |
| `c512c31` | docs: 状态报告 |
| `47bc9b9` | fix: Hero 颜色修复 |
| `269fe7f` | feat: 会员中心 + 推荐 + 仪表盘双语 |
| `731ad30` | feat: LaTeX Phase 2 — 分数→`\frac` (170 JSON) |
| `ab48f5e` | feat: 账户设置页 + Profile CRUD API |
| `fb85ac8` | feat: Last-mile delivery — releases.json + member_downloads |
| `7e8b4b1` | feat: E2E 测试通过 — 24 下载 26/26 PASS |
| `339f42a` | fix: 成就系统 3 Bug 修复 |
| `f3739da` | refactor: 提取 achievement_evaluator.js |
| `bd78109` | feat: LaTeX Phase 1 — Unicode→LaTeX (108 JSON) |

**关键成果**:
- Webhook → Entitlements → 签名 URL → PDF 下载全链路通过
- 账户设置页 + Profile CRUD API
- LaTeX Phase 1-2 完成

### Round 1-7 — 基础建设 (2026-02 初)

| 轮次 | 内容 | Commit |
|------|------|--------|
| R1 | Blog 系统 (16 篇 EN+ZH) | `b9f0420` |
| R2 | SEO & 本地化 | `9d45f43` |
| R3 | 设计一致性审计 | `3d7823d` |
| R4 | 交叉链接 & 质量审计 | `20aa975` |
| R5 | 性能 & SEO | `d47cc8a` |
| R6 | 无障碍 & 安全审计 | `eaf4815` |
| R7 | 练习题 LaTeX Phase 1-2 | `731ad30` |

---

## 当前状态 (2026-04-03)

### 完成度（R11b 审计修正版）

```
Jekyll 架构        ████████████  100%
互动练习 (v2)      ████████████  100%  (202/202 全部填充, 613q/3203m)
博客系统           ████████████  100%  (8 EN + 8 ZH)
双语支持           ██████████░░   85%  ← R11b 修正: Kahoot Hub 零中文 + JS ~8 处未 i18n
会员认证/支付       ████████████  100%  (Supabase Auth + Payhip Webhook)
CIE 商业产品       ████████████  100%  (26 releases, $24.99 Term Pass)
EDX 商业产品       ░░░░░░░░░░░░    0%  ← R11b 新发现: releases.json 零 EDX 产品
下载权限网关       ████████████  100%  (E2E 26/26 PASS)
会员中心 UX        █████████░░░   80%  ← R11b 新发现: 登录流程死循环
Engagement        ███████████░   95%  (Streak + XP + 成就 — 剩余: 阈值审查)
B2B 组卷模块       ████░░░░░░░░   35%  (UI 完成, API 待开发)
CI/CD             ████████████  100%  (2 workflows + 视觉回归)
```

### 生态项目状态

| 项目 | 状态 | 说明 |
|------|------|------|
| 主站 (25maths.com) | ✅ 生产运行 | ~90% 完成，见上方修正 |
| Play (games-legends) | ❌ 空仓库 | 零规格零代码，产品定义待完成 |
| ExamHub (keywords) | ❌ 空仓库 | 零规格零代码，产品定义待完成 |
| Dashboard | 状态不明 | 需确认 |
| CIE 分析流水线 | ✅ | 已产出 202 JSON |

### 数据规模

| 维度 | 数量 |
|------|------|
| 练习 JSON | 202 个（CIE 124 + EDX 78），v2 schema |
| 已填题 | **202 文件, 613 题, 3203 分 (100%)** |
| 待填题文件 | 0 个 |
| 博客文章 | 16 (8 EN + 8 ZH) |
| API 端点 | 14 |
| DB 表 | 18 (public) |
| 新增文档 | EXERCISE-SCHEMA.md (v2.1) + exercise_registry.json |
| Health Check 脚本 | 6 |
| 前端 JS 文件 | 14 |

---

## 待完成任务

### P0 — 进行中 (2026-04 R11 续)

| # | 任务 | 状态 | 说明 |
|---|------|------|------|
| 0a | ~~练习 v2 样板题填充~~ | **完成** | 202/202 文件, 613 题, 3203 分 |
| 0b | **exercise_engine.js 适配 v2 schema** | 待开发 | 渲染 short-answer + structured 题型 |
| 0c | **exercise_registry.json 最终更新** | 待开发 | 所有文件填完后重新生成 |
| 0d | **B2B 组卷 API 端点** | 待开发 | POST /api/v1/institution/assignments |

### Phase 0 — 立即修复

| # | 任务 | 严重度 | 状态 |
|---|------|--------|------|
| F1 | 会员中心登录死循环修复 (`/membership/index.html`) | Critical | 待修复 |
| F2 | EDX 首页措辞修正（诚实标注或注册产品） | High | 待决策 |
| F3 | Kahoot Hub 中文补全 | Medium | 待开发 |
| F4 | JS 动态文案 i18n（`member_downloads.js` ~5 处 + `exercise_engine.js` ~3 处） | Medium | 待开发 |

### Phase 1 — 兑现承诺 (2026 Q2)

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 1.1 | EDX Term Practice Pass 产品化 | `releases.json` + Payhip 产品 + subscription 页 | 待开发 |
| 1.2 | 成就阈值 + 等级统一最终审查 | Engagement 100% | 待开发 |
| 1.3 | KaTeX 86 边缘用例修复 | 负数上标、嵌套 sqrt | 待开发 |
| 1.4 | 产品间交叉链接补全 | Worksheets ↔ Exercises ↔ Kahoot | 待开发 |
| 1.5 | KaTeX CSS 预加载优化 | 性能提升 | 待开发 |

### Phase 2 — 产品定义（需人工决策，阻塞后续 Phase）

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 2.1 | Play 产品定义 | 类型 + 主题 + Kahoot 差异化 + 商业模式 | ⏸ 待决策 |
| 2.2 | ExamHub 产品定义 | 核心功能 + 数据源 + 与 Exercises 关系 + 商业模式 | ⏸ 待决策 |
| 2.3 | 域名架构决策 | 子路径(推荐) vs 子域名 | ⏸ 待决策 |
| 2.4 | 跨产品 event schema 设计 | 统一 Engagement 数据契约 | 待 2.1/2.2 完成 |

### Phase 3 — 主站重构（Phase 2 完成后）

| # | 任务 | 前置条件 |
|---|------|---------|
| 3.1 | 导航重构：Practice 下拉 + Exam Boards 下拉 | Phase 2 产品列表确定 |
| 3.2 | 首页重构：产品矩阵 + How It Works | Phase 2 产品定位确定 |
| 3.3 | 统一 Engagement API | Phase 2 event schema |
| 3.4 | `/start/` 路径选择器增加新产品入口 | Phase 2 用户旅程 |

### Phase 4 — 生态扩张（持续）

| # | 任务 | 说明 |
|---|------|------|
| 4.1 | Play MVP 开发 + 主站接入 | 定义 → MVP → 内测 → 导航上线 |
| 4.2 | ExamHub MVP 开发 + 主站接入 | 同上 |
| 4.3 | B2B 教师系统完整 API | 组卷 UI 已完成，API 端点 + 学生提交 + 报告待开发 |
| 4.4 | GA4 事件追踪 | 全链路 session_complete, download 等 |
| 4.5 | Email 周报模板 | weekly_report_enabled 字段已就绪 |
| 4.6 | sitemap.xml lastmod 自动化 | hook 到 build 流程 |
| 4.7 | CSP unsafe-inline 迁移 | 需 nonces/hashes |

> 详细生态分析见 `docs/ECOSYSTEM-ANALYSIS.md`

---

## 技术债台账

| # | 项目 | 状态 | 备注 |
|---|------|------|------|
| TD-1 | `payhip_events.js` 函数过长 | 待拆分 | 低优先级 |
| TD-2 | `weekly.js` import `computeLevel` | ✅ R10 | |
| TD-7 | streak 逻辑提取至 `streak_utils.js` | ✅ R10 | |
| TD-8 | 日期函数提取至 `date_utils.js` | ✅ R10 | |
| TD-9 | 练习筛选器 `<select>` 无障碍 id | 待修复 | WCAG 合规，低优先级 |
