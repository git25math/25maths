# Kahoot Full-Pack Command Center (Task Tree)

## 目标
把本轮对话中的沟通决策、质量策略、已实现能力和验收基线，迁移到独立任务树中，作为后续并行优化的唯一指挥与追踪入口。

## 当前状态
- 任务树类型：质量优先（Quality-first）
- 管理范围：CIE 0580 + Edexcel 4MA1 全量 micro-topics
- 基线结论：两套考纲当前均通过 full-pack gate

## 已迁移内容
- 沟通决策与约束：`COMMUNICATION-TRANSFER.md`
- 功能实现与文件映射：`IMPLEMENTATION-TRANSFER.md`
- 当前基线快照：`STATE-SNAPSHOT.md`
- 任务分解树：`TASK-TREE.md`
- 多 agent 指挥方案：`COMMANDER-ORCHESTRATION.md`
- 可执行操作流程：`RUNBOOK.md`
- Prompt 模板：`prompts/`
- 调度脚本：`scripts/dispatch_multi_agent.sh`
- 关键历史快照：`snapshot/`

## 你后续只需要看这两个入口
1. 指挥入口：`COMMANDER-ORCHESTRATION.md`
2. 执行入口：`RUNBOOK.md`

## 实时看板
- 更新命令：`scripts/update_dashboard.sh`
- 产物：
- `DASHBOARD.md`（人读）
- `STATE.json`（程序读）

## 工作项管理（并行任务隔离）
- 创建任务：`scripts/create_work_item.sh --title "..."`
- 更新任务状态：`scripts/update_work_item.sh --task-id <id> --status IN_PROGRESS --log "..."`
- 重建任务索引：`scripts/sync_work_items_index.sh`
- 索引文件：`WORK-ITEMS.md`
