# Member System Workboard

> Updated: 2026-03-01 (UTC)
> Branch focus: `main`
> Status: `todo` / `in_progress` / `blocked` / `done`

## Sprint Objective

交付完整会员系统闭环：

1. 免费会员可注册登录并记录做题进度。
2. 付费会员可获得错题导向的学习计划与权益（优惠券/订阅优惠）。
3. Payhip 与站内会员权益同步稳定。

## Stream Board

| ID | Stream | Owner | Status | Dependency | Definition of Done |
|---|---|---|---|---|---|
| W0 | 调度底座（Codex + Gemini 多 agent） | Commander | done | None | 可并发调度、失败即停、修复回写、自愈重试可用 |
| W1 | 免费会员 Auth + Profile | Codex-Backend | done | W0 | 登录、会话、基础资料可用，重定向配置正确 |
| W2 | 练习进度与错题数据链路 | Codex-Frontend | done | W1 | session/attempt 成功写入，匿名流程不受影响 |
| W3 | 付费会员状态与权益模型 | Codex-Backend | done | W1 | membership_status/entitlements 与 RLS 完整 |
| W4 | Payhip Webhook 同步 | Codex-Backend | done | W3 | 订单事件可驱动会员状态与权益变更，幂等生效 |
| W5 | 会员下载网关 | Codex-Backend | done | W3, W4 | 非会员拒绝，会员签名链接可用且短时有效 |
| W6 | 个性化学习推荐 | Codex-Frontend + Gemini-Architect | in_progress | W2, W3 | 基于错题标签输出针对性学习计划 |
| W7 | 优惠券与订阅优惠权益 | Codex-Backend + Codex-Frontend | in_progress | W3, W4 | 付费会员可见可用优惠策略，策略判定可追踪 |
| W8 | QA 回归与发布闸门 | Gemini-QA + Commander | done | W1-W7 | E2E 冒烟通过（26/26），回滚演练待做 |

## Current Iteration (Now)

