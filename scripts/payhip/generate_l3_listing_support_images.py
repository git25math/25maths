#!/usr/bin/env python3
"""Generate L3 Payhip support images (#02-#09) for each unit listing."""

from __future__ import annotations

import argparse
import csv
from pathlib import Path
from typing import Dict, List, Tuple

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
INPUT_CSV = ROOT / "payhip/presale/kahoot-payhip-listings-l3.csv"
ASSET_ROOT = ROOT / "payhip/presale/listing-assets/l3"

W = 2320
H = 1520
L1_ANCHOR_USD = 3

FILES = [
    ("02-unit-roadmap-2320x1520-payhip.png", "roadmap"),
    ("03-whats-included-2320x1520-payhip.png", "included"),
    ("04-kahoot-workflow-2320x1520-payhip.png", "workflow"),
    ("05-worksheet-support-2320x1520-payhip.png", "worksheet"),
    ("06-release-plan-2320x1520-payhip.png", "timeline"),
    ("07-pricing-value-2320x1520-payhip.png", "pricing"),
    ("08-bilingual-support-2320x1520-payhip.png", "bilingual"),
    ("09-upgrade-path-2320x1520-payhip.png", "upgrade"),
]

BOARD_STYLE: Dict[str, Dict[str, str]] = {
    "cie0580": {
        "bg_top": "#EAF1FF",
        "bg_bottom": "#F8FBFF",
        "accent": "#1D4ED8",
        "brand": "#8B1538",
        "text": "#0F2748",
        "muted": "#5D738D",
        "card": "#FFFFFF",
    },
    "edexcel-4ma1": {
        "bg_top": "#E9FAF6",
        "bg_bottom": "#F8FFFD",
        "accent": "#0F766E",
        "brand": "#1E3A8A",
        "text": "#0F2748",
        "muted": "#5D738D",
        "card": "#FFFFFF",
    },
}

FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_CACHE: Dict[Tuple[bool, int], ImageFont.FreeTypeFont] = {}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate L3 support PNGs (#02-#09).")
    parser.add_argument("--input-csv", default=str(INPUT_CSV), help="L3 listing matrix CSV path")
    parser.add_argument("--asset-root", default=str(ASSET_ROOT), help="L3 listing-assets root")
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing support PNGs if they already exist",
    )
    parser.add_argument(
        "--max-rows",
        type=int,
        default=0,
        help="Generate only first N rows for QA (0 means all)",
    )
    return parser.parse_args()


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    key = (bold, size)
    if key in FONT_CACHE:
        return FONT_CACHE[key]
    path = FONT_BOLD if bold else FONT_REG
    FONT_CACHE[key] = ImageFont.truetype(path, size=size)
    return FONT_CACHE[key]


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def blend(c1: Tuple[int, int, int], c2: Tuple[int, int, int], t: float) -> Tuple[int, int, int]:
    return (
        int(c1[0] + (c2[0] - c1[0]) * t),
        int(c1[1] + (c2[1] - c1[1]) * t),
        int(c1[2] + (c2[2] - c1[2]) * t),
    )


def draw_vertical_gradient(img: Image.Image, top_hex: str, bottom_hex: str) -> None:
    top = hex_to_rgb(top_hex)
    bottom = hex_to_rgb(bottom_hex)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / max(H - 1, 1)
        draw.line([(0, y), (W, y)], fill=blend(top, bottom, t), width=1)


def text_wrap(draw: ImageDraw.ImageDraw, text: str, max_width: int, fnt: ImageFont.FreeTypeFont) -> List[str]:
    words = text.split()
    if not words:
        return [""]
    lines: List[str] = []
    line = words[0]
    for w in words[1:]:
        candidate = f"{line} {w}"
        width = draw.textbbox((0, 0), candidate, font=fnt)[2]
        if width <= max_width:
            line = candidate
        else:
            lines.append(line)
            line = w
    lines.append(line)
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: Tuple[int, int],
    max_width: int,
    fnt: ImageFont.FreeTypeFont,
    fill: str,
    line_gap: int = 8,
) -> int:
    x, y = xy
    lines = text_wrap(draw, text, max_width=max_width, fnt=fnt)
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill)
        h = draw.textbbox((x, y), line, font=fnt)[3] - draw.textbbox((x, y), line, font=fnt)[1]
        y += h + line_gap
    return y


def parse_money(value: str) -> float:
    cleaned = "".join(ch for ch in str(value or "") if ch.isdigit() or ch == ".")
    return float(cleaned) if cleaned else 0.0


def money(value: float) -> str:
    if float(value).is_integer():
        return f"US${int(value)}"
    return f"US${value:.2f}"


