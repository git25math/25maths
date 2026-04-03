# 25Maths 生态系统分析报告

> **日期**: 2026-04-03
> **类型**: 战略分析 — 主站重新规划前置研究
> **状态**: Phase 2 待决策（产品定义未完成）

---

## 一、生态全景

```
┌─────────────────────────────────────────────────────────┐
│                  Supabase (共享后端)                      │
│          ref: jjjigohjvmyewasmmmyf                      │
│    18 张 public 表 + Auth + Storage                      │
└──────────┬──────────┬──────────┬──────────┬──────────────┘
           │          │          │          │
     ┌─────▼────┐ ┌───▼────┐ ┌──▼───┐ ┌───▼──────┐
     │ 主站      │ │ Play   │ │ExamHub│ │Dashboard │
     │25maths.com│ │ Games  │ │Keywords│ │ 运营可视化│
     └──────────┘ └────────┘ └───────┘ └──────────┘
           ▲
           │ JSON 数据源
     ┌─────┴────┐
     │CIE 分析   │
     │练习题生产  │
     └──────────┘
```

### 项目清单

| 项目 | 仓库 | 共享组件 | 实际状态 |
|------|------|---------|---------|
| **主站** | `git25math/25maths` | Supabase + Cloudflare Workers | ✅ 生产环境运行中 |
| **Play** | `git25math/25maths-games-legends` | 共享 Supabase + 用户账号 | ❌ 仅有空仓库，零规格零代码 |
| **ExamHub** | `git25math/25maths-examhub` | 共享 Supabase + 用户账号 | ❌ 仅有空仓库，零规格零代码 |
| **Dashboard** | `git25math/25maths-dashboard` | 读取 Supabase 运营数据 | 状态不明 |
| **CIE 分析** | `CIE/IGCSE_v2/analysis/` | 产出练习 JSON | ✅ 已产出 202 JSON |

---

## 二、已打通的部分

| 维度 | 实现方式 | 状态 |
|------|---------|------|
| 统一用户身份 | Supabase Auth (`auth.users`) | ✅ |
| 统一会员状态 | `membership_status` 表 + Payhip webhook | ✅ |
| 统一 Engagement | `user_xp` / `user_streaks` / `user_achievements` | ✅ |
| 统一 Profile | `profiles` 表 (display_name, lang, target_board) | ✅ |
| 练习数据源 | CIE 分析 → 202 JSON → 主站 `_data/exercises/` | ✅ |
| 下载权限 | `entitlements` + Storage 签名 URL | ✅ |
| API 网关 | 14 个 Cloudflare Workers 端点 | ✅ |

---

## 三、主站完成度审计（修正版）

上一版 DEVELOPMENT-PLAN.md 标注"双语 100%"、"会员系统 ~98%"，审计发现需要修正：

```
Jekyll 架构        ████████████  100%
互动练习(CIE)      ████████████  100%  (124 JSON)
互动练习(EDX)      ████████████  100%  (78 JSON)
博客系统           ████████████  100%  (8 EN + 8 ZH)
双语 UI            ██████████░░   85%  ← 修正：Kahoot Hub 零中文 + JS 动态文案 ~8 处未 i18n
会员认证/支付       ████████████  100%
CIE 商业产品       ████████████  100%  (26 releases, $24.99 Pass)
EDX 商业产品       ░░░░░░░░░░░░    0%  ← 新发现：releases.json 零 EDX 产品
会员中心 UX        █████████░░░   80%  ← 新发现：登录流程死循环 bug
Engagement         ███████████░   95%
B2B 教师系统       ██░░░░░░░░░░   15%  (UI 骨架 + DB schema, 0 API)
CI/CD              ████████████  100%
```

### 新发现的问题

