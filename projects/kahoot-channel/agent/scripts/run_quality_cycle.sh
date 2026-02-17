#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  run_quality_cycle.sh [options]

Options:
  --queue <queue-file>            Queue file path (default: agent/queues/cie-pending.txt)
  --base <base-dir>               Topic base directory to scan
  --report <report-file>          Markdown report output path
  --generator-cmd "<command>"     Generator command passed to run_batch_serial.sh
  --model <model>                 Model for default Codex generator command
  --force                         Force generator invocation for every topic
  --dry-run                       Dry run generator invocation (default generator only)
  --skip-generation               Validate/build only; do not generate
  --require-full-pack             Enforce kahoot/listing full-pack checks
  --start-from <N>                Start index in queue (default: 1)
  --max-topics <N>                Maximum topics to process this cycle (default: 3)
  -h, --help                      Show this help

Notes:
  - This script runs one quality cycle:
      1) build pending queue
      2) run serial batch (optional generation)
      3) rebuild pending queue
      4) write cycle report
  - Default generator command:
      run_codex_generator.sh --topic "{topic_dir}"
EOF
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
default_queue="$script_dir/../queues/cie-pending.txt"
default_base="/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics"
default_report="$script_dir/../reports/quality-cycle-latest.md"

queue_file="$default_queue"
base_dir="$default_base"
report_file="$default_report"
generator_cmd=""
model=""
force_generation=0
dry_run=0
skip_generation=0
require_full_pack=0
start_from=1
max_topics=3

extract_int() {
  local value="$1"
  value="$(echo "$value" | tr -dc '0-9')"
  if [[ -z "$value" ]]; then
    echo 0
  else
    echo "$value"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --queue)
      queue_file="${2:-}"
      if [[ -z "$queue_file" ]]; then
        echo "Missing value for --queue"
        usage
        exit 1
      fi
      shift 2
      ;;
    --base)
      base_dir="${2:-}"
      if [[ -z "$base_dir" ]]; then
        echo "Missing value for --base"
        usage
        exit 1
      fi
      shift 2
      ;;
    --report)
      report_file="${2:-}"
      if [[ -z "$report_file" ]]; then
        echo "Missing value for --report"
        usage
        exit 1
      fi
      shift 2
      ;;
    --generator-cmd)
      generator_cmd="${2:-}"
      if [[ -z "$generator_cmd" ]]; then
        echo "Missing value for --generator-cmd"
        usage
        exit 1
      fi
      shift 2
      ;;
    --model)
      model="${2:-}"
      if [[ -z "$model" ]]; then
        echo "Missing value for --model"
        usage
        exit 1
      fi
      shift 2
      ;;
    --force)
      force_generation=1
      shift
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --skip-generation)
      skip_generation=1
      shift
      ;;
    --require-full-pack)
      require_full_pack=1
      shift
      ;;
    --start-from)
      start_from="${2:-}"
      if [[ -z "$start_from" ]]; then
        echo "Missing value for --start-from"
        usage
        exit 1
      fi
      shift 2
      ;;
    --max-topics)
      max_topics="${2:-}"
      if [[ -z "$max_topics" ]]; then
        echo "Missing value for --max-topics"
        usage
        exit 1
      fi
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

if ! [[ "$start_from" =~ ^[0-9]+$ ]] || [[ "$start_from" -lt 1 ]]; then
  echo "Invalid --start-from value: $start_from (must be >= 1)"
  exit 1
fi
if ! [[ "$max_topics" =~ ^[0-9]+$ ]] || [[ "$max_topics" -lt 1 ]]; then
  echo "Invalid --max-topics value: $max_topics (must be >= 1)"
  exit 1
fi

build_queue="$script_dir/build_pending_queue.sh"
run_batch="$script_dir/run_batch_serial.sh"
codex_runner="$script_dir/run_codex_generator.sh"

for required in "$build_queue" "$run_batch" "$codex_runner"; do
  if [[ ! -f "$required" ]]; then
    echo "Missing required script: $required"
    exit 1
  fi
done

mkdir -p "$(dirname "$queue_file")"
mkdir -p "$(dirname "$report_file")"

if [[ "$skip_generation" -eq 1 && -n "$generator_cmd" ]]; then
  echo "Warning: --generator-cmd is ignored when --skip-generation is enabled."
