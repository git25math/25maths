#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PDF="${BASE_DIR}/international-gcse-in-mathematics-spec-a.pdf"
TXT="${BASE_DIR}/spec-a.txt"
TSV="${BASE_DIR}/official-subheadings.tsv"
MD="${BASE_DIR}/OFFICIAL-SUBHEADINGS-4MA1.md"

if ! command -v pdftotext >/dev/null 2>&1; then
  echo "Error: pdftotext is required but not installed." >&2
  exit 1
fi

pdftotext "$PDF" "$TXT"

awk '
function trim(s){ gsub(/^[ \t\r\f]+|[ \t\r\f]+$/, "", s); return s }
BEGIN{ mode="F"; seen_11=0 }
{
  t=trim($0)
  if (t ~ /^[1-6]\.[0-9]+$/) {
    if (t=="1.1") {
      seen_11++
      if (seen_11>=2) mode="H"
    }
    num=t
    title=""
    for (i=1; i<=6; i++) {
      if (getline nxt <= 0) break
      tt=trim(nxt)
      if (tt=="" || tt=="\f") {
        if (title!="") break
        continue
      }
      if (tt=="Notes" || tt=="See Foundation Tier" || tt ~ /^[A-Z]$/ || tt ~ /^[0-9]+$/ || tt ~ /^Students should be taught/ || tt ~ /^AO[0-9]/ || tt ~ /^[1-6]\.[0-9]+$/) {
        break
      }
      if (title=="") title=tt
      else title=title " " tt
    }
    if (title!="") print mode "\t" num "\t" title
  }
}' "$TXT" > "$TSV"

{
  echo "# Edexcel 4MA1 Official Subheadings (From PDF)"
  echo
  echo 'Source: `international-gcse-in-mathematics-spec-a.pdf`'
  echo
  echo "## Foundation Tier"
  awk -F'\t' '$1=="F" { printf("- %s %s\n", $2, $3) }' "$TSV"
  echo
  echo "## Higher Tier"
  awk -F'\t' '$1=="H" { printf("- %s %s\n", $2, $3) }' "$TSV"
} > "$MD"

echo "Generated:"
echo "- $TXT"
echo "- $TSV"
echo "- $MD"
