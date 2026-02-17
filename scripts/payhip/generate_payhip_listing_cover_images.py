#!/usr/bin/env python3
"""Generate Payhip listing cover images for L1/L2/L3/L4."""

from __future__ import annotations

import argparse
import csv
import html
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

ROOT = Path(__file__).resolve().parents[2]
PAYHIP_DIR = ROOT / "payhip/presale"
OUTPUT_ROOT = PAYHIP_DIR / "listing-assets"

INPUT_CSVS = {
    "l1": PAYHIP_DIR / "kahoot-payhip-listings-l1.csv",
    "l2": PAYHIP_DIR / "kahoot-payhip-listings-l2.csv",
    "l3": PAYHIP_DIR / "kahoot-payhip-listings-l3.csv",
    "l4": PAYHIP_DIR / "kahoot-payhip-listings-l4.csv",
}

MANIFEST_PATH = OUTPUT_ROOT / "payhip-cover-manifest.csv"
README_PATH = OUTPUT_ROOT / "README.md"

OUT_BASENAME = "01-cover-main-2320x1520-payhip"
W = 2320
H = 1520
SUPERSAMPLE = 2

LEVEL_STYLE = {
    "l1": {
        "name": "L1 SubTopic MVP",
        "bg_top": "#E9F8F4",
        "bg_bottom": "#F8FFFD",
        "accent": "#0F766E",
        "chip": "#0F766E",
    },
    "l2": {
        "name": "L2 Section Bundle",
        "bg_top": "#FFF4E8",
        "bg_bottom": "#FFFDF8",
        "accent": "#B45309",
        "chip": "#B45309",
    },
    "l3": {
        "name": "L3 Unit Bundle",
        "bg_top": "#EDF4FF",
        "bg_bottom": "#F8FBFF",
        "accent": "#1D4ED8",
        "chip": "#1D4ED8",
    },
    "l4": {
        "name": "L4 All-Units Bundle",
        "bg_top": "#FFF8E8",
        "bg_bottom": "#FFFEF9",
        "accent": "#92400E",
        "chip": "#92400E",
    },
}

