#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <base_url> <output_dir>"
  exit 1
fi

BASE_URL="$1"
OUTPUT_DIR="$2"
PLAYWRIGHT_VERSION="${PLAYWRIGHT_VERSION:-1.52.0}"
MOBILE_USER_AGENT="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

mkdir -p "$OUTPUT_DIR"

PAGES=(
  "home|/"
  "cie0580|/cie0580/"
  "edx4ma1|/edx4ma1/"
  "kahoot|/kahoot/"
)

capture_with_profile() {
  local profile_slug="$1"
  local wait_ms="$2"
  local entry key route url target
  local -a profile_args

  if [[ "$profile_slug" == "mobile" ]]; then
    profile_args=(--viewport-size "390,844" --user-agent "$MOBILE_USER_AGENT")
  else
    profile_args=(--viewport-size "1440,960")
  fi

  for entry in "${PAGES[@]}"; do
    key="${entry%%|*}"
    route="${entry##*|}"
    url="${BASE_URL%/}${route}"
    target="$OUTPUT_DIR/${key}.${profile_slug}.png"
    npx --yes "playwright@$PLAYWRIGHT_VERSION" screenshot -b chromium "${profile_args[@]}" --wait-for-timeout "$wait_ms" --timeout 45000 "$url" "$target"
    echo "Captured: $target"
  done
}

capture_with_profile "desktop" "1200"
capture_with_profile "mobile" "1100"
