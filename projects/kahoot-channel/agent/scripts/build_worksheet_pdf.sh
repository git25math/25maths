#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <micro-topic-dir>"
  exit 1
fi

dir="$1"
student_md="$dir/worksheet-student.md"
answers_md="$dir/worksheet-answers.md"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
template="$script_dir/../../_templates/worksheet-pdf-template.tex"

if [[ ! -f "$student_md" || ! -f "$answers_md" || ! -f "$template" ]]; then
  echo "Missing required files in $dir"
  exit 1
fi

title_line=$(grep -m1 '^## ' "$student_md" | sed 's/^##[[:space:]]*//')
raw_code=$(echo "$title_line" | awk '{print $1}')
if [[ "$raw_code" =~ ^[A-Za-z][0-9]+\.[0-9]+$ ]]; then
  code="$raw_code"
else
  code=$(basename "$dir" | sed -E 's/[^A-Za-z0-9._-]+/-/g')
fi

board="CIE 0580"
if echo "$dir" | grep -q 'edexcel-4ma1'; then
  board="Edexcel 4MA1"
fi

difficulty="Auto"
case "${code:0:1}" in
  C|c) difficulty="Core" ;;
  E|e) difficulty="Extended" ;;
  F|f) difficulty="Foundation" ;;
  H|h) difficulty="Higher" ;;
esac
subtitle="Kahoot Extension Worksheet | Topic ID: ${code} | Difficulty: ${difficulty}"

extract_section_line() {
  local section="$1"
  local file="$2"
  awk -v sec="$section" '
    tolower($0) ~ "^##[[:space:]]*" tolower(sec) "[[:space:]]*$" {flag=1;next}
    flag && /^- /{sub(/^- /,""); print; exit}
    flag && /^$/ {next}
    flag && /^## /{flag=0}
    flag {print; exit}
  ' "$file"
}

ensure_period() {
  local s="$1"
  if [[ "$s" =~ [.!?]$ ]]; then
    printf '%s' "$s"
  else
    printf '%s.' "$s"
  fi
}

syllabus_focus=$(extract_section_line "Syllabus focus" "$student_md")
if [[ -z "$syllabus_focus" ]]; then
  syllabus_focus="Exam-style objective practice aligned to the target syllabus point."
fi
exam_reminder=$(extract_section_line "Exam reminder" "$student_md")
if [[ -z "$exam_reminder" ]]; then
  focus_with_period="$(ensure_period "$syllabus_focus")"
  exam_reminder="Focus on ${focus_with_period} Show clear working, keep exact values until the final step, and include correct units where needed."
fi

student_items=$(awk 'tolower($0) ~ /^## .*practice \(10/{flag=1;next} flag && /^[0-9]+\. /{sub(/^[0-9]+\. /,""); print} flag && /^$/{next} flag && !/^[0-9]+\. / && /^## /{flag=0}' "$student_md" | head -n 10)
answers_items=$(awk '/^[0-9]+\. /{sub(/^[0-9]+\. /,""); print}' "$answers_md" | head -n 10)

if [[ -z "$student_items" || -z "$answers_items" ]]; then
  echo "Could not parse questions/answers in $dir"
  exit 1
fi

escape_tex() {
  sed -E \
    -e 's/\\/\\textbackslash{}/g' \
    -e 's/&/\\&/g' \
    -e 's/%/\\%/g' \
    -e 's/#/\\#/g' \
    -e 's/_/\\_/g' \
    -e 's/\$/\\$/g' \
    -e 's/\^/\\textasciicircum{}/g' \
    -e 's/\{/\\{/g' \
    -e 's/\}/\\}/g'
}

normalize_quotes() {
  sed -E \
    -e 's/[“”]/"/g' \
    -e "s/[‘’]/'/g"
}

workdir="$dir/.build"
outdir="$dir/pdf"
mkdir -p "$workdir" "$outdir"
outtex="$workdir/worksheet-pack.tex"

title_esc="$(printf '%s' "$title_line" | normalize_quotes | escape_tex)"
subtitle_esc="$(printf '%s' "$subtitle" | normalize_quotes | escape_tex)"
board_esc="$(printf '%s' "$board" | normalize_quotes | escape_tex)"
focus_esc="$(printf '%s' "$syllabus_focus" | normalize_quotes | escape_tex)"
reminder_esc="$(printf '%s' "$exam_reminder" | normalize_quotes | escape_tex)"
questions_esc="$(printf '%s\n' "$student_items" | while IFS= read -r l; do printf '%s\n' "$(printf '%s' "$l" | normalize_quotes | escape_tex)"; done)"
answers_esc="$(printf '%s\n' "$answers_items" | while IFS= read -r l; do printf '%s\n' "$(printf '%s' "$l" | normalize_quotes | escape_tex)"; done)"