| # | 问题 | 严重度 | 说明 |
|---|------|--------|------|
| **F1** | 会员中心登录死循环 | Critical | `/membership/index.html` — 已付费用户未登录时只看到 "Get Term Pass"，无登录入口 |
| **F2** | EDX 首页承诺 vs 零产品 | High | 首页声称支持 Edexcel 4MA1，但 `releases.json` 零 EDX release |
| **F3** | Kahoot Hub 零中文 | Medium | 整个 `/kahoot/` 页面无 `bilingual-support-only` 标签 |
| **F4** | JS 动态文案未 i18n | Medium | `member_downloads.js` ~5 处 + `exercise_engine.js` ~3 处 |
| **F5** | 产品间交叉链接弱 | Low | Worksheets → Exercises/Kahoot 缺少双向链接 |

---

## 四、跨项目断点分析

### 断点 1：Play / ExamHub 尚无产品定义

两个子项目仅存在于文档引用中，无规格、无代码、无时间表。以下问题需先回答：

**Play 待决策**：

| # | 问题 | 选项 | 影响 |
|---|------|------|------|
| P1 | Play 是什么类型的游戏？ | A: 数学闯关 / B: 对战竞技 / C: 益智解谜 | 技术选型 |
| P2 | Play 覆盖哪些数学主题？ | A: 与 exercises 同步 / B: 独立 / C: 子集 | 数据依赖 |
| P3 | Play 和 Kahoot 的区别？ | Kahoot 已是"游戏化练习"，Play 差异化何在？ | **核心问题** |
| P4 | Play 的商业模式？ | A: 全免费引流 / B: 基础免费+付费 / C: 仅会员 | entitlement 逻辑 |

**ExamHub 待决策**：

| # | 问题 | 选项 | 影响 |
|---|------|------|------|
| E1 | ExamHub 核心功能？ | A: 真题搜索 / B: 知识点索引 / C: 错题本 / D: AI 分析 | 技术栈 |
| E2 | 数据源？ | A: CIE 分析流水线 / B: 人工标注 / C: 两者 | 冷启动速度 |
| E3 | 与 Exercises 的关系？ | A: 互补 / B: 增强 / C: 独立 | 数据架构 |
| E4 | 商业模式？ | A: 免费 / B: Freemium / C: 仅会员 | paywall |

### 断点 2：跨域登录

当前各项目独立 Supabase session（localStorage 域名隔离）。

| 方案 | 优点 | 缺点 |
|------|------|------|
| **A: 子路径部署**（推荐） | 零额外代码，共享 cookie | 需 Cloudflare Pages 路由配置 |
| B: 子域名 + token relay | 独立部署灵活 | 需开发 SSO 逻辑 |
| C: Cloudflare Access | 企业级安全 | 复杂度高 |

### 断点 3：统一 Engagement

当前只有主站 exercises 产生 XP/streak/achievements。扩展需要：

1. 统一 event schema（source + event_type + xp_earned + metadata）
2. 通用 API 端点 `POST /api/v1/engagement/record-activity`
3. `achievement_definitions` 扩展跨产品成就

### 断点 4：EDX 商业空白

`releases.json` 26 个 release 全部为 CIE 0580。EDX 用户无法购买任何付费产品。

---

## 五、主站产品矩阵

### 现有产品

| 产品 | 核心价值 | 定价 | 数据规模 | 状态 |
|------|---------|------|---------|------|
| Interactive Exercises | 诊断 + 刷题 | 免费 | 202 JSON (CIE 124 + EDX 78) | ✅ |
| Worksheet Packs | 结构化训练 | 免费14 + 付费$24.99 | 26 releases (CIE only) | ⚠️ EDX 缺失 |
| Kahoot Quizzes | 课堂快速检索 | 免费(第三方) | 40+ 题组 | ✅ |
| Membership Center | 会员中心 | 含在 Pass 中 | Streaks + XP + 成就 + 排行 | ⚠️ 登录 bug |
| B2B Institution | 教师平台 | $3-21/学生/月 | UI 骨架 + 6 张 DB 表 | 🔲 15% |

### 潜在产品（未定义）

| 产品 | 可能的价值 | 前置条件 |
|------|-----------|---------|
| Play (Math Games) | 游戏化巩固 | 产品定义 + 与 Kahoot 差异化 |
| ExamHub | 真题检索/分析 | 产品定义 + 数据源确认 |

