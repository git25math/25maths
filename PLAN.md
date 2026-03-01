# 25maths.com 会员系统收尾计划

> 生成日期: 2026-03-01 | 代码版本: `c40b494` + uncommitted | 总体完成度: ~65%

---

## 已完成 ✅

### 技术债清理（本次会话）

| # | 项目 | 文件 | 状态 |
|---|------|------|------|
| TD-2 | weekly.js 引入 `computeLevel` | `functions/api/v1/reports/weekly.js` | ✅ 删除本地 LEVEL_THRESHOLDS，import 共享模块 |
| TD-7 | 提取 streak 更新逻辑 | `functions/_lib/streak_utils.js` (新建)，`complete.js`，`check-achievements.js` | ✅ 统一 freeze_used_at 和 || 0 防护 |
| TD-8 | 提取日期工具函数 | `functions/_lib/date_utils.js` (新建)，5 个消费文件 | ✅ 消除 5 处重复定义 |
| — | profiles 主键修复 | `functions/_lib/supabase_server.js` fetchProfile/upsertProfile | ✅ id → user_id (方案 B) |
| — | 成就定义数据修正 | Supabase `achievement_definitions` 表 | ✅ 4 条 UPDATE (explorer-all/streak-7/streak-60/accuracy-100-5) |
| — | Settings 入口 | `membership/index.html` hero 区域 | ✅ 添加 ⚙️ Settings / 设置 链接 |

### 之前已完成（Round 1-9）

| 轮次 | 内容 | 代表 commit |
|------|------|-------------|
| R1 | Blog 系统 (16 篇 EN+ZH) | `b9f0420` |
| R2 | SEO & 本地化 (hreflang, sitemap) | `9d45f43` |
| R3 | 设计一致性审计 | `3d7823d` |
| R4 | 交叉链接 & 质量审计 | `20aa975` |
| R5 | 性能 & SEO (defer, preconnect) | `d47cc8a` |
| R6 | 无障碍 & 安全审计 | `eaf4815` |
| R7 | 练习题 LaTeX Phase 1-2 | `731ad30` |
| R8 | 会员系统 last-mile (E2E 26/26 pass) | `f6bb787` |
| R9 | KaTeX Phase 3-4 (8,731 表达式) | `c40b494` |

---

## Phase 1: 代码收尾

### 1.1 前端 LEVEL_THRESHOLDS 硬编码消除

**现状**: 5 处硬编码（后端已通过 `achievement_evaluator.js` 统一）

| 文件 | 行号 | 类型 | 说明 |
|------|------|------|------|
| `membership/achievements.html` | 74 | 简单数组 `[0,50,200,...]` | 前端计算 XP 进度条 |
| `membership/parent-dashboard.html` | 181 | 对象数组 `[{xp,label}]` | 家长面板等级显示 |
| `zh-cn/membership/parent-dashboard.html` | 168 | 对象数组 (中文版) | 同上中文版 |
| `assets/js/streak_widget.js` | 4 | 对象数组 `[{xp,label}]` | 仪表盘等级条 |
| `functions/api/v1/engagement/achievements.js` | 9 | 对象数组 | API 端点 |

**方案**:
- 后端 `achievements.js` 直接 import `XP_THRESHOLDS` from `achievement_evaluator.js`（与 weekly.js 相同改法）
- 前端 3 个文件：等级数据通过 API 返回（`/api/v1/engagement/achievements` 已返回 level 信息），前端仍需本地阈值做进度条计算。可接受保留但添加 `// Sync with functions/_lib/achievement_evaluator.js:XP_THRESHOLDS` 注释标记

**工作量**: ~30 分钟

### 1.2 双语文案补全

**现状**: 78 处英文 UI 文案缺少中文对照

| 文件 | 缺失数 | 优先级 |
|------|--------|--------|
| `membership/index.html` | 22 | P0 — 会员中心首页 |
| `membership/settings.html` | 18 | P0 — 设置页面 |
| `membership/parent-dashboard.html` | 14 | P1 — 家长面板 |
| `membership/leaderboard.html` | 11 | P1 — 排行榜 |
| `membership/achievements.html` | 8 | P2 — 成就页 |
| `assets/js/member_downloads.js` | 5 | P1 — 下载卡片 |

**最高优先级 10 处**:

