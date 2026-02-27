#!/usr/bin/env python3
"""Generate L4 Payhip copy templates from listing matrix CSV."""

from __future__ import annotations

import argparse
import csv
from datetime import datetime
from pathlib import Path
from typing import List

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_L4_CSV = ROOT / "payhip/presale/kahoot-payhip-listings-l4.csv"
DEFAULT_OUT_CSV = ROOT / "payhip/presale/kahoot-payhip-l4-copy-template.csv"
DEFAULT_OUT_MD = ROOT / "payhip/presale/kahoot-payhip-l4-copy-template.md"
L1_ANCHOR_USD = 3

OUT_COLUMNS = [
    "sku",
    "board",
    "board_label",
    "unit_count",
    "section_count",
    "subtopic_count",
    "listing_title",
    "subtitle",
    "short_description",
    "description_markdown",
    "seo_title",
    "seo_description",
    "price_early_bird",
    "price_regular",
    "early_bird_end_date",
    "release_date",
    "payhip_url_seed",
    "tags",
    "cta_label",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate L4 Payhip copy templates")
    parser.add_argument("--l4-csv", default=str(DEFAULT_L4_CSV), help="Input L4 matrix CSV")
    parser.add_argument("--out-csv", default=str(DEFAULT_OUT_CSV), help="Output CSV with copy templates")
    parser.add_argument("--out-md", default=str(DEFAULT_OUT_MD), help="Output Markdown copy handbook")
    return parser.parse_args()


def load_rows(path: Path) -> List[dict]:
    with path.open("r", encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def date_long(date_text: str) -> str:
    try:
        return datetime.strptime(date_text, "%Y-%m-%d").strftime("%B %-d, %Y")
    except ValueError:
        try:
            return datetime.strptime(date_text, "%Y-%m-%d").strftime("%B %d, %Y").replace(" 0", " ")
        except ValueError:
            return date_text


def parse_int(text: str) -> int:
    value = str(text or "").strip()
    if not value:
        return 0
    try:
        return int(value)
    except ValueError:
        return 0


def parse_price_usd(text: str) -> float:
    value = "".join(ch for ch in str(text or "") if ch.isdigit() or ch == ".")
    if not value:
        return 0.0
    try:
        return float(value)
    except ValueError:
        return 0.0


def usd(amount: float) -> str:
    rounded = round(amount, 2)
    if rounded.is_integer():
        return f"US${int(rounded)}"
    return f"US${rounded:.2f}"


def all_units_value_line(row: dict) -> str:
    subtopic_count = parse_int(row.get("subtopic_count", ""))
    singles_total = subtopic_count * L1_ANCHOR_USD
    bundle_price = parse_price_usd(row.get("price_early_bird", ""))
    if bundle_price <= 0:
        return "Full-board bundle value is positioned around complete progression and support."
    if singles_total > bundle_price:
        return (
            f"L1 singles total {usd(singles_total)}; "
            f"L4 early-bird {usd(bundle_price)} (save {usd(singles_total - bundle_price)})."
        )
    if singles_total == bundle_price:
        return (
            f"Same entry price as buying L1 separately ({usd(bundle_price)}), "
            "with complete board-level workflow and support."
        )
    return (
        f"Board-complete package pricing is based on full roadmap support "
        f"(L1 subtotal {usd(singles_total)})."
    )


def all_units_value_block(row: dict) -> str:
    subtopic_count = parse_int(row.get("subtopic_count", ""))
    singles_total = subtopic_count * L1_ANCHOR_USD
    bundle_price = parse_price_usd(row.get("price_early_bird", ""))
    if bundle_price <= 0:
        decision_line = "- Pricing will be announced before release."
    elif singles_total > bundle_price:
        decision_line = f"- Savings at early-bird price: **{usd(singles_total - bundle_price)}**."
    elif singles_total == bundle_price:
        decision_line = "- Price break-even versus singles; added value comes from complete board workflow."
    else:
        decision_line = (
            "- Pricing is built around complete-board progression, cross-unit support, and bundled delivery logic."
        )

    return (
        "### Value positioning (L1 anchor: US$3 each)\n"
        f"- L1 single-buy subtotal for this board: **{usd(singles_total)}** ({subtopic_count} x US$3)\n"
        f"- L4 early-bird price: **{usd(bundle_price)}**\n"
        f"{decision_line}"
    )


def build_short_description(row: dict) -> str:
    board_label = row.get("board_label", "")
    unit_count = row.get("unit_count", "")
    section_count = row.get("section_count", "")
    subtopic_count = row.get("subtopic_count", "")
    value_line = all_units_value_line(row)
    return (
        f"Early-bird presale for the complete {board_label} all-units package. "
        f"Includes {unit_count} units, {section_count} sections, and {subtopic_count} subtopics in one roadmap. "
        f"{value_line}"
    )


def build_description(row: dict) -> str:
    board_label = row.get("board_label", "")
    unit_count = row.get("unit_count", "")
    section_count = row.get("section_count", "")
    subtopic_count = row.get("subtopic_count", "")
    early_bird = date_long(row.get("early_bird_end_date", ""))
    release = date_long(row.get("release_date", ""))
    bonus = row.get("bonus", "") or row.get("presale_notes", "")
    value_block = all_units_value_block(row)

    return (
        f"This is the early-bird presale for the **{board_label} All-Units Mega Bundle**.\n\n"
        f"### What this mega bundle covers\n"
        f"- **{unit_count} units**\n"
        f"- **{section_count} sections**\n"
        f"- **{subtopic_count} subtopics**\n"
        f"- A full exam-board structured progression path\n\n"
        f"{value_block}\n\n"
        f"### What you receive now (presale stage)\n"
        f"- Presale entitlement confirmation for full-board access\n"
        f"- Early-bird price lock for all-units package\n"
        f"- Board-level release updates and rollout notifications\n\n"
        f"### What you receive on release ({release})\n"
        f"- All listed unit bundles for this board\n"
        f"- Unit-level worksheets and answer support\n"
        f"- Kahoot-aligned structured progression across topics\n"
        f"- Cross-unit extension roadmap and bundled upgrade logic\n\n"
        f"### Early-bird window\n"
        f"- Early-bird ends: **{early_bird}**\n"
        f"- Official release: **{release}**\n\n"
        f"### Retention and bonus value\n"
        f"- {bonus}\n"
        f"- Need-based bilingual support path is available after purchase (not review-gated).\n\n"
        f"### Policy notes\n"
        f"- Presale terms are listed in the product page and project terms PDF.\n"
        f"- Dates are absolute and promises follow the listed release schedule."
    )


def generate_rows(l4_rows: List[dict]) -> List[dict]:
    output: List[dict] = []
    ordered = sorted(l4_rows, key=lambda r: (r.get("board", ""), r.get("sku", "")))

    for row in ordered:
        listing_title = row.get("listing_title", "")
        subtitle = "Early-Bird Presale | All-Units Mega Bundle"
        short_description = build_short_description(row)
        description_markdown = build_description(row)
        seo_title = f"{listing_title} | Early-Bird Presale"
        seo_description = short_description

        output.append(
            {
                "sku": row.get("sku", ""),
                "board": row.get("board", ""),
                "board_label": row.get("board_label", ""),
                "unit_count": row.get("unit_count", ""),
                "section_count": row.get("section_count", ""),
                "subtopic_count": row.get("subtopic_count", ""),
                "listing_title": listing_title,
                "subtitle": subtitle,
                "short_description": short_description,
                "description_markdown": description_markdown,
                "seo_title": seo_title,
                "seo_description": seo_description,
                "price_early_bird": row.get("price_early_bird", ""),
                "price_regular": row.get("price_regular", ""),
                "early_bird_end_date": row.get("early_bird_end_date", ""),
                "release_date": row.get("release_date", ""),
                "payhip_url_seed": row.get("payhip_url", ""),
                "tags": row.get("tags", ""),
                "cta_label": "Get All-Units Early-Bird Access",
            }
        )

    return output


def write_csv(path: Path, rows: List[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=OUT_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def write_markdown(path: Path, rows: List[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines: List[str] = []
    lines.append("# L4 Payhip Copy Templates")
    lines.append("")
    lines.append("Use this document to paste listing copy into Payhip for each all-units mega bundle.")
    lines.append("")
    lines.append("Global CTA label: `Get All-Units Early-Bird Access`")
    lines.append("")

    for row in rows:
        lines.append(f"## {row['sku']} - {row['listing_title']}")
        lines.append("")
        lines.append(f"- Board: `{row['board_label']}`")
        lines.append(f"- Units: `{row['unit_count']}`")
        lines.append(f"- Sections: `{row['section_count']}`")
        lines.append(f"- Subtopics: `{row['subtopic_count']}`")
        lines.append(f"- Early-bird price: `{row['price_early_bird']}`")
        lines.append(f"- Regular price: `{row['price_regular']}`")
        lines.append(f"- Early-bird end: `{row['early_bird_end_date']}`")
        lines.append(f"- Release date: `{row['release_date']}`")
        lines.append(f"- Seed URL: `{row['payhip_url_seed']}`")
        lines.append("")
        lines.append("### Subtitle")
        lines.append("")
        lines.append(row["subtitle"])
        lines.append("")
        lines.append("### Short Description")
        lines.append("")
        lines.append(row["short_description"])
        lines.append("")
        lines.append("### Full Description (Markdown)")
        lines.append("")
        lines.append(row["description_markdown"])
        lines.append("")
        lines.append("### SEO")
        lines.append("")
        lines.append(f"- SEO title: {row['seo_title']}")
        lines.append(f"- SEO description: {row['seo_description']}")
        lines.append("")
        lines.append("### Tags")
        lines.append("")
        lines.append(row["tags"])
        lines.append("")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    args = parse_args()
    in_csv = Path(args.l4_csv)
    out_csv = Path(args.out_csv)
    out_md = Path(args.out_md)

    l4_rows = load_rows(in_csv)
    if not l4_rows:
        print(f"No rows found in {in_csv}")
        return 1

    rows = generate_rows(l4_rows)
    write_csv(out_csv, rows)
    write_markdown(out_md, rows)

    print("== L4 Copy Templates ==")
    print(f"Input rows: {len(l4_rows)}")
    print(f"Output CSV: {out_csv}")
    print(f"Output MD: {out_md}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
