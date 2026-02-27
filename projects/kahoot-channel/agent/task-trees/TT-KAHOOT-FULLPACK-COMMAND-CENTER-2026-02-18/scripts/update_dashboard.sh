#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/Users/zhuxingzhe/Project/ExamBoard/25maths-website"
TREE_ROOT="/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18"
REPORT_DIR="$REPO_ROOT/projects/kahoot-channel/agent/reports"
WORK_INDEX="$TREE_ROOT/WORK-ITEMS.md"

CIE_BASE="$REPO_ROOT/projects/kahoot-channel/cie0580/micro-topics"
EDEX_BASE="$REPO_ROOT/projects/kahoot-channel/edexcel-4ma1/micro-topics"
CIE_QUEUE="$REPO_ROOT/projects/kahoot-channel/agent/queues/cie-pending-fullpack.txt"
EDEX_QUEUE="$REPO_ROOT/projects/kahoot-channel/agent/queues/edexcel-pending.txt"

"$REPO_ROOT/projects/kahoot-channel/agent/scripts/build_pending_queue.sh" \
  --out "$CIE_QUEUE" --base "$CIE_BASE" --require-full-pack >/dev/null
"$REPO_ROOT/projects/kahoot-channel/agent/scripts/build_pending_queue.sh" \
  --out "$EDEX_QUEUE" --base "$EDEX_BASE" --require-full-pack >/dev/null

cie_total=$(find "$CIE_BASE" -mindepth 2 -maxdepth 2 -type d | wc -l | tr -d ' ')
edex_total=$(find "$EDEX_BASE" -mindepth 2 -maxdepth 2 -type d | wc -l | tr -d ' ')
cie_pending=$(wc -l < "$CIE_QUEUE" | tr -d ' ')
edex_pending=$(wc -l < "$EDEX_QUEUE" | tr -d ' ')
cie_pass=$((cie_total - cie_pending))
edex_pass=$((edex_total - edex_pending))

health="GREEN"
if [[ "$cie_pending" != "0" || "$edex_pending" != "0" ]]; then
  health="AMBER"
fi

ts_local=$(date '+%Y-%m-%d %H:%M:%S %Z')
recent_reports=$(ls -1t "$REPORT_DIR" | head -n 8)

if [[ -x "$TREE_ROOT/scripts/sync_work_items_index.sh" ]]; then
  "$TREE_ROOT/scripts/sync_work_items_index.sh" >/dev/null
fi

open_n=0
inprog_n=0
blocked_n=0
done_n=0
if [[ -f "$WORK_INDEX" ]]; then
  open_n=$( (rg -n '\| OPEN \|' "$WORK_INDEX" || true) | wc -l | tr -d ' ' )
  inprog_n=$( (rg -n '\| IN_PROGRESS \|' "$WORK_INDEX" || true) | wc -l | tr -d ' ' )
  blocked_n=$( (rg -n '\| BLOCKED \|' "$WORK_INDEX" || true) | wc -l | tr -d ' ' )
  done_n=$( (rg -n '\| DONE \|' "$WORK_INDEX" || true) | wc -l | tr -d ' ' )
fi

cat > "$TREE_ROOT/DASHBOARD.md" <<MD
# Commander Dashboard

- Updated: \
  $ts_local
- Health: \
  $health

## Coverage
- CIE 0580: \
  pass=$cie_pass / total=$cie_total / pending=$cie_pending
- Edexcel 4MA1: \
  pass=$edex_pass / total=$edex_total / pending=$edex_pending

## Work Item Summary
- OPEN: $open_n
- IN_PROGRESS: $inprog_n
- BLOCKED: $blocked_n
- DONE: $done_n

## Latest Reports
$recent_reports

## Next Action
- If pending > 0: run \`$TREE_ROOT/scripts/dispatch_multi_agent.sh --provider codex --execute\`
- If pending = 0: keep baseline, run this dashboard script before next batch.
MD

cat > "$TREE_ROOT/STATE.json" <<JSON
{
  "updated_local": "$ts_local",
  "health": "$health",
  "cie": {
    "total": $cie_total,
    "pending": $cie_pending,
    "pass": $cie_pass
  },
  "edexcel": {
    "total": $edex_total,
    "pending": $edex_pending,
    "pass": $edex_pass
  }
}
JSON

echo "Dashboard updated: $TREE_ROOT/DASHBOARD.md"
echo "State updated: $TREE_ROOT/STATE.json"
