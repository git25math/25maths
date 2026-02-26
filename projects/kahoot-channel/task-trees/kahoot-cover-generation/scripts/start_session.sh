#!/usr/bin/env bash
set -euo pipefail

BASE="$(cd "$(dirname "$0")/.." && pwd)"

echo "== Kahoot Cover Task Tree Session =="
echo "Task root: $BASE"
echo

echo "1) Refresh snapshot from live"
"$BASE/scripts/sync_from_live.sh"
echo

echo "2) Verify snapshot integrity"
"$BASE/scripts/verify_snapshot.sh"
echo

echo "3) Read handoff docs"
echo "- $BASE/TASK-STATE.md"
echo "- $BASE/CONVERSATION-SUMMARY.zh-CN.md"
echo "- $BASE/snapshot/free-showcase/CODEX-HANDOFF-2026-02-17.md"
echo "- $BASE/NEXT-ACTIONS.md"
