#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
QUALITY="${QUALITY:-78}"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp is required but not found in PATH"
  exit 1
fi

tmp_list="$(mktemp)"
find \
  "$ROOT_DIR/projects/kahoot-channel/cie0580/micro-topics" \
  "$ROOT_DIR/projects/kahoot-channel/edexcel-4ma1/micro-topics" \
  -type f -name 'cover-2320x1520-kahoot-minimal.png' | sort > "$tmp_list"

covers_count="$(wc -l < "$tmp_list" | tr -d ' ')"

if [[ "$covers_count" -eq 0 ]]; then
  rm -f "$tmp_list"
  echo "No cover PNG files found."
  exit 1
fi

created=0
updated=0
skipped=0

while IFS= read -r png; do
  webp="${png%.png}.webp"
  if [[ -f "$webp" && "$webp" -nt "$png" ]]; then
    skipped=$((skipped + 1))
    continue
  fi

  existed_before=0
  if [[ -f "$webp" ]]; then
    existed_before=1
  fi

  cwebp -quiet -q "$QUALITY" "$png" -o "$webp"
  if [[ -f "$webp" ]]; then
    if [[ -f "$webp" && ! -s "$webp" ]]; then
      echo "Failed to build $webp"
      exit 1
    fi
    if [[ "$existed_before" -eq 1 ]]; then
      updated=$((updated + 1))
    else
      created=$((created + 1))
    fi
  else
    echo "Failed to build $webp"
    rm -f "$tmp_list"
    exit 1
  fi
done < "$tmp_list"

rm -f "$tmp_list"

echo "WebP build complete"
echo "Total PNG covers: $covers_count"
echo "Updated/created WebP: $((created + updated))"
echo "Skipped (already up to date): $skipped"