### 主站增强方向（无需新项目）

以下功能可在主站内实现，可能比新建子项目更有价值：

- **诊断报告**：做完 exercises → 生成个人薄弱点地图
- **错题本**：自动收集错题，按知识点分组复习
- **自适应推荐**：根据正确率推荐下一组练习
- **模拟考试**：限时、混合 topic、接近真实考试体验

---

## 六、战略路线图（修正版）

### 原则：先兑现承诺，再扩张版图

```
Phase 0 — 修复 (立即)          "别让现有用户受伤"
Phase 1 — 兑现 (2-4 周)        "首页承诺的全部做到"
Phase 2 — 定义 (2-3 周)        "想清楚 Play/ExamHub 是什么"
Phase 3 — 重构 (2-4 周)        "主站架构为生态做准备"
Phase 4 — 扩张 (持续)          "逐个接入子产品"
```

### Phase 0 — 修复（立即）

| # | 问题 | 修复方案 |
|---|------|---------|
| F1 | 会员中心登录死循环 | `/membership/index.html` 增加明确登录 CTA |
| F2 | EDX 承诺 vs 零产品 | 选择：注册 EDX releases 或 首页诚实标注 "CIE only" |
| F3 | Kahoot Hub 零中文 | 补全 `bilingual-support-only` 标签 |
| F4 | JS 动态文案未 i18n | `member_downloads.js` ~5 处 + `exercise_engine.js` ~3 处 |

### Phase 1 — 兑现（2-4 周）

| # | 任务 | 产出 |
|---|------|------|
| 1.1 | EDX Term Practice Pass 产品化 | `releases.json` 新增 EDX + Payhip 产品 |
| 1.2 | 成就阈值 + 等级最终审查 | Engagement 100% |
| 1.3 | KaTeX 86 边缘用例修复 | 数学渲染零错误 |
| 1.4 | 产品间交叉链接补全 | Worksheets ↔ Exercises ↔ Kahoot |

**完成标志**：主站作为独立产品 100% 完整，首页每句承诺可兑现。

### Phase 2 — 定义（2-3 周，需人工决策）

每个子产品产出：
1. 一页纸产品定义（用户 + 核心功能 + 差异化 + 商业模式）
2. MVP 功能列表（≤ 5 个核心功能）
3. DB schema 扩展设计
4. API 契约
5. 域名/部署决策

### Phase 3 — 重构（Phase 2 完成后）

| # | 任务 | 前置条件 |
|---|------|---------|
| 3.1 | 导航重构：Practice 下拉 + Exam Boards 下拉 | 产品列表确定 |
| 3.2 | 首页重构：产品矩阵替代 "3 layers" | 产品定位确定 |
| 3.3 | 统一 Engagement API | event schema 确定 |
| 3.4 | `/start/` 增加新产品入口 | 用户旅程确定 |
| 3.5 | `achievement_definitions` 扩展 | 跨产品成就定义 |

### Phase 4 — 扩张（持续）

每个子产品走完整生命周期：定义 → MVP → 内测 → 主站导航上线 → Engagement 接入 → 商业化。

---

## 七、技术打通方案

### 域名架构（推荐子路径）

```
www.25maths.com/              ← 主站 (Jekyll)
www.25maths.com/play/         ← Play (子路径，共享 cookie)
www.25maths.com/examhub/      ← ExamHub (子路径，共享 cookie)
```

### 统一认证

子路径方案下同域名 → 同 localStorage → session 自动共享，`member_auth.js` 可直接复用。

### 统一 Engagement Event Schema

```json
{
  "source": "practice | play | examhub | kahoot",
  "event_type": "session_complete | game_win | search | ...",
  "xp_earned": 10,
  "metadata": { "..." }
}
```

### 共享 Supabase 约束

修改以下共享表需同步所有项目：
- `profiles`, `membership_status`, `entitlements`
- `user_streaks`, `user_xp`, `user_daily_activity`
- `user_achievements`, `achievement_definitions`