1. 已完成 W0 调度脚本升级与停线修复（codex 401 -> 预检探测 + 环境净化）。
2. 已完成并行 agent 运行：`plan/member-agent-runs/20260218T124247Z/`。
3. 已完成免费会员链路（W1/W2）：登录回跳 + 会员学习面板 + session/attempt/complete API。
4. 已完成付费模型基础层（W3）：`membership_status` / `entitlements` / `member_benefit_offers`。
5. 已完成一次完整 Gate 证据落盘：`plan/member-agent-runs/20260218T213543Z/`（build/node/supabase/health 全绿）。
6. 已将 Gate 固化到脚本：`bash scripts/member/dispatch_member_agents.sh gate`。
7. 已完成 W4 一轮硬化：退款/取消类 Payhip 事件会回收对应 entitlement（`expires_at=now()`）。
8. 正在执行 W4/W5：Payhip 真实事件回放与下载网关授权闭环验证。
9. 已完成 W6 第一轮增强：推荐卡已接入“错题频次 + 最近窗口”加权，并显示最近错题时间解释字段。
10. 已完成 W7 第一轮：`member_benefit_offers.metadata.trigger` 已支持规则驱动筛选，权益卡显示 Eligibility 原因。
11. 正在执行 W7 第二轮：优惠券发放策略与课程映射联动（按 skill_tag 精细化）。
12. 正在执行 W8：补齐回滚演练与异常注入测试。
13. 已新增 E2E 命令脚本：`scripts/member/e2e_payhip_flow.sh`，用于命令行串联 webhook/reconcile/download 验证。
14. **2026-02-27**: subscription.html 从 waitlist 模式切换到 Payhip checkout 模式（Claude Code Opus 执行）。
15. **2026-02-27**: releases.json 更新 — demo draft 替换为 Week 1 active entry (`member-week01-algebra-foundations-2026w09`)。
16. **2026-02-27**: release_registry.js 同步完成。
51. **2026-02-28**: **12-Week Term Practice Pass 全部完成** — 24 PDFs (12 EN + 12 bilingual) 已上传 Supabase，releases.json 含 25 条记录（含 free vocab），asset_key 路径已修正为 `member-files/week-packs/`。
52. **2026-02-28**: 优化完成 — TikZ 图表 (W01-W04,W06,W07)、格式一致性审查 (810+ 修正)、Venn 图歧义修复、答案泄露图删除。
53. **2026-02-28**: releases.json 源文件创建并同步到 release_registry.js。
17. **2026-02-27**: 创建总工程师运维计划 `plan/CHIEF-ENGINEER-OPS-PLAN.md`，统一 AI 工具分配与验收标准。
18. **待执行**: 用户创建 Payhip 订阅产品 -> 替换 `{PRODUCT_ID}` -> 配置 Cloudflare env vars -> E2E 验证。
19. **2026-02-27**: 北极星愿景确立 — 目标：全球最佳 IGCSE 数学备考平台。详见 `plan/NORTH-STAR-VISION.md`。
20. **已完成**: Q2 自适应难度引擎技术规格 `plan/specs/ADAPTIVE-DIFFICULTY-ENGINE.md`。
21. **已完成**: Q2 打卡/成就/XP 系统技术规格 `plan/specs/STREAK-ACHIEVEMENT-SYSTEM.md`。
22. **已完成**: Q2 学生周报系统技术规格 `plan/specs/WEEKLY-REPORT-SYSTEM.md`。
23. **已完成**: B2B 教培机构平台深度研究 + 技术规格 `plan/specs/B2B-INSTITUTION-PLATFORM.md`。
24. **已完成**: 5 篇 SEO 博客文章发布 (IGCSE revision strategy, Paper 4 tips, trigonometry, percentage, CIE vs Edexcel)。
25. **已完成**: sitemap.xml 更新 — 新增 5 篇博客条目。
26. **规划中**: Q3 中文家长面板 (parents.25maths.com) + 双语月度 PDF 进度报告。
27. **已完成**: demo 账户种子脚本 `supabase/seed.demo_accounts.sql` + `scripts/seed_demo_accounts.js` 创建完成。
28. **已完成**: Supabase 迁移 — engagement 系统 5 表 + B2B 机构基础 4 表；旧 assignment 表已随 exercise schema 下线。
29. **已完成**: 5 篇中文 SEO 博客翻译 (`_posts/2026-02-27-zh-cn-*.md`)，含双向 `lang_links`。
30. **已完成**: B2B 机构着陆页 `institution/index.html` + 教师仪表盘骨架 `institution/dashboard.html`。
31. **已完成**: 会员面板 streak 打卡组件 + 30 天热力图 + XP 等级条 + 成就徽章区 (`membership/index.html`)。
32. **已完成**: 前端 JS — `assets/js/streak_widget.js` + `assets/js/achievement_toast.js`。
33. **已完成**: 成就画廊页 `membership/achievements.html` — 分类筛选、XP 汇总、解锁/锁定网格。
34. **部分保留**: Engagement API 保留 `streak.js` + `achievements.js`；旧 `check-achievements.js` 随 exercise completion flow 下线。
35. **已完成**: `functions/_lib/supabase_server.js` 新增 10 个 engagement helper 函数。
36. **已下线**: 教师作业管理页 `institution/assignments.html` — 依赖旧 exercise catalog，已删除。
37. **已完成**: sitemap.xml 更新 — 新增 5 篇中文博客条目（共 10 篇新博客）。
38. **已下线**: Session complete 端点随 exercise Functions API 删除。
39. **已下线**: 练习引擎 `exercise_engine.js` 已删除；会员 engagement 改走非 exercise 活动摘要。
40. **已完成**: 家长周报邮件模板 `templates/emails/weekly-report.html` — 双语 + 内联 CSS。
41. **已完成**: Streak freeze API 端点 `functions/api/v1/engagement/freeze.js` — 仅付费会员可用。
42. **已完成**: sitemap.xml 更新 — 新增 membership 页面条目。
43. **已完成**: DECISIONS.md 更新 — 记录 engagement 全链路实施决策。
44. **已完成**: CHIEF-ENGINEER-OPS-PLAN.md audit trail 更新 — 18 条新记录。
45. **已完成**: 竞争情报报告 `plan/COMPETITIVE-INTELLIGENCE.md` — 7 大竞争对手深度分析 + 市场数据 + 双语空白发现。
46. **已完成**: 中文家长着陆页 `zh-cn/parents.html` — 微信/小红书分发优化，痛点+对比表+CTA。
47. **已完成**: sitemap.xml 更新 — 新增 institution/B2B 页面 + 家长页面 + 会员页面条目。
48. **已完成**: 周报数据 API 端点 `functions/api/v1/reports/weekly.js` — GET 返回周汇总、话题表现、错题排行、成就、XP。
49. **已完成**: streak freeze 按钮前端联调 — `streak_widget.js` 添加点击处理器调用 `/api/v1/engagement/freeze`。
50. **已完成**: 家长仪表盘页面 `membership/parent-dashboard.html` — 周报卡片、话题表现表、弱项预警、成就、建议。
51. **已完成**: 中文家长仪表盘 `zh-cn/membership/parent-dashboard.html` — 完整中文翻译，含知识点中英映射。
52. **已完成**: FAQ 页面 `faq.html` — 11 个常见问题，schema.org FAQPage 结构化数据，双语链接。
53. **已完成**: 中文 FAQ 页面 `zh-cn/faq.html` — 11 个问题完整中文翻译。
54. **已完成**: 排行榜 API 端点 `functions/api/v1/engagement/leaderboard.js` — 按 XP 排名 Top 20，含当前用户排名。
55. **已完成**: 排行榜页面 `membership/leaderboard.html` — 奖牌图标、用户排名卡、周统计表。
56. **已完成**: OG meta 标签增强 — `_includes/head.html` 添加 locale、默认 fallback、Twitter image 支持。
57. **已完成**: sitemap.xml 最终更新 — 新增 FAQ(EN+CN)、排行榜、中文家长仪表盘条目。
58. **已完成**: B2B 定价研究报告 `plan/B2B-PRICING-RESEARCH.md` — 10 大教育 SaaS 平台价格+功能+白标对比。
59. **已完成**: 会员中心快捷导航 — `membership/index.html` 添加成就画廊/排行榜/家长视图/练习链接。
60. **已完成**: 页脚重构 — `_includes/footer.html` 新增 FAQ/机构/家长仪表盘/排行榜链接，分栏重组为 Platform + Help & Info。
61. **注意**: 机构页定价 ($14-21/学生/月) 显著高于竞品 ($3-15/学生/年)，建议用户重新评估 B2B 定价策略。
62. **已完成**: 教培机构深度研究 `plan/TUTORING-INSTITUTION-RESEARCH.md` — 中国+东南亚市场、6 大功能需求、10 平台对比、定价建议。
63. **关键发现**: 25Maths 可成为唯一同时覆盖 IGCSE 专题练习+机构管理+微信家长通讯+防火墙可访问+中英双语 的平台。无现有竞品覆盖全部五点。
64. **已完成**: Jekyll 构建修复 — 使用 Homebrew Ruby 3.2 (`/opt/homebrew/opt/ruby@3.2/bin`) + bundler 2.7.1 成功构建。零错误零警告。
65. **已完成**: Liquid 警告修复 — `plan/specs/WEEKLY-REPORT-SYSTEM.md` Handlebars 模板添加 raw/endraw 标签包裹。
66. **已完成**: 路线图更新 — `CHIEF-ENGINEER-OPS-PLAN.md` §9 已标记所有已完成的 Q2/Q3 项目（streak、家长面板、B2B 页面、FAQ、排行榜等）。
67. **已完成**: API 一致性修复 — `leaderboard.js` 和 `weekly.js` 移除本地 `serviceHeaders()` 重复定义，改为从 `supabase_server.js` 导入。
68. **已完成**: hreflang 标签 — `_includes/head.html` 添加双语页面 `<link rel="alternate" hreflang>` 标签，基于 `lang_links` 前置数据自动渲染。
69. **已完成**: 机构页结构化数据 — `institution/index.html` 添加 `schema.org/SoftwareApplication` JSON-LD（含定价层级）。
70. **已完成**: SEO 审计通过 — robots.txt、sitemap.xml（212 条 URL）、404.html 全部正确配置。
71. **2026-03-01**: **账户设置页** — Profile CRUD API + `membership/settings.html`（commit ab48f5e）。
72. **2026-03-01**: **会员 JS/HTML 双语文案补全** — 6 文件 ~60 处翻译，`isZh()`+`t()` 模式（commit 269fe7f）。
73. **2026-03-01**: **Hero 颜色修复** — `text-gray-300`/`text-blue-300` 品牌色覆盖（commit 47bc9b9）。
74. **2026-03-01**: **LaTeX Phase 1** — Unicode 上标/根号/希腊字母→LaTeX，108 个 JSON（commit bd78109）。
75. **2026-03-01**: **LaTeX Phase 2** — 纯文本分数→`\frac{}{}`，170 个 JSON（commit 731ad30/19ce5de）。

## Stop-The-Line Triggers

出现以下情况立即中断并进入修复流：

1. 登录链路不可用或回跳异常。
2. RLS 策略出现越权风险。
3. Webhook 验签或幂等失效。
4. 会员下载授权绕过。
5. 生产构建失败或关键页面白屏。

## Repair Workflow (强制)

1. 记录失败上下文（日志、命令、影响范围）。
2. 先修复故障。
3. 将修复策略写入调度脚本自愈记录。
4. 仅重跑失败项。
5. 通过后回到主计划继续执行。

## Plan Update Workflow (需你确认)

若执行中发现新约束或更优方案：

1. 暂停当前执行。
2. 提交变更提案（原因、收益、风险、替代方案）。
3. 等你确认后更新计划文件。
4. 基于新计划恢复执行。