1. `membership/index.html:113` — "Your Learning Snapshot" (主区块标题)
2. `membership/index.html:206` — "Weekly Practice Packs" (主区块标题)
3. `membership/settings.html:33` — "Account Summary" (设置页标题)
4. `membership/settings.html:56` — "Profile" (表单标题)
5. `membership/settings.html:93` — "Save Changes" (提交按钮)
6. `membership/index.html:162` — "Top Mistake Clusters" (分析区标题)
7. `membership/index.html:183` — "Targeted Practice Plan" (推荐区标题)
8. `membership/index.html:248` — "FAQ" + 3 个问答 (帮助区)
9. `membership/parent-dashboard.html:37` — "Sign in to view progress" (认证门)
10. `membership/leaderboard.html:26` — "Your Rank" (排名卡)

**ZH 页面差距**: `zh-cn/membership/` 仅有 `parent-dashboard.html`，缺失 `index.html`、`settings.html`、`achievements.html`、`leaderboard.html` 的中文版。但当前架构使用 bilingual-support-only CSS 类而非独立 ZH 页面，所以只需补全 `bilingual-support-only` 标签。

**工作量**: ~2 小时

### 1.3 其他遗留代码项

| 项目 | 优先级 | 说明 |
|------|--------|------|
| KaTeX CSS 预加载 | P2 | `<link rel="preload" as="style">` 模式 |
| sitemap.xml lastmod 自动化 | P3 | 可 hook 到 build 流程 |
| CSP unsafe-inline 迁移 | P3 | 需 nonces/hashes，影响所有内联 script |
| 练习筛选器缺 id | P3 | `<select>` 无障碍修复 |
| ~86 KaTeX 边缘用例 | P3 | 负数 Unicode 上标、嵌套 sqrt 等 |

---

## Phase 2: 测试用户与验证

### 2.1 环境准备

| 项目 | 状态 |
|------|------|
| `.env` (SUPABASE_URL, keys, API_BASE_URL) | ✅ 已存在 |
| `.claude/commands/test-setup.md` | ✅ 已存在（16 用户定义） |
| `.claude/commands/test-verify.md` | ✅ 已存在 |
| `.claude/commands/test-report.md` | ✅ 已存在 |
| `scripts/test-users/` 目录 | ❌ 不存在，需创建 |
| `scripts/test-users/users.json` | ❌ 不存在，需创建 |
| `scripts/test-users/setup.js` | ❌ 不存在，需创建 |
| `package.json` (node 依赖) | ❌ 不存在，需 `@supabase/supabase-js` |

### 2.2 创建 4 个核心测试用户

| ID | alias | membership | board | 授权 | 特殊场景 |
|----|-------|-----------|-------|------|----------|
| T01 | Alice | active | CIE | 全授权 | 基准线，高活跃（25 sessions, 7-day streak, 2400 XP） |
| T03 | Charlie | cancelled | CIE | 已失效 | period_end = 6 天前 |
| T04 | Diana | — | — | 无 | 从未购买，低活跃 |
| T08 | Henry | active | — | 全授权 | 零数据（测试 null 处理） |

### 2.3 DB 层验证（每用户 15 项检查）

- profiles 存在 + 字段正确
- membership_status 状态一致
- entitlements 数量正确
- exercise_sessions 数量正确
- question_attempts 存在
- user_streaks current/best/freeze
- user_xp total/level
- user_achievements count
- user_daily_activity 日期范围
- 各表 user_id FK 一致性
- T08: 所有表空记录验证
- T03: expired entitlements 验证
- T04: 无 membership 记录验证

### 2.4 API 层验证（每用户 5 个 endpoint）

| Endpoint | 验证点 |
|----------|--------|
| `GET /api/v1/user/profile` | 返回 display_name, preferred_lang, target_board |
| `PATCH /api/v1/user/profile` | 保存并返回更新后数据 |
| `GET /api/v1/engagement/streak` | current_streak, calendar, freeze_available |
| `GET /api/v1/reports/weekly` | summary, xp.level 使用 computeLevel |
| `POST /api/v1/engagement/check-achievements` | newly_unlocked, xp, streak 使用共享模块 |

**工作量**: ~3-4 小时

---

## Phase 3: Edexcel 补齐

### 3.1 差距清单

