#!/usr/bin/env python3
"""Generate L1 Payhip copy templates from listing matrix CSV."""

from __future__ import annotations

import argparse
import csv
from datetime import datetime
from pathlib import Path
from typing import List

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_L1_CSV = ROOT / "payhip/presale/kahoot-payhip-listings-l1.csv"
DEFAULT_OUT_CSV = ROOT / "payhip/presale/kahoot-payhip-l1-copy-template.csv"
DEFAULT_OUT_MD = ROOT / "payhip/presale/kahoot-payhip-l1-copy-template.md"

OUT_COLUMNS = [
    "sku",
    "board",
    "board_label",
    "unit_code",
    "unit_key",
    "unit_title",
    "section_code",
    "section_key",
    "section_title",
    "subtopic_code",
    "subtopic_id",
    "subtopic_title",
    "tier_scope",
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
    "kahoot_url",
    "worksheet_url",
    "section_bundle_url",
    "unit_bundle_url",
    "payhip_url_seed",
    "deliver_now",
    "deliver_on_release",
    "bonus",
    "tags",
    "cta_label",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate L1 Payhip copy templates")
    parser.add_argument("--l1-csv", default=str(DEFAULT_L1_CSV), help="Input L1 matrix CSV")
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


def title_case_subtopic(text: str) -> str:
    parts = [p for p in text.replace("_", " ").split(" ") if p]
    return " ".join(word.capitalize() for word in parts)


def build_short_description(row: dict) -> str:
    board_label = row.get("board_label", "")
    subtopic_code = row.get("subtopic_code", "")
    subtopic_title = title_case_subtopic(row.get("subtopic_title", ""))
    tier_scope = row.get("tier_scope", "")
    return (
        f"Early-bird presale for {board_label} {subtopic_code} {subtopic_title} ({tier_scope}). "
        f"Worksheet + answers + Kahoot companion are delivered on release."
    )


def build_description(row: dict) -> str:
    board_label = row.get("board_label", "")
    unit_title = row.get("unit_title", "")
    section_title = row.get("section_title", "")
    subtopic_code = row.get("subtopic_code", "")
    subtopic_title = title_case_subtopic(row.get("subtopic_title", ""))
    tier_scope = row.get("tier_scope", "")
    early_bird = date_long(row.get("early_bird_end_date", ""))
    release = date_long(row.get("release_date", ""))
    deliver_now = row.get("deliver_now", "")
    deliver_on_release = row.get("deliver_on_release", "")
    bonus = row.get("presale_notes", "") or row.get("bonus", "")
    kahoot_url = row.get("kahoot_url", "")
    section_bundle_url = row.get("section_bundle_url", "")
    unit_bundle_url = row.get("unit_bundle_url", "")

    return (
        f"This is the early-bird presale for **{board_label} {subtopic_code} {subtopic_title}** "
        f"({tier_scope}) in **{unit_title} / {section_title}**.\n\n"
        f"### What this SubTopic covers\n"
        f"- Focused exam-spec practice for one micro-topic\n"
        f"- Built to pair worksheet drills with Kahoot recap flow\n"
        f"- Fast MVP purchase point for targeted revision\n\n"
        f"### What you receive now (presale stage)\n"
        f"- {deliver_now}\n\n"
        f"### What you receive on release ({release})\n"
        f"- {deliver_on_release}\n\n"
        f"### Kahoot companion\n"
        f"- Dedicated Kahoot link for this SubTopic: {kahoot_url}\n\n"
        f"### Early-bird window\n"
        f"- Early-bird ends: **{early_bird}**\n"
        f"- Official release: **{release}**\n\n"
        f"### Upgrade path\n"
        f"- Step 1: SubTopic MVP (this listing)\n"
        f"- Step 2: Section bundle (L2): {section_bundle_url}\n"
        f"- Step 3: Unit bundle (L3): {unit_bundle_url}\n\n"
        f"### Bonus and retention\n"
        f"- {bonus}\n"
        f"- Need-based bilingual support path is available after purchase (not review-gated).\n\n"
        f"### Policy notes\n"
        f"- Presale terms are listed in the product page and project terms PDF.\n"
        f"- Dates are absolute and promises follow the listed release schedule."
    )


def generate_rows(l1_rows: List[dict]) -> List[dict]:
    output: List[dict] = []
    ordered = sorted(
        l1_rows,
        key=lambda r: (
            r.get("board", ""),
            r.get("section_code", ""),
            r.get("subtopic_code", ""),
            r.get("sku", ""),
        ),
    )

    for row in ordered:
        listing_title = row.get("listing_title", "")
        tier_scope = row.get("tier_scope", "")
        subtitle = f"Early-Bird Presale | {tier_scope} | SubTopic MVP"
        short_description = build_short_description(row)
        description_markdown = build_description(row)
        seo_title = f"{listing_title} | Early-Bird Presale"
        seo_description = short_description

        output.append(
            {
                "sku": row.get("sku", ""),
                "board": row.get("board", ""),
                "board_label": row.get("board_label", ""),
                "unit_code": row.get("unit_code", ""),
                "unit_key": row.get("unit_key", ""),
                "unit_title": row.get("unit_title", ""),
                "section_code": row.get("section_code", ""),
                "section_key": row.get("section_key", ""),
                "section_title": row.get("section_title", ""),
                "subtopic_code": row.get("subtopic_code", ""),
                "subtopic_id": row.get("subtopic_id", ""),
                "subtopic_title": title_case_subtopic(row.get("subtopic_title", "")),
                "tier_scope": tier_scope,
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
                "kahoot_url": row.get("kahoot_url", ""),
                "worksheet_url": row.get("worksheet_url", ""),
                "section_bundle_url": row.get("section_bundle_url", ""),
                "unit_bundle_url": row.get("unit_bundle_url", ""),
                "payhip_url_seed": row.get("payhip_url", ""),
                "deliver_now": row.get("deliver_now", ""),
                "deliver_on_release": row.get("deliver_on_release", ""),
                "bonus": row.get("bonus", ""),
                "tags": row.get("tags", ""),
                "cta_label": "Get SubTopic Early-Bird Access",
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
    lines.append("# L1 Payhip Copy Templates")
    lines.append("")
    lines.append("Use this document to paste listing copy into Payhip for each L1 SubTopic MVP item.")
    lines.append("")
    lines.append("Global CTA label: `Get SubTopic Early-Bird Access`")
    lines.append("")

    for row in rows:
        lines.append(f"## {row['sku']} - {row['listing_title']}")
        lines.append("")
        lines.append(f"- Board: `{row['board_label']}`")
        lines.append(f"- Tier scope: `{row['tier_scope']}`")
        lines.append(f"- Unit: `{row['unit_code']} {row['unit_title']}`")
        lines.append(f"- Section: `{row['section_code']} {row['section_title']}`")
        lines.append(f"- SubTopic: `{row['subtopic_code']} {row['subtopic_title']}`")
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
        lines.append("### Delivery Notes")
        lines.append("")
        lines.append(f"- Deliver now: {row['deliver_now']}")
        lines.append(f"- Deliver on release: {row['deliver_on_release']}")
        lines.append("")
        lines.append("### Links")
        lines.append("")
        lines.append(f"- Kahoot URL: {row['kahoot_url']}")
        lines.append(f"- Worksheet URL: {row['worksheet_url']}")
        lines.append(f"- Section bundle URL: {row['section_bundle_url']}")
        lines.append(f"- Unit bundle URL: {row['unit_bundle_url']}")
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
    in_csv = Path(args.l1_csv)
    out_csv = Path(args.out_csv)
    out_md = Path(args.out_md)

    l1_rows = load_rows(in_csv)
    if not l1_rows:
        print(f"No rows found in {in_csv}")
        return 1

    rows = generate_rows(l1_rows)
    write_csv(out_csv, rows)
    write_markdown(out_md, rows)

    print("== L1 Copy Templates ==")
    print(f"Input rows: {len(l1_rows)}")
    print(f"Output CSV: {out_csv}")
    print(f"Output MD: {out_md}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
