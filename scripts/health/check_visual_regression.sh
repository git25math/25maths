#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BASELINE_DIR="$ROOT/tests/visual/baseline"
CURRENT_DIR="$ROOT/.tmp/visual-current"
PORT="${VISUAL_PORT:-4173}"
SERVER_LOG="${TMPDIR:-/tmp}/25maths-visual-server.log"
MAX_RMSE="${VISUAL_MAX_RMSE:-0.0015}"

cd "$ROOT"

if [[ ! -d "$BASELINE_DIR" ]]; then
  echo "FAIL: Missing baseline directory: $BASELINE_DIR"
  echo "Run: bash scripts/health/update_visual_baseline.sh"
  exit 1
fi

if [[ ! -d "$ROOT/_site" ]]; then
  echo "No _site output found; building first..."
  bundle exec jekyll build >/dev/null
fi

rm -rf "$CURRENT_DIR"
mkdir -p "$CURRENT_DIR"

echo "Starting local server on port $PORT..."
python3 -m http.server "$PORT" --directory "$ROOT/_site" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT

sleep 1

echo "Capturing current snapshots..."
bash "$ROOT/scripts/health/capture_visual_snapshots.sh" "http://127.0.0.1:$PORT" "$CURRENT_DIR"

failures=0

while IFS= read -r current_file; do
  rel_name="$(basename "$current_file")"
  baseline_file="$BASELINE_DIR/$rel_name"

  if [[ ! -f "$baseline_file" ]]; then
    echo "FAIL: Missing baseline file $baseline_file"
    failures=$((failures + 1))
    continue
  fi

  rmse_norm="$(python3 - "$baseline_file" "$current_file" <<'PY'
import math
import sys
from PIL import Image, ImageChops, ImageStat

baseline = Image.open(sys.argv[1]).convert("RGBA")
current = Image.open(sys.argv[2]).convert("RGBA")

if baseline.size != current.size:
    print("SIZE_MISMATCH")
    raise SystemExit(0)

def premultiply_alpha(img):
    r, g, b, a = img.split()
    # Ignore RGB drift inside fully transparent pixels by premultiplying alpha.
    r = ImageChops.multiply(r, a)
    g = ImageChops.multiply(g, a)
    b = ImageChops.multiply(b, a)
    return Image.merge("RGBA", (r, g, b, a))

baseline = premultiply_alpha(baseline)
current = premultiply_alpha(current)

diff = ImageChops.difference(baseline, current)
means = ImageStat.Stat(diff).mean
mean_square = sum(channel * channel for channel in means) / len(means)
rmse = math.sqrt(mean_square) / 255.0
print(f"{rmse:.8f}")
PY
)"

  if [[ "$rmse_norm" == "SIZE_MISMATCH" ]]; then
    echo "FAIL: Visual diff detected for $rel_name (size mismatch)"
    failures=$((failures + 1))
    continue
  fi

  if awk "BEGIN { exit !($rmse_norm <= $MAX_RMSE) }"; then
    echo "PASS: $rel_name"
  else
    echo "FAIL: Visual diff detected for $rel_name (rmse=$rmse_norm, max=$MAX_RMSE)"
    failures=$((failures + 1))
  fi
done < <(find "$CURRENT_DIR" -maxdepth 1 -type f -name '*.png' | sort)

if [[ "$failures" -gt 0 ]]; then
  echo "Visual regression check failed: $failures mismatched snapshot(s)."
  echo "Inspect current snapshots in: $CURRENT_DIR"
  echo "If expected, refresh baseline with: bash scripts/health/update_visual_baseline.sh"
  exit 1
fi

echo "Visual regression check passed."
rm -rf "$CURRENT_DIR"
