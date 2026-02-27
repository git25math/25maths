#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BASELINE_DIR="$ROOT/tests/visual/baseline"
PORT="${VISUAL_PORT:-4173}"
SERVER_LOG="${TMPDIR:-/tmp}/25maths-visual-server.log"

cd "$ROOT"

echo "Building site..."
bundle exec jekyll build >/dev/null

echo "Starting local server on port $PORT..."
python3 -m http.server "$PORT" --directory "$ROOT/_site" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT

sleep 1

echo "Updating baseline snapshots in $BASELINE_DIR..."
mkdir -p "$BASELINE_DIR"
bash "$ROOT/scripts/health/capture_visual_snapshots.sh" "http://127.0.0.1:$PORT" "$BASELINE_DIR"

echo "Baseline snapshots updated."
