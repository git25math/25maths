#!/usr/bin/env bash
set -euo pipefail

TREE_ROOT="/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18"
WORK_DIR="$TREE_ROOT/work-items"
INDEX="$TREE_ROOT/WORK-ITEMS.md"

mkdir -p "$WORK_DIR"

{
  echo "# Work Items"
  echo
  echo "- Updated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo
  echo "| Task ID | Title | Status | Priority | Owner | Updated |"
  echo "|---|---|---|---|---|---|"

  shopt -s nullglob
  for f in "$WORK_DIR"/*.md; do
    id=$(basename "$f" .md)
    header=$(sed -n '1p' "$f")
    title="${header#\# $id - }"
    if [[ "$title" == "$header" ]]; then
      title="$header"
    fi
    status=$(sed -n 's/^- Status: //p' "$f" | head -n1)
    priority=$(sed -n 's/^- Priority: //p' "$f" | head -n1)
    owner=$(sed -n 's/^- Owner: //p' "$f" | head -n1)
    updated=$(sed -n 's/^- Updated: //p' "$f" | head -n1)
    echo "| $id | $title | $status | $priority | $owner | $updated |"
  done
} > "$INDEX"

echo "Updated: $INDEX"
