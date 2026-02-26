#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel"
TT="$ROOT/task-trees/kahoot-cover-generation"
SN="$TT/snapshot"

mkdir -p "$SN/cie0580" "$SN/edexcel-4ma1" "$SN/_templates"

rsync -a --delete "$ROOT/free-showcase/" "$SN/free-showcase/"
rsync -a --delete "$ROOT/cie0580/course-packs/" "$SN/cie0580/course-packs/"
rsync -a --delete "$ROOT/edexcel-4ma1/course-packs/" "$SN/edexcel-4ma1/course-packs/"
rsync -a --delete "$ROOT/_templates/coming-soon/" "$SN/_templates/coming-soon/"

cp -f "$ROOT/cie0580/COURSE-PACK-TOPICS.md" "$SN/cie0580/COURSE-PACK-TOPICS.md"
cp -f "$ROOT/edexcel-4ma1/COURSE-PACK-TOPICS.md" "$SN/edexcel-4ma1/COURSE-PACK-TOPICS.md"
cp -f "$ROOT/course-pack-listing-copy-all.md" "$SN/course-pack-listing-copy-all.md"

cp -f "$ROOT/edexcel-4ma1/OFFICIAL-SUBHEADINGS-4MA1.md" "$SN/edexcel-4ma1/OFFICIAL-SUBHEADINGS-4MA1.md"
cp -f "$ROOT/edexcel-4ma1/official-subheadings.tsv" "$SN/edexcel-4ma1/official-subheadings.tsv"
mkdir -p "$SN/edexcel-4ma1/scripts"
cp -f "$ROOT/edexcel-4ma1/scripts/extract_official_subheadings.sh" "$SN/edexcel-4ma1/scripts/extract_official_subheadings.sh"

{
  echo "free_showcase_files=$(find "$SN/free-showcase" -type f | wc -l | tr -d ' ')"
  echo "cie_course_pack_files=$(find "$SN/cie0580/course-packs" -type f | wc -l | tr -d ' ')"
  echo "edx_course_pack_files=$(find "$SN/edexcel-4ma1/course-packs" -type f | wc -l | tr -d ' ')"
  echo "coming_soon_files=$(find "$SN/_templates/coming-soon" -type f | wc -l | tr -d ' ')"
} > "$SN/COUNTS.txt"

echo "Snapshot refreshed."
cat "$SN/COUNTS.txt"
