#!/usr/bin/env bash
set -euo pipefail

base="${1:-/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/edexcel-4ma1}"

all=0
placeholder=0
ready=0

while IFS= read -r f; do
  all=$((all+1))
  if rg -qi 'syllabus micro-topic|\[Fill with exact official wording\]|^##[[:space:]]*T[0-9]+\.[0-9]+[[:space:]]+T[0-9]+\.[0-9]+' "$f"; then
    placeholder=$((placeholder+1))
    echo "PLACEHOLDER: ${f%/worksheet-student.md}"
  else
    ready=$((ready+1))
    echo "READY: ${f%/worksheet-student.md}"
  fi
done < <(find "$base" -type f -name 'worksheet-student.md' | sort)

echo "---"
echo "total=$all"
echo "ready=$ready"
echo "placeholder=$placeholder"
