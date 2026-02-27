#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

GLOBAL_NAV_FILE="$ROOT/_includes/global-nav.html"
FOOTER_FILE="$ROOT/_includes/footer.html"
SITE_INDEX_FILE="$ROOT/index.html"
SITE_EN_INDEX_FILE="$ROOT/en/index.html"
SITE_ZH_INDEX_FILE="$ROOT/zh-cn/index.html"

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

count_occurrences() {
  local needle="$1"
  local haystack_file="$2"
  (rg -F -o "$needle" "$haystack_file" || true) | wc -l | tr -d ' '
}

count_occurrences_text() {
  local needle="$1"
  local text="$2"
  (printf '%s' "$text" | rg -F -o "$needle" || true) | wc -l | tr -d ' '
}

first_line_no_text() {
  local needle="$1"
  local text="$2"
  local line
  line="$(printf '%s' "$text" | rg -nF "$needle" | head -n1 | cut -d: -f1 || true)"
  printf '%s' "$line"
}

check_order_in_section() {
  local section_label="$1"
  local section_text="$2"
  local a='<a href="{{ exercises_path }}"'
  local b='<a href="{{ kahoot_path }}"'
  local c='<a href="{{ membership_path }}"'

  local ca cb cc
  ca="$(count_occurrences_text "$a" "$section_text")"
  cb="$(count_occurrences_text "$b" "$section_text")"
  cc="$(count_occurrences_text "$c" "$section_text")"

  [[ "$ca" == "1" ]] || fail "$section_label: '$a' appears $ca time(s), expected 1"
  [[ "$cb" == "1" ]] || fail "$section_label: '$b' appears $cb time(s), expected 1"
  [[ "$cc" == "1" ]] || fail "$section_label: '$c' appears $cc time(s), expected 1"

  local la lb lc
  la="$(first_line_no_text "$a" "$section_text")"
  lb="$(first_line_no_text "$b" "$section_text")"
  lc="$(first_line_no_text "$c" "$section_text")"

  if [[ -n "$la" && -n "$lb" && -n "$lc" && "$la" -lt "$lb" && "$lb" -lt "$lc" ]]; then
    pass "$section_label: order verified (Interactive Exercises -> Kahoot -> Membership)"
  else
    fail "$section_label: marker order mismatch; expected Interactive Exercises -> Kahoot -> Membership"
  fi
}

check_global_nav() {
  if ! require_file "$GLOBAL_NAV_FILE" "Global nav"; then
    return
  fi

  local desktop_section
  desktop_section="$(awk '
    /class="hidden md:flex items-center space-x-1"/ {capture=1}
    capture {print}
    /<!-- Mobile menu button -->/ {capture=0; exit}
  ' "$GLOBAL_NAV_FILE")"

  local mobile_section
  mobile_section="$(awk '
    /<div id="global-mobile-menu"/ {capture=1}
    capture {print}
  ' "$GLOBAL_NAV_FILE")"

  if [[ -z "$desktop_section" ]]; then
    fail "Global nav desktop: failed to locate section"
  else
    check_order_in_section "Global nav desktop" "$desktop_section"
  fi

  if [[ -z "$mobile_section" ]]; then
    fail "Global nav mobile: failed to locate section"
  else
    check_order_in_section "Global nav mobile" "$mobile_section"
  fi

  local marker
  for marker in \
    '<a href="{{ exercises_path }}"' \
    '<a href="{{ kahoot_path }}"' \
    '<a href="{{ membership_path }}"'; do
    local total
    total="$(count_occurrences "$marker" "$GLOBAL_NAV_FILE")"
    [[ "$total" == "2" ]] || fail "Global nav: '$marker' appears $total time(s), expected 2"
  done

  local forbidden
  for forbidden in \
    'blog_path' \
    'about_label' \
    'support_label' \
    '/blog/' \
    '/about.html' \
    '/support.html' \
    '>EN<' \
    '>ZH-CN<'; do
    if rg -F -q "$forbidden" "$GLOBAL_NAV_FILE"; then
      fail "Global nav: forbidden top-nav marker detected '$forbidden'"
    fi
  done

  pass "Global nav: removed entries remain absent (Blog/Support/About/EN/ZH-CN)"
}

check_footer_preserved_entries() {
  if ! require_file "$FOOTER_FILE" "Footer"; then
    return
  fi

  local required
  for required in \
    'blog_path' \
    'about_label' \
    'support_label' \
    '{{ kahoot_label }}' \
    '{{ exercises_label }}' \
    '{{ membership_label }}' \
    '/about.html' \
    '/support.html'; do
    if rg -F -q "$required" "$FOOTER_FILE"; then
      :
    else
      fail "Footer: missing expected retained marker '$required'"
    fi
  done

  pass "Footer: retained entry markers present (Blog/About/Support/Kahoot/Exercises)"
}

check_homepage_blog_entry() {
  local file="$1"
  local label="$2"
  local marker="$3"

  if ! require_file "$file" "$label"; then
    return
  fi

  if rg -F -q "$marker" "$file"; then
    pass "$label: lower-page Blog entry marker present"
  else
    fail "$label: missing lower-page Blog entry marker '$marker'"
  fi
}

check_layout_global_nav_usage() {
  local layout
  local include_marker='include global-nav.html'

  for layout in \
    "$ROOT/_layouts/global.html" \
    "$ROOT/_layouts/module.html" \
    "$ROOT/_layouts/post.html" \
    "$ROOT/_layouts/interactive_exercise.html"; do
    local name
    name="$(basename "$layout")"
    if ! require_file "$layout" "Layout $name"; then
      continue
    fi
    if rg -F -q "$include_marker" "$layout"; then
      pass "Layout $name: uses global nav include"
    else
      fail "Layout $name: missing '$include_marker'"
    fi
  done
}

echo "== Navigation Consistency Check (Bash) =="
check_global_nav
check_footer_preserved_entries
check_homepage_blog_entry "$SITE_INDEX_FILE" "Home default" "/blog/"
check_homepage_blog_entry "$SITE_EN_INDEX_FILE" "Home EN" "/en/blog/"
check_homepage_blog_entry "$SITE_ZH_INDEX_FILE" "Home ZH" "/zh-cn/blog/"
check_layout_global_nav_usage

echo "== Summary =="
echo "Failures: $failures"
echo "Warnings: $warnings"

if [[ "$failures" -gt 0 ]]; then
  exit 1
fi
