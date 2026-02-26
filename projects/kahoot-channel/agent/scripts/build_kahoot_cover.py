#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import re
import subprocess
from pathlib import Path
from typing import Iterable

OUTPUT_WIDTH = 2320
OUTPUT_HEIGHT = 1520
SUPERSAMPLE_FACTOR = 2
OUTPUT_COVER_BASENAME = "cover-2320x1520-kahoot-minimal"

PALETTES: dict[int, dict[str, str]] = {
    1: {"bg": "#FFFDF8", "top_strip": "#97CDE7", "pill_primary": "#6FAFD6", "pill_secondary": "#7FBDDF", "pill_accent": "#FFB5BA", "panel": "#FFFFFF", "title": "#4F7398", "subtitle": "#6A8FB2", "accent_line": "#9CCBE6", "footer": "#8FC4E1"},
    2: {"bg": "#FFF9F2", "top_strip": "#F9CFA1", "pill_primary": "#E9B77D", "pill_secondary": "#EFC48D", "pill_accent": "#FFB9A7", "panel": "#FFFDF9", "title": "#8E658C", "subtitle": "#A07A9D", "accent_line": "#F2C995", "footer": "#EFBE86"},
    3: {"bg": "#FFFAF6", "top_strip": "#F4B39B", "pill_primary": "#E89C80", "pill_secondary": "#EDAB91", "pill_accent": "#F7C7A8", "panel": "#FFFFFF", "title": "#7B6C9D", "subtitle": "#9787B1", "accent_line": "#EEB59B", "footer": "#E9A387"},
    4: {"bg": "#FFF8F7", "top_strip": "#F3B8BE", "pill_primary": "#E9A3AE", "pill_secondary": "#EFB1BA", "pill_accent": "#F8D1B6", "panel": "#FFFFFF", "title": "#6D7AA8", "subtitle": "#8A95BD", "accent_line": "#EDB4BC", "footer": "#E8A3AD"},
    5: {"bg": "#FFF9F5", "top_strip": "#F2B89A", "pill_primary": "#E6A47F", "pill_secondary": "#ECB08F", "pill_accent": "#F8CAA7", "panel": "#FFFFFF", "title": "#5F7BA5", "subtitle": "#7D97BC", "accent_line": "#EFB392", "footer": "#E6A07A"},
    6: {"bg": "#FFF8F2", "top_strip": "#F0B786", "pill_primary": "#E3A36E", "pill_secondary": "#E9AE79", "pill_accent": "#F8C7A2", "panel": "#FFFFFF", "title": "#4F7398", "subtitle": "#6A8FB2", "accent_line": "#EAB384", "footer": "#E09F67"},
    7: {"bg": "#FFFDF4", "top_strip": "#F5D789", "pill_primary": "#E9C66C", "pill_secondary": "#F0CE7C", "pill_accent": "#F8D7A8", "panel": "#FFFFFF", "title": "#5F7C8F", "subtitle": "#7C96A8", "accent_line": "#EFD183", "footer": "#E7C468"},
    8: {"bg": "#FFF9F1", "top_strip": "#EFC79C", "pill_primary": "#E0B27E", "pill_secondary": "#E8BE90", "pill_accent": "#F6CFAC", "panel": "#FFFFFF", "title": "#6C7896", "subtitle": "#8893AE", "accent_line": "#E8BE93", "footer": "#DFAF79"},
    9: {"bg": "#FFF8F4", "top_strip": "#F1B4AA", "pill_primary": "#E49D91", "pill_secondary": "#ECAE9F", "pill_accent": "#F7CCB8", "panel": "#FFFFFF", "title": "#5E7E9E", "subtitle": "#7D9BB9", "accent_line": "#ECB1A4", "footer": "#E49C90"},
    10: {"bg": "#FDFBF6", "top_strip": "#CFE5C8", "pill_primary": "#B9D8AD", "pill_secondary": "#C3DEB8", "pill_accent": "#F8C8A8", "panel": "#FFFFFF", "title": "#5E789B", "subtitle": "#7D97B8", "accent_line": "#C3DDAF", "footer": "#B4D39F"},
    11: {"bg": "#FDFBF7", "top_strip": "#DCE7C7", "pill_primary": "#C7D9A7", "pill_secondary": "#D0DEB3", "pill_accent": "#F6CDAE", "panel": "#FFFFFF", "title": "#667A95", "subtitle": "#8295AE", "accent_line": "#D1DDB3", "footer": "#C2D39E"},
    12: {"bg": "#FFF8F3", "top_strip": "#E9B28A", "pill_primary": "#D99A6D", "pill_secondary": "#E2A77D", "pill_accent": "#F4C6A3", "panel": "#FFFFFF", "title": "#5A749A", "subtitle": "#7790B4", "accent_line": "#E2AC84", "footer": "#D89467"},
}