TEMPLATE_PATH="$template" OUTTEX="$outtex" TITLE="$title_esc" SUBTITLE="$subtitle_esc" BOARD="$board_esc" FOCUS="$focus_esc" REMINDER="$reminder_esc" QUESTIONS="$questions_esc" ANSWERS="$answers_esc" \
python3 -W ignore::SyntaxWarning - <<'PY'
import re
import os
from pathlib import Path

tex = Path(os.environ["TEMPLATE_PATH"]).read_text(encoding="utf-8")

title = os.environ["TITLE"]
subtitle = os.environ["SUBTITLE"]
board = os.environ["BOARD"]
focus = os.environ["FOCUS"]
reminder = os.environ["REMINDER"]
questions = os.environ["QUESTIONS"].splitlines()
answers = os.environ["ANSWERS"].splitlines()

def pair_quotes(s: str) -> str:
    out = []
    dbl_open = True
    sgl_open = True
    for i, ch in enumerate(s):
        if ch == '"':
            out.append("``" if dbl_open else "''")
            dbl_open = not dbl_open
        elif ch == "'":
            prev = s[i - 1] if i > 0 else ''
            nxt = s[i + 1] if i + 1 < len(s) else ''
            # Keep apostrophes inside words (don't, student's, etc.)
            if prev.isalnum() and nxt.isalnum():
                out.append("'")
            else:
                out.append("`" if sgl_open else "'")
                sgl_open = not sgl_open
        else:
            out.append(ch)
    return ''.join(out)

def render_math(s: str) -> str:
    # Restore exponent caret and convert markdown inline code to LaTeX math.
    s = s.replace(r'\textasciicircum{}', '^')
    s = s.replace(r'\textasciicircum\{\}', '^')
    s = re.sub(r'sqrt\(([^()]+)\)', lambda m: '\\sqrt{' + m.group(1) + '}', s)
    tick = chr(96)
    dollar = chr(36)
    math_wrap = lambda expr: '~' + dollar + expr + dollar + '~'
    backslash = chr(92)
    s = re.sub(f'{tick}([^{tick}]+){tick}', lambda m: f"{dollar}{m.group(1)}{dollar}", s)
    # Split text into math/non-math segments by unescaped '$'.
    segments = []
    buf = []
    in_math = False
    for i, ch in enumerate(s):
        if ch == dollar and (i == 0 or s[i - 1] != backslash):
            if buf:
                segments.append((in_math, ''.join(buf)))
                buf = []
            in_math = not in_math
            continue
        buf.append(ch)
    if buf:
        segments.append((in_math, ''.join(buf)))

    unit_pattern = re.compile(r'\b(mm|cm|m|km|mg|g|kg|ml|l|s|min|h|hr)\^([0-9]+)\b', flags=re.IGNORECASE)
    frac_pattern = re.compile(r'(\([^()]+\)|[A-Za-z0-9.+\-^]+)\s*/\s*(\([^()]+\)|[A-Za-z0-9.+\-^]+)')

    def normalize_math_segment(seg: str) -> str:
        # Use multiplication sign in expressions (e.g. 7 x 3 -> 7 \times 3).
        seg = re.sub(r'(?<=\d)\s*[xX]\s*(?=\d)', lambda _m: backslash + 'times ', seg)
        seg = re.sub(r'(?<=\S)\s+[xX]\s+(?=\S)', lambda _m: ' ' + backslash + 'times ', seg)
        # Convert simple fractions to \frac{}{} in math mode.
        seg = frac_pattern.sub(lambda m: backslash + 'frac{' + m.group(1) + '}{' + m.group(2) + '}', seg)
        return seg

    out = []
    for is_math, seg in segments:
        if is_math:
            out.append(math_wrap(normalize_math_segment(seg)))
        else:
            out.append(unit_pattern.sub(lambda m: m.group(1) + math_wrap('^{' + m.group(2) + '}'), seg))
    s = ''.join(out)
    return s

title = pair_quotes(title)
subtitle = pair_quotes(subtitle)
board = pair_quotes(board)
focus = pair_quotes(focus)
reminder = pair_quotes(reminder)
questions = [render_math(pair_quotes(q)) for q in questions]
answers = [render_math(pair_quotes(a)) for a in answers]

lines = tex.splitlines()
for i, line in enumerate(lines):
    if line.startswith(r'\newcommand{\WorksheetTitle}'):
        lines[i] = rf'\newcommand{{\WorksheetTitle}}{{{title}}}'
    elif line.startswith(r'\newcommand{\WorksheetSubtitle}'):
        lines[i] = rf'\newcommand{{\WorksheetSubtitle}}{{{subtitle}}}'
    elif line.startswith(r'\newcommand{\BoardLabel}'):
        lines[i] = rf'\newcommand{{\BoardLabel}}{{{board}}}'
