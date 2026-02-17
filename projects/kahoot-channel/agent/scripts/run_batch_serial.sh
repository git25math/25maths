#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: run_batch_serial.sh <queue-file> [--generator-cmd "<command>"] [--start-from N] [--max-topics N] [--skip-generation]

Queue file format:
  - One topic directory path per line
  - Empty lines and lines starting with # are ignored

Compatibility aliases:
  --codex-cmd <command>       (alias of --generator-cmd)
  --antigravity-cmd <command> (alias of --generator-cmd)
  --skip-antigravity          (alias of --skip-generation)
  --require-full-pack         (enforce kahoot/listing pack checks in topic gate)
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

queue_file="$1"
shift || true

if [[ ! -f "$queue_file" ]]; then
  echo "Queue file not found: $queue_file"
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
topic_gate="$script_dir/run_topic_gate.sh"

generator_cmd=""
start_from=1
max_topics=0
skip_generation=0
require_full_pack=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --generator-cmd|--codex-cmd|--antigravity-cmd)
      generator_cmd="${2:-}"
      if [[ -z "$generator_cmd" ]]; then
        echo "Missing value for $1"
        usage
        exit 1
      fi
      shift 2
      ;;
    --start-from)
      start_from="${2:-1}"
      shift 2
      ;;
    --max-topics)
      max_topics="${2:-0}"
      shift 2
      ;;
    --skip-generation|--skip-antigravity)
      skip_generation=1
      shift
      ;;
    --require-full-pack)
      require_full_pack=1
      shift
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

topics=()
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  [[ "$line" =~ ^# ]] && continue
  topics+=( "$line" )
done < "$queue_file"

total="${#topics[@]}"

if [[ "$total" -eq 0 ]]; then
  echo "No topics found in queue: $queue_file"
  exit 0
fi

if ! [[ "$start_from" =~ ^[0-9]+$ ]] || [[ "$start_from" -lt 1 ]] || [[ "$start_from" -gt "$total" ]]; then
  echo "Invalid --start-from value: $start_from (must be 1..$total)"
  exit 1
fi

if ! [[ "$max_topics" =~ ^[0-9]+$ ]] || [[ "$max_topics" -lt 0 ]]; then
  echo "Invalid --max-topics value: $max_topics (must be >= 0)"
  exit 1
fi

end_index="$total"
if [[ "$max_topics" -gt 0 ]]; then
  end_index=$((start_from + max_topics - 1))
  if [[ "$end_index" -gt "$total" ]]; then
    end_index="$total"
  fi
fi

echo "Queue: $queue_file"
echo "Total topics: $total"
echo "Start index: $start_from"
if [[ "$max_topics" -gt 0 ]]; then
  echo "Max topics this run: $max_topics"
fi
if [[ "$require_full_pack" -eq 1 ]]; then
  echo "Require full pack: 1"
fi

for ((i=start_from; i<=end_index; i++)); do
  topic_dir="${topics[$((i-1))]}"
  echo "[${i}/${total}] $topic_dir"

  cmd=( "$topic_gate" "$topic_dir" )
  if [[ "$require_full_pack" -eq 1 ]]; then
    cmd+=( "--require-full-pack" )
  fi
  if [[ "$skip_generation" -eq 1 ]]; then
    cmd+=( "--skip-generation" )
  elif [[ -n "$generator_cmd" ]]; then
    cmd+=( "--generator-cmd" "$generator_cmd" )
  fi

  if ! "${cmd[@]}"; then
    echo "STOP: failed at item $i ($topic_dir)"
    exit 1
  fi
done

echo "DONE: all topics passed."