TIER_STYLES: dict[str, dict[str, str]] = {
    "core": {
        "bg": "#F8FCFB",
        "top_strip": "#E4F2EF",
        "pill_primary": "#B2DDD6",
        "pill_secondary": "#C8E8E2",
        "pill_accent": "#DEF0EC",
        "pill_text_primary": "#164E4A",
        "pill_text_secondary": "#1D5D58",
        "pill_text_accent": "#245B57",
        "accent_line": "#77BDAF",
        "footer": "#2F7D74",
        "footer_text": "#FFFFFF",
        "title": "#1A5550",
        "subtitle": "#2F6D67",
    },
    "extended": {
        "bg": "#F9FBFE",
        "top_strip": "#E7EFF8",
        "pill_primary": "#C2D4EC",
        "pill_secondary": "#D2E0F3",
        "pill_accent": "#E0E9F8",
        "pill_text_primary": "#27496D",
        "pill_text_secondary": "#31587F",
        "pill_text_accent": "#2E5478",
        "accent_line": "#84A8CF",
        "footer": "#4B729F",
        "footer_text": "#FFFFFF",
        "title": "#264C70",
        "subtitle": "#406587",
    },
    "foundation": {
        "bg": "#F8FCFB",
        "top_strip": "#E4F2EF",
        "pill_primary": "#B2DDD6",
        "pill_secondary": "#C8E8E2",
        "pill_accent": "#DEF0EC",
        "pill_text_primary": "#164E4A",
        "pill_text_secondary": "#1D5D58",
        "pill_text_accent": "#245B57",
        "accent_line": "#77BDAF",
        "footer": "#2F7D74",
        "footer_text": "#FFFFFF",
        "title": "#1A5550",
        "subtitle": "#2F6D67",
    },
    "higher": {
        "bg": "#FEFCF8",
        "top_strip": "#F2E8D8",
        "pill_primary": "#DCC3A3",
        "pill_secondary": "#E8D7BF",
        "pill_accent": "#F1E6D5",
        "pill_text_primary": "#4E3A28",
        "pill_text_secondary": "#5D4733",
        "pill_text_accent": "#5D4733",
        "accent_line": "#C4A57F",
        "footer": "#8B6A49",
        "footer_text": "#FFFFFF",
        "title": "#5C4632",
        "subtitle": "#725A42",
    },
}


def extract_topic_heading(student_md: Path) -> str:
    for line in student_md.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            return line[3:].strip()
    return student_md.parent.name


def is_placeholder_topic(student_md: Path) -> bool:
    text = student_md.read_text(encoding="utf-8")
    patterns = [
        r"syllabus micro-topic",
        r"\[Fill with exact official wording\]",
        r"^##\s*T\d+\.\d+\s+T\d+\.\d+",
        r"^##\s*E\d+\.\d+\s+E\d+\.\d+",
    ]
    for p in patterns:
        if re.search(p, text, flags=re.IGNORECASE | re.MULTILINE):
            return True
    return False


