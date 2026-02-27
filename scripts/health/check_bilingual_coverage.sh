#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

MARKER_REGEX='bilingual-support-only|data-bilingual-block|include bilingual/inline-note.html'
LOW_MARKER_WARN_THRESHOLD="${LOW_MARKER_WARN_THRESHOLD:-1}"

CORE_EFFECT_PAGES=(
  "index.html"
  "about.html"
  "cie0580/index.html"
  "cie0580/products.html"
  "cie0580/pricing.html"
  "cie0580/free/index.html"
  "edx4ma1/index.html"
  "edx4ma1/products.html"
  "edx4ma1/pricing.html"
  "edx4ma1/free/index.html"
  "exercises/index.html"
  "kahoot/index.html"
  "kahoot/cie0580/index.html"
  "kahoot/edexcel-4ma1/index.html"
  "free-gift.html"
  "subscription.html"
  "support.html"
  "blog/index.html"
  "terms.html"
  "privacy.html"
  "thanks.html"
  "gift-thanks.html"
  "support-thanks.html"
  "404.html"
  "membership/index.html"
)

EXPECTED_ZERO_MARKER_PAGES=(
  "admin/changelog.html"
  "free/index.html"
  "pricing.html"
  "products.html"
  "products/algebra.html"
  "products/functions.html"
  "products/number.html"
  "cie0580/products/algebra.html"
  "cie0580/products/functions.html"
  "cie0580/products/number.html"
  "projects/kahoot-channel/_templates/worksheet-pdf-template.html"
  "templates/emails/weekly-report.html"
)

failures=0
warnings=0

pass() {
  printf 'PASS: %s\n' "$1"
}

warn() {
  warnings=$((warnings + 1))
  printf 'WARN: %s\n' "$1"
}

fail() {
  failures=$((failures + 1))
  printf 'FAIL: %s\n' "$1"
}

count_markers() {
  local file="$1"
  local hits
  hits="$(rg -o -e "$MARKER_REGEX" "$file" || true)"
  if [[ -z "$hits" ]]; then
    printf '0'
  else
    printf '%s\n' "$hits" | wc -l | tr -d '[:space:]'
  fi
}

is_expected_zero_page() {
  local candidate="$1"
  local expected
  for expected in "${EXPECTED_ZERO_MARKER_PAGES[@]}"; do
    if [[ "$candidate" == "$expected" ]]; then
      return 0
    fi
  done
  return 1
}

echo "== Bilingual Coverage Check =="
echo "Root: $ROOT"

if ! command -v rg >/dev/null 2>&1; then
  fail "ripgrep (rg) is required for bilingual coverage checks."
  echo
  echo "== Summary =="
  echo "Failures: $failures"
  echo "Warnings: $warnings"
  exit 1
fi

echo "-- core effect pages --"
for core_page in "${CORE_EFFECT_PAGES[@]}"; do
  local_path="$ROOT/$core_page"
  if [[ ! -f "$local_path" ]]; then
    fail "Core page missing: $core_page"
    continue
  fi

  marker_count="$(count_markers "$local_path")"
  if [[ "$marker_count" -gt 0 ]]; then
    pass "Core page $core_page has bilingual markers (count=$marker_count)"
  else
    fail "Core page $core_page has zero bilingual markers"
  fi
done

echo
echo "-- canonical source scan --"
pushd "$ROOT" >/dev/null
source_html_files=()
while IFS= read -r candidate_file; do
  source_html_files+=("$candidate_file")
done < <(
  rg --files \
    -g '*.html' \
    -g '!_site/**' \
    -g '!_includes/**' \
    -g '!_layouts/**' \
    -g '!assets/**' \
    -g '!tests/**' \
    -g '!tasks/**' \
    -g '!scripts/**' \
    -g '!infra/**' \
    -g '!vendor/**' \
    -g '!node_modules/**'
)
popd >/dev/null

total=0
with_markers=0
zero_markers=0
low_markers=0

for file_path in "${source_html_files[@]}"; do
  if [[ "$file_path" == en/* || "$file_path" == zh-cn/* ]]; then
    continue
  fi

  total=$((total + 1))
  marker_count="$(count_markers "$ROOT/$file_path")"

  if [[ "$marker_count" -eq 0 ]]; then
    zero_markers=$((zero_markers + 1))
    if is_expected_zero_page "$file_path"; then
      pass "Expected zero-marker page: $file_path"
    else
      fail "Unexpected zero-marker canonical page: $file_path"
    fi
    continue
  fi

  with_markers=$((with_markers + 1))
  if [[ "$marker_count" -le "$LOW_MARKER_WARN_THRESHOLD" ]]; then
    low_markers=$((low_markers + 1))
    warn "Low marker density on $file_path (count=$marker_count)"
  fi
done

echo
echo "== Coverage Summary =="
echo "Canonical pages scanned: $total"
echo "Pages with markers: $with_markers"
echo "Pages with zero markers: $zero_markers"
echo "Low marker pages (<=${LOW_MARKER_WARN_THRESHOLD}): $low_markers"
echo "Failures: $failures"
echo "Warnings: $warnings"

if [[ "$failures" -gt 0 ]]; then
  exit 1
fi
