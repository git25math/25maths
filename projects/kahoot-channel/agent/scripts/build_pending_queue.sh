#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  build_pending_queue.sh [output-queue-file] [base-dir]
  build_pending_queue.sh --out <output-queue-file> [--base <base-dir>] [--require-full-pack]

Default base-dir:
  /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics

Default output queue:
  /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/queues/cie-pending.txt

This script writes topic directories that fail structural or quality checks to the queue file.
With --require-full-pack, it also enforces kahoot/listing pack checks.
EOF
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
validator="$script_dir/validate_worksheet.py"
quality_checker="$script_dir/quality_check_worksheet.py"
pack_quality_checker="$script_dir/quality_check_topic_pack.py"
default_out="$script_dir/../queues/cie-pending.txt"
default_base="/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/cie0580/micro-topics"

out="$default_out"
base="$default_base"
require_full_pack=0
positionals=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --out)
      out="${2:-}"
      if [[ -z "$out" ]]; then
        echo "Missing value for --out"
        usage
        exit 1
      fi
      shift 2
      ;;
    --base)
      base="${2:-}"
      if [[ -z "$base" ]]; then
        echo "Missing value for --base"
        usage
        exit 1
      fi
      shift 2
      ;;
    --require-full-pack)
      require_full_pack=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
    *)
      positionals+=( "$1" )
      shift
      ;;
  esac
done

if [[ "${#positionals[@]}" -ge 1 ]]; then
  out="${positionals[0]}"
fi
if [[ "${#positionals[@]}" -ge 2 ]]; then
  base="${positionals[1]}"
fi
if [[ "${#positionals[@]}" -gt 2 ]]; then
  echo "Too many positional arguments."
  usage
  exit 1
fi

mkdir -p "$(dirname "$out")"
: > "$out"

total=0
pending=0

while IFS= read -r student; do
  [[ -f "$student" ]] || continue
  topic_dir="$(dirname "$student")"
  total=$((total+1))

  if ! "$validator" "$topic_dir" --quiet >/dev/null 2>&1 \
    || ! "$quality_checker" "$topic_dir" >/dev/null 2>&1; then
    echo "$topic_dir" >> "$out"
    pending=$((pending+1))
    continue
  fi

  if [[ "$require_full_pack" -eq 1 ]]; then
    if [[ ! -f "$pack_quality_checker" ]]; then
      echo "Missing required script: $pack_quality_checker"
      exit 1
    fi
    if ! "$pack_quality_checker" "$topic_dir" >/dev/null 2>&1; then
      echo "$topic_dir" >> "$out"
      pending=$((pending+1))
    fi
  fi
done < <(find "$base" -type f -name 'worksheet-student.md' | sort)

echo "Queue written: $out"
echo "Scanned topics: $total"
echo "Pending topics: $pending"
