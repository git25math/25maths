# 25maths.com 会员系统状态报告

> 日期：2026-03-01 | 代码库版本：47bc9b9 | 总行数：7,300+ 行（31 个核心文件 + 6 个双语更新）

---

## 一、系统架构概览

```
用户 ──Magic Link OTP──▶ Supabase Auth ──session──▶ 前端 JS (member_auth.js)
                                                        │
                                                   ┌────▼─────┐
                                                   │ reconcile │ POST /api/v1/membership/reconcile
                                                   └────┬─────┘
                                                        │ 重放 payhip_event_log
                                                        ▼
Payhip ──Webhook HMAC──▶ /webhook/payhip.js ──▶ membership_status + entitlements
                                                        │
              ┌─────────────────────────────────────────┘
              ▼
        门控检查: membership_status.status === 'active'
              │
    ┌─────────┼─────────────┐
    ▼         ▼             ▼
 下载签名URL  会员福利      周练习包 (12周 x 2版本)
 /download/   /benefits     member_downloads.js
```

**完整链路**：Magic Link 认证 → Payhip Webhook 自动同步会员状态 → Entitlement 门控 → Supabase Storage 签名下载。前端通过事件驱动架构串联：`member_auth` → `member_center` → `member_downloads` / `member_benefits` / `member_recommendations`。

---

## 二、功能完成度清单

### 后端 API（13 个 endpoint）

| Endpoint | 方法 | 行数 | 状态 | 说明 |
|----------|------|------|------|------|
| `membership/webhook/payhip.js` | POST | 244 | ✅完整 | HMAC 签名验证 + 事件幂等去重 + 会员状态自动同步 |
| `membership/reconcile.js` | POST | 178 | ✅完整 | 重放 payhip_event_log，修复漏同步 |
| `membership/benefits.js` | GET | 332 | ✅完整 | DB 驱动的 trigger 条件评估，返回可用优惠 |
| `exercise/session/start.js` | POST | 65 | ✅完整 | 创建练习会话 |
| `exercise/session/[id]/attempt.js` | POST | 91 | ✅完整 | 记录逐题作答 |
| `exercise/session/[id]/complete.js` | POST | 309 | ✅完整 | 完成会话 + 全 6 类成就评估 + XP/等级更新 |
| `engagement/achievements.js` | GET | 109 | ✅完整 | 返回 XP/等级/已解锁成就 |
| `engagement/check-achievements.js` | POST | 251 | ✅完整 | 独立成就评估入口，覆盖全 6 类 criteria |
| `engagement/streak.js` | GET | 76 | ✅完整 | 连续天数 + 30 天日历热图数据 |
| `engagement/freeze.js` | POST | 113 | ✅完整 | 使用 streak freeze（仅付费会员） |
| `engagement/leaderboard.js` | GET | 163 | ✅完整 | 按 total_xp 排名 + 周活跃数据 |
| `download/[release_id].js` | GET | 158 | ✅完整 | Entitlement 检查 + Supabase Storage 签名 URL |
| `reports/weekly.js` | GET | 284 | ✅完整 | 周报数据（sessions/accuracy/topic/streak/achievements） |

### 后端库文件（6 个）

| 文件 | 行数 | 状态 | 说明 |
|------|------|------|------|
| `_lib/supabase_server.js` | 780 | ✅完整 | 25+ async 函数，覆盖全部 13 张活跃表 |
| `_lib/achievement_evaluator.js` | 102 | ✅完整 | 公共模块：checkCriteria（6 类）+ computeLevel + fetchSkillImprovementData |
| `_lib/release_registry.js` | 335 | ✅完整 | 25 条 release 元数据（自动生成） |
| `_lib/payhip_events.js` | 100 | ✅完整 | 11 个支付事件解析/映射函数 |
| `_lib/crypto.js` | 56 | ✅完整 | SHA-256, HMAC, 常量时间比较 |
| `_lib/http.js` | 26 | ✅完整 | jsonResponse, getBearerToken |

### 前端页面（4 个）