fi
if [[ -n "$generator_cmd" && ( "$force_generation" -eq 1 || "$dry_run" -eq 1 || -n "$model" ) ]]; then
  echo "Warning: --model/--force/--dry-run only affect the default generator command."
fi

if [[ -z "$generator_cmd" ]]; then
  generator_cmd="$codex_runner --topic \"{topic_dir}\""
  if [[ -n "$model" ]]; then
    generator_cmd="$generator_cmd --model $model"
  fi
  if [[ "$force_generation" -eq 1 ]]; then
    generator_cmd="$generator_cmd --force"
  fi
  if [[ "$dry_run" -eq 1 ]]; then
    generator_cmd="$generator_cmd --dry-run"
  fi
fi

echo "== Quality Cycle: pre-scan =="
pre_cmd=( "$build_queue" --out "$queue_file" --base "$base_dir" )
if [[ "$require_full_pack" -eq 1 ]]; then
  pre_cmd+=( "--require-full-pack" )
fi
pre_output="$("${pre_cmd[@]}")"
echo "$pre_output"

scanned_before="$(echo "$pre_output" | awk -F': ' '/^Scanned topics:/ {print $2}' | tail -n 1)"
pending_before="$(echo "$pre_output" | awk -F': ' '/^Pending topics:/ {print $2}' | tail -n 1)"
scanned_before="$(extract_int "$scanned_before")"
pending_before="$(extract_int "$pending_before")"

batch_status="not-run"
batch_exit_code=0

if [[ "$pending_before" -eq 0 ]]; then
  batch_status="no-pending"
else
  if [[ "$start_from" -gt "$pending_before" ]]; then
    batch_status="start-out-of-range"
    batch_exit_code=2
    echo "FAIL: start index $start_from exceeds pending count $pending_before."
  else
    echo "== Quality Cycle: serial batch =="
    batch_cmd=( "$run_batch" "$queue_file" --start-from "$start_from" --max-topics "$max_topics" )
    if [[ "$require_full_pack" -eq 1 ]]; then
      batch_cmd+=( "--require-full-pack" )
    fi
    if [[ "$skip_generation" -eq 1 ]]; then
      batch_cmd+=( "--skip-generation" )
    else
      batch_cmd+=( "--generator-cmd" "$generator_cmd" )
    fi

    printf 'Batch command: '
    printf '%q ' "${batch_cmd[@]}"
    printf '\n'

    if "${batch_cmd[@]}"; then
      batch_status="pass"
    else
      batch_exit_code=$?
      batch_status="failed"
    fi
  fi
fi

echo "== Quality Cycle: post-scan =="
post_cmd=( "$build_queue" --out "$queue_file" --base "$base_dir" )
if [[ "$require_full_pack" -eq 1 ]]; then
  post_cmd+=( "--require-full-pack" )
fi
post_output="$("${post_cmd[@]}")"
echo "$post_output"

scanned_after="$(echo "$post_output" | awk -F': ' '/^Scanned topics:/ {print $2}' | tail -n 1)"
pending_after="$(echo "$post_output" | awk -F': ' '/^Pending topics:/ {print $2}' | tail -n 1)"
scanned_after="$(extract_int "$scanned_after")"
pending_after="$(extract_int "$pending_after")"

timestamp_utc="$(date -u +"%Y-%m-%d %H:%M:%SZ")"
{
  echo "# Worksheet Quality Cycle Report"
  echo
  echo "- Timestamp (UTC): $timestamp_utc"
  echo "- Base dir: $base_dir"
  echo "- Queue file: $queue_file"
  echo "- Batch status: $batch_status"
  if [[ "$batch_exit_code" -ne 0 ]]; then
    echo "- Batch exit code: $batch_exit_code"
  fi
  echo "- Start index: $start_from"
  echo "- Max topics: $max_topics"
  echo "- Skip generation: $skip_generation"
  echo "- Require full pack: $require_full_pack"
  if [[ "$skip_generation" -eq 0 ]]; then
    echo "- Generator command: \`$generator_cmd\`"
  fi
  echo "- Scanned topics (before): $scanned_before"
  echo "- Pending topics (before): $pending_before"
  echo "- Scanned topics (after): $scanned_after"
  echo "- Pending topics (after): $pending_after"
} > "$report_file"

echo "Report written: $report_file"
echo "Summary: before=$pending_before, after=$pending_after, status=$batch_status"

if [[ "$batch_exit_code" -ne 0 ]]; then
  exit "$batch_exit_code"
fi

exit 0