| 维度 | CIE 0580 | Edexcel 4MA1 | 差距 |
|------|----------|--------------|------|
| 练习题 JSON | 124 | 78 | -46 (37%) |
| Payhip 产品页 | — | — | 均未上线 |
| 独立 topic 覆盖 | ~70 | ~35 | 需评估目标 syllabus 差异 |

### 3.2 任务清单

- [ ] 分析 4MA1 syllabus，确定缺失 topic 列表
- [ ] 批量生成缺失练习题 JSON（可复用 CIE 分析管道）
- [ ] 产品页创建（如需 Payhip 上架）
- [ ] 转化漏斗补全（landing page → exercises → membership）

**工作量**: ~1-2 周（取决于内容深度）

---

## Phase 4: 内容与增长（仅列出）

- [ ] Blog: 新增 IGCSE 备考系列文章（EN + ZH）
- [ ] GA4: 事件追踪（session_complete, achievement_unlock, download）
- [ ] SEO: 结构化数据 FAQ markup，练习页 breadcrumbs
- [ ] Email: 周报邮件模板（配合 weekly_report_enabled）

---

## 依赖关系

```
Phase 1.1 (LEVEL_THRESHOLDS) ──── 可独立
Phase 1.2 (双语补全) ─────────── 可独立
Phase 1.3 (其他遗留) ─────────── 可独立

Phase 2.1 (环境准备) ──┐
                       ├─→ Phase 2.2 (创建用户) ──→ Phase 2.3 (DB 验证) ──→ Phase 2.4 (API 验证)
Phase 1 (代码收尾) ────┘

Phase 3 (Edexcel) ────────────── 可与 Phase 1-2 并行
Phase 4 (增长) ───────────────── 可与所有 Phase 并行
```

**可并行**:
- Phase 1.1 / 1.2 / 1.3 互相独立
- Phase 3 与 Phase 1-2 独立
- Phase 4 与所有 Phase 独立

**必须串行**:
- Phase 2 依赖 Phase 1 代码修复完成（否则验证结果不准确）
- Phase 2.2 → 2.3 → 2.4 必须顺序执行

---

## 风险项

| 风险 | 影响 | 缓解 |
|------|------|------|
| profiles 修复后可能有旧数据残留 | 低 | profiles 表当前为空（0 行），修复后新数据直接写入 user_id |
| LEVEL_THRESHOLDS 前后端不一致 | 中 | 已在后端统一；前端保留硬编码 + 注释标记，后续可通过 API 返回阈值配置 |
| 测试用户可能写入生产库 | 高 | test-setup.md 已要求脚本检测 URL 含 "prod" 时拒绝执行；当前 URL 为 Supabase 托管 |
| Edexcel 练习质量不均 | 中 | 78 题已有，优先覆盖核心 topic；复用 CIE 管道降低成本 |
| KaTeX 86 个边缘用例 | 低 | 不影响主流程；可逐步手动修复 |

---

## 当前 Git 状态

### 未提交变更 (12 modified + 7 untracked)

**Modified**:
- `functions/_lib/supabase_server.js` — profiles PK 修复
- `functions/api/v1/reports/weekly.js` — TD-2 computeLevel
- `functions/api/v1/engagement/check-achievements.js` — TD-7/8 streak + date
- `functions/api/v1/engagement/freeze.js` — TD-8 date_utils
- `functions/api/v1/engagement/streak.js` — TD-8 date_utils
- `functions/api/v1/exercise/session/[id]/complete.js` — TD-7/8 streak + date
- `membership/index.html` — Settings 链接
- 3 exercise JSON + exercise_engine.js — 之前的 KaTeX 修复残留
- 2 .DS_Store

**New files**:
- `functions/_lib/date_utils.js` — 共享日期工具
- `functions/_lib/streak_utils.js` — 共享 streak 逻辑

### 最近 5 次 commit

```
c40b494 docs: update changelog and decision log for LaTeX Phase 4
121ccd9 fix: LaTeX Phase 4 — KaTeX quality assurance across 102 exercise JSON files
3982506 fix: 修复练习题 KaTeX 渲染 — normalizeInlineMath 跳过简单数学表达式
f411886 docs: 同步更新 LaTeX Phase 3 KaTeX 批量转换记录至所有项目文档
3f1f420 docs: 同步 6 份项目文档至 2026-03-01 最新进度
```
