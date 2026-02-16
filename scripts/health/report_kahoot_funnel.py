#!/usr/bin/env python3
"""Generate a markdown health report for the Kahoot presale funnel."""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

ROOT = Path(__file__).resolve().parents[2]
CIE_FILE = ROOT / "_data/kahoot_cie0580_subtopics.json"
EDX_FILE = ROOT / "_data/kahoot_edexcel4ma1_subtopics.json"
LINKS_FILE = ROOT / "_data/kahoot_subtopic_links.json"
CATALOG_FILE = ROOT / "_data/kahoot_presale_catalog.json"

REQUIRED_FIELDS = [
    "kahoot_url",
    "worksheet_payhip_url",
    "section_bundle_payhip_url",
    "unit_bundle_payhip_url",
    "presale_release_date",
    "presale_early_bird_end_date",
]

STATUS_VALUES = {"planned", "presale", "live", "archived"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Kahoot funnel health report")
    parser.add_argument(
        "--out",
        default=str(ROOT / "payhip/presale/kahoot-funnel-health.md"),
        help="Output markdown report path",
    )
    parser.add_argument(
        "--json-out",
        help="Optional JSON summary output path",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit non-zero if there are missing required fields or non-sellable statuses",
    )
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def is_blank(value) -> bool:
    return not str(value or "").strip()


def init_stats() -> dict:
    return {
        "total": 0,
        "complete": 0,
        "missing": 0,
        "status": Counter(),
    }


def to_title(value: str) -> str:
    return " ".join(word.capitalize() for word in str(value or "").replace("-", " ").split())


def collect_items(board_key: str, board_data: dict) -> Iterable[dict]:
    for section in board_data.get("sections", []):
        section_key = section.get("section_key", "")
        section_code = section.get("section_code", "")
        section_title = section.get("section_title", "")
        unit_key = section.get("domain", "")
        tier = section.get("tier", "")

        for item in section.get("items", []):
            yield {
                "board": board_key,
                "tier": tier,
                "section_key": section_key,
                "section_code": section_code,
                "section_title": section_title,
                "unit_key": unit_key,
                "id": item.get("id", ""),
                "code": item.get("code", ""),
                "title": item.get("title", ""),
            }


def md_table(rows: List[List[str]]) -> str:
    if not rows:
        return ""
    head = "| " + " | ".join(rows[0]) + " |"
    sep = "| " + " | ".join(["---"] * len(rows[0])) + " |"
    body = ["| " + " | ".join(r) + " |" for r in rows[1:]]
    return "\n".join([head, sep] + body)


def main() -> int:
    args = parse_args()

    cie = load_json(CIE_FILE)
    edx = load_json(EDX_FILE)
    links = load_json(LINKS_FILE)
    catalog = load_json(CATALOG_FILE)

    board_items = list(collect_items("cie0580", cie)) + list(collect_items("edexcel-4ma1", edx))

    board_stats: Dict[str, dict] = defaultdict(init_stats)
    tier_stats: Dict[Tuple[str, str], dict] = defaultdict(init_stats)
    unit_stats: Dict[Tuple[str, str], dict] = defaultdict(init_stats)
    section_stats: Dict[Tuple[str, str], dict] = defaultdict(init_stats)

    section_meta: Dict[Tuple[str, str], dict] = {}
    unit_meta: Dict[Tuple[str, str], dict] = {}
    board_meta: Dict[str, dict] = {
        "cie0580": {"label": "CIE 0580"},
        "edexcel-4ma1": {"label": "Edexcel 4MA1"},
    }

    missing_field_counts: Counter = Counter()
    invalid_status_ids: List[str] = []
    non_sellable_ids: List[str] = []
    date_mismatch_count = 0

    catalog_units: Dict[str, Dict[str, dict]] = {}
    for board_key, board_data in (catalog.get("boards") or {}).items():
        units = {}
        for unit in board_data.get("units", []):
            key = unit.get("key")
            if isinstance(key, str) and key:
                units[key] = unit
        catalog_units[board_key] = units

    for item in board_items:
        item_id = item["id"]
        board = item["board"]
        tier = item["tier"]
        unit_key = item["unit_key"]
        section_key = item["section_key"]

        link = links.get(item_id, {}) if isinstance(links.get(item_id), dict) else {}
        status = str(link.get("status", "planned")).strip().lower() or "planned"
        if status not in STATUS_VALUES:
            invalid_status_ids.append(item_id)
            status = "planned"

        missing_fields = [f for f in REQUIRED_FIELDS if is_blank(link.get(f, ""))]
        complete = not missing_fields

        board_stats[board]["total"] += 1
        board_stats[board]["status"][status] += 1
        tier_stats[(board, tier)]["total"] += 1
        tier_stats[(board, tier)]["status"][status] += 1
        unit_stats[(board, unit_key)]["total"] += 1
        unit_stats[(board, unit_key)]["status"][status] += 1
        section_stats[(board, section_key)]["total"] += 1
        section_stats[(board, section_key)]["status"][status] += 1

        if complete:
            board_stats[board]["complete"] += 1
            tier_stats[(board, tier)]["complete"] += 1
            unit_stats[(board, unit_key)]["complete"] += 1
            section_stats[(board, section_key)]["complete"] += 1
        else:
            board_stats[board]["missing"] += 1
            tier_stats[(board, tier)]["missing"] += 1
            unit_stats[(board, unit_key)]["missing"] += 1
            section_stats[(board, section_key)]["missing"] += 1
            for field in missing_fields:
                missing_field_counts[field] += 1

        if status in {"planned", "archived"}:
            non_sellable_ids.append(item_id)

        unit_catalog = catalog_units.get(board, {}).get(unit_key, {})
        expected_release = str(unit_catalog.get("release_date", "")).strip()
        expected_early_bird = str(unit_catalog.get("early_bird_deadline", "")).strip()
        actual_release = str(link.get("presale_release_date", "")).strip()
        actual_early_bird = str(link.get("presale_early_bird_end_date", "")).strip()
        if expected_release and actual_release and expected_release != actual_release:
            date_mismatch_count += 1
        if expected_early_bird and actual_early_bird and expected_early_bird != actual_early_bird:
            date_mismatch_count += 1

        section_meta[(board, section_key)] = {
            "section_code": item["section_code"],
            "section_title": item["section_title"],
            "tier": tier,
        }
        unit_meta[(board, unit_key)] = {
            "unit_key": unit_key,
            "unit_title": to_title(unit_key),
        }

    total = len(board_items)
    sellable = sum(1 for item in board_items if str((links.get(item["id"], {}) or {}).get("status", "planned")).strip().lower() in {"presale", "live"})
    complete_total = sum(1 for item in board_items if all(not is_blank((links.get(item["id"], {}) or {}).get(f, "")) for f in REQUIRED_FIELDS))
    missing_total = total - complete_total

    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    lines: List[str] = []
    lines.append("# Kahoot Funnel Health Report")
    lines.append("")
    lines.append(f"Generated: {generated}")
    lines.append("")
    lines.append("## Snapshot")
    lines.append("")
    lines.append(f"- Active SubTopics: **{total}**")
    lines.append(f"- Sellable status (`presale` or `live`): **{sellable} / {total}**")
    lines.append(f"- Required-field complete: **{complete_total} / {total}**")
    lines.append(f"- Required-field gaps: **{missing_total}**")
    lines.append(f"- Unit-date mismatches vs catalog: **{date_mismatch_count}**")
    lines.append("")

    board_rows = [["Board", "Total", "Presale", "Live", "Planned", "Complete", "Missing"]]
    for board in ["cie0580", "edexcel-4ma1"]:
        stats = board_stats[board]
        label = board_meta.get(board, {}).get("label", board)
        board_rows.append(
            [
                label,
                str(stats["total"]),
                str(stats["status"].get("presale", 0)),
                str(stats["status"].get("live", 0)),
                str(stats["status"].get("planned", 0)),
                str(stats["complete"]),
                str(stats["missing"]),
            ]
        )
    lines.append("## Board Summary")
    lines.append("")
    lines.append(md_table(board_rows))
    lines.append("")

    tier_rows = [["Board", "Tier", "Total", "Presale", "Live", "Planned", "Complete", "Missing"]]
    for board, tier in sorted(tier_stats.keys()):
        stats = tier_stats[(board, tier)]
        tier_rows.append(
            [
                board_meta.get(board, {}).get("label", board),
                tier,
                str(stats["total"]),
                str(stats["status"].get("presale", 0)),
                str(stats["status"].get("live", 0)),
                str(stats["status"].get("planned", 0)),
                str(stats["complete"]),
                str(stats["missing"]),
            ]
        )
    lines.append("## Tier Summary")
    lines.append("")
    lines.append(md_table(tier_rows))
    lines.append("")

    unit_rows = [["Board", "Unit", "Total", "Presale", "Live", "Planned", "Complete", "Missing"]]
    for board, unit_key in sorted(unit_stats.keys()):
        stats = unit_stats[(board, unit_key)]
        unit_title = unit_meta.get((board, unit_key), {}).get("unit_title", unit_key)
        unit_rows.append(
            [
                board_meta.get(board, {}).get("label", board),
                unit_title,
                str(stats["total"]),
                str(stats["status"].get("presale", 0)),
                str(stats["status"].get("live", 0)),
                str(stats["status"].get("planned", 0)),
                str(stats["complete"]),
                str(stats["missing"]),
            ]
        )
    lines.append("## Unit Summary")
    lines.append("")
    lines.append(md_table(unit_rows))
    lines.append("")

    gap_sections = []
    for key, stats in section_stats.items():
        if stats["missing"] > 0 or stats["status"].get("planned", 0) > 0:
            gap_sections.append((key, stats))

    lines.append("## Section Gaps")
    lines.append("")
    if not gap_sections:
        lines.append("No section-level gaps. All sections are sellable and required fields are complete.")
    else:
        for (board, section_key), stats in sorted(gap_sections, key=lambda x: (x[0][0], x[0][1])):
            meta = section_meta.get((board, section_key), {})
            section_code = meta.get("section_code", section_key)
            section_title = meta.get("section_title", section_key)
            tier = meta.get("tier", "")
            lines.append(
                f"- {board_meta.get(board, {}).get('label', board)} | {section_code} ({tier}) | {section_title}: "
                f"planned={stats['status'].get('planned', 0)}, missing={stats['missing']}"
            )
    lines.append("")

    lines.append("## Missing Fields")
    lines.append("")
    if not missing_field_counts:
        lines.append("No missing required fields.")
    else:
        for field in REQUIRED_FIELDS:
            lines.append(f"- `{field}`: {missing_field_counts.get(field, 0)}")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    summary = {
        "generated": generated,
        "total": total,
        "sellable": sellable,
        "complete": complete_total,
        "missing": missing_total,
        "date_mismatches": date_mismatch_count,
        "missing_fields": dict(missing_field_counts),
        "invalid_status_count": len(invalid_status_ids),
        "non_sellable_count": len(non_sellable_ids),
    }

    if args.json_out:
        json_out = Path(args.json_out)
        json_out.parent.mkdir(parents=True, exist_ok=True)
        json_out.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("== Kahoot Funnel Report ==")
    print(f"Output: {out_path}")
    print(f"Active SubTopics: {total}")
    print(f"Sellable: {sellable}/{total}")
    print(f"Required-field complete: {complete_total}/{total}")
    print(f"Required-field gaps: {missing_total}")
    print(f"Date mismatches: {date_mismatch_count}")
    print(f"Invalid status ids: {len(invalid_status_ids)}")
    print(f"Non-sellable ids: {len(non_sellable_ids)}")

    if args.strict:
        strict_issues = missing_total + len(invalid_status_ids) + len(non_sellable_ids)
        if strict_issues:
            print(f"Strict mode failed: {strict_issues} issue(s).")
            return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
