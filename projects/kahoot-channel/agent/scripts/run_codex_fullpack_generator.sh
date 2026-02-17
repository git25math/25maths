#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  run_codex_fullpack_generator.sh <topic-dir> [--template <template-file>] [--model <model>] [--gemini-model <model>] [--force] [--dry-run]
  run_codex_fullpack_generator.sh --topic <topic-dir> [--template <template-file>] [--model <model>] [--gemini-model <model>] [--force] [--dry-run]

Defaults:
  template:
    /Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/agent/templates/topic-pack-task.template.md

Behavior:
  - By default, this script skips Codex generation if the topic already passes
    worksheet + full-pack quality checks.
  - If Codex fails, it falls back to Gemini CLI when available.
  - Use --force to always invoke Codex.
EOF
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
default_template="$script_dir/../templates/topic-pack-task.template.md"
validator="$script_dir/validate_worksheet.py"
quality_checker="$script_dir/quality_check_worksheet.py"
pack_quality_checker="$script_dir/quality_check_topic_pack.py"

topic_dir=""
template="$default_template"
model=""
gemini_model="gemini-2.5-pro"
force=0
dry_run=0
fallback_gemini=1

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
    --gemini-model)
      gemini_model="${2:-}"
      if [[ -z "$gemini_model" ]]; then
        echo "Missing value for --gemini-model"
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
    --no-fallback-gemini)
      fallback_gemini=0
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

for required in "$validator" "$quality_checker" "$pack_quality_checker"; do
  if [[ ! -f "$required" ]]; then
    echo "Missing required script: $required"
    exit 1
  fi
done

if [[ ! -f "$template" ]]; then
  echo "Template file not found: $template"
  exit 1
fi

topic_dir="$(cd "$topic_dir" && pwd)"
student_file="$topic_dir/worksheet-student.md"
answers_file="$topic_dir/worksheet-answers.md"
kahoot_file="$topic_dir/kahoot-question-set.md"
listing_file="$topic_dir/listing-copy.md"

if [[ ! -f "$student_file" ]]; then
  echo "Missing required student worksheet file: $student_file"
  exit 1
fi

if [[ "$force" -eq 0 ]]; then
  if "$validator" "$topic_dir" --quiet >/dev/null 2>&1 \
    && "$quality_checker" "$topic_dir" >/dev/null 2>&1 \
    && "$pack_quality_checker" "$topic_dir" >/dev/null 2>&1; then
    echo "SKIP: already passes full-pack gates ($topic_dir)"
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
prompt="${prompt//\{kahoot_file\}/$kahoot_file}"
prompt="${prompt//\{listing_file\}/$listing_file}"
prompt="${prompt//\{task_template\}/$template}"

cmd=( codex exec -C "$repo_root" --sandbox workspace-write )
if [[ -n "$model" ]]; then
  cmd+=( --model "$model" )
fi
cmd+=( "$prompt" )

gemini_cmd=( gemini --approval-mode yolo )
if [[ -n "$gemini_model" ]]; then
  gemini_cmd+=( -m "$gemini_model" )
fi
gemini_cmd+=( -p "$prompt" )

if [[ "$dry_run" -eq 1 ]]; then
  if command -v codex >/dev/null 2>&1; then
    printf 'DRY RUN (codex): '
    printf '%q ' "${cmd[@]}"
    printf '\n'
  else
    echo "DRY RUN (codex): command not found"
  fi
  if [[ "$fallback_gemini" -eq 1 ]]; then
    if command -v gemini >/dev/null 2>&1; then
      printf 'DRY RUN (gemini fallback): '
      printf '%q ' "${gemini_cmd[@]}"
      printf '\n'
    else
      echo "DRY RUN (gemini fallback): command not found"
    fi
  fi
  exit 0
fi

codex_exit=127
if command -v codex >/dev/null 2>&1; then
  if "${cmd[@]}"; then
    exit 0
  else
    codex_exit=$?
    echo "WARN: Codex generation failed (exit=$codex_exit)." >&2
  fi
else
  echo "WARN: Codex command not found." >&2
fi

if [[ "$fallback_gemini" -eq 1 && -x "$(command -v gemini 2>/dev/null || true)" ]]; then
  echo "INFO: Falling back to Gemini generation..." >&2
  "${gemini_cmd[@]}"
  exit $?
fi

echo "FAIL: generation failed and Gemini fallback is unavailable." >&2
exit "$codex_exit"
