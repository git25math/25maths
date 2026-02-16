#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/zhuxingzhe/Project/ExamBoard/25maths-website"
SRC="$ROOT/payhip/presale/kahoot-presale-info-template.md"
OUT="$ROOT/payhip/presale/kahoot-presale-info-template.pdf"

if [[ ! -f "$SRC" ]]; then
  echo "Missing source markdown: $SRC" >&2
  exit 1
fi

pandoc "$SRC" -o "$OUT" --pdf-engine=xelatex -V geometry:margin=1in

echo "Built: $OUT"