def round_box(
    draw: ImageDraw.ImageDraw,
    xy: Tuple[int, int, int, int],
    radius: int,
    fill: str,
    outline: str | None = None,
    width: int = 1,
) -> None:
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_header(draw: ImageDraw.ImageDraw, row: dict, style: Dict[str, str]) -> None:
    draw.rectangle([(0, 0), (W, 86)], fill=style["brand"])
    round_box(draw, (52, 114, 760, 224), radius=48, fill=style["accent"])
    round_box(draw, (792, 114, 1480, 224), radius=48, fill="#F2F5FA")
    round_box(draw, (1512, 114, 2268, 224), radius=48, fill="#F2F5FA")

    draw.text((130, 145), "L3 Unit Bundle", font=font(56, bold=True), fill="#FFFFFF")
    draw.text((860, 145), row["board_label"], font=font(56, bold=True), fill=style["brand"])
    draw.text((1580, 145), row["tier_scope"], font=font(56, bold=True), fill=style["muted"])


def draw_footer(draw: ImageDraw.ImageDraw, style: Dict[str, str]) -> None:
    draw.rectangle([(0, H - 116), (W, H)], fill="#8F103D")
    draw.text((120, H - 86), "25Maths Payhip Presale", font=font(64, bold=True), fill="#FFFFFF")
    draw.text((1320, H - 86), "Kahoot + Worksheet + Exam Support", font=font(56, bold=True), fill="#FFFFFF")


def card_base(draw: ImageDraw.ImageDraw, style: Dict[str, str]) -> None:
    round_box(draw, (120, 280, W - 120, H - 156), radius=56, fill=style["card"], outline="#D6E1EE", width=3)
    draw.rectangle([(120, 280), (154, H - 156)], fill=style["accent"])


def common_title(draw: ImageDraw.ImageDraw, row: dict, style: Dict[str, str], subtitle: str) -> int:
    y = 360
    draw.text((250, y), row["sku"], font=font(62, bold=True), fill="#5A6E87")
    y += 86
    draw.text((250, y), f"{row['unit_code']} {row['unit_title']}", font=font(122, bold=True), fill=style["text"])
    y += 162
    draw.text((250, y), subtitle, font=font(72, bold=True), fill="#27486B")
    y += 102
    return y


def image_roadmap(row: dict, style: Dict[str, str]) -> Image.Image:
    img = Image.new("RGB", (W, H), "white")
    draw_vertical_gradient(img, style["bg_top"], style["bg_bottom"])
    draw = ImageDraw.Draw(img)
    draw_header(draw, row, style)
    card_base(draw, style)
    y = common_title(draw, row, style, "Unit Roadmap Snapshot")
    bullets = [
        f"{row['section_count']} sections connected in one unit path",
        f"{row['subtopic_count']} subtopics with Kahoot-aligned progression",
        "One purchase entry for structured unit completion",
    ]
    for b in bullets:
        draw.text((280, y), "•", font=font(58, bold=True), fill=style["accent"])
        y = draw_wrapped(draw, b, (330, y + 6), max_width=1600, fnt=font(52), fill=style["text"], line_gap=12) + 14
    draw_footer(draw, style)
    return img


def image_included(row: dict, style: Dict[str, str]) -> Image.Image:
    img = Image.new("RGB", (W, H), "white")
    draw_vertical_gradient(img, style["bg_top"], style["bg_bottom"])
    draw = ImageDraw.Draw(img)
    draw_header(draw, row, style)
    card_base(draw, style)
    y = common_title(draw, row, style, "What Is Included")
    items = [
        "Unit-level worksheet pack (release delivery)",
        "Answer and worked support for each worksheet set",
        "Kahoot companion route across all unit subtopics",
        "Presale entitlement + release updates",
    ]
    box_y = y
    for item in items:
        round_box(draw, (250, box_y, W - 250, box_y + 110), radius=24, fill="#F3F8FF", outline="#D6E1EE", width=2)
        draw.text((290, box_y + 30), item, font=font(46, bold=True), fill=style["text"])
        box_y += 132
    draw_footer(draw, style)
    return img


def image_workflow(row: dict, style: Dict[str, str]) -> Image.Image:
    img = Image.new("RGB", (W, H), "white")
    draw_vertical_gradient(img, style["bg_top"], style["bg_bottom"])
    draw = ImageDraw.Draw(img)
    draw_header(draw, row, style)
    card_base(draw, style)
    y = common_title(draw, row, style, "Kahoot + Worksheet Workflow")
    steps = ["Learn Core Idea", "Kahoot Drill", "Worksheet Practice", "Answer Check", "Exam-style Reinforce"]
    x = 250
    for i, step in enumerate(steps, start=1):
        round_box(draw, (x, y, x + 360, y + 170), radius=30, fill="#F7FAFF", outline="#D6E1EE", width=2)
        draw.text((x + 24, y + 24), f"Step {i}", font=font(36, bold=True), fill=style["accent"])
        draw_wrapped(draw, step, (x + 24, y + 72), max_width=316, fnt=font(40, bold=True), fill=style["text"], line_gap=8)
        if i < len(steps):
            draw.text((x + 372, y + 66), "→", font=font(72, bold=True), fill=style["muted"])
        x += 408
    draw_footer(draw, style)
    return img


