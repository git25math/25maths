# Runbook

## 0) 工作目录
```bash
cd /Users/zhuxingzhe/Project/ExamBoard/25maths-website
```

## 1) 创建或选择工作项（并行隔离）
```bash
ROOT=/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18
$ROOT/scripts/create_work_item.sh --title "your task title" --priority P1 --owner Commander
$ROOT/scripts/sync_work_items_index.sh
```

## 2) 重建双考纲队列
```bash
projects/kahoot-channel/agent/scripts/build_pending_queue.sh \
  --out projects/kahoot-channel/agent/queues/cie-pending-fullpack.txt \
  --base /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics \
  --require-full-pack

projects/kahoot-channel/agent/scripts/build_pending_queue.sh \
  --out projects/kahoot-channel/agent/queues/edexcel-pending.txt \
  --base /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/edexcel-4ma1/micro-topics \
  --require-full-pack
```

## 3) Commander 预演（不触发模型）
```bash
projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18/scripts/dispatch_multi_agent.sh --provider codex --dry-run --task-id WI-20260218-BASELINE-COMMANDER
projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18/scripts/dispatch_multi_agent.sh --provider gemini --dry-run --task-id WI-20260218-BASELINE-COMMANDER
```

## 4) Commander 实际执行（触发多 agent）
```bash
projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18/scripts/dispatch_multi_agent.sh --provider codex --execute --task-id WI-20260218-BASELINE-COMMANDER
# 或
projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18/scripts/dispatch_multi_agent.sh --provider gemini --execute --task-id WI-20260218-BASELINE-COMMANDER
```

## 5) 状态更新与看板同步
```bash
ROOT=/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18
$ROOT/scripts/update_work_item.sh --task-id WI-20260218-BASELINE-COMMANDER --status IN_PROGRESS --log "batch dispatched"
$ROOT/scripts/update_dashboard.sh
```

## 6) 失败处理（必须）
- 查看失败 topic 下最新 `.agent-gate/*.log`
- 修复后更新：
- 生成逻辑（generator）
- 验收逻辑（quality checker / validator）
- 回到同一 topic 复测，确认通过后继续批量
