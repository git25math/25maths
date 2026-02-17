#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <backlog-csv>"
  exit 1
fi

src="$1"
if [[ ! -f "$src" ]]; then
  echo "CSV not found: $src"
  exit 1
fi

dir="$(dirname "$src")"
base="$(basename "$src" .csv)"
header='board,syllabus_code,domain,micro_topic,tier,status,notes'

out_core="$dir/${base}-core.csv"
out_extended="$dir/${base}-extended.csv"
out_foundation="$dir/${base}-foundation.csv"
out_higher="$dir/${base}-higher.csv"

echo "$header" > "$out_core"
echo "$header" > "$out_extended"
echo "$header" > "$out_foundation"
echo "$header" > "$out_higher"

awk -F',' -v OC="$out_core" -v OE="$out_extended" -v OF="$out_foundation" -v OH="$out_higher" 'NR>1 {
  board=$1; code=$2; domain=$3; micro=$4; tier=$5; status=$6; notes=$7;
  if (tier ~ /Core/) print board","code","domain","micro",Core,"status","notes >> OC;
  if (tier ~ /Extended/) print board","code","domain","micro",Extended,"status","notes >> OE;
  if (tier ~ /Foundation/) print board","code","domain","micro",Foundation,"status","notes >> OF;
  if (tier ~ /Higher/) print board","code","domain","micro",Higher,"status","notes >> OH;
}' "$src"

echo "Wrote: $out_core"
echo "Wrote: $out_extended"
echo "Wrote: $out_foundation"
echo "Wrote: $out_higher"

for f in "$out_core" "$out_extended" "$out_foundation" "$out_higher"; do
  if [[ $(wc -l < "$f") -le 1 ]]; then
    rm -f "$f"
  fi
done

for f in "$out_core" "$out_extended" "$out_foundation" "$out_higher"; do
  if [[ -f "$f" ]]; then
    echo "Kept: $f"
  fi
done