def image_worksheet(row: dict, style: Dict[str, str]) -> Image.Image:
    img = Image.new("RGB", (W, H), "white")
    draw_vertical_gradient(img, style["bg_top"], style["bg_bottom"])
    draw = ImageDraw.Draw(img)
    draw_header(draw, row, style)
    card_base(draw, style)
    y = common_title(draw, row, style, "Worksheet + Answer Support")
    left = [
        "Designed for unit progression",
        "Aligned to syllabus subtopics",
        "Clear answer support for self-check",
    ]
    right = [
        "Exam-focused question mix",
        "Pacing-friendly worksheet chunks",
        "Ready to pair with Kahoot sessions",
    ]
    lx, rx = 260, 1180
    by = y
    for ltxt, rtxt in zip(left, right):
        round_box(draw, (lx, by, lx + 840, by + 130), radius=24, fill="#F5FAFF", outline="#D6E1EE", width=2)
        draw.text((lx + 24, by + 42), ltxt, font=font(42, bold=True), fill=style["text"])
        round_box(draw, (rx, by, rx + 840, by + 130), radius=24, fill="#F5FAFF", outline="#D6E1EE", width=2)
        draw.text((rx + 24, by + 42), rtxt, font=font(42, bold=True), fill=style["text"])
        by += 154
    draw_footer(draw, style)
    return img


