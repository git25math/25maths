#!/usr/bin/env bash
# Build a Week Pack PDF from JSON data.
#
# Usage:
#   bash scripts/build_week_pack.sh week01              # builds both en + bilingual
#   bash scripts/build_week_pack.sh week01 en           # English edition only
#   bash scripts/build_week_pack.sh week01 bilingual    # Bilingual edition only
#   bash scripts/build_week_pack.sh week01.sample en    # MCQ sample, English
#
# Output: build/week-{nn}-en.pdf and/or build/week-{nn}-bilingual.pdf
#
# Requirements: python3, xelatex (TeX Live)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$REPO_ROOT/build"
TEX_DIR="$REPO_ROOT/tex"
CONTENT_DIR="$REPO_ROOT/_data/content"

WEEK_KEY="${1:?Usage: $0 <week_key> [en|bilingual]  (e.g. week01, week01.sample)}"
EDITION="${2:-}"

# ── Resolve input JSON ───────────────────────────────────────────────────────
JSON_FILE="$CONTENT_DIR/${WEEK_KEY}.json"
if [ ! -f "$JSON_FILE" ]; then
    echo "ERROR: $JSON_FILE not found"
    exit 1
fi

# ── Determine which editions to build ────────────────────────────────────────
if [ -z "$EDITION" ]; then
    EDITIONS=("en" "bilingual")
elif [ "$EDITION" = "en" ] || [ "$EDITION" = "bilingual" ]; then
    EDITIONS=("$EDITION")
else
    echo "ERROR: Invalid edition '$EDITION'. Use 'en' or 'bilingual'."
    exit 1
fi

# Extract week number for output naming
WEEK_NUM=$(python3 -c "import json; d=json.load(open('$JSON_FILE')); print(str(d.get('week_number',1)).zfill(2))")

echo "=== 25Maths Week Pack Builder ==="
echo "  Input:    $JSON_FILE"
echo "  Editions: ${EDITIONS[*]}"
echo ""

# ── Step 1: Validate JSON ────────────────────────────────────────────────────
echo "Step 1: Validating JSON..."
if python3 "$REPO_ROOT/scripts/health/check_week_pack_data.py" "$JSON_FILE"; then
    echo "  Validation PASSED"
else
    echo ""
    echo "  WARNING: Validation failed (see above). Continuing build anyway."
    echo "  Fix the data issues for a production-quality pack."
fi
echo ""

# ── Build each edition ───────────────────────────────────────────────────────
for LANG in "${EDITIONS[@]}"; do
    OUTPUT_NAME="week-${WEEK_NUM}-${LANG}.pdf"
    echo "──────────────────────────────────────────────────────────────"
    echo "Building: $OUTPUT_NAME (${LANG} edition)"
    echo "──────────────────────────────────────────────────────────────"

    # ── Step 2: Render JSON → LaTeX ──
    echo "  Rendering JSON → LaTeX (--lang $LANG)..."
    python3 "$REPO_ROOT/tools/week_pack/render_week_pack.py" "$JSON_FILE" --lang "$LANG"
    echo ""

    # ── Step 3: Copy template + theme into build dir ──
    echo "  Preparing build directory..."
    cp "$TEX_DIR/25maths_theme.sty" "$BUILD_DIR/"
    cp "$TEX_DIR/week_pack_template.tex" "$BUILD_DIR/"
    echo ""

    # ── Step 4: Compile with XeLaTeX ──
    echo "  Compiling PDF (xelatex, 2 passes)..."
    cd "$BUILD_DIR"

    xelatex -interaction=nonstopmode week_pack_template.tex > xelatex_pass1.log 2>&1
    PASS1_EXIT=$?
    if [ ! -f week_pack_template.pdf ]; then
        echo ""
        echo "ERROR: XeLaTeX compilation failed (no PDF produced). Check build/xelatex_pass1.log"
        echo "  Or run manually: cd build && xelatex week_pack_template.tex"
        exit 1
    fi
    xelatex -interaction=nonstopmode week_pack_template.tex > xelatex_pass2.log 2>&1
    if [ $PASS1_EXIT -ne 0 ]; then
        echo "  (xelatex completed with warnings — see build/xelatex_pass1.log)"
    fi

    # ── Step 5: Rename output ──
    mv week_pack_template.pdf "$OUTPUT_NAME"
    echo "  Compiled: build/$OUTPUT_NAME"

    cd "$REPO_ROOT"
    echo ""
done

# ── Step 6: Report ───────────────────────────────────────────────────────────
echo "=== Build Complete ==="
for LANG in "${EDITIONS[@]}"; do
    OUTPUT_NAME="week-${WEEK_NUM}-${LANG}.pdf"
    FILE_SIZE=$(du -h "$BUILD_DIR/$OUTPUT_NAME" | cut -f1)
    PAGE_COUNT=$(python3 -c "
import subprocess
r = subprocess.run(['pdfinfo', '$BUILD_DIR/$OUTPUT_NAME'], capture_output=True, text=True)
for line in r.stdout.splitlines():
    if line.startswith('Pages:'):
        print(line.split(':')[1].strip())
        break
" 2>/dev/null || echo "?")
    echo "  $OUTPUT_NAME  ($FILE_SIZE, $PAGE_COUNT pages)"
done
echo ""
echo "  To view: open build/week-${WEEK_NUM}-*.pdf"
