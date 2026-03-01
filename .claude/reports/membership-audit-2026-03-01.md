# 25maths.com 会员系统开发状态审计

> 审计日期：2026-03-01 | 审计范围：membership/、assets/js/member_*.js、functions/api/v1/、functions/_lib/、_data/

---

## 1. 已完成功能

| 功能模块 | 完成度 | 说明 |
|---------|--------|------|
| **Magic Link 认证** | 完整 | OTP 登录、OAuth 回调、session 恢复、token 自动刷新，全站可用 |
| **Payhip 支付对接** | 完整 | Webhook 接收 + HMAC 签名验证 + 事件幂等去重 + 会员状态自动同步 |
| **会员资格管理** | 完整 | active/paused/cancelled 状态、period_start/end、用户侧 reconcile 重放 |
| **Entitlement 门控** | 完整 | 基于 release_id 的授权检查、Supabase Storage 签名下载、多渠道(member/payhip)路由 |
| **会员仪表盘** | 完整 | 4 统计卡片 + 弱项分析 + 最近练习 + streak/XP/heatmap + 下载 + 推荐 + 福利 |
| **Exercise 做题引擎** | 完整 | session 创建→逐题作答→完成，API 优先 + Supabase 直连 fallback |
| **Streak 系统** | 完整 | 连续天数追踪、freeze 机制（每 7 天赚 1 次）、30 天日历热图 |
| **XP & 等级系统** | 完整 | 10 级体系（0→32000 XP）、做题/成就双渠道获取 XP |
| **成就系统** | **部分** | 20 个定义已 seed，6 个 criteria 类型中 `improvement` 类**完全未实现评估**；`complete.js` 内联路径仅评估 streak + volume |
| **排行榜** | 完整 | 按 total_xp 全局排名、周活跃数据聚合、匿名化处理 |
| **家长视图** | 完整 | 独立 magic link 认证 + 周报数据（sessions/accuracy/topic/streak/achievements） |
| **周报 API** | **部分** | 功能完整，但等级阈值与其他 endpoint **不一致**（见 Bug 清单） |
| **会员福利/优惠** | 完整 | DB 驱动的 offers + trigger 条件评估（弱项题数、session 数等） |
| **每周资料下载** | 完整 | 12 周 x 2 版本（EN + 双语），签名 URL 下载 |
| **练习推荐** | 完整 | 基于弱项的推荐卡片，自动检测考试板、链接 exercise 和产品包 |
| **B2B 教师系统** | **骨架** | 5 张 DB 表已建（institutions/classes/assignments），零 API、零前端 |

---

## 2. 前端页面状态

| 页面 | 行数 | JS 加载 | 功能组件 | 空白/占位 | 状态 |
|------|------|---------|---------|-----------|------|
| `/membership/` (index) | 260 | 6 外部 JS | streak widget、XP bar、heatmap、成就徽章、快捷链接、统计卡片、弱项、下载、推荐、福利、FAQ | 无。所有 section 有 `hidden` 初始态，JS 加载后按条件显示 | **完整** |
| `/membership/achievements.html` | 231 | 内联 162 行 | XP 摘要栏、分类过滤器(7类)、成就网格(解锁/锁定/隐藏)、tier 配色 | 无 | **完整** |
| `/membership/leaderboard.html` | 159 | 内联 87 行 | 排名卡片、排行表(rank/name/level/XP/sessions/accuracy)、top 3 奖牌 | 无 | **完整** |
| `/membership/parent-dashboard.html` | 439 | 内联 275 行 | 独立 auth gate + 邮箱登录、4 统计卡片(带 delta)、topic 表格、弱项卡片、成就、推荐 | 无 | **完整** |

> 所有 4 个页面无 TODO、无 lorem、无硬编码数据、无缺失组件。均有 auth/non-auth/loading/error 全状态处理。

---

## 3. 后端 API 状态

