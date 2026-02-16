#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_FILE="$ROOT_DIR/styles/site.tailwind.css"
OUTPUT_FILE="$ROOT_DIR/assets/css/site.css"
CLI_FILE="$ROOT_DIR/node_modules/@tailwindcss/cli/dist/index.mjs"

if [[ ! -f "$CLI_FILE" ]]; then
  echo "Tailwind CLI not found at $CLI_FILE"
  echo "Install dependencies before building CSS."
  exit 1
fi

node "$CLI_FILE" \
  --cwd "$ROOT_DIR" \
  --input "$INPUT_FILE" \
  --output "$OUTPUT_FILE" \
  --minify

echo "Built CSS: $OUTPUT_FILE"