BOARD_STYLE = {
    "cie0580": {
        "brand": "#8B1538",
        "soft": "#F8EAF0",
        "text": "#5E1025",
    },
    "edexcel-4ma1": {
        "brand": "#2563EB",
        "soft": "#EAF1FF",
        "text": "#1E4FB7",
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate L1-L4 Payhip listing cover images.")
    parser.add_argument(
        "--levels",
        default="l1,l2,l3,l4",
        help="Comma-separated levels to generate. Any of: l1,l2,l3,l4",
    )
    parser.add_argument(
        "--png-only",
        action="store_true",
        help="Skip SVG write and only attempt PNG rendering from existing SVG files.",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip render when target PNG already exists.",
    )
    return parser.parse_args()


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def title_case_phrase(text: str) -> str:
    raw = normalize_whitespace(text.replace("_", " ").replace("-", " "))
    if not raw:
        return ""
    return " ".join(w.capitalize() for w in raw.split())


def board_key(row: dict) -> str:
    b = normalize_whitespace(row.get("board", "")).lower()
    if b in BOARD_STYLE:
        return b
    # fallback based on listing title
    title = normalize_whitespace(row.get("listing_title", "")).lower()
    if "edexcel" in title or "4ma1" in title:
        return "edexcel-4ma1"
    return "cie0580"


def wrap_lines(text: str, max_chars: int, max_lines: int) -> List[str]:
    words = normalize_whitespace(text).split()
    if not words:
        return []

    lines: List[str] = []
    current = words[0]
    for w in words[1:]:
        candidate = f"{current} {w}"
        if len(candidate) <= max_chars:
            current = candidate
        else:
            lines.append(current)
            current = w
    lines.append(current)

    if len(lines) <= max_lines:
        return lines

    merged = lines[: max_lines - 1]
    tail = " ".join(lines[max_lines - 1 :])
    if len(tail) > max_chars:
        tail = tail[: max_chars - 3].rstrip() + "..."
    merged.append(tail)
    return merged


def content_for_row(level: str, row: dict) -> Dict[str, str]:
    unit_code = normalize_whitespace(row.get("unit_code", ""))
    unit_title = normalize_whitespace(row.get("unit_title", ""))
    section_code = normalize_whitespace(row.get("section_code", ""))
    section_title = normalize_whitespace(row.get("section_title", ""))
    subtopic_code = normalize_whitespace(row.get("subtopic_code", ""))
    subtopic_title = title_case_phrase(row.get("subtopic_title", ""))
    tier_scope = normalize_whitespace(row.get("tier_scope", ""))
    board_label = normalize_whitespace(row.get("board_label", ""))
    listing_title = normalize_whitespace(row.get("listing_title", ""))
    early = normalize_whitespace(row.get("price_early_bird", ""))
    regular = normalize_whitespace(row.get("price_regular", ""))
    early_end = normalize_whitespace(row.get("early_bird_end_date", ""))
    release = normalize_whitespace(row.get("release_date", ""))

    if level == "l1":
        main = f"{subtopic_code} {subtopic_title}".strip()
        sub = "Worksheet + Kahoot Companion"
        scope = f"{unit_code} {unit_title} | {section_code} {section_title}".strip(" |")
        counts = "1 SubTopic MVP"
    elif level == "l2":
        main = f"{section_code} {section_title}".strip()
        sub = "Section Bundle"
        scope = f"{unit_code} {unit_title}".strip()
        counts = f"{normalize_whitespace(row.get('subtopic_count', '0'))} SubTopics"
    elif level == "l3":
        main = f"{unit_code} {unit_title}".strip()
        sub = "Unit Bundle"
        scope = board_label
        counts = (
            f"{normalize_whitespace(row.get('section_count', '0'))} Sections"
            f" | {normalize_whitespace(row.get('subtopic_count', '0'))} SubTopics"
        )
    else:
        main = f"{board_label} All Units"
        sub = "All-Units Mega Bundle"
        scope = "Complete Board Roadmap"
        counts = (
            f"{normalize_whitespace(row.get('unit_count', '0'))} Units"
            f" | {normalize_whitespace(row.get('section_count', '0'))} Sections"
            f" | {normalize_whitespace(row.get('subtopic_count', '0'))} SubTopics"
        )

    if not main:
        main = listing_title

    return {
        "board_label": board_label,
        "tier_scope": tier_scope,
        "main": main,
        "sub": sub,
        "scope": scope,
        "counts": counts,
        "price_line": f"Early Bird {early}   |   Regular {regular}",
        "date_line": f"Early Bird Ends {early_end}   |   Release {release}",
    }


def svg_for_cover(level: str, row: dict) -> str:
    level_style = LEVEL_STYLE[level]
    b_key = board_key(row)
    b_style = BOARD_STYLE[b_key]
    content = content_for_row(level, row)

    sku = html.escape(normalize_whitespace(row.get("sku", "")))
    board = html.escape(content["board_label"])
    tier = html.escape(content["tier_scope"] or "All tiers")
    level_label = html.escape(level_style["name"])
    main_lines = [html.escape(x) for x in wrap_lines(content["main"], max_chars=28, max_lines=2)]
    sub_lines = [html.escape(x) for x in wrap_lines(content["sub"], max_chars=34, max_lines=1)]
    scope_lines = [html.escape(x) for x in wrap_lines(content["scope"], max_chars=42, max_lines=1)]
    counts = html.escape(content["counts"])
    price_line = html.escape(content["price_line"])
    date_line = html.escape(content["date_line"])

    y_main = 180
    main_block = []
    for i, line in enumerate(main_lines):
        main_block.append(
            f'<text x="52" y="{y_main + i * 52}" font-family="Avenir Next, Inter, Arial, sans-serif" '
            f'font-size="45" font-weight="800" fill="#10233A">{line}</text>'
        )
    main_svg = "\n  ".join(main_block)

    sub_text = sub_lines[0] if sub_lines else ""
    scope_text = scope_lines[0] if scope_lines else ""

    return f"""<svg width="{W}" height="{H}" viewBox="0 0 580 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{sku} cover">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{level_style['bg_top']}"/>
      <stop offset="100%" stop-color="{level_style['bg_bottom']}"/>
    </linearGradient>
    <linearGradient id="stripe" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="{level_style['accent']}"/>
      <stop offset="100%" stop-color="{b_style['brand']}"/>
    </linearGradient>
  </defs>

  <rect width="580" height="380" fill="url(#bg)"/>
  <rect x="0" y="0" width="580" height="12" fill="{b_style['brand']}"/>
  <rect x="0" y="12" width="580" height="48" fill="{b_style['soft']}"/>

  <rect x="18" y="22" width="128" height="28" rx="14" fill="{level_style['chip']}"/>
  <text x="82" y="40" text-anchor="middle" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF">{level_label}</text>

  <rect x="154" y="22" width="150" height="28" rx="14" fill="#FFFFFF"/>
  <text x="229" y="40" text-anchor="middle" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="12" font-weight="800" fill="{b_style['text']}">{board}</text>

  <rect x="312" y="22" width="250" height="28" rx="14" fill="#FFFFFF"/>
  <text x="437" y="40" text-anchor="middle" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="12" font-weight="800" fill="#425466">{tier}</text>

  <rect x="18" y="76" width="544" height="248" rx="20" fill="#FFFFFF"/>
  <rect x="18" y="76" width="9" height="248" fill="url(#stripe)"/>

  <text x="52" y="120" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#5A6D84">{html.escape(sku)}</text>
  {main_svg}
  <text x="52" y="290" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="19" font-weight="700" fill="#27445E">{sub_text}</text>
  <text x="52" y="313" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="#4A617B">{scope_text}</text>

  <rect x="350" y="125" width="195" height="92" rx="14" fill="#F7FAFD" stroke="#D9E3EF"/>
  <text x="366" y="151" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="14" font-weight="800" fill="#2A3E56">Coverage</text>
  <text x="366" y="175" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="13" font-weight="700" fill="#4C6078">{counts}</text>
  <text x="366" y="197" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="12" font-weight="700" fill="#6B7E95">Worksheet-aligned</text>

  <rect x="350" y="228" width="195" height="82" rx="14" fill="#F7FAFD" stroke="#D9E3EF"/>
  <text x="366" y="251" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="12" font-weight="800" fill="#2A3E56">{price_line}</text>
  <text x="366" y="273" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="11" font-weight="700" fill="#5F7389">{date_line}</text>
  <text x="366" y="294" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="11" font-weight="700" fill="#7A8EA6">Presale Product Cover</text>

  <rect x="0" y="334" width="580" height="46" fill="{b_style['brand']}"/>
  <text x="18" y="362" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">25Maths Payhip Presale</text>
  <text x="562" y="362" text-anchor="end" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Kahoot + Worksheet + Exam Support</text>
</svg>
"""


def render_png(svg_path: Path, png_path: Path) -> None:
    qlmanage = shutil.which("qlmanage")
    if qlmanage:
        with tempfile.TemporaryDirectory(prefix="payhip-cover-") as tmp:
            tmp_dir = Path(tmp)
            subprocess.run(
                [
                    qlmanage,
                    "-t",
                    "-s",
                    str(W),
                    "-o",
                    str(tmp_dir),
                    str(svg_path),
                ],
                check=True,
                timeout=25,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            produced = tmp_dir / f"{svg_path.name}.png"
            if not produced.exists():
                raise subprocess.CalledProcessError(
                    returncode=1,
                    cmd=["qlmanage", str(svg_path)],
                )
            shutil.move(str(produced), str(png_path))
            subprocess.run(
                [
                    "magick",
                    str(png_path),
                    "-resize",
                    f"{W}x{H}!",
                    str(png_path),
                ],
                check=True,
                timeout=20,
            )
            return

    subprocess.run(
        [
            "magick",
            "-density",
            "192",
            str(svg_path),
            "-resize",
            f"{W}x{H}!",
            str(png_path),
        ],
        check=True,
        timeout=45,
    )


def read_rows(csv_path: Path) -> List[dict]:
    with csv_path.open("r", encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def iter_level_rows(levels: Iterable[str]) -> Iterable[Tuple[str, dict]]:
    for level in levels:
        rows = read_rows(INPUT_CSVS[level])
        rows_sorted = sorted(rows, key=lambda r: r.get("sku", ""))
        for row in rows_sorted:
            yield level, row


def write_readme(generated_counts: Dict[str, int]) -> None:
    lines = [
        "# Payhip Listing Cover Assets",
        "",
        "Auto-generated listing cover images for Payhip uploads.",
        "",
        "## Folder Structure",
        "",
        "- `l1/<SKU>/01-cover-main-2320x1520-payhip.svg/png`",
        "- `l2/<SKU>/01-cover-main-2320x1520-payhip.svg/png`",
        "- `l3/<SKU>/01-cover-main-2320x1520-payhip.svg/png`",
        "- `l4/<SKU>/01-cover-main-2320x1520-payhip.svg/png`",
        "",
        "## Generated Counts",
        "",
    ]
    for level in ("l1", "l2", "l3", "l4"):
        if level in generated_counts:
            lines.append(f"- `{level.upper()}`: {generated_counts[level]}")
    lines.append("")
    lines.append("This package currently generates image #1 (main cover) in your 9-image Payhip set.")
    lines.append("")
    README_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    args = parse_args()
    levels = [x.strip().lower() for x in args.levels.split(",") if x.strip()]
    valid = {"l1", "l2", "l3", "l4"}
    for level in levels:
        if level not in valid:
            raise SystemExit(f"Invalid level: {level}")

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    manifest_rows: List[dict] = []
    failures: List[dict] = []
    generated_counts: Dict[str, int] = {k: 0 for k in levels}
    total_done = 0

    for level, row in iter_level_rows(levels):
        sku = normalize_whitespace(row.get("sku", ""))
        if not sku:
            continue
        sku_dir = OUTPUT_ROOT / level / sku.lower()
        sku_dir.mkdir(parents=True, exist_ok=True)
        svg_path = sku_dir / f"{OUT_BASENAME}.svg"
        png_path = sku_dir / f"{OUT_BASENAME}.png"

        try:
            if not args.png_only:
                svg_path.write_text(svg_for_cover(level, row), encoding="utf-8")
            if args.skip_existing and png_path.exists():
                pass
            else:
                render_png(svg_path, png_path)
        except subprocess.TimeoutExpired:
            failures.append({"level": level.upper(), "sku": sku, "error": "magick timeout"})
            continue
        except subprocess.CalledProcessError as exc:
            failures.append({"level": level.upper(), "sku": sku, "error": f"magick failed ({exc.returncode})"})
            continue

        manifest_rows.append(
            {
                "level": level.upper(),
                "sku": sku,
                "board": row.get("board", ""),
                "listing_title": row.get("listing_title", ""),
                "cover_svg": str(svg_path.relative_to(ROOT)),
                "cover_png": str(png_path.relative_to(ROOT)),
            }
        )
        generated_counts[level] += 1
        total_done += 1
        if total_done % 25 == 0:
            print(f"Progress: {total_done} covers complete...")

    with MANIFEST_PATH.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=["level", "sku", "board", "listing_title", "cover_svg", "cover_png"],
        )
        writer.writeheader()
        writer.writerows(manifest_rows)

    if failures:
        err_path = OUTPUT_ROOT / "payhip-cover-generation-errors.csv"
        with err_path.open("w", encoding="utf-8", newline="") as fh:
            writer = csv.DictWriter(fh, fieldnames=["level", "sku", "error"])
            writer.writeheader()
            writer.writerows(failures)
        print(f"Errors: {len(failures)} (see {err_path})")

    write_readme(generated_counts)

    total = sum(generated_counts.values())
    print("== Payhip Listing Cover Generation ==")
    for level in levels:
        print(f"{level.upper()}: {generated_counts[level]}")
    print(f"Total: {total}")
    print(f"Manifest: {MANIFEST_PATH}")
    print(f"Output root: {OUTPUT_ROOT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
