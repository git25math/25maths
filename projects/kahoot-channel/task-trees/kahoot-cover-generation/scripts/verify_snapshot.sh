#!/usr/bin/env bash
set -euo pipefail

BASE="$(cd "$(dirname "$0")/.." && pwd)"
SN="$BASE/snapshot"

fail=0

require_file() {
  local p="$1"
  if [ ! -f "$p" ]; then
    echo "[MISSING FILE] $p"
    fail=1
  fi
}

require_dir() {
  local p="$1"
  if [ ! -d "$p" ]; then
    echo "[MISSING DIR] $p"
    fail=1
  fi
}

require_dir "$SN/free-showcase"
require_dir "$SN/cie0580/course-packs"
require_dir "$SN/edexcel-4ma1/course-packs"
require_dir "$SN/_templates/coming-soon"

require_file "$SN/course-pack-listing-copy-all.md"
require_file "$SN/cie0580/COURSE-PACK-TOPICS.md"
require_file "$SN/edexcel-4ma1/COURSE-PACK-TOPICS.md"
require_file "$SN/edexcel-4ma1/OFFICIAL-SUBHEADINGS-4MA1.md"
require_file "$SN/free-showcase/FREE-SAMPLE-ISSUE-LOG.zh-CN.md"

cie_pack_count=$(find "$SN/cie0580/course-packs" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
edx_pack_count=$(find "$SN/edexcel-4ma1/course-packs" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
free_item_count=$(find "$SN/free-showcase" -mindepth 2 -maxdepth 2 -type d | wc -l | tr -d ' ')

printf "CIE course packs: %s\n" "$cie_pack_count"
printf "Edexcel course packs: %s\n" "$edx_pack_count"
printf "Free showcase items: %s\n" "$free_item_count"

if [ "$cie_pack_count" -lt 18 ]; then
  echo "[WARN] CIE course pack count is below expected (18)."
fi
if [ "$edx_pack_count" -lt 12 ]; then
  echo "[WARN] Edexcel course pack count is below expected (12)."
fi
if [ "$free_item_count" -lt 16 ]; then
  echo "[WARN] Free showcase item count is below expected (16)."
fi

if [ "$fail" -ne 0 ]; then
  echo "Snapshot verification FAILED."
  exit 1
fi

echo "Snapshot verification OK."