| 页面 | 行数 | 状态 | 功能组件 |
|------|------|------|---------|
| `/membership/` (index) | 259 | ✅完整 | Streak widget, XP bar, heatmap, 成就徽章, 统计卡片, 弱项, 下载, 推荐, 福利, FAQ |
| `/membership/achievements.html` | 230 | ✅完整 | XP 摘要栏, 7 类过滤器, 成就网格(解锁/锁定), tier 配色 |
| `/membership/leaderboard.html` | 158 | ✅完整 | 排名卡片, Top 20 表格, 奖牌 |
| `/membership/parent-dashboard.html` | 438 | ✅完整 | 独立 auth gate, 4 统计卡片, topic 表, 弱项, 成就, 推荐 |

### 前端 JS（8 个）

| 文件 | 行数 | 状态 | API 调用 | 事件 |
|------|------|------|---------|------|
| `member_auth.js` | 399 | ✅完整 | POST reconcile | 发出: auth-change, auth-notice, reconcile-complete |
| `member_center.js` | 314 | ✅完整 | Supabase 直查 3 表 | 发出: dashboard-data; 监听: auth-change, reconcile-complete |
| `member_downloads.js` | 130 | ✅完整 | GET download/{id} | 监听: dashboard-data |
| `member_benefits.js` | 145 | ✅完整 | GET benefits | 监听: dashboard-data |
| `member_recommendations.js` | 113 | ✅完整 | 无（纯数据驱动） | 监听: dashboard-data |
| `streak_widget.js` | 358 | ✅完整 | GET streak, POST freeze | 监听: auth-change |
| `achievement_toast.js` | 146 | ✅完整 | 无 | 监听: achievement-unlocked |
| `exercise_engine.js` | 671 | ⚠️部分 | 3 API + 3 fallback | 1 个 TODO: fill-in-the-blank (L526) |

### 功能模块汇总

| 功能模块 | 状态 | 说明 |
|---------|------|------|
| Magic Link 认证 | ✅完整 | OTP 登录, OAuth 回调, session 恢复, token 自动刷新 |
| Payhip 支付对接 | ✅完整 | Webhook HMAC + 幂等去重 + 自动同步 |
| 会员资格管理 | ✅完整 | active/paused/cancelled + period 管理 + reconcile 重放 |
| Entitlement 门控 | ✅完整 | release_id 授权检查 + 签名下载 + 多渠道路由 |
| 会员仪表盘 | ✅完整 | 全功能（统计/弱项/下载/推荐/福利/FAQ） |
| Exercise 做题引擎 | ✅完整 | session 创建→逐题作答→完成，API 优先 + fallback |
| Streak 系统 | ✅完整 | 连续天数 + freeze（每 7 天赚 1 次）+ 30 天热图 |
| XP & 等级系统 | ✅完整 | 10 级（0→32000 XP），做题/成就双渠道获取 |
| 成就系统 | ✅完整 | 20 个定义，6 类 criteria 全部实现（含 improvement） |
| 排行榜 | ✅完整 | 按 XP 排名 + 周活跃 + 匿名化 |
| 家长视图 | ✅完整 | 独立 auth + 周报 + 推荐 |
| 周报 API | ✅完整 | 双周对比 + topic 表现 + 弱项 + 成就 |
| 会员福利 | ✅完整 | DB 驱动 offers + trigger 条件 |
| 每周资料下载 | ✅完整 | 12 周 x 2 版本（EN + 双语） |
| 练习推荐 | ✅完整 | 弱项驱动推荐卡片 |
| B2B 教师系统 | ❌未开始 | 5 张 DB 表已建，零 API，零前端 |

---

## 三、今日修复记录

### Commit 339f42a — 3 个 Bug 修复

**Bug #1: 等级阈值不一致**
- 文件：`reports/weekly.js` L238
- 问题：阈值 `[0,100,300,600,...]` 与全局标准 `[0,50,200,500,1000,...]` 不一致
- 影响：家长周报中等级显示可能与仪表盘/成就页不同
- 修复：改为 `[0, 50, 200, 500, 1000, 2000, 4000, 8000, 16000, 32000]`

**Bug #2: improvement 成就评估缺失**
- 文件：`check-achievements.js`
- 问题：`checkCriteria` switch 中无 `case 'improvement'`，`fetchSkillImprovementData` 未实现
- 影响：`improve-20` 和 `improve-first` 两个成就永远无法解锁
- 修复：新增 `fetchSkillImprovementData()` 函数 + `case 'improvement'` 分支 + lazy-fetch 优化

