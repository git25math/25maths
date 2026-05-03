# Member Learning Platform Execution Plan

> Updated: 2026-02-18 (UTC)
> Scope: Free member foundation + paid member personalization + dual-channel content rights
> 2026-05-03 update: Online exercise telemetry in this plan is retired. The active member platform scope is auth, entitlements, downloads, engagement surfaces, and recommendations that point to free packs/Kahoot.

Supporting files:
- `plan/MEMBER-SYSTEM-COMMAND-CENTER.md`
- `plan/MEMBER-SYSTEM-WORKBOARD.md`
- `plan/MEMBER-SYSTEM-API-CONTRACTS.md`

## 1) Product Intent (Confirmed)

目标产品是一个“学习体验驱动”的会员系统：

1. 免费会员
- 注册登录
- 做题进度记录
- 错题轨迹记录

2. 付费会员
- 基于错题的针对性学习计划推荐
- 基于薄弱环节的学习路径强化
- 订阅优惠
- 课程包优惠券权益

3. 运营闭环
- Payhip 购买行为同步到站内会员权益
- 新题库发布时支持 Payhip 与站内下载双通道

## 2) Architecture Baseline

1. Frontend: Jekyll + Cloudflare Pages
2. Identity/Data: Supabase Auth + Postgres + RLS
3. Billing Sync: Payhip Webhook -> membership_status + entitlements
4. Access Gateway: `/api/v1/download/:release_id`
5. Telemetry: exercise_sessions + question_attempts

## 3) Phased Delivery

## Phase P0 - Orchestration Foundation

Deliverables:
1. 多 agent 调度脚本（Codex + Gemini）
2. 失败即停机制
3. 自愈回写机制（失败原因与修复规则沉淀）

DoD:
1. 并行任务可运行
2. 单任务失败会中断总流程
3. 可自动记录修复建议并重跑失败项

## Phase P1 - Free Member Foundation

Deliverables:
1. 登录与会话可用
2. 进度记录（session）
3. 错题记录（attempt）

DoD:
1. 登录回跳稳定
2. 会员中心可看到基础学习数据
3. 匿名用户仍可练习（不写云端数据）

## Phase P2 - Paid Membership Core

Deliverables:
1. 付费状态同步
2. 权益表生效
3. 会员下载授权网关

DoD:
1. Payhip 事件可驱动会员状态更新
2. 非会员被正确拒绝
3. 会员可获取短时签名链接

## Phase P3 - Personalization Layer

Deliverables:
1. 错题标签聚类
2. 学习计划推荐卡片
3. 薄弱环节强化路径

DoD:
1. 推荐结果可解释（基于 skill_tag 统计）
2. 会员可一键跳转到推荐练习

## Phase P4 - Commercial Benefits Layer

Deliverables:
1. 订阅优惠规则
2. 课程包优惠券显示与发放逻辑
3. 权益可追踪日志

DoD:
1. 仅付费会员可见相应优惠
2. 优惠触发逻辑稳定且可审计

## Phase P5 - Release and Hardening

Deliverables:
1. 冒烟测试矩阵
2. 回滚手册
3. 发布清单

DoD:
1. E2E 流程通过
2. 关键异常分支可复现可修复
3. 生产监控指标完整

## 3.1) Delivery Status Snapshot (2026-02-18 UTC)

1. P0: done（调度与 stop-the-line、自愈记录已落盘）
2. P1: done（登录回跳、免费会员学习面板、session/attempt 记录链路已打通）
3. P2: in_progress（Webhook + reconcile + 下载网关已上线代码，待真实支付事件与下载 E2E）
4. P3: in_progress（基于错题标签的推荐卡已上线，待推荐排序与解释性增强）
5. P4: in_progress（权益由 DB 配置驱动，待优惠券发放策略自动化）
6. P5: in_progress（Gate 脚本与验证证据已建立，待发布回滚演练）

## 4) Security & Reliability Standards

1. `service_role` 仅用于服务器端，禁止前端暴露。
2. 所有会员数据表强制 RLS。
3. Webhook 必须验签并做幂等。
4. 云端写入失败不阻塞做题主流程。
5. 下载链接默认短时有效（建议 <= 600 秒）。

## 5) Execution Governance

1. 每一步执行前必须回看计划。
2. 计划偏移时必须停下并提交变更提案。
3. 变更提案必须先经你确认。
4. 修复必须回写到脚本自愈规则，防止重复故障。

## 6) Immediate Next Actions

1. 已完成 Gate 验证并落盘：`plan/member-agent-runs/20260218T213543Z/`（build/node/supabase/QA 全绿）。
2. 已将 Gate 流程写入调度脚本：`scripts/member/dispatch_member_agents.sh gate`（顺序执行，避免 Supabase 并发认证冲突）。
3. 已完成 P2 一轮硬化：`refunded/cancel/subscription.deleted` 事件会回收（失效）对应 entitlement。
4. 下一步执行 P2 闭环验证：用 Payhip sandbox/真实测试事件打通 `webhook -> membership_status -> entitlements -> /api/v1/download/:release_id`。
5. 已完成 P3 第一轮：推荐逻辑已从“频次排序”升级为“错题频次 + 最近窗口”加权。
6. 已完成 P4 第一轮：`member_benefit_offers.metadata.trigger` 已支持优惠触发规则（近期错题/活跃度/skill 前缀）。
7. 已新增命令行验证脚本：`scripts/member/e2e_payhip_flow.sh`（可直接回放 Payhip 事件并检查 reconcile/download）。
