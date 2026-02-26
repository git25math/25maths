#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  update_work_item.sh --task-id <id> [--status OPEN|IN_PROGRESS|BLOCKED|DONE] [--owner <name>] [--priority P1|P2|P3] [--log "message"]
USAGE
}

task_id=""
status=""
owner=""
priority=""
log_msg=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task-id)
      task_id="${2:-}"
      shift 2
      ;;
    --status)
      status="${2:-}"
      shift 2
      ;;
    --owner)
      owner="${2:-}"
      shift 2
      ;;
    --priority)
      priority="${2:-}"
      shift 2
      ;;
    --log)
      log_msg="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$task_id" ]]; then
  echo "--task-id is required"
  exit 1
fi

TREE_ROOT="/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18"
item="$TREE_ROOT/work-items/$task_id.md"
if [[ ! -f "$item" ]]; then
  echo "Task not found: $item"
  exit 1
fi

now=$(date '+%Y-%m-%d %H:%M:%S %Z')

if [[ -n "$status" ]]; then
  sed -i '' -E "s|^- Status: .*|- Status: $status|" "$item"
fi
if [[ -n "$owner" ]]; then
  sed -i '' -E "s|^- Owner: .*|- Owner: $owner|" "$item"
fi
if [[ -n "$priority" ]]; then
  sed -i '' -E "s|^- Priority: .*|- Priority: $priority|" "$item"
fi

sed -i '' -E "s|^- Updated: .*|- Updated: $now|" "$item"

if [[ -n "$log_msg" ]]; then
  printf -- '- %s | %s\n' "$now" "$log_msg" >> "$item"
fi

"$TREE_ROOT/scripts/sync_work_items_index.sh" >/dev/null

echo "Updated: $item"