**Bug #3: volume 成就用当日计数**
- 文件：`complete.js` L220-241
- 问题：volume 类成就用 `activity.sessions_completed`（当日值）判断，而非历史累计
- 影响：跨天时 volume 成就可能漏触发（如用户已完成 50 个 session 但当日只做了 1 个）
- 修复：新增 `Prefer: count=exact` 查询 `exercise_sessions` 历史总数，当日值作 fallback

### Commit f3739da — 公共模块重构

**重构: achievement_evaluator.js 提取**
- 新建 `functions/_lib/achievement_evaluator.js`（102 行）
- 导出：`checkCriteria`, `computeLevel`, `XP_THRESHOLDS`, `fetchSkillImprovementData`, `fetchTotalCompletedSessions`
- `check-achievements.js` 删除本地实现，改为 import 共享模块（-81 行）
- `complete.js` 替换内联 streak+volume 逻辑，改用 `checkCriteria`，覆盖全部 6 类 criteria
- 等级阈值统一为单一来源 (`XP_THRESHOLDS`)，消除未来不一致风险

### Commit 731ad30 — 练习题 LaTeX 分数转换（Phase 2）

**功能: 将纯文本分数批量转换为 LaTeX `\frac{}{}` 格式**
- 文件：`scripts/convert_exercise_math.py`（+329 行）+ 170 个 exercise JSON
- 新增 3 个函数：
  - `_parse_frac_operand()` — 从 `/` 两侧解析分子/分母，支持 LaTeX 命令、上标、大括号组
  - `convert_fractions_in_math()` — 在 `$...$` 内将 `a/b` → `\frac{a}{b}`
  - `convert_plain_fractions()` — 在纯文本中将 `3/5` → `$\frac{3}{5}$`，带分数 `2 1/3` → `$2\frac{1}{3}$`
- 跳过列表：单位速率（`km/h`, `m/s`）、散文分数（`opposite / adjacent`）、括号内分数
- 移除过于激进的 `\frac{` 跳过守卫（阻止了含有部分 `\frac` 的文本中其他分数的转换）
- 统计：646 变更，103 个文件，完全幂等（重复运行 0 变更）
- 背景：Phase 1 已完成上标、根号、希腊字母、反引号→LaTeX 转换（commit bd78109）

**后续改进方向（Phase 3）：**
1. 括号分数：`$(12a^4) / (3a)$` 目前跳过，需扩展解析器支持 `(...)` 作为分子/分母
2. 大括号内分数：`${dy/dx = 0}$` 中 `/` 在 guard braces 内部（depth > 0），未被转换
3. 选项中的文本分数：`dy/dx = 15x^2` 等含字母的分数未转换（当前仅处理 digit/digit）
4. 三角函数比值：`sin(30°) = opposite / 10` 可考虑转为 `\frac{\text{opposite}}{10}`
5. KaTeX 渲染验证：在浏览器中抽检 `\frac` 的视觉效果，确认嵌套分数无溢出

### Commit ab48f5e — 账户设置页

**功能: 会员账户设置页面 + Profile CRUD API**
- 新增 `membership/settings.html` — 修改昵称/偏好语言/目标考试板，已有 bilingual headers
- 新增 `api/v1/membership/profile.js` — GET/PUT profile 操作
- 与 `member_auth.js` 事件驱动集成

### Commit 269fe7f — 会员系统双语文案补全

**功能: 6 个文件约 60 处用户可见字符串的中文翻译**
- `member_center.js` — 添加 `isZh()`+`t()`，翻译 20 处（状态徽章、加载提示、错题/会话空状态、会员状态等）
- `member_recommendations.js` — 添加 `isZh()`+`t()`，翻译 12 处（时间戳、推荐、按钮、空状态）
- `achievements.html` — 添加 `LEVEL_TITLES_CN` + `t()`，翻译等级名/已解锁/未解锁/空状态
- `leaderboard.html` — 添加 `isZh()`+`t()`，翻译 8 处（周标签、排名、加载/错误状态）+ bilingual 静态段落
- `parent-dashboard.html` — 添加 `isZh()`+`t()` + `titleCn`，翻译 15+ 处（deltaText、推荐语句、section 标签）
- `membership/index.html` — 交付政策 bilingual-support-only 中文段落
- 统计：6 文件，128 行新增，80 行替换