def parse_code_and_title(heading: str, fallback_code: str) -> tuple[str, str]:
    m = re.match(r"^([A-Za-z]\d+(?:\.\d+)*)(?:\s+|$)(.*)$", heading)
    if m:
        code = m.group(1).strip()
        title = m.group(2).strip() or heading.strip()
        return code, title
    return fallback_code, heading.strip()


def normalize_title(raw: str) -> str:
    title = re.sub(r"\s+", " ", raw).strip()
    title = re.sub(r"\([^)]*\)", "", title).strip()
    title = title.replace("<->", "to")
    title = title.replace("&", "and")
    return title


def wrap_two_lines(title: str, width: int = 18) -> tuple[str, str]:
    words = title.split()
    if not words:
        return "Topic Practice", ""

    # Keep full title text and split into exactly two lines without truncation.
    if len(words) == 1:
        return words[0], ""

    best_first = " ".join(words)
    best_second = ""
    best_score: tuple[int, int] | None = None

    for i in range(1, len(words)):
        first = " ".join(words[:i])
        second = " ".join(words[i:])
        max_len = max(len(first), len(second))
        diff_len = abs(len(first) - len(second))
        score = (max_len, diff_len)
        if best_score is None or score < best_score:
            best_score = score
            best_first = first
            best_second = second

    return best_first, best_second


def board_label_for_dir(topic_dir: Path) -> str:
    p = str(topic_dir).lower()
    if "edexcel-4ma1" in p:
        return "EDEXCEL 4MA1"
    return "CIE 0580"


def normalize_tier(raw: str) -> str | None:
    t = raw.strip().lower()
    if t in {"core", "extended", "foundation", "higher"}:
        return t
    return None


def detect_tier(student_md: Path, topic_dir: Path, code: str, forced_tier: str | None = None) -> str | None:
    if forced_tier:
        return forced_tier

    text = student_md.read_text(encoding="utf-8")
    low = text.lower()

    m = re.search(r"^\s*-?\s*tier\s*:\s*(core|extended|foundation|higher)\b", text, flags=re.IGNORECASE | re.MULTILINE)
    if m:
        return normalize_tier(m.group(1))

    lines = text.splitlines()
    for i, line in enumerate(lines):
        if re.match(r"^\s*##\s*tier\s*$", line, flags=re.IGNORECASE):
            for j in range(i + 1, min(i + 6, len(lines))):
                m2 = re.search(r"\b(core|extended|foundation|higher)\b", lines[j], flags=re.IGNORECASE)
                if m2:
                    return normalize_tier(m2.group(1))

    m = re.search(r"\b(core|extended|foundation|higher)\s*tier\b", low, flags=re.IGNORECASE)
    if m:
        return normalize_tier(m.group(1))

    p = str(topic_dir).lower()
    m = re.search(r"(core|extended|foundation|higher)", p)
    if m:
        return normalize_tier(m.group(1))

    board = board_label_for_dir(topic_dir)
    if board == "CIE 0580":
        if re.match(r"^E\d", code, flags=re.IGNORECASE):
            return "extended"
        if re.match(r"^C\d", code, flags=re.IGNORECASE):
            return "core"
    if board == "EDEXCEL 4MA1":
        if re.match(r"^F\d", code, flags=re.IGNORECASE):
            return "foundation"
        if re.match(r"^H\d", code, flags=re.IGNORECASE):
            return "higher"
    return None


def palette_with_tier(base_palette: dict[str, str], tier: str | None) -> dict[str, str]:
    if not tier:
        return base_palette
    style = TIER_STYLES.get(tier)
    if not style:
        return base_palette
    merged = dict(base_palette)
    merged.update(style)
    return merged


def tier_badge_text(tier: str | None) -> str:
    if not tier:
        return "QUIZ + WORKSHEET"
    if tier == "core":
        return "Core Track"
    if tier == "extended":
        return "Extended Track"
    if tier == "foundation":
        return "FOUNDATION TIER"
    if tier == "higher":
        return "Higher Tier"
    return tier.upper()


