#!/usr/bin/env python3
"""Export _data/kahoot_subtopic_links.json to editable CSV."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parents[2]
LINKS_FILE = ROOT / "_data/kahoot_subtopic_links.json"
CIE_FILE = ROOT / "_data/kahoot_cie0580_subtopics.json"
EDX_FILE = ROOT / "_data/kahoot_edexcel4ma1_subtopics.json"

CSV_COLUMNS = [
    "id",
    "board",
    "tier",
    "section_code",
    "section_key",
    "unit_key",
    "subtopic_code",
    "title",
    "status",
    "kahoot_url",
    "worksheet_payhip_url",
    "section_bundle_payhip_url",
    "unit_bundle_payhip_url",
    "bundle_url",
    "past_paper_analysis_url",
    "variant_practice_url",
    "presale_release_date",
    "presale_early_bird_end_date",
    "presale_notes",
    "notes",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export kahoot_subtopic_links to CSV")
    parser.add_argument(
        "--out",
        default=str(ROOT / "payhip/presale/kahoot-subtopic-links-working.csv"),
        help="Output CSV path",
    )
    parser.add_argument("--board", choices=["cie0580", "edexcel-4ma1"], help="Filter by board")
    parser.add_argument("--tier", help="Filter by tier label (Core/Extended/Foundation/Higher)")
    parser.add_argument("--status", help="Filter by status (planned/presale/live/archived)")
    parser.add_argument(
        "--include-archived",
        action="store_true",
        help="Include archived rows (default excludes archived)",
    )
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def build_context_index() -> Dict[str, Dict[str, str]]:
    context: Dict[str, Dict[str, str]] = {}

    for board, data_file in (("cie0580", CIE_FILE), ("edexcel-4ma1", EDX_FILE)):
        data = load_json(data_file)
        for section in data.get("sections", []):
            section_key = section.get("section_key", "")
            section_code = section.get("section_code", "")
            unit_key = section.get("domain", "")
            tier = section.get("tier", "")
            for item in section.get("items", []):
                subtopic_id = item.get("id", "")
                if not subtopic_id:
                    continue
                context[subtopic_id] = {
                    "board": board,
                    "tier": tier,
                    "section_code": section_code,
                    "section_key": section_key,
                    "unit_key": unit_key,
                    "subtopic_code": item.get("code", ""),
                    "title": item.get("title", ""),
                }

    return context


def parse_id_fallback(subtopic_id: str) -> Dict[str, str]:
    parts = subtopic_id.split(":")
    board = parts[0] if len(parts) >= 1 else ""
    section_key = parts[1] if len(parts) >= 2 else ""
    slug = parts[2] if len(parts) >= 3 else ""
    section_code = ""
    unit_key = ""

    if section_key:
        sec_parts = section_key.split("-")
        if len(sec_parts) >= 2:
            unit_key = sec_parts[0]
            code = sec_parts[1]
            section_code = code.upper()

    subtopic_code = ""
    if slug:
        slug_parts = slug.split("-")
        if len(slug_parts) >= 2:
            subtopic_code = f"{slug_parts[0].upper()}-{slug_parts[1]}"

    return {
        "board": board,
        "tier": "",
        "section_code": section_code,
        "section_key": section_key,
        "unit_key": unit_key,
        "subtopic_code": subtopic_code,
        "title": slug,
    }


def main() -> int:
    args = parse_args()

    links = load_json(LINKS_FILE)
    if not isinstance(links, dict):
        raise SystemExit(f"Links file must be JSON object map: {LINKS_FILE}")

    context_index = build_context_index()

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    rows: List[Dict[str, str]] = []
    for subtopic_id in sorted(links.keys()):
        link = links.get(subtopic_id)
        if not isinstance(link, dict):
            continue

        ctx = context_index.get(subtopic_id, parse_id_fallback(subtopic_id))
        status = (link.get("status") or "").strip().lower()

        if not args.include_archived and status == "archived":
            continue
        if args.board and ctx.get("board") != args.board:
            continue
        if args.tier and (ctx.get("tier") or "").lower() != args.tier.lower():
            continue
        if args.status and status != args.status.lower():
            continue

        row = {
            "id": subtopic_id,
            "board": ctx.get("board", ""),
            "tier": ctx.get("tier", ""),
            "section_code": ctx.get("section_code", ""),
            "section_key": ctx.get("section_key", ""),
            "unit_key": ctx.get("unit_key", ""),
            "subtopic_code": ctx.get("subtopic_code", ""),
            "title": ctx.get("title", ""),
            "status": link.get("status", ""),
            "kahoot_url": link.get("kahoot_url", ""),
            "worksheet_payhip_url": link.get("worksheet_payhip_url", ""),
            "section_bundle_payhip_url": link.get("section_bundle_payhip_url", ""),
            "unit_bundle_payhip_url": link.get("unit_bundle_payhip_url", ""),
            "bundle_url": link.get("bundle_url", ""),
            "past_paper_analysis_url": link.get("past_paper_analysis_url", ""),
            "variant_practice_url": link.get("variant_practice_url", ""),
            "presale_release_date": link.get("presale_release_date", ""),
            "presale_early_bird_end_date": link.get("presale_early_bird_end_date", ""),
            "presale_notes": link.get("presale_notes", ""),
            "notes": link.get("notes", ""),
        }
        rows.append(row)

    with out_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    print("== Export Summary ==")
    print(f"Output: {out_path}")
    print(f"Rows: {len(rows)}")
    print(f"Board filter: {args.board or 'all'}")
    print(f"Tier filter: {args.tier or 'all'}")
    print(f"Status filter: {args.status or 'all'}")
    print(f"Include archived: {args.include_archived}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
