#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  run_topic_gate.sh <topic-dir> [--generator-cmd "<command>"] [--skip-generation] [--require-full-pack]
  run_topic_gate.sh --topic <topic-dir> [--generator-cmd "<command>"] [--skip-generation] [--require-full-pack]

Compatibility aliases:
  --codex-cmd <command>       (alias of --generator-cmd)
  --antigravity-cmd <command> (alias of --generator-cmd)
  --skip-antigravity          (alias of --skip-generation)

Placeholders supported inside --generator-cmd:
  {topic_dir}
  {student_file}
  {answers_file}
  {kahoot_file}
  {listing_file}
  {task_template}
USAGE
}

if [[ $# -eq 0 ]]; then
  usage
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
validator="$script_dir/validate_worksheet.py"
quality_checker="$script_dir/quality_check_worksheet.py"
pack_quality_checker="$script_dir/quality_check_topic_pack.py"
builder="$script_dir/build_worksheet_pdf.sh"
task_template="$script_dir/../templates/antigravity-task.template.md"

topic_dir=""
generator_cmd=""
skip_generation=0
require_full_pack=0

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
    --generator-cmd|--codex-cmd|--antigravity-cmd)
      generator_cmd="${2:-}"
      if [[ -z "$generator_cmd" ]]; then
        echo "Missing value for $1"
        usage
        exit 1
      fi
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

for required in "$validator" "$quality_checker" "$builder"; do
  if [[ ! -f "$required" ]]; then
    echo "Missing required script: $required"
    exit 1
  fi
done
if [[ "$require_full_pack" -eq 1 && ! -f "$pack_quality_checker" ]]; then
  echo "Missing required script: $pack_quality_checker"
  exit 1
fi

if ! command -v pdfinfo >/dev/null 2>&1; then
  echo "Missing required command: pdfinfo"
  exit 1
fi

topic_dir="$(cd "$topic_dir" && pwd)"
student_file="$topic_dir/worksheet-student.md"
answers_file="$topic_dir/worksheet-answers.md"
kahoot_file="$topic_dir/kahoot-question-set.md"
listing_file="$topic_dir/listing-copy.md"

if [[ ! -f "$student_file" ]]; then
  echo "Missing worksheet file in: $topic_dir ($student_file)"
  exit 1
fi
if [[ ! -f "$answers_file" && ( "$skip_generation" -eq 1 || -z "$generator_cmd" ) ]]; then
  echo "Missing worksheet answers file in: $topic_dir ($answers_file)"
  exit 1
fi

log_dir="$topic_dir/.agent-gate"
mkdir -p "$log_dir"
ts="$(date +%Y%m%d-%H%M%S)"
log_file="$log_dir/$ts.log"

{
  echo "== Topic Gate =="
  echo "topic_dir=$topic_dir"
  echo "timestamp=$ts"
} > "$log_file"

if [[ "$skip_generation" -eq 0 && -n "$generator_cmd" ]]; then
  rendered_cmd="$generator_cmd"
  rendered_cmd="${rendered_cmd//\{topic_dir\}/$topic_dir}"
  rendered_cmd="${rendered_cmd//\{student_file\}/$student_file}"
  rendered_cmd="${rendered_cmd//\{answers_file\}/$answers_file}"
  rendered_cmd="${rendered_cmd//\{kahoot_file\}/$kahoot_file}"
  rendered_cmd="${rendered_cmd//\{listing_file\}/$listing_file}"
  rendered_cmd="${rendered_cmd//\{task_template\}/$task_template}"

  {
    echo "step=generator"
    echo "command=$rendered_cmd"
  } >> "$log_file"

  if ! bash -lc "$rendered_cmd" >> "$log_file" 2>&1; then
    echo "FAIL: Generator step failed. See $log_file"
    exit 1
  fi
fi

{
  echo "step=validate"
} >> "$log_file"
if ! "$validator" "$topic_dir" >> "$log_file" 2>&1; then
  echo "FAIL: Validation failed. See $log_file"
  exit 1
fi

{
  echo "step=quality_check"
} >> "$log_file"
if ! "$quality_checker" "$topic_dir" >> "$log_file" 2>&1; then
  echo "FAIL: Quality check failed. See $log_file"
  exit 1
fi

if [[ "$require_full_pack" -eq 1 ]]; then
  {
    echo "step=quality_check_topic_pack"
  } >> "$log_file"
  if ! "$pack_quality_checker" "$topic_dir" >> "$log_file" 2>&1; then
    echo "FAIL: Topic-pack quality check failed. See $log_file"
    exit 1
  fi
fi

{
  echo "step=build_pdf"
} >> "$log_file"
if ! "$builder" "$topic_dir" >> "$log_file" 2>&1; then
  echo "FAIL: PDF build failed. See $log_file"
  exit 1
fi

pdf_dir="$topic_dir/pdf"
full_pdf="$(ls -t "$pdf_dir"/*-worksheet-pack.pdf 2>/dev/null | head -n 1 || true)"
student_pdf="$(ls -t "$pdf_dir"/*-worksheet-student.pdf 2>/dev/null | head -n 1 || true)"

if [[ -z "$full_pdf" || -z "$student_pdf" ]]; then
  echo "FAIL: Missing expected PDF outputs in $pdf_dir. See $log_file"
  exit 1
fi

full_pages="$(pdfinfo "$full_pdf" | awk -F: '/^Pages/{gsub(/ /,"",$2); print $2}')"
student_pages="$(pdfinfo "$student_pdf" | awk -F: '/^Pages/{gsub(/ /,"",$2); print $2}')"

{
  echo "full_pdf=$full_pdf"
  echo "full_pages=$full_pages"
  echo "student_pdf=$student_pdf"
  echo "student_pages=$student_pages"
} >> "$log_file"

if [[ "$full_pages" != "3" ]]; then
  echo "FAIL: Full PDF page count must be 3, got $full_pages. See $log_file"
  exit 1
fi
if [[ "$student_pages" != "2" ]]; then
  echo "FAIL: Student PDF page count must be 2, got $student_pages. See $log_file"
  exit 1
fi

echo "PASS: $topic_dir"
echo "Log: $log_file"