def macro_topic_index(code: str, topic_dir: Path) -> int:
    m = re.match(r"^[A-Za-z]([0-9]{1,2})", code)
    if m:
        n = int(m.group(1))
        return 12 if n > 12 else max(1, n)
    m = re.search(r"/topics/([0-9]{1,2})-", str(topic_dir))
    if m:
        n = int(m.group(1))
        return 12 if n > 12 else max(1, n)
    return 1


def svg_content(code: str, line1: str, line2: str, board_label: str, tier_label: str, palette: dict[str, str]) -> str:
    code = html.escape(code)
    line1 = html.escape(line1)
    line2 = html.escape(line2)
    board_label = html.escape(board_label)
    tier_label = html.escape(tier_label)

    # Estimate font size to keep both title lines fully visible within panel width.
    max_chars = max(len(line1), len(line2))
    if max_chars <= 0:
        title_size = 49
    else:
        # Approx width budget: 496px (x=44 to right padding inside panel), glyph factor ~0.56.
        fit_size = int(496 / (0.56 * max_chars))
        title_size = max(30, min(49, fit_size))
    line_gap = max(36, int(title_size * 1.05))

    line2_svg = ""
    if line2:
        line2_svg = (
            f'  <text x="44" y="{188 + line_gap}" font-family="Avenir Next, Inter, Arial, sans-serif" '
            f'font-size="{title_size}" font-weight="800" fill="{palette["title"]}">{line2}</text>\n'
        )

    return f"""<svg width="{OUTPUT_WIDTH}" height="{OUTPUT_HEIGHT}" viewBox="0 0 580 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{code} Kahoot cover" text-rendering="geometricPrecision" shape-rendering="geometricPrecision">
  <rect width="580" height="380" fill="{palette['bg']}"/>

  <rect x="0" y="0" width="580" height="56" fill="{palette['top_strip']}"/>
  <rect x="20" y="14" width="152" height="28" rx="14" fill="{palette['pill_primary']}"/>
  <text x="96" y="33" text-anchor="middle" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="13" font-weight="800" fill="{palette.get('pill_text_primary', '#FFFFFF')}">TOPIC PRACTICE</text>

  <rect x="194" y="14" width="140" height="28" rx="14" fill="{palette['pill_secondary']}"/>
  <text x="264" y="33" text-anchor="middle" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="13" font-weight="800" fill="{palette.get('pill_text_secondary', '#3E7198')}">{board_label}</text>

  <rect x="394" y="14" width="172" height="28" rx="14" fill="{palette['pill_accent']}"/>
  <text x="480" y="33" text-anchor="middle" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="13" font-weight="800" fill="{palette.get('pill_text_accent', '#FFFFFF')}">{tier_label}</text>

  <rect x="20" y="76" width="540" height="234" rx="20" fill="{palette['panel']}"/>
  <rect x="20" y="76" width="8" height="234" fill="{palette['accent_line']}"/>

  <text x="44" y="134" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="21" font-weight="700" fill="{palette['subtitle']}">{code}</text>
  <text x="44" y="188" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="{title_size}" font-weight="800" fill="{palette['title']}">{line1}</text>
{line2_svg}  <rect x="44" y="260" width="212" height="6" rx="3" fill="{palette['accent_line']}"/>

  <text x="44" y="292" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="{palette['subtitle']}">IGCSE Maths Objective Practice</text>

  <rect x="0" y="332" width="580" height="48" fill="{palette['footer']}"/>
  <text x="20" y="361" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="{palette.get('footer_text', '#FFFFFF')}">25Maths Kahoot Companion</text>
  <text x="560" y="361" text-anchor="end" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="13" font-weight="700" fill="{palette.get('footer_text', '#FFFFFF')}">Real Exam Style • Revision • Self Study</text>
</svg>
"""


