# Member System Command Center

> Updated: 2026-02-18 (UTC)
> Branch baseline: `main` + `codex/member-system-dev`
> Commander: Codex

## 1) North Star

构建一套完整会员系统，支持从免费会员到付费会员的自然升级，并通过学习数据闭环提升学习效果与续费率。

目标能力分层：

1. 免费会员（Free）
- 邮箱登录与账号身份
- 互动练习进度记录
- 做题轨迹和错题记录
- 个人学习仪表盘基础视图

2. 付费会员（Paid）
- 基于错题标签的针对性学习计划推荐
- 个性化薄弱环节强化路径
- 订阅优惠权益
- 课程包优惠券权益

3. 运营与增长（Ops/Growth）
- Payhip 与站内会员权益打通
- 会员下载权限精确控制
- 发布新题库时同时支持 Payhip 与站内权益发放

## 2) Non-Negotiable Operating Rules

1. 每一步执行前必须对照主计划。
2. 任一环节报错，立即 Stop-The-Line（停止当前流水线）。
3. 先修复再继续；修复过程必须沉淀到脚本/规则文件（自更新）。
4. 发现计划偏移时，先提交变更提案，待你确认后再执行。
5. 未通过 DoD（Definition of Done）不得进入下一阶段。

## 3) Change Control Protocol (必须先请示)

当出现以下任一情况，必须暂停并更新计划：

1. 目标范围变化（例如新增权益、调整分层逻辑）。
2. 安全策略变化（RLS、密钥、Webhook 校验逻辑）。
3. 成本显著变化（SMTP、第三方服务、推送成本）。
4. 开发路径变化（技术方案替换、数据模型重构）。

提案模板：

1. 变更项
2. 触发原因
3. 原计划风险
4. 新方案收益（为什么更优）
5. 影响范围（代码/数据/上线/回滚）
6. 需要你的确认点

## 4) Agent Topology (多线程)

## Commander: Codex
- 负责总体调度、依赖管理、集成验收、风险仲裁。
- 审批每个阶段的 DoD。

## Agent-Codex-Backend
- 负责 Supabase Schema/RLS、Webhook、下载授权 API。
- 输出：可运行代码 + 验证脚本 + 风险说明。

## Agent-Codex-Frontend
- 负责登录体验、练习数据上报、会员中心可视化。
- 输出：前端交互与兼容性验证结果。

## Agent-Gemini-Architect
- 负责方案校验、边界条件、回滚路径、成本与扩展性评审。
- 输出：架构审查与改进建议。

## Agent-Gemini-QA
- 负责测试矩阵、异常路径、回归清单、上线闸门。
- 输出：测试清单 + 失败复现路径 + 修复建议。

## 5) Master Delivery Streams

1. S0: 调度底座
- 统一调度脚本（Codex + Gemini）
- 失败即停 + 自动修复回写 + 单项重试

2. S1: 身份与基础数据层（Free 基础）
- Auth 登录、profiles、exercise_sessions、question_attempts

3. S2: 会员权益层（Paid 能力）
- membership_status、entitlements、升级判定

4. S3: 运营对接层
- Payhip Webhook -> 会员状态/权益
- 会员下载网关

5. S4: 学习体验层
- 错题聚类
- 针对性推荐学习计划
- 优惠券/订阅优惠展示与触发

6. S5: 发布与增长层
- 双通道发布（Payhip + 站内）
- 上线验证与回滚演练

## 6) Definition of Done (Phase Gate)

## Gate A (Free MVP)
1. 登录可用
2. 练习进度可记录
3. 错题可追踪
4. 匿名流程不退化

## Gate B (Paid MVP)
1. 支付后会员状态更新成功
2. 付费会员可拿到对应权益
3. 非会员访问受限资源被正确拦截

## Gate C (Personalization)
1. 会员中心显示错题弱点与推荐路径
2. 推荐逻辑可解释（基于 skill_tag）
3. 优惠券/订阅优惠展示逻辑正确

## Gate D (Production Readiness)
1. 端到端冒烟全绿
2. 异常分支有清晰报错与日志
3. 回滚脚本与清单可执行

## 7) Gate Status Snapshot (2026-02-18 UTC)

1. Gate A (Free MVP): pass
- 登录链路可用，回跳兼容 `access_token/code/token_hash`。
- 免费会员 session/attempt/complete 记录链路可用。
- 匿名练习仍可运行（云端失败不阻塞）。

2. Gate B (Paid MVP): in_progress
- `membership_status`、`entitlements`、`benefits`、`download` API 已完成实现。
- 待补：Payhip 实际事件到下载授权的生产链路实测证据。

3. Gate C (Personalization): in_progress
- 已有错题聚类 + 推荐卡展示（含频次与近期窗口加权）。
- 待补：推荐权重与课程包映射策略强化。

4. Gate D (Production Readiness): in_progress
- 已形成可重复 Gate 验证脚本与运行证据。
- 待补：回滚演练与异常注入测试报告。

## 8) Evidence and Audit Trail

所有执行证据统一落盘：

- 运行记录：`plan/member-agent-runs/<timestamp>/`
- 指挥中枢：`plan/MEMBER-SYSTEM-COMMAND-CENTER.md`
- 工作看板：`plan/MEMBER-SYSTEM-WORKBOARD.md`
- 执行总计划：`plan/MEMBER-LEARNING-PLATFORM-EXECUTION-PLAN.md`
- 自愈规则：`scripts/member/dispatch_member_agents.selfheal.md`

最新证据：

1. `plan/member-agent-runs/20260218T123710Z/`
- 首轮并行触发 stop-the-line（codex auth 401）。
- 修复动作：调度脚本新增 codex 预检探测 + 环境净化策略。

2. `plan/member-agent-runs/20260218T124247Z/`
- 第二轮并行成功收敛（backend/frontend/architect/qa 全部落盘）。
- 输出用于驱动 W3/W4/W5 第一批代码硬化。

3. `plan/member-agent-runs/20260218T205629Z/`
- `dispatch gate` 顺序验证全绿（jekyll/node/supabase/health checks）。
- 同步修复并沉淀了 Supabase CLI 并发认证冲突规避策略。

4. `plan/member-agent-runs/20260218T210315Z/`
- 在推荐加权改动后再次通过 `dispatch gate` 回归验证。
- 证明当前 P3 第一轮改造未引入构建或数据链路回归。

5. `plan/member-agent-runs/20260218T212638Z/`
- 在 webhook/reconcile 增强退款回收 entitlement 后通过 `dispatch gate` 回归验证。
- 证明 `refunded/cancel/subscription.deleted` 场景硬化未引入构建或迁移回归。

6. `plan/member-agent-runs/20260218T213543Z/`
- 在 `membership/benefits` 触发规则引擎（metadata.trigger）与前端权益原因展示改造后，通过 `dispatch gate` 回归验证。
- 证明 W7 第一轮（规则驱动优惠）未引入构建或数据链路回归。