### Commit 47bc9b9 — Hero 颜色覆盖修复

**修复: CIE/EDX hero 区 `text-gray-300` / `text-blue-300` 未被品牌色覆盖**
- 问题：`_includes/head.html` 中 hero 颜色覆盖仅覆盖到 `-200` 色阶，`-300` 落回 Tailwind 默认冷灰/浅蓝
- 影响：四层体系描述段落在 CIE 暖色背景上显示冷灰色，EDX 青色背景上显示亮蓝色
- 修复：`.cie-hero-gradient/soft .text-gray-300` → `var(--cie-igcse-600)`，`.edx-hero-gradient .text-blue-300/.text-gray-300` → `var(--edx-igcse-600)`

---

## 四、已知限制与技术债

| # | 优先级 | 类别 | 说明 | 影响 |
|---|--------|------|------|------|
| 1 | 低 | TODO | `exercise_engine.js:526` fill-in-the-blank 题型未实现 | 202 个 JSON 全是 multiple-choice，暂无影响 |
| 2 | 低 | 架构 | `weekly.js` 仍有本地硬编码的 `LEVEL_THRESHOLDS`，未 import `achievement_evaluator.js` | 功能正确（值已手动对齐），但非单一来源 |
| 3 | 低 | 架构 | `achievements.html` 和 `parent-dashboard.html` 前端也有各自的 `LEVEL_THRESHOLDS` 硬编码 | 前端无法直接 import 后端模块，需单独维护 |
| 4 | 低 | 缺失 | `.env` 中缺少 `TEST_EMAIL_BASE`，自动化测试脚本未实现 | 阻塞端到端自动化测试 |
| 5 | 低 | 缺失 | 3 个付费单品 (Algebra/Functions/Number) 不在 `release_registry` 中 | 走 Payhip 直销，不经 entitlements 系统 |
| 6 | 低 | 未开发 | B2B 教师系统 — 5 张 DB 表已建（institutions/classes/assignments），零 API，零前端 | 未来 feature |
| 7 | 低 | 架构 | `complete.js` 和 `check-achievements.js` 的 streak 更新逻辑各有一份，未提取 | 代码重复但逻辑一致，暂不影响正确性 |
| 8 | 低 | 架构 | `formatDateStr` / `subtractDays` 在 3 个文件中重复定义 | 可考虑提取到 `_lib/date_utils.js` |

---

## 五、下一步计划（按优先级排序）

### P1 — 会员体系收尾 ✅ 基本完成

- [x] 账户设置页（修改邮箱/昵称/偏好语言）— commit ab48f5e
- [x] 双语文案补全（JS 动态内容 + HTML 静态标签）— commit 269fe7f（6 文件，~60 处翻译）
- [x] Hero 颜色覆盖修复（`text-gray-300`/`text-blue-300` 品牌色对齐）— commit 47bc9b9
- [ ] 成就 seed 数据审查（20 个定义的 criteria 阈值是否合理）
- [ ] `weekly.js` 引入 `computeLevel` 统一等级计算（消除技术债 #2）

### P1.5 — 练习题 LaTeX 数学渲染优化

- [x] Phase 1: Unicode 上标/根号/希腊字母/反引号→LaTeX — commit bd78109
- [x] Phase 2: 纯文本分数→`\frac{}{}`，带分数、数学模式内分数 — commit 731ad30
- [ ] Phase 3: 括号分数 `$(12a^4) / (3a)$`→`$\frac{12a^4}{3a}$`（扩展解析器支持 `(...)` 分组）
- [ ] Phase 3: guard braces 内分数 `${dy/dx = 0}$`（需在 guard 包裹前处理分数）
- [ ] Phase 3: 字母分数 `dy/dx = 15x²`（选项文本中的非 digit/digit 分数）
- [ ] Phase 4: KaTeX 浏览器端渲染验证（抽检嵌套分数、长分数无溢出）
- [ ] Phase 4: 三角比值格式化 `opposite / adjacent`→`$\frac{\text{opposite}}{\text{adjacent}}$`

