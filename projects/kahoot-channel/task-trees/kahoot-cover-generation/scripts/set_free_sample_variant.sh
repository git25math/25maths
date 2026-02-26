#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LIVE_DIR="$(cd "$BASE_DIR/../.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/set_free_sample_variant.sh <balanced|contrast10> [snapshot|live|both]

Examples:
  ./scripts/set_free_sample_variant.sh balanced
  ./scripts/set_free_sample_variant.sh contrast10 both

Default scope: snapshot
EOF
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 1
fi

VARIANT="$1"
SCOPE="${2:-snapshot}"

if [[ "$VARIANT" != "balanced" && "$VARIANT" != "contrast10" ]]; then
  echo "Error: variant must be 'balanced' or 'contrast10'"
  usage
  exit 1
fi

if [[ "$SCOPE" != "snapshot" && "$SCOPE" != "live" && "$SCOPE" != "both" ]]; then
  echo "Error: scope must be 'snapshot', 'live', or 'both'"
  usage
  exit 1
fi

roots=()
if [[ "$SCOPE" == "snapshot" || "$SCOPE" == "both" ]]; then
  roots+=("$BASE_DIR/snapshot/free-showcase")
fi
if [[ "$SCOPE" == "live" || "$SCOPE" == "both" ]]; then
  roots+=("$LIVE_DIR/free-showcase")
fi

total=0

for root in "${roots[@]}"; do
  if [[ ! -d "$root" ]]; then
    echo "Skip (missing): $root"
    continue
  fi

  count=0
  while IFS= read -r -d '' src; do
    dst="${src%-${VARIANT}.png}.png"
    cp -f "$src" "$dst"
    count=$((count + 1))
  done < <(find "$root" -type f -name "cover-2320x1520-kahoot-free-sample-${VARIANT}.png" -print0)

  total=$((total + count))
  echo "Updated $count files in: $root"
done

echo "Done. variant=$VARIANT scope=$SCOPE total_updated=$total"