| Endpoint | 行数 | 方法 | Auth | 读表 | 写表 | 状态 |
|----------|------|------|------|------|------|------|
| `membership/benefits.js` | 332 | GET | Bearer | membership_status, member_benefit_offers, question_attempts, exercise_sessions | — | **完整** |
| `membership/reconcile.js` | 179 | POST | Bearer | membership_status, payhip_event_log | membership_status, entitlements, payhip_event_log | **完整** |
| `membership/webhook/payhip.js` | 245 | POST | HMAC 签名 | auth.users | payhip_event_log, membership_status, entitlements | **完整** |
| `engagement/achievements.js` | 110 | GET | Bearer | user_xp, user_achievements, achievement_definitions | — | **完整** |
| `engagement/check-achievements.js` | 264 | POST | Bearer | user_daily_activity, user_streaks, user_xp, user_achievements, achievement_definitions, exercise_sessions | user_daily_activity, user_streaks, user_xp, user_achievements | **完整** |
| `engagement/freeze.js` | 114 | POST | Bearer+Member | membership_status, user_streaks | user_streaks | **完整** |
| `engagement/leaderboard.js` | 164 | GET | 可选 | user_daily_activity, user_xp, profiles | — | **完整** |
| `engagement/streak.js` | 77 | GET | Bearer | user_streaks, user_daily_activity | — | **完整** |
| `exercise/session/start.js` | 66 | POST | Bearer | — | exercise_sessions | **完整** |
| `exercise/session/[id]/attempt.js` | 92 | POST | Bearer | exercise_sessions | question_attempts | **完整** |
| `exercise/session/[id]/complete.js` | 272 | POST | Bearer | exercise_sessions, user_streaks, user_xp, user_achievements, achievement_definitions, user_daily_activity | exercise_sessions, user_daily_activity, user_streaks, user_xp, user_achievements | **部分** |
| `download/[release_id].js` | 159 | GET | 条件 | membership_status, entitlements | — | **完整** |
| `reports/weekly.js` | 285 | GET | Bearer | exercise_sessions, question_attempts, user_streaks, user_xp, user_achievements, achievement_definitions | — | **完整** (有 Bug) |

> **0 个 stub**。13 个 endpoint 全部有完整业务逻辑。`complete.js` 标记为「部分」因为内联 engagement 仅评估 streak + volume 两类 achievement criteria。

### Library 文件

| 文件 | 行数 | 导出函数 | 状态 |
|------|------|---------|------|
| `_lib/supabase_server.js` | 781 | 25 个 async 函数，覆盖全部 13 张活跃表 | **完整** |
| `_lib/payhip_events.js` | 100 | 11 个解析/映射函数 | **完整** |
| `_lib/crypto.js` | 57 | sha256, hmac, 常量时间比较 | **完整** |
| `_lib/http.js` | 27 | jsonResponse, redirectResponse, getBearerToken | **完整** |
| `_lib/release_registry.js` | 336 | 25 条 release + findReleaseById | **完整** (自动生成) |

---

## 4. JS 客户端状态

| 文件 | 行数 | API 调用 | 事件机制 | TODO/FIXME | 状态 |
|------|------|----------|---------|------------|------|
| `member_auth.js` | 399 | `POST /api/v1/membership/reconcile` | 发出: `member-auth-change`, `member-auth-notice`, `member-reconcile-complete` | 无 | **完整** |
| `member_center.js` | 314 | Supabase 直查 3 表 | 发出: `member-dashboard-data`; 监听: auth-change, reconcile-complete | 无 | **完整** |
| `member_downloads.js` | 131 | `GET /api/v1/download/{id}` | 监听: `member-dashboard-data` | 无 | **完整** |
| `member_benefits.js` | 145 | `GET /api/v1/membership/benefits` | 监听: `member-dashboard-data` | 无 | **完整** |
| `member_recommendations.js` | 113 | 无 (纯数据驱动) | 监听: `member-dashboard-data` | 无 | **完整** |
| `streak_widget.js` | 358 | `GET /engagement/streak`, `POST /engagement/freeze` | 监听: `member-auth-change` | 无 | **完整** |
| `achievement_toast.js` | 146 | 无 | 监听: `achievement-unlocked` | 无 | **完整** |
| `exercise_engine.js` | 671 | 3 API + 3 Supabase fallback | 发出: `achievement-unlocked`, `streak-updated`; 监听: `member-auth-change` | **1 个 TODO**: fill-in-the-blank 题型 (L526) | **完整** |

> 事件驱动架构链：`member_auth` → `member_center` → `member_downloads` / `member_benefits` / `member_recommendations`

---

## 5. 数据库依赖

