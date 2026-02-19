#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HEAD_FILE="$ROOT/_includes/head.html"

KEY_PAGES=(
  "$ROOT/index.html"
  "$ROOT/en/index.html"
  "$ROOT/zh-cn/index.html"
  "$ROOT/cie0580/index.html"
  "$ROOT/cie0580/free/index.html"
  "$ROOT/en/cie0580/index.html"
  "$ROOT/en/cie0580/free/index.html"
  "$ROOT/zh-cn/cie0580/index.html"
  "$ROOT/zh-cn/cie0580/free/index.html"
  "$ROOT/edx4ma1/index.html"
  "$ROOT/edx4ma1/free/index.html"
  "$ROOT/kahoot/index.html"
  "$ROOT/kahoot/cie0580/index.html"
  "$ROOT/kahoot/edexcel-4ma1/index.html"
  "$ROOT/zh-cn/kahoot/index.html"
)

HERO_CTA_CIE_PAGES=(
  "$ROOT/cie0580/index.html"
  "$ROOT/en/cie0580/index.html"
  "$ROOT/zh-cn/cie0580/index.html"
)

HERO_CTA_EDX_PAGES=(
  "$ROOT/edx4ma1/index.html"
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

if ! command -v rg >/dev/null 2>&1; then
  echo "FAIL: ripgrep (rg) is required for style checks. Install it first (e.g. 'brew install ripgrep')." >&2
  exit 1
fi

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
    count="$(rg -c 'ui-focus-ring|include ui/cta-link.html' "$file" || true)"
    if [[ "$count" -gt 0 ]]; then
      pass "Key page $name: focus-token semantics usage count=$count"
    else
      fail "Key page $name: missing focus-token semantics usage"
    fi
  done
}

check_hero_cta_tokenization() {
  local file

  for file in "${HERO_CTA_CIE_PAGES[@]}"; do
    local name
    name="${file#"$ROOT/"}"
    require_file "$file" "CIE hero page $name" || continue

    local count
    count="$(rg -c 'cta-btn-equal[^"]*cie-soft-bg[^"]*border[^"]*cie-soft-border[^"]*cie-solid-text' "$file" || true)"
    if [[ "$count" -ge 3 ]]; then
      pass "CIE hero page $name: primary CTA buttons use cie-soft token semantics count=$count"
    else
      fail "CIE hero page $name: expected >=3 cie-soft hero CTA buttons, found $count"
    fi
  done

  for file in "${HERO_CTA_EDX_PAGES[@]}"; do
    local name
    name="${file#"$ROOT/"}"
    require_file "$file" "Edexcel hero page $name" || continue

    local count
    count="$(rg -c 'cta-btn-equal[^"]*edx-soft-bg[^"]*border[^"]*edx-soft-border[^"]*edx-soft-text' "$file" || true)"
    if [[ "$count" -ge 3 ]]; then
      pass "Edexcel hero page $name: primary CTA buttons use edx-soft token semantics count=$count"
    else
      fail "Edexcel hero page $name: expected >=3 edx-soft hero CTA buttons, found $count"
    fi

    if rg -q 'edx-hero-outline-hover|border-2 border-white' "$file"; then
      fail "Edexcel hero page $name: found legacy hero outline CTA classes"
    else
      pass "Edexcel hero page $name: no legacy hero outline CTA classes"
    fi
  done
}

check_cross_board_copy_isolation() {
  local edx_free="$ROOT/edx4ma1/free/index.html"
  local cie_free="$ROOT/cie0580/free/index.html"

  require_file "$edx_free" "Edexcel free page" || return
  require_file "$cie_free" "CIE free page" || return

  if rg -q 'CIE 0580|Cambridge IGCSE' "$edx_free"; then
    fail "Edexcel free page: found CIE/Cambridge copy contamination"
  else
    pass "Edexcel free page: no CIE/Cambridge copy contamination"
  fi

  if rg -q '4MA1|Edexcel' "$cie_free"; then
    fail "CIE free page: found Edexcel/4MA1 copy contamination"
  else
    pass "CIE free page: no Edexcel/4MA1 copy contamination"
  fi
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
    if rg -q 'token-chip token-chip-sm|include ui/board-status-chip.html' "$file"; then
      pass "Board product page $name: status badges use token-chip semantics"
    else
      fail "Board product page $name: missing token-chip status badge semantics"
    fi
  done
}

echo "== Style Consistency Check =="
check_head_tokens
check_no_solid_text_conflicts
check_legacy_focus_chain_absent
check_ui_focus_adoption
check_hero_cta_tokenization
check_cross_board_copy_isolation
check_board_presale_tokenization

echo "== Summary =="
echo "Failures: $failures"
echo "Warnings: $warnings"

if [[ "$failures" -gt 0 ]]; then
  exit 1
fi
