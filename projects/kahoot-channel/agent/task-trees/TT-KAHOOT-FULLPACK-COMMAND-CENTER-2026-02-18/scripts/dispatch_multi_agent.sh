#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  dispatch_multi_agent.sh --provider <codex|gemini> [--execute|--dry-run] [--task-id <id>] [--allow-empty-queue]

Behavior:
  - Rebuilds CIE/Edexcel full-pack queues
  - If both queues are empty: exits cleanly
  - If pending exists:
      --dry-run  : prints agent launch commands only
      --execute  : launches three agents sequentially (A -> B -> C)
USAGE
}

provider=""
mode="dry-run"
task_id="GENERAL"
allow_empty_queue=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --provider)
      provider="${2:-}"
      shift 2
      ;;
    --execute)
      mode="execute"
      shift
      ;;
    --dry-run)
      mode="dry-run"
      shift
      ;;
    --task-id)
      task_id="${2:-}"
      if [[ -z "$task_id" ]]; then
        echo "Missing value for --task-id"
        usage
        exit 1
      fi
      shift 2
      ;;
    --allow-empty-queue)
      allow_empty_queue=1
      shift
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

if [[ "$provider" != "codex" && "$provider" != "gemini" ]]; then
  echo "--provider must be codex or gemini"
  exit 1
fi

REPO_ROOT="/Users/zhuxingzhe/Project/ExamBoard/25maths-website"
TREE_ROOT="/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/task-trees/TT-KAHOOT-FULLPACK-COMMAND-CENTER-2026-02-18"
LOG_DIR="$TREE_ROOT/logs"
mkdir -p "$LOG_DIR"
TASK_LOG_DIR="$LOG_DIR/$task_id"
mkdir -p "$TASK_LOG_DIR"

CIE_QUEUE="$REPO_ROOT/projects/kahoot-channel/agent/queues/cie-pending-fullpack.txt"
EDEX_QUEUE="$REPO_ROOT/projects/kahoot-channel/agent/queues/edexcel-pending.txt"

echo "[Commander] Rebuilding queues..."
"$REPO_ROOT/projects/kahoot-channel/agent/scripts/build_pending_queue.sh" \
  --out "$CIE_QUEUE" \
  --base "$REPO_ROOT/projects/kahoot-channel/cie0580/micro-topics" \
  --require-full-pack >/dev/null

"$REPO_ROOT/projects/kahoot-channel/agent/scripts/build_pending_queue.sh" \
  --out "$EDEX_QUEUE" \
  --base "$REPO_ROOT/projects/kahoot-channel/edexcel-4ma1/micro-topics" \
  --require-full-pack >/dev/null

cie_n=$(wc -l < "$CIE_QUEUE" | tr -d ' ')
edex_n=$(wc -l < "$EDEX_QUEUE" | tr -d ' ')

echo "[Commander] Queue status: CIE=$cie_n, Edexcel=$edex_n"
if [[ "$cie_n" == "0" && "$edex_n" == "0" && "$allow_empty_queue" -eq 0 ]]; then
  echo "[Commander] No pending topics. Baseline remains clean."
  exit 0
fi

run_codex() {
  local prompt_file="$1"
  local log_file="$2"
  codex exec -C "$REPO_ROOT" --full-auto -m gpt-5-mini - < "$prompt_file" | tee "$log_file"
}

run_gemini() {
  local prompt_file="$1"
  local log_file="$2"
  gemini -p "$(cat "$prompt_file")" --approval-mode auto_edit --sandbox --model gemini-2.5-pro | tee "$log_file"
}

run_agent() {
  local prompt_file="$1"
  local name="$2"
  local log_file="$TASK_LOG_DIR/${name}-$(date +%Y%m%d-%H%M%S).log"

  echo "[Commander] Agent $name prompt: $prompt_file"
  echo "[Commander] Agent $name log: $log_file"

  if [[ "$mode" == "dry-run" ]]; then
    if [[ "$provider" == "codex" ]]; then
      echo "codex exec -C '$REPO_ROOT' --full-auto -m gpt-5-mini - < '$prompt_file'"
    else
      echo "gemini -p \"$(cat "$prompt_file" | tr '\n' ' ')\" --approval-mode auto_edit --sandbox --model gemini-2.5-pro"
    fi
    return 0
  fi

  if [[ "$provider" == "codex" ]]; then
    run_codex "$prompt_file" "$log_file"
  else
    run_gemini "$prompt_file" "$log_file"
  fi
}

run_agent "$TREE_ROOT/prompts/agent-a-generator-fixer.md" "A-generator-fixer"
run_agent "$TREE_ROOT/prompts/agent-b-worksheet-qa.md" "B-worksheet-qa"
run_agent "$TREE_ROOT/prompts/agent-c-pack-pdf-qa.md" "C-pack-pdf-qa"

echo "[Commander] Dispatch finished."