| 表名 | 读 | 写 | 引用位置 | 状态 |
|------|:--:|:--:|---------|------|
| `auth.users` | R | — | webhook/payhip, supabase_server | **活跃** |
| `membership_status` | R | W | benefits, reconcile, webhook, freeze, download, member_center | **活跃** |
| `entitlements` | R | W | reconcile, webhook, download, supabase_server | **活跃** |
| `payhip_event_log` | R | W | reconcile, webhook, supabase_server | **活跃** |
| `exercise_sessions` | R | W | start, attempt, complete, benefits, weekly, member_center, check-achievements | **活跃** |
| `question_attempts` | R | W | attempt, benefits, weekly, member_center | **活跃** |
| `user_streaks` | R | W | streak, freeze, complete, check-achievements | **活跃** |
| `user_xp` | R | W | achievements, complete, check-achievements, leaderboard | **活跃** |
| `user_daily_activity` | R | W | streak, complete, check-achievements, leaderboard | **活跃** |
| `user_achievements` | R | W | achievements, complete, check-achievements | **活跃** |
| `achievement_definitions` | R | — | achievements, complete, check-achievements | **活跃** |
| `member_benefit_offers` | R | — | benefits | **活跃** |
| `profiles` | R | — | leaderboard | **活跃** |
| `institutions` | — | — | DB 存在，代码无引用 | **未使用** |
| `institution_members` | — | — | DB 存在，代码无引用 | **未使用** |
| `classes` | — | — | DB 存在，代码无引用 | **未使用** |
| `class_students` | — | — | DB 存在，代码无引用 | **未使用** |
| `assignments` | — | — | DB 存在，代码无引用 | **未使用** |
| `assignment_submissions` | — | — | DB 存在，代码无引用 | **未使用** |

> 13/18 张表活跃使用。5 张 B2B 教师系统表仅有 schema，零代码引用。

---

## 6. 缺失/待完成清单

| # | 优先级 | 类别 | 问题 | 影响 | 修复量 |
|---|--------|------|------|------|--------|
| 1 | **高** | Bug | `reports/weekly.js` 等级阈值 `[0,100,300,600,...]` 与其他 endpoint `[0,50,200,500,...]` **不一致** | 用户在周报中看到的等级可能与仪表盘/成就页不同 | 改 1 行 |
| 2 | **高** | 功能缺失 | `improvement` 类 achievement criteria（`improve-20`, `improve-first`）在 `check-achievements.js` 和 `complete.js` 中**均无评估逻辑** | 2 个成就永远无法解锁 | ~30 行 |
| 3 | **中** | 功能不完整 | `complete.js` 内联 engagement 仅评估 `streak` + `volume`，跳过 `accuracy`/`explorer`/`speed` | 依赖前端单独调用 `check-achievements` 才能解锁这 3 类成就 | 重构提取公共函数 |
| 4 | **中** | 功能不完整 | `complete.js` 的 `volume` 检查用当日 `sessions_completed` 而非历史累计 | volume 成就可能在跨天时漏触发 | 改查询逻辑 |
| 5 | **低** | TODO | `exercise_engine.js:526` — fill-in-the-blank 题型未实现 | 目前 202 个 JSON 全是 multiple-choice，暂无影响 | 未来 feature |
| 6 | **低** | 功能未开发 | B2B 教师系统（机构/班级/作业/提交）— 5 张表已建，0 API，0 前端 | 未来 feature，非当前阻塞 | 大型 feature |
| 7 | **低** | 缺失 | `.env` 中缺少 `TEST_EMAIL_BASE`，测试框架脚本 (`scripts/test-users/`) 尚未实现 | 阻塞自动化测试 | 新建脚本 |
| 8 | **低** | 缺失 | 3 个付费单品 (Algebra/Functions/Number bundles) 不在 `release_registry` 中 | 这 3 个产品走 Payhip 直销，不经过 entitlements 系统 | 按需添加 |

### 建议修复顺序

1. **修复等级阈值不一致** — `weekly.js` 行 238，改为 `[0, 50, 200, 500, 1000, ...]`，5 分钟
2. **补全 `improvement` criteria 评估** — 在 `check-achievements.js` 的 `checkCriteria` switch 中新增 `case 'improvement'`
3. **让 `complete.js` 调用 `check-achievements` 逻辑或提取公共评估函数** — 消除重复 + 覆盖全 criteria