def build_one(
    topic_dir: Path,
    include_placeholder: bool = False,
    forced_tier: str | None = None,
    require_tier: bool = False,
    svg_only: bool = False,
) -> tuple[Path, Path] | None:
    student_md = topic_dir / "worksheet-student.md"
    if not student_md.exists():
        raise FileNotFoundError(f"Missing worksheet-student.md in {topic_dir}")
    if not include_placeholder and is_placeholder_topic(student_md):
        return None

    heading = extract_topic_heading(student_md)
    fallback_code = topic_dir.name.split("-")[0].upper()
    code, title = parse_code_and_title(heading, fallback_code)
    line1, line2 = wrap_two_lines(normalize_title(title))
    tier = detect_tier(student_md, topic_dir, code, forced_tier=forced_tier)
    if require_tier and not tier:
        print(f"Skipped (missing tier): {topic_dir}")
        return None

    base_palette = PALETTES[macro_topic_index(code, topic_dir)]
    palette = palette_with_tier(base_palette, tier)

    svg_path = topic_dir / f"{OUTPUT_COVER_BASENAME}.svg"
    png_path = topic_dir / f"{OUTPUT_COVER_BASENAME}.png"
    svg_path.write_text(
        svg_content(code, line1, line2, board_label_for_dir(topic_dir), tier_badge_text(tier), palette),
        encoding="utf-8",
    )

    if not svg_only:
        # Render at 2x, then downsample with slight unsharp mask for crisper text edges.
        subprocess.run(
            [
                "magick",
                "-density",
                "288",
                str(svg_path),
                "-resize",
                f"{OUTPUT_WIDTH * SUPERSAMPLE_FACTOR}x{OUTPUT_HEIGHT * SUPERSAMPLE_FACTOR}!",
                "-filter",
                "Lanczos",
                "-resize",
                f"{OUTPUT_WIDTH}x{OUTPUT_HEIGHT}!",
                "-unsharp",
                "0x0.75+0.8+0.02",
                str(png_path),
            ],
            check=True,
            capture_output=True,
            text=True,
        )
    return svg_path, png_path


def iter_topic_dirs(base: Path, all_topics: bool, scan_topics: bool) -> Iterable[Path]:
    if scan_topics:
        dirs = sorted({p.parent for p in base.rglob("worksheet-student.md")})
        for d in dirs:
            yield d
        return
    if all_topics:
        for d in sorted(base.glob("e1-*")):
            if d.is_dir():
                yield d
        return
    yield base


def main() -> None:
    parser = argparse.ArgumentParser(
        description=f"Build Kahoot covers ({OUTPUT_WIDTH}x{OUTPUT_HEIGHT}) from micro-topic folders."
    )
    parser.add_argument("path", help="Micro-topic dir (e.g. .../e1-01-...) or root number-e1 dir with --all.")
    parser.add_argument("--all", action="store_true", help="Build all e1-* folders under given path.")
    parser.add_argument("--scan", action="store_true", help="Recursively build every folder containing worksheet-student.md under path.")
    parser.add_argument(
        "--include-placeholder",
        action="store_true",
        help="Also build covers for placeholder skeleton topics. Default: skip placeholders.",
    )
    parser.add_argument(
        "--tier",
        choices=["core", "extended", "foundation", "higher"],
        help="Force tier for all generated covers in this run.",
    )
    parser.add_argument(
        "--require-tier",
        action="store_true",
        help="Skip topics that do not contain a detectable tier.",
    )
    parser.add_argument(
        "--svg-only",
        action="store_true",
        help="Write SVG only and skip PNG rendering.",
    )
    args = parser.parse_args()

    base = Path(args.path).resolve()
    if not base.exists():
        raise SystemExit(f"Path not found: {base}")

    built = 0
    skipped = 0
    for topic_dir in iter_topic_dirs(base, args.all, args.scan):
        result = build_one(
            topic_dir,
            include_placeholder=args.include_placeholder,
            forced_tier=args.tier,
            require_tier=args.require_tier,
            svg_only=args.svg_only,
        )
        if result is None:
            skipped += 1
            continue
        svg_path, png_path = result
        built += 1
        print(f"Built: {svg_path}")
        print(f"Built: {png_path}")

    print(f"Done: {built} cover set(s), skipped: {skipped}.")


if __name__ == "__main__":
    main()
