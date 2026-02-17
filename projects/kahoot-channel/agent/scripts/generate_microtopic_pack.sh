#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <backlog-csv> [limit]"
  exit 1
fi

csv="$1"
limit="${2:-9999}"
count=0
skipped_placeholder=0
allow_placeholder="${ALLOW_PLACEHOLDER:-0}"

is_status() {
  case "$1" in
    planned|ready|spec_lock_required|blocked|in_progress) return 0 ;;
    *) return 1 ;;
  esac
}

is_valid_tier_for_board() {
  local board="$1"
  local tier="$2"
  case "$board" in
    CIE0580)
      [[ "$tier" == "Core" || "$tier" == "Extended" || "$tier" == "Core|Extended" ]]
      ;;
    EDEXCEL4MA1)
      [[ "$tier" == "Foundation" || "$tier" == "Higher" || "$tier" == "Foundation|Higher" ]]
      ;;
    *)
      return 1
      ;;
  esac
}

slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g'
}

while IFS=, read -r board syllabus_code domain micro_topic tier status notes; do
  [[ "$board" == "board" ]] && continue

  # Backward compatibility with old 6-column CSV:
  # board,syllabus_code,domain,micro_topic,status,notes
  if is_status "$tier"; then
    notes="$status"
    status="$tier"
    tier="unassigned"
  fi

  if [[ "$status" != "planned" && "$status" != "spec_lock_required" ]]; then
    continue
  fi

  if ! is_valid_tier_for_board "$board" "$tier"; then
    continue
  fi

  if [[ "$allow_placeholder" != "1" ]] && echo "$micro_topic" | rg -qi 'syllabus micro-topic|\[Fill with exact official wording\]'; then
    skipped_placeholder=$((skipped_placeholder+1))
    continue
  fi

  board_slug=""
  case "$board" in
    CIE0580) board_slug="cie0580" ;;
    EDEXCEL4MA1) board_slug="edexcel-4ma1" ;;
    *) continue ;;
  esac

  code_slug="$(echo "$syllabus_code" | tr '[:upper:]' '[:lower:]' | tr '.' '-')"
  topic_slug="$(slugify "$micro_topic")"
  dir="/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel/${board_slug}/micro-topic-packs/${code_slug}-${topic_slug}"

  if [[ -d "$dir" ]]; then
    continue
  fi

  mkdir -p "$dir"

  cat > "$dir/kahoot-question-set.md" <<MD
# ${syllabus_code} Kahoot Question Set - ${micro_topic}

## Metadata
- Board: ${board}
- Domain: ${domain}
- Syllabus code: ${syllabus_code}
- Tier: ${tier}
- Status: draft

## Build rule
- 15 MCQ total: 5 fluency + 6 method + 4 exam-context.
- Include correct option and misconception distractors.
MD

  cat > "$dir/worksheet-student.md" <<MD
# Worksheet (Student)
## ${syllabus_code} ${micro_topic}

Name: ____________________   Date: ____________________

## Syllabus focus
- [Fill with exact official wording]

## Tier
- ${tier}

## Exam reminder
- [Add a one-line exam strategy reminder]

## Model example
- [Add one worked example]

## Practice (10)
1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 
9. 
10. 
MD

  cat > "$dir/worksheet-answers.md" <<MD
# Worksheet (Answers)
## ${syllabus_code} ${micro_topic}

Tier: ${tier}

1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 
9. 
10. 

## Marker notes
- [method marks and common errors]
MD

  cat > "$dir/listing-copy.md" <<MD
# Listing Copy - ${syllabus_code} ${micro_topic}

## Title
${syllabus_code} ${micro_topic} | Quiz + Worksheet

## Description
Exam-style practice pack aligned to ${syllabus_code}. Includes Kahoot questions, worksheet, and answers.

## Tags
#IGCSE #Maths #ExamStyle

## Suggested price
\$3.90
MD

  count=$((count+1))
  if [[ $count -ge $limit ]]; then
    break
  fi
done < "$csv"

echo "Generated $count micro-topic pack skeleton(s)."
echo "Skipped placeholder micro-topics: $skipped_placeholder"
