#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  run_codex_generator.sh <topic-dir> [--template <template-file>] [--model <model>] [--force] [--dry-run]
  run_codex_generator.sh --topic <topic-dir> [--template <template-file>] [--model <model>] [--force] [--dry-run]

Defaults:
  template:
    /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/templates/antigravity-task.template.md

Behavior:
  - By default, this script skips Codex generation if the topic already passes
    structural + quality checks.
  - Use --force to always invoke Codex.
EOF
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
default_template="$script_dir/../templates/antigravity-task.template.md"
validator="$script_dir/validate_worksheet.py"
quality_checker="$script_dir/quality_check_worksheet.py"

topic_dir=""
template="$default_template"
model=""
force=0
dry_run=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --topic|--topic-dir)
      topic_dir="${2:-}"
      if [[ -z "$topic_dir" ]]; then
        echo "Missing value for $1"
        usage
        exit 1
      fi
      shift 2
      ;;
    --template)
      template="${2:-}"
      if [[ -z "$template" ]]; then
        echo "Missing value for --template"
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
      force=1
      shift
      ;;
    --dry-run)
      dry_run=1
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
      if [[ -z "$topic_dir" ]]; then
        topic_dir="$1"
        shift
      else
        echo "Unexpected argument: $1"
        usage
        exit 1
      fi
      ;;
  esac
done

if [[ -z "$topic_dir" ]]; then
  echo "Missing topic directory."
  usage
  exit 1
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "Missing required command: codex"
  exit 1
fi

if [[ ! -f "$template" ]]; then
  echo "Template file not found: $template"
  exit 1
fi

topic_dir="$(cd "$topic_dir" && pwd)"
student_file="$topic_dir/worksheet-student.md"
answers_file="$topic_dir/worksheet-answers.md"

if [[ ! -f "$student_file" || ! -f "$answers_file" ]]; then
  echo "Missing worksheet files in: $topic_dir"
  exit 1
fi

if [[ "$force" -eq 0 ]]; then
  if "$validator" "$topic_dir" --quiet >/dev/null 2>&1 \
    && "$quality_checker" "$topic_dir" >/dev/null 2>&1; then
    echo "SKIP: already valid and quality-pass ($topic_dir)"
    exit 0
  fi
fi

repo_root="$(git -C "$topic_dir" rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$repo_root" ]]; then
  repo_root="$topic_dir"
fi

prompt="$(cat "$template")"
prompt="${prompt//\{topic_dir\}/$topic_dir}"
prompt="${prompt//\{student_file\}/$student_file}"
prompt="${prompt//\{answers_file\}/$answers_file}"
prompt="${prompt//\{task_template\}/$template}"

cmd=( codex exec -C "$repo_root" --sandbox workspace-write )
if [[ -n "$model" ]]; then
  cmd+=( --model "$model" )
fi
cmd+=( "$prompt" )

if [[ "$dry_run" -eq 1 ]]; then
  printf 'DRY RUN: '
  printf '%q ' "${cmd[@]}"
  printf '\n'
  exit 0
fi

"${cmd[@]}"
