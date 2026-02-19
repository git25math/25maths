#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HEAD_FILE="$ROOT/_includes/head.html"

KEY_PAGES=(
  "$ROOT/index.html"
  "$ROOT/en/index.html"
  "$ROOT/zh-cn/index.html"
  "$ROOT/cie0580/index.html"
  "$ROOT/en/cie0580/index.html"
  "$ROOT/zh-cn/cie0580/index.html"
  "$ROOT/edx4ma1/index.html"
  "$ROOT/kahoot/index.html"
  "$ROOT/kahoot/cie0580/index.html"
  "$ROOT/kahoot/edexcel-4ma1/index.html"
  "$ROOT/zh-cn/kahoot/index.html"
)

BOARD_PRESALE_PAGES=(
  "$ROOT/cie0580/products.html"
  "$ROOT/cie0580/pricing.html"
  "$ROOT/en/cie0580/products.html"
  "$ROOT/en/cie0580/pricing.html"
  "$ROOT/zh-cn/cie0580/products.html"
  "$ROOT/zh-cn/cie0580/pricing.html"
  "$ROOT/edx4ma1/products.html"
  "$ROOT/edx4ma1/pricing.html"
)

BOARD_PRODUCT_PAGES=(
  "$ROOT/cie0580/products.html"
  "$ROOT/en/cie0580/products.html"
  "$ROOT/zh-cn/cie0580/products.html"
  "$ROOT/edx4ma1/products.html"
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

require_file() {
  local file="$1"
  local label="$2"
  if [[ ! -f "$file" ]]; then
    fail "$label: missing file $file"
    return 1
  fi
  return 0
}

check_head_tokens() {
  if ! require_file "$HEAD_FILE" "Head include"; then
    return
  fi

  local marker
  for marker in \
    '.token-chip {' \
    '.token-chip-live {' \
    '.ui-focus-ring:focus-visible {' \
    '.cta-btn-equal:active,' \
    '.cta-card-btn:active {'; do
    if rg -F -q "$marker" "$HEAD_FILE"; then
      pass "Head include: marker present '$marker'"
    else
      fail "Head include: missing marker '$marker'"
    fi
  done
}

check_no_solid_text_conflicts() {
  local conflict_pattern='class="[^"]*(cie-solid-bg|edx-solid-bg)[^"]*text-white|class="[^"]*text-white[^"]*(cie-solid-bg|edx-solid-bg)'
  local hits
  hits="$(rg -n "$conflict_pattern" "$ROOT" --glob '*.html' --glob '*.js' --glob '!_site/**' --glob '!node_modules/**' --glob '!vendor/**' || true)"
  if [[ -n "$hits" ]]; then
    fail "Found solid-token text conflicts (expected no text-white paired with cie/edx-solid-bg)"
    printf '%s\n' "$hits"
  else
    pass "No cie/edx solid-token text conflicts detected"
  fi
}

check_legacy_focus_chain_absent() {
  local legacy_pattern='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900'
  local hits
  hits="$(rg -n "$legacy_pattern" "$ROOT" --glob '*.html' --glob '*.js' --glob '!_site/**' --glob '!node_modules/**' --glob '!vendor/**' || true)"
  if [[ -n "$hits" ]]; then
    fail "Legacy focus class chain still present (expected ui-focus-ring token usage)"
    printf '%s\n' "$hits"
  else
    pass "Legacy focus class chain removed"
  fi
}

check_ui_focus_adoption() {
  local file
  for file in "${KEY_PAGES[@]}"; do
    local name
    name="${file#"$ROOT/"}"
    if ! require_file "$file" "Key page $name"; then
      continue
    fi

    local count
    count="$(rg -c 'ui-focus-ring' "$file" || true)"
    if [[ "$count" -gt 0 ]]; then
      pass "Key page $name: ui-focus-ring usage count=$count"
    else
      fail "Key page $name: missing ui-focus-ring usage"
    fi
  done
}

check_board_presale_tokenization() {
  local file
  for file in "${BOARD_PRESALE_PAGES[@]}"; do
    local name
    name="${file#"$ROOT/"}"
    require_file "$file" "Board presale page $name" || continue
  done

  local amber_hits
  amber_hits="$(rg -n 'bg-amber-|text-amber-|border-amber-' "${BOARD_PRESALE_PAGES[@]}" || true)"
  if [[ -n "$amber_hits" ]]; then
    fail "Found residual amber status/warning classes on board presale pages (expected board token surfaces)"
    printf '%s\n' "$amber_hits"
  else
    pass "Board presale pages: no residual amber status/warning classes"
  fi

  local legacy_cie_dark_hits
  legacy_cie_dark_hits="$(rg -n 'bg-gray-900 text-white rounded-xl p-6' "$ROOT/cie0580/products.html" "$ROOT/en/cie0580/products.html" "$ROOT/zh-cn/cie0580/products.html" || true)"
  if [[ -n "$legacy_cie_dark_hits" ]]; then
    fail "Found legacy CIE dark mega-bundle block (expected cie-soft token surface)"
    printf '%s\n' "$legacy_cie_dark_hits"
  else
    pass "CIE products: mega-bundle surface uses cie-soft tokens"
  fi

  for file in "${BOARD_PRODUCT_PAGES[@]}"; do
    local name
    name="${file#"$ROOT/"}"
    if rg -q 'token-chip token-chip-sm' "$file"; then
      pass "Board product page $name: token-chip status badges present"
    else
      fail "Board product page $name: missing token-chip status badges"
    fi
  done
}

echo "== Style Consistency Check =="
check_head_tokens
check_no_solid_text_conflicts
check_legacy_focus_chain_absent
check_ui_focus_adoption
check_board_presale_tokenization

echo "== Summary =="
echo "Failures: $failures"
echo "Warnings: $warnings"

if [[ "$failures" -gt 0 ]]; then
  exit 1
fi
