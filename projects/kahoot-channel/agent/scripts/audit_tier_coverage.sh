#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <backlog-csv> [board-label]"
  exit 1
fi

csv="$1"
label="${2:-$(basename "$csv")}" 

if [[ ! -f "$csv" ]]; then
  echo "CSV not found: $csv"
  exit 1
fi

total=$(($(wc -l < "$csv") - 1))
placeholder=$(awk -F',' 'NR>1{if (tolower($4) ~ /syllabus micro-topic|\[fill with exact official wording\]/) c++} END{print c+0}' "$csv")
ready=$(awk -F',' 'NR>1{if ($6=="ready") c++} END{print c+0}' "$csv")
planned=$(awk -F',' 'NR>1{if ($6=="planned") c++} END{print c+0}' "$csv")
spec_lock=$(awk -F',' 'NR>1{if ($6=="spec_lock_required") c++} END{print c+0}' "$csv")

core=$(awk -F',' 'NR>1{if ($5 ~ /Core/) c++} END{print c+0}' "$csv")
extended=$(awk -F',' 'NR>1{if ($5 ~ /Extended/) c++} END{print c+0}' "$csv")
foundation=$(awk -F',' 'NR>1{if ($5 ~ /Foundation/) c++} END{print c+0}' "$csv")
higher=$(awk -F',' 'NR>1{if ($5 ~ /Higher/) c++} END{print c+0}' "$csv")

cat <<EOF
== $label ==
total=$total
ready=$ready
planned=$planned
spec_lock_required=$spec_lock
placeholder=$placeholder
tier_core=$core
tier_extended=$extended
tier_foundation=$foundation
tier_higher=$higher
EOF