---

## 八、关键约束

1. **不在产品定义完成前改导航/首页** — 避免空头承诺
2. **不在子产品 MVP 可用前添加入口链接** — 避免死链接
3. **DB schema 变更需三项目同步** — 避免跨项目 break
4. **`service_role_key` 仅 Workers 侧使用** — 安全红线
5. **主站 `package.json` 只含 Tailwind 依赖** — 部署安全（BUG-POSTMORTEM #B1）

---

## 九、会话记录 (2026-04-03)

本分析在一次完整的 Claude Code 会话中完成，以下是工作过程记录。

### 阶段 1：项目现状分析

执行启动协议（git baseline + 读取 DEVELOPMENT-PLAN.md + CONTRIBUTING.md），统计项目数据：
- 115 HTML 页面、202 练习 JSON、16 博客、14 API 端点、52 commits
- 初步评估整体完成度约 98%

### 阶段 2：生态打通分析

深度探索 5 个项目的集成关系：
- 分析 `_config.yml`、`supabase_server.js`(820 行)、`release_registry.js`、`member_auth.js`(400 行)
- 梳理 14 个 API 端点的完整调用链
- 绘制 3 条核心数据流：支付→会员→下载、练习→Engagement→排行、登录→对账
- 识别 6 个跨项目断点

### 阶段 3：主站重新规划（初版）

提出 5 产品矩阵 + 导航重构 + 首页重构 + 4 Phase 路线图。

### 阶段 4：自我审核纠正

启动 3 个并行审计代理，深入验证初版方案：

**审计 1 — 用户体验**：逐页分析 9 个核心页面的 CTA、交叉链接、双语覆盖、死胡同
- 发现：会员中心登录死循环（F1）、Kahoot Hub 零中文（F3）

**审计 2 — 数据与 API**：验证 releases.json、API 端点、exercises 数量、会员系统
- 发现：EDX 商业产品为零（F2）、首页对 EDX 的承诺不实

**审计 3 — Play/ExamHub 实际状态**：搜索所有规划文档
- 发现：两个项目仅有空仓库名，零规格零代码零时间表，未出现在任何路线图中

**纠正结论**：初版方案的核心错误是"在空中画生态图"——在 Play/ExamHub 连产品定义都不存在的情况下规划导航和首页。修正后策略：**先修复 → 再兑现 → 再定义 → 最后扩张**。

### 阶段 5：用户视角倒推

从 IGCSE 考生的 6 个真实痛点出发，重新评估 Play/ExamHub 的必要性：
- Kahoot vs Play 可能打架（两者都是"游戏化练习"）
- ExamHub 核心不明确（搜？练？分析？）
- 主站自身的诊断报告、错题本、自适应推荐可能比新项目更有价值

用户确认"还没想好"，进一步验证了 Phase 2 暂停决策的正确性。

### 阶段 6：文档化与合并

- 创建 `docs/ECOSYSTEM-ANALYSIS.md`（本文档）
- 更新 `docs/DEVELOPMENT-PLAN.md`（R11b 记录 + 完成度修正 + Phase 0-4 重排）
- 解决与 main 上 R11（组卷模块重构 #39）的合并冲突
- PR #40 squash merge 到 main

### 关键发现汇总

| # | 发现 | 影响 | 来源 |
|---|------|------|------|
| 1 | 主站完成度被高估（98% → ~90%） | 开发优先级需调整 | 审计 1+2 |
| 2 | EDX 商业产品 0%（首页承诺不实） | 信任风险 | 审计 2 |
| 3 | 会员中心登录 UX 死循环 | 付费用户流失 | 审计 1 |
| 4 | Play/ExamHub 无实质进展 | 生态扩张需先完成产品定义 | 审计 3 |
| 5 | 初版规划过于乐观 | 需要"先修后扩"策略 | 自我纠正 |
| 6 | 主站增强可能优于新项目 | 诊断报告/错题本/自适应 | 用户视角倒推 |
