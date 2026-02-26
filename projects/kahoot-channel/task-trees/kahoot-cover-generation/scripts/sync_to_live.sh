#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/zhuxingzhe/Project/ExamBoard/25maths-website/projects/kahoot-channel"
TT="$ROOT/task-trees/kahoot-cover-generation"
SN="$TT/snapshot"

# Controlled sync: only Kahoot-cover related domains
rsync -a "$SN/free-showcase/" "$ROOT/free-showcase/"
rsync -a "$SN/cie0580/course-packs/" "$ROOT/cie0580/course-packs/"
rsync -a "$SN/edexcel-4ma1/course-packs/" "$ROOT/edexcel-4ma1/course-packs/"
rsync -a "$SN/_templates/coming-soon/" "$ROOT/_templates/coming-soon/"

cp -f "$SN/cie0580/COURSE-PACK-TOPICS.md" "$ROOT/cie0580/COURSE-PACK-TOPICS.md"
cp -f "$SN/edexcel-4ma1/COURSE-PACK-TOPICS.md" "$ROOT/edexcel-4ma1/COURSE-PACK-TOPICS.md"
cp -f "$SN/course-pack-listing-copy-all.md" "$ROOT/course-pack-listing-copy-all.md"

echo "Snapshot applied to live Kahoot paths."