### P2 — Edexcel 4MA1 补齐

- [ ] 产品详情页（对标 CIE 的 algebra/functions/number 页面结构）
- [ ] `/edx4ma1/free/` 页面添加 Term Pass 推荐 CTA
- [ ] `/edx4ma1/products.html` 页面 "Try before you buy" CTA
- [ ] Edexcel 练习 JSON 扩充（当前 202 个全是 CIE 0580）

### P3 — 内容与增长

- [ ] 5 篇新 Blog 文章（SEO 长尾词覆盖）
- [ ] GA4 事件追踪接入（练习完成、成就解锁、下载等关键行为）
- [ ] Google Search Console 优化（索引覆盖率、Core Web Vitals）
- [ ] SEO 关键词覆盖扩展（"IGCSE maths practice", "CIE 0580 worksheets" 等）

### P4 — 未来 Feature

- [ ] B2B 教师系统（机构/班级/作业/提交 — 全栈开发）
- [ ] fill-in-the-blank 题型（exercise_engine.js 扩展）
- [ ] 自动化测试框架（测试用户创建/验证/报告）
- [ ] 周报邮件推送（Supabase Edge Function 定时触发）

---

## 六、文件索引

### 后端 — Cloudflare Pages Functions

```
functions/
├── _lib/
│   ├── supabase_server.js      (780 行) 全部 DB 操作
│   ├── achievement_evaluator.js (102 行) 成就评估公共模块
│   ├── release_registry.js     (335 行) 产品元数据 (自动生成)
│   ├── payhip_events.js        (100 行) 支付事件解析
│   ├── crypto.js                (56 行) HMAC/SHA-256
│   └── http.js                  (26 行) 响应/认证工具
├── api/v1/
│   ├── membership/
│   │   ├── webhook/payhip.js   (244 行) Payhip Webhook
│   │   ├── benefits.js         (332 行) 会员福利
│   │   └── reconcile.js        (178 行) 事件重放
│   ├── engagement/
│   │   ├── check-achievements.js (251 行) 成就评估
│   │   ├── achievements.js     (109 行) 成就查询
│   │   ├── leaderboard.js      (163 行) 排行榜
│   │   ├── freeze.js           (113 行) Streak freeze
│   │   └── streak.js            (76 行) Streak 查询
│   ├── exercise/session/
│   │   ├── start.js             (65 行) 创建会话
│   │   └── [id]/
│   │       ├── complete.js     (309 行) 完成 + engagement
│   │       └── attempt.js       (91 行) 逐题作答
│   ├── download/
│   │   └── [release_id].js     (158 行) 签名下载
│   └── reports/
│       └── weekly.js           (284 行) 周报
```

### 前端 — 页面 + JS

```
membership/
├── index.html              (259 行) 会员仪表盘主页
├── achievements.html       (230 行) 成就页
├── leaderboard.html        (158 行) 排行榜页
└── parent-dashboard.html   (438 行) 家长视图

assets/js/
├── member_auth.js          (399 行) 认证客户端
├── member_center.js        (314 行) 仪表盘数据层
├── member_downloads.js     (130 行) 下载卡片
├── member_benefits.js      (145 行) 福利卡片
├── member_recommendations.js (113 行) 推荐卡片
├── streak_widget.js        (358 行) Streak + heatmap
├── achievement_toast.js    (146 行) 成就通知 toast
└── exercise_engine.js      (671 行) 做题引擎
```

### 数据

```
_data/
├── releases.json           产品/版本元数据
└── exercises/*.json        202 个练习题目 (全 multiple-choice, 12 题/个)
```

### 数据库（18 张 public 表）

| 分类 | 表名 | 状态 |
|------|------|------|
| 核心 | profiles, membership_status, entitlements, payhip_event_log, member_benefit_offers | 活跃 |
| 练习 | exercise_sessions, question_attempts | 活跃 |
| Engagement | user_streaks, user_xp, user_daily_activity, user_achievements, achievement_definitions | 活跃 |
| B2B | institutions, institution_members, classes, class_students, assignments, assignment_submissions | 未使用 |
