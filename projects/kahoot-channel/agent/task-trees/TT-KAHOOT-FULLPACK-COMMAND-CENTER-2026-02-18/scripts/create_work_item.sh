#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  create_work_item.sh --title "<title>" [--priority P1|P2|P3] [--owner <name>] [--task-id <id>]
USAGE
}

title=""
priority="P1"
owner="Commander"
task_id=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title)
      title="${2:-}"
      shift 2
      ;;
    --priority)
      priority="${2:-P1}"
      shift 2
      ;;
    --owner)
      owner="${2:-Commander}"
      shift 2
      ;;
    --task-id)
      task_id="${2:-}"
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

if [[ -z "$title" ]]; then
  echo "--title is required"
  exit 1
fi

TREE_ROOT="/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18"
WORK_DIR="$TREE_ROOT/work-items"
TPL="$TREE_ROOT/templates/work-item-template.md"
mkdir -p "$WORK_DIR"

if [[ -z "$task_id" ]]; then
  slug=$(printf '%s' "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g; s/-+/-/g')
  task_id="WI-$(date +%Y%m%d-%H%M)-${slug}"
fi

out="$WORK_DIR/$task_id.md"
if [[ -f "$out" ]]; then
  echo "Task already exists: $out"
  exit 1
fi

now=$(date '+%Y-%m-%d %H:%M:%S %Z')
sed \
  -e "s|{{TASK_ID}}|$task_id|g" \
  -e "s|{{TITLE}}|$title|g" \
  -e "s|{{CREATED_AT}}|$now|g" \
  "$TPL" > "$out"

# update fields
sed -i '' -e "s|^- Priority: .*|- Priority: $priority|" "$out"
sed -i '' -e "s|^- Owner: .*|- Owner: $owner|" "$out"

echo "Created: $out"
