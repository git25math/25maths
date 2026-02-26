# Commander Orchestration

## 角色定义
1. Commander（总指挥）
- 维护任务树状态
- 分发任务给 agent
- 执行失败闭环和验收决策

2. Agent-A（Generator/Fixer）
- 负责生成逻辑更新与 bug 修复
- 出现失败时先修复根因

3. Agent-B（Worksheet QA）
- 负责 `validate_worksheet.py` + `quality_check_worksheet.py`

4. Agent-C（Pack/PDF QA）
- 负责 `quality_check_topic_pack.py` + PDF 页数规则

## 调度策略
- 先队列扫描，再分批执行。
- 任何 agent 失败 -> 全局暂停 -> 修复 -> 更新逻辑 -> 复测 -> 恢复批量。
- 禁止只追求吞吐，必须维持“每次修复提升基线”。

## 双引擎执行（Codex / Gemini CLI）
- Codex 适合：仓库内修复与命令编排。
- Gemini 适合：补充审题逻辑与文本质量复核。
- 统一通过 `scripts/dispatch_multi_agent.sh` 触发。