tex = "\n".join(lines)
# Stable text replacement for focus box (avoid regex escape pitfalls)
focus_marker = r'\textbf{Syllabus focus:}'
focus_end = r'\end{focusbox}'
start = tex.find(focus_marker)
if start != -1:
    after_marker = start + len(focus_marker)
    end = tex.find(focus_end, after_marker)
    if end != -1:
        tex = tex[:after_marker] + ' ' + focus + '\n' + tex[end:]
else:
    raise RuntimeError("Template marker not found: Syllabus focus")

reminder_marker = r'\textbf{Exam reminder:}'
reminder_end = r'\end{notesbox}'
rstart = tex.find(reminder_marker)
if rstart != -1:
    rafter = rstart + len(reminder_marker)
    rend = tex.find(reminder_end, rafter)
    if rend != -1:
        tex = tex[:rafter] + ' ' + reminder + '\n' + tex[rend:]
else:
    raise RuntimeError("Template marker not found: Exam reminder")

# Replace the whole question block between the Practice heading and Quick Answer Grid
practice_marker = r'\noindent{\large\bfseries Practice (10 Questions)}'
quick_heading = r'\noindent{\large\bfseries Quick Answer Grid}'
p_start = tex.find(practice_marker)
q_start = tex.find(quick_heading, p_start if p_start != -1 else 0)
if p_start == -1 or q_start == -1 or q_start <= p_start:
    raise RuntimeError("Template markers for question block not found.")

question_boxes = []
for i in range(10):
    q = questions[i] if i < len(questions) and questions[i].strip() else f'Question {i+1}.'
    lines = max(2, min(4, (len(q) // 75) + 1))
    question_boxes.append(
        f"\\begin{{qbox}}{{Q{i+1}}}\n{q}\n\\answerlines{{{lines}}}\n\\end{{qbox}}\n"
    )

# Keep pages 1-2 dedicated to student work so they can be printed double-sided.
first_student_page = "\n".join(question_boxes[:5])
second_student_page = "\n".join(question_boxes[5:])
new_question_block = (
    "\n\n"
    + first_student_page
    + "\n"
    + "\\newpage\n"
    + "\\SetFooterLabel{Student Sheet 2/2}\n"
    + "\\noindent{\\large\\bfseries Practice (continued)}\n\n"
    + second_student_page
    + "\n"
)
insert_after = p_start + len(practice_marker)
tex = tex[:insert_after] + new_question_block + tex[q_start:]

# Append answers page right before \end{document}
answer_items = "\n".join([f"\\item {a}" for a in answers[:10]])
answers_page = "\n".join([
    "",
    "\\newpage",
    "\\SetFooterLabel{Answer Key}",
    "\\noindent{\\Large\\bfseries\\color{BrandPrimary}Answer Keys}",
    "\\vspace{1mm}",
    "\\vspace{2mm}",
    "\\begin{enumerate}[leftmargin=6mm,itemsep=3.0mm]",
    answer_items,
    "\\end{enumerate}",
    ""
])
tex = tex.replace("\n\\end{document}", answers_page + "\n\\end{document}", 1)

Path(os.environ["OUTTEX"]).write_text(tex, encoding="utf-8")
PY

( cd "$workdir" && xelatex -interaction=nonstopmode -halt-on-error worksheet-pack.tex >/dev/null )
full_pdf="$outdir/${code}-worksheet-pack.pdf"
student_pdf="$outdir/${code}-worksheet-student.pdf"
cp "$workdir/worksheet-pack.pdf" "$full_pdf"

pages="$(pdfinfo "$full_pdf" | awk -F: '/^Pages/{gsub(/ /,"",$2); print $2}')"

if [[ "${pages:-0}" -ge 2 ]]; then
  if command -v qpdf >/dev/null 2>&1; then
    qpdf "$full_pdf" --pages "$full_pdf" 1-2 -- "$student_pdf"
  elif command -v pdfseparate >/dev/null 2>&1 && command -v pdfunite >/dev/null 2>&1; then
    tmp_pages_dir="$workdir/student-pages"
    rm -rf "$tmp_pages_dir"
    mkdir -p "$tmp_pages_dir"
    pdfseparate "$full_pdf" "$tmp_pages_dir/page-%d.pdf"
    pdfunite "$tmp_pages_dir/page-1.pdf" "$tmp_pages_dir/page-2.pdf" "$student_pdf"
  else
    echo "Warning: could not create student-only PDF (missing qpdf or pdfseparate/pdfunite)."
  fi
else
  echo "Warning: generated PDF has fewer than 2 pages; student-only export skipped."
fi

if [[ "$pages" != "3" ]]; then
  echo "Warning: expected 3 pages (2 student + 1 answer), got $pages pages."
fi

echo "Built: $full_pdf"
if [[ -f "$student_pdf" ]]; then
  echo "Built: $student_pdf"
fi