def image_timeline(row: dict, style: Dict[str, str]) -> Image.Image:
    img = Image.new("RGB", (W, H), "white")
    draw_vertical_gradient(img, style["bg_top"], style["bg_bottom"])
    draw = ImageDraw.Draw(img)
    draw_header(draw, row, style)
    card_base(draw, style)
    y = common_title(draw, row, style, "Presale Timeline")
    draw.line((280, y + 120, W - 280, y + 120), fill="#B8C9DC", width=8)
    milestones = [
        ("Now", "Presale Open"),
        (row["early_bird_end_date"], "Early-bird Ends"),
        (row["release_date"], "Official Release"),
    ]
    x_positions = [320, W // 2, W - 320]
    for x, (date_label, name) in zip(x_positions, milestones):
        draw.ellipse((x - 30, y + 90, x + 30, y + 150), fill=style["accent"])
        draw.text((x - 130, y + 170), date_label, font=font(40, bold=True), fill=style["text"])
        draw.text((x - 150, y + 220), name, font=font(38), fill=style["muted"])
    draw_wrapped(
        draw,
        "Buy during presale to lock the early-bird price. Delivery follows the official release schedule shown above.",
        (280, y + 330),
        max_width=W - 560,
        fnt=font(44),
        fill=style["text"],
        line_gap=10,
    )
    draw_footer(draw, style)
    return img


def image_pricing(row: dict, style: Dict[str, str]) -> Image.Image:
    subtopic_count = int(row["subtopic_count"])
    early = parse_money(row["price_early_bird"])
    regular = parse_money(row["price_regular"])
    singles_total = float(subtopic_count * L1_ANCHOR_USD)
    save = singles_total - early

    img = Image.new("RGB", (W, H), "white")
    draw_vertical_gradient(img, style["bg_top"], style["bg_bottom"])
    draw = ImageDraw.Draw(img)
    draw_header(draw, row, style)
    card_base(draw, style)
    y = common_title(draw, row, style, "Pricing + Value")

    round_box(draw, (250, y, 1080, y + 360), radius=32, fill="#F5FAFF", outline="#D6E1EE", width=2)
    draw.text((290, y + 36), "L1 Anchor", font=font(44, bold=True), fill=style["accent"])
    draw.text((290, y + 110), f"{subtopic_count} x US$3 = {money(singles_total)}", font=font(62, bold=True), fill=style["text"])

    round_box(draw, (1130, y, 2060, y + 360), radius=32, fill="#F5FAFF", outline="#D6E1EE", width=2)
    draw.text((1170, y + 36), "L3 Bundle Price", font=font(44, bold=True), fill=style["accent"])
    draw.text((1170, y + 110), f"EB {money(early)} | REG {money(regular)}", font=font(62, bold=True), fill=style["text"])

    value_line = (
        f"Early-bird savings vs L1 single-buy total: {money(save)}"
        if save > 0
        else "Bundle positioned for structured unit support beyond single-file purchase."
    )
    draw_wrapped(draw, value_line, (280, y + 420), max_width=W - 560, fnt=font(52, bold=True), fill=style["text"], line_gap=10)
    draw_footer(draw, style)
    return img


def image_bilingual(row: dict, style: Dict[str, str]) -> Image.Image:
    img = Image.new("RGB", (W, H), "white")
    draw_vertical_gradient(img, style["bg_top"], style["bg_bottom"])
    draw = ImageDraw.Draw(img)
    draw_header(draw, row, style)
    card_base(draw, style)
    y = common_title(draw, row, style, "Optional Bilingual Support")
    lines = [
        "Need-based EN-ZH vocabulary cards available for learners who need language support.",
        "Not mandatory for all buyers.",
        "Returning buyers can access bilingual upgrade coupons in later release phases.",
    ]
    for line in lines:
        round_box(draw, (250, y, W - 250, y + 126), radius=24, fill="#F5FAFF", outline="#D6E1EE", width=2)
        draw_wrapped(draw, line, (286, y + 36), max_width=W - 572, fnt=font(42, bold=True), fill=style["text"], line_gap=8)
        y += 150
    draw_footer(draw, style)
    return img


def image_upgrade(row: dict, style: Dict[str, str]) -> Image.Image:
    img = Image.new("RGB", (W, H), "white")
    draw_vertical_gradient(img, style["bg_top"], style["bg_bottom"])
    draw = ImageDraw.Draw(img)
    draw_header(draw, row, style)
    card_base(draw, style)
    y = common_title(draw, row, style, "Upgrade Path")
    nodes = [
        ("L1", "SubTopic MVP"),
        ("L2", "Section Bundle"),
        ("L3", "Unit Bundle"),
        ("L4", "All-Units Bundle"),
    ]
    x = 240
    for idx, (lv, name) in enumerate(nodes):
        fill = style["accent"] if lv == "L3" else "#F5FAFF"
        text_fill = "#FFFFFF" if lv == "L3" else style["text"]
        round_box(draw, (x, y, x + 460, y + 220), radius=36, fill=fill, outline="#D6E1EE", width=2)
        draw.text((x + 40, y + 48), lv, font=font(68, bold=True), fill=text_fill)
        draw.text((x + 150, y + 62), name, font=font(42, bold=True), fill=text_fill)
        if idx < len(nodes) - 1:
            draw.text((x + 476, y + 74), "→", font=font(72, bold=True), fill=style["muted"])
        x += 520
    draw_wrapped(
        draw,
        f"This product is the L3 step for {row['unit_code']} {row['unit_title']}, built for full unit completion.",
        (260, y + 290),
        max_width=W - 520,
        fnt=font(48, bold=True),
        fill=style["text"],
        line_gap=8,
    )
    draw_footer(draw, style)
    return img


def render(kind: str, row: dict, style: Dict[str, str]) -> Image.Image:
    if kind == "roadmap":
        return image_roadmap(row, style)
    if kind == "included":
        return image_included(row, style)
    if kind == "workflow":
        return image_workflow(row, style)
    if kind == "worksheet":
        return image_worksheet(row, style)
    if kind == "timeline":
        return image_timeline(row, style)
    if kind == "pricing":
        return image_pricing(row, style)
    if kind == "bilingual":
        return image_bilingual(row, style)
    if kind == "upgrade":
        return image_upgrade(row, style)
    raise ValueError(f"Unsupported kind: {kind}")


def load_rows(path: Path) -> List[dict]:
    with path.open("r", encoding="utf-8", newline="") as fh:
        rows = list(csv.DictReader(fh))
    return rows


def main() -> int:
    args = parse_args()
    rows = load_rows(Path(args.input_csv))
    if args.max_rows > 0:
        rows = rows[: args.max_rows]

    generated = 0
    skipped = 0
    missing_dirs = 0

    for row in rows:
        folder = Path(args.asset_root) / row["slug_candidate"]
        if not folder.exists():
            missing_dirs += 1
            print(f"missing_dir: {folder}")
            continue

        style = BOARD_STYLE.get(row["board"], BOARD_STYLE["cie0580"])
        row_ctx = {
            "sku": row["sku"],
            "board_label": row["board_label"],
            "tier_scope": row["tier_scope"],
            "unit_code": row["unit_code"],
            "unit_title": row["unit_title"],
            "subtopic_count": row["subtopic_count"],
            "section_count": row["section_count"],
            "price_early_bird": row["price_early_bird"],
            "price_regular": row["price_regular"],
            "early_bird_end_date": row["early_bird_end_date"],
            "release_date": row["release_date"],
        }

        for filename, kind in FILES:
            out = folder / filename
            if out.exists() and not args.overwrite:
                skipped += 1
                continue
            img = render(kind, row_ctx, style)
            img.save(out, format="PNG", optimize=True)
            generated += 1

    print("== L3 Support Images ==")
    print(f"rows_processed={len(rows)}")
    print(f"generated_png={generated}")
    print(f"skipped_existing={skipped}")
    print(f"missing_dirs={missing_dirs}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
