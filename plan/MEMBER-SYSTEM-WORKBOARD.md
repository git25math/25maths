# Member System Workboard

> Updated: 2026-02-18
> Branch focus: `main` + `codex/member-system-dev`
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
| W1 | 免费会员 Auth + Profile | Codex-Backend | todo | W0 | 登录、会话、基础资料可用，重定向配置正确 |
| W2 | 练习进度与错题数据链路 | Codex-Frontend | todo | W1 | session/attempt 成功写入，匿名流程不受影响 |
| W3 | 付费会员状态与权益模型 | Codex-Backend | in_progress | W1 | membership_status/entitlements 与 RLS 完整 |
| W4 | Payhip Webhook 同步 | Codex-Backend | in_progress | W3 | 订单事件可驱动会员状态与权益变更，幂等生效 |
| W5 | 会员下载网关 | Codex-Backend | in_progress | W3, W4 | 非会员拒绝，会员签名链接可用且短时有效 |
| W6 | 个性化学习推荐 | Codex-Frontend + Gemini-Architect | in_progress | W2, W3 | 基于错题标签输出针对性学习计划 |
| W7 | 优惠券与订阅优惠权益 | Codex-Backend + Codex-Frontend | in_progress | W3, W4 | 付费会员可见可用优惠策略，策略判定可追踪 |
| W8 | QA 回归与发布闸门 | Gemini-QA + Commander | todo | W1-W7 | E2E 冒烟通过，回滚清单可执行 |

## Current Iteration (Now)

1. 已完成 W0 调度脚本升级与停线修复（codex 401 -> 预检探测 + 环境净化）。
2. 已完成并行 agent 运行：`plan/member-agent-runs/20260218T124247Z/`。
3. 正在执行 W3/W4/W5 后端硬化补丁（webhook 幂等追踪 + 下载授权加固）。
4. 正在执行 W6/W7 前端层改造（错题推荐卡 + 付费权益可见性）。
5. 已执行 `dispatch qa`，题库与练习健康检查全绿（Failures=0）。
6. 已新增 `membership/reconcile` 与 `membership/benefits` API，开始打通登录后自动补偿与权益动态读取。
7. 已修复登录回跳路径到 `/membership/`，并在补偿完成后自动刷新会员学习面板。
8. 已增强 Supabase 登录回跳兼容：支持 `access_token`、`code`、`token_hash` 三类回跳参数，并在失败时提供页面内提示。
9. 已将会员权益读取升级为 DB 优先：`member_benefit_offers` 可配置优惠策略，env 仅作兜底。
10. 已修复 Supabase 迁移历史冲突（`20260218` -> `20260218000000`），当前 `supabase db push --include-all` 可稳定通过。

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
