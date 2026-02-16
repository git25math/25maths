#!/usr/bin/env python3
"""Generate Payhip listing matrix CSVs for Kahoot presale products.

Outputs:
- kahoot-payhip-listings-master.csv
- kahoot-payhip-listings-l1.csv
- kahoot-payhip-listings-l2.csv
- kahoot-payhip-listings-l3.csv
- kahoot-payhip-listings-l4.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Tuple
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_WORKING_CSV = ROOT / "payhip/presale/kahoot-subtopic-links-working.csv"
DEFAULT_CATALOG_JSON = ROOT / "_data/kahoot_presale_catalog.json"
DEFAULT_CIE_JSON = ROOT / "_data/kahoot_cie0580_subtopics.json"
DEFAULT_EDX_JSON = ROOT / "_data/kahoot_edexcel4ma1_subtopics.json"
DEFAULT_OUT_DIR = ROOT / "payhip/presale"

BOARD_SHORT = {
    "cie0580": "CIE0580",
    "edexcel-4ma1": "EDX4MA1",
}

LEVEL_ORDER = {
    "L1": 1,
    "L2": 2,
    "L3": 3,
    "L4": 4,
}

CSV_COLUMNS = [
    "sku",
    "level",
    "board",
    "board_label",
    "tier_scope",
    "status",
    "listing_title",
    "slug_candidate",
    "price_early_bird",
    "price_regular",
    "early_bird_end_date",
    "release_date",
    "payhip_url",
    "source_param",
    "unit_key",
    "unit_code",
    "unit_title",
    "section_key",
    "section_code",
    "section_title",
    "subtopic_id",
    "subtopic_code",
    "subtopic_title",
    "subtopic_count",
    "section_count",
    "unit_count",
    "kahoot_url",
    "worksheet_url",
    "section_bundle_url",
    "unit_bundle_url",
    "deliver_now",
    "deliver_on_release",
    "bonus",
    "presale_notes",
    "terms_pdf_url",
    "tags",
    "notes",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Payhip listing matrix for Kahoot presale")
    parser.add_argument("--working-csv", default=str(DEFAULT_WORKING_CSV), help="Source L1 working CSV")
    parser.add_argument("--catalog-json", default=str(DEFAULT_CATALOG_JSON), help="Presale catalog JSON")
    parser.add_argument("--cie-json", default=str(DEFAULT_CIE_JSON), help="CIE subtopics JSON")
    parser.add_argument("--edexcel-json", default=str(DEFAULT_EDX_JSON), help="Edexcel subtopics JSON")
    parser.add_argument("--out-dir", default=str(DEFAULT_OUT_DIR), help="Output directory")
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def load_csv_rows(path: Path) -> List[dict]:
    with path.open("r", encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def parse_src(url: str) -> str:
    if not url:
        return ""
    try:
        query = parse_qs(urlparse(url).query)
    except ValueError:
        return ""
    values = query.get("src")
    return values[0] if values else ""


def clean_space(text: str) -> str:
    return " ".join(str(text or "").split())


def title_case(text: str) -> str:
    words = clean_space(text).split(" ")
    return " ".join(w[:1].upper() + w[1:] if w else "" for w in words)


def slugify(text: str) -> str:
    value = clean_space(text).lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value


def build_structures(cie_data: dict, edx_data: dict) -> Tuple[Dict[Tuple[str, str], dict], Dict[Tuple[str, str], dict], Dict[str, dict]]:
    section_meta: Dict[Tuple[str, str], dict] = {}
    unit_stats: Dict[Tuple[str, str], dict] = defaultdict(lambda: {"subtopic_count": 0, "section_keys": set()})
    subtopic_meta: Dict[str, dict] = {}

    for board_key, board_data in (("cie0580", cie_data), ("edexcel-4ma1", edx_data)):
        for section in board_data.get("sections", []):
            section_key = section.get("section_key", "")
            section_record = {
                "board": board_key,
                "tier": section.get("tier", ""),
                "section_key": section_key,
                "section_code": section.get("section_code", ""),
                "section_title": section.get("section_title", ""),
                "unit_key": section.get("domain", ""),
                "count": int(section.get("count", 0)),
            }
            section_meta[(board_key, section_key)] = section_record

            unit_key = section_record["unit_key"]
            unit_stats[(board_key, unit_key)]["subtopic_count"] += section_record["count"]
            unit_stats[(board_key, unit_key)]["section_keys"].add(section_key)

            for item in section.get("items", []):
                subtopic_id = item.get("id", "")
                if not subtopic_id:
                    continue
                subtopic_meta[subtopic_id] = {
                    "board": board_key,
                    "tier": section_record["tier"],
                    "section_key": section_key,
                    "section_code": section_record["section_code"],
                    "section_title": section_record["section_title"],
                    "unit_key": unit_key,
                    "subtopic_code": item.get("code", ""),
                    "subtopic_title": item.get("title", ""),
                }

    for key in unit_stats:
        unit_stats[key]["section_count"] = len(unit_stats[key]["section_keys"])

    return section_meta, unit_stats, subtopic_meta


def unit_maps(catalog: dict) -> Dict[str, Dict[str, dict]]:
    output: Dict[str, Dict[str, dict]] = {}
    boards = (catalog or {}).get("boards", {})
    for board_key, board in boards.items():
        by_key = {}
        for unit in board.get("units", []):
            key = unit.get("key", "")
            if key:
                by_key[key] = unit
        output[board_key] = by_key
    return output


def build_l1_rows(
    working_rows: List[dict],
    catalog: dict,
    section_meta: Dict[Tuple[str, str], dict],
    units_by_board: Dict[str, Dict[str, dict]],
) -> List[dict]:
    rows: List[dict] = []
    boards = catalog.get("boards", {})
    terms_default = catalog.get("meta", {}).get("presale_terms_pdf_url", "")

    for item in sorted(
        working_rows,
        key=lambda r: (
            r.get("board", ""),
            r.get("section_code", ""),
            r.get("subtopic_code", ""),
            r.get("id", ""),
        ),
    ):
        board = item.get("board", "")
        section_key = item.get("section_key", "")
        section = section_meta.get((board, section_key), {})
        board_cfg = boards.get(board, {})
        board_label = board_cfg.get("label", board)
        unit_key = item.get("unit_key", "")
        unit = units_by_board.get(board, {}).get(unit_key, {})
        status = clean_space(item.get("status", "presale")).lower() or "presale"

        subtopic_code = item.get("subtopic_code", "")
        subtopic_title = item.get("title", "")
        tier = item.get("tier", section.get("tier", ""))
        section_code = item.get("section_code", section.get("section_code", ""))

        sku = f"L1-{BOARD_SHORT.get(board, board.upper())}-{subtopic_code}".replace(" ", "")
        listing_title = (
            f"{board_label} {subtopic_code} {title_case(subtopic_title)} "
            f"Worksheet + Kahoot Companion ({tier})"
        )

        worksheet_url = item.get("worksheet_payhip_url", "")
        section_bundle_url = item.get("section_bundle_payhip_url", "")
        unit_bundle_url = item.get("unit_bundle_payhip_url", "")

        row = {
            "sku": sku,
            "level": "L1",
            "board": board,
            "board_label": board_label,
            "tier_scope": tier,
            "status": status,
            "listing_title": listing_title,
            "slug_candidate": slugify(sku),
            "price_early_bird": board_cfg.get("pricing", {}).get("l1_early_bird", ""),
            "price_regular": board_cfg.get("pricing", {}).get("l1_regular", ""),
            "early_bird_end_date": item.get("presale_early_bird_end_date", "") or board_cfg.get("default_early_bird_deadline", ""),
            "release_date": item.get("presale_release_date", "") or board_cfg.get("default_release_date", ""),
            "payhip_url": worksheet_url,
            "source_param": parse_src(worksheet_url),
            "unit_key": unit_key,
            "unit_code": unit.get("code", ""),
            "unit_title": unit.get("title", title_case(unit_key)),
            "section_key": section_key,
            "section_code": section_code,
            "section_title": section.get("section_title", ""),
            "subtopic_id": item.get("id", ""),
            "subtopic_code": subtopic_code,
            "subtopic_title": subtopic_title,
            "subtopic_count": "1",
            "section_count": "",
            "unit_count": "",
            "kahoot_url": item.get("kahoot_url", ""),
            "worksheet_url": worksheet_url,
            "section_bundle_url": section_bundle_url,
            "unit_bundle_url": unit_bundle_url,
            "deliver_now": "Presale placeholder + entitlement confirmation + release updates.",
            "deliver_on_release": "SubTopic worksheet PDF + answers + Kahoot companion updates.",
            "bonus": unit.get("bonus", ""),
            "presale_notes": item.get("presale_notes", ""),
            "terms_pdf_url": board_cfg.get("terms_pdf_url", terms_default),
            "tags": ",".join(
                [
                    "kahoot",
                    "presale",
                    "l1",
                    board,
                    slugify(tier),
                    f"unit:{unit_key}",
                    f"section:{section_code.lower()}",
                    f"subtopic:{subtopic_code.lower()}",
                ]
            ),
            "notes": item.get("notes", ""),
        }
        rows.append(row)

    return rows


def choose_value(rows: Iterable[dict], key: str) -> str:
    for row in rows:
        value = clean_space(row.get(key, ""))
        if value:
            return value
    return ""


def build_l2_rows(
    l1_rows: List[dict],
    catalog: dict,
    section_meta: Dict[Tuple[str, str], dict],
    units_by_board: Dict[str, Dict[str, dict]],
) -> List[dict]:
    grouped: Dict[Tuple[str, str], List[dict]] = defaultdict(list)
    for row in l1_rows:
        grouped[(row["board"], row["section_key"])] .append(row)

    boards = catalog.get("boards", {})
    terms_default = catalog.get("meta", {}).get("presale_terms_pdf_url", "")
    rows: List[dict] = []

    for (board, section_key), group in sorted(grouped.items(), key=lambda x: (x[0][0], x[0][1])):
        section = section_meta.get((board, section_key), {})
        board_cfg = boards.get(board, {})
        board_label = board_cfg.get("label", board)
        unit_key = section.get("unit_key", group[0].get("unit_key", ""))
        unit = units_by_board.get(board, {}).get(unit_key, {})
        section_code = section.get("section_code", group[0].get("section_code", ""))
        section_title = section.get("section_title", "")
        tier_scope = section.get("tier", group[0].get("tier_scope", ""))

        section_bundle_url = choose_value(group, "section_bundle_url") or choose_value(group, "payhip_url")
        status_counts = defaultdict(int)
        for row in group:
            status_counts[row.get("status", "presale")] += 1
        status = sorted(status_counts.items(), key=lambda x: (-x[1], x[0]))[0][0]

        sku = f"L2-{BOARD_SHORT.get(board, board.upper())}-{section_code}".replace(" ", "")
        listing_title = f"{board_label} {section_code} {section_title} Section Bundle"
        subtopic_count = len(group)

        row = {
            "sku": sku,
            "level": "L2",
            "board": board,
            "board_label": board_label,
            "tier_scope": tier_scope,
            "status": status,
            "listing_title": listing_title,
            "slug_candidate": slugify(sku),
            "price_early_bird": board_cfg.get("pricing", {}).get("l2_early_bird", ""),
            "price_regular": board_cfg.get("pricing", {}).get("l2_regular", ""),
            "early_bird_end_date": choose_value(group, "early_bird_end_date") or board_cfg.get("default_early_bird_deadline", ""),
            "release_date": choose_value(group, "release_date") or board_cfg.get("default_release_date", ""),
            "payhip_url": section_bundle_url,
            "source_param": parse_src(section_bundle_url),
            "unit_key": unit_key,
            "unit_code": unit.get("code", ""),
            "unit_title": unit.get("title", title_case(unit_key)),
            "section_key": section_key,
            "section_code": section_code,
            "section_title": section_title,
            "subtopic_id": "",
            "subtopic_code": "",
            "subtopic_title": "",
            "subtopic_count": str(subtopic_count),
            "section_count": "1",
            "unit_count": "",
            "kahoot_url": "",
            "worksheet_url": "",
            "section_bundle_url": section_bundle_url,
            "unit_bundle_url": choose_value(group, "unit_bundle_url"),
            "deliver_now": "Presale placeholder + section entitlement + release updates.",
            "deliver_on_release": f"{subtopic_count} SubTopic worksheets + answers + section practice progression.",
            "bonus": unit.get("bonus", ""),
            "presale_notes": choose_value(group, "presale_notes") or unit.get("bonus", ""),
            "terms_pdf_url": board_cfg.get("terms_pdf_url", terms_default),
            "tags": ",".join(
                [
                    "kahoot",
                    "presale",
                    "l2",
                    board,
                    slugify(tier_scope),
                    f"unit:{unit_key}",
                    f"section:{section_code.lower()}",
                ]
            ),
            "notes": "",
        }
        rows.append(row)

    return rows


def build_l3_rows(
    catalog: dict,
    unit_stats: Dict[Tuple[str, str], dict],
) -> List[dict]:
    rows: List[dict] = []
    boards = catalog.get("boards", {})
    terms_default = catalog.get("meta", {}).get("presale_terms_pdf_url", "")

    for board in sorted(boards.keys()):
        board_cfg = boards.get(board, {})
        board_label = board_cfg.get("label", board)
        for unit in board_cfg.get("units", []):
            unit_key = unit.get("key", "")
            if not unit_key:
                continue
            stat = unit_stats.get((board, unit_key), {"subtopic_count": 0, "section_count": 0})
            sku = f"L3-{BOARD_SHORT.get(board, board.upper())}-{unit.get('code', unit_key).replace(' ', '')}"
            listing_title = f"{board_label} {unit.get('code', '')} {unit.get('title', title_case(unit_key))} Unit Bundle"
            payhip_url = unit.get("presale_url", "")

            row = {
                "sku": sku,
                "level": "L3",
                "board": board,
                "board_label": board_label,
                "tier_scope": unit.get("tier_scope", ""),
                "status": clean_space(unit.get("status", "presale")).lower() or "presale",
                "listing_title": listing_title,
                "slug_candidate": slugify(sku),
                "price_early_bird": unit.get("early_bird_price") or board_cfg.get("pricing", {}).get("l3_early_bird", ""),
                "price_regular": unit.get("regular_price") or board_cfg.get("pricing", {}).get("l3_regular", ""),
                "early_bird_end_date": unit.get("early_bird_deadline", "") or board_cfg.get("default_early_bird_deadline", ""),
                "release_date": unit.get("release_date", "") or board_cfg.get("default_release_date", ""),
                "payhip_url": payhip_url,
                "source_param": parse_src(payhip_url),
                "unit_key": unit_key,
                "unit_code": unit.get("code", ""),
                "unit_title": unit.get("title", title_case(unit_key)),
                "section_key": "",
                "section_code": "",
                "section_title": "",
                "subtopic_id": "",
                "subtopic_code": "",
                "subtopic_title": "",
                "subtopic_count": str(stat.get("subtopic_count", 0)),
                "section_count": str(stat.get("section_count", 0)),
                "unit_count": "1",
                "kahoot_url": "",
                "worksheet_url": "",
                "section_bundle_url": "",
                "unit_bundle_url": payhip_url,
                "deliver_now": "Presale placeholder + unit entitlement + release updates.",
                "deliver_on_release": "Full unit pack: worksheets, answers, Kahoot alignment, and unit-level exam extensions.",
                "bonus": unit.get("bonus", ""),
                "presale_notes": unit.get("bonus", ""),
                "terms_pdf_url": board_cfg.get("terms_pdf_url", terms_default),
                "tags": ",".join(
                    [
                        "kahoot",
                        "presale",
                        "l3",
                        board,
                        f"unit:{unit_key}",
                    ]
                ),
                "notes": "",
            }
            rows.append(row)

    return rows


def build_l4_rows(
    catalog: dict,
    board_subtopic_counts: Dict[str, int],
    board_section_counts: Dict[str, int],
) -> List[dict]:
    rows: List[dict] = []
    boards = catalog.get("boards", {})
    terms_default = catalog.get("meta", {}).get("presale_terms_pdf_url", "")

    for board in sorted(boards.keys()):
        board_cfg = boards.get(board, {})
        board_label = board_cfg.get("label", board)
        bundle = board_cfg.get("all_units_bundle", {})
        if not bundle:
            continue
        payhip_url = bundle.get("presale_url", "")
        unit_count = len(board_cfg.get("units", []))

        row = {
            "sku": f"L4-{BOARD_SHORT.get(board, board.upper())}-ALLUNITS",
            "level": "L4",
            "board": board,
            "board_label": board_label,
            "tier_scope": f"All tiers ({unit_count} units)",
            "status": clean_space(bundle.get("status", "presale")).lower() or "presale",
            "listing_title": bundle.get("title", f"{board_label} All-Units Mega Bundle"),
            "slug_candidate": slugify(f"L4-{BOARD_SHORT.get(board, board.upper())}-ALLUNITS"),
            "price_early_bird": bundle.get("early_bird_price", ""),
            "price_regular": bundle.get("regular_price", ""),
            "early_bird_end_date": bundle.get("early_bird_deadline", ""),
            "release_date": bundle.get("release_date", ""),
            "payhip_url": payhip_url,
            "source_param": parse_src(payhip_url),
            "unit_key": "all-units",
            "unit_code": "ALL",
            "unit_title": "All Units",
            "section_key": "",
            "section_code": "",
            "section_title": "",
            "subtopic_id": "",
            "subtopic_code": "",
            "subtopic_title": "",
            "subtopic_count": str(board_subtopic_counts.get(board, 0)),
            "section_count": str(board_section_counts.get(board, 0)),
            "unit_count": str(unit_count),
            "kahoot_url": "",
            "worksheet_url": "",
            "section_bundle_url": "",
            "unit_bundle_url": payhip_url,
            "deliver_now": "Presale placeholder + all-units entitlement + staged release updates.",
            "deliver_on_release": "All unit bundles + cross-unit bonuses + loyalty upgrade path.",
            "bonus": bundle.get("bonus", ""),
            "presale_notes": bundle.get("bonus", ""),
            "terms_pdf_url": board_cfg.get("terms_pdf_url", terms_default),
            "tags": ",".join(["kahoot", "presale", "l4", board, "bundle:all-units"]),
            "notes": "",
        }
        rows.append(row)

    return rows


def write_csv(path: Path, rows: List[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def sort_rows(rows: List[dict]) -> List[dict]:
    return sorted(
        rows,
        key=lambda r: (
            LEVEL_ORDER.get(r.get("level", ""), 99),
            r.get("board", ""),
            r.get("unit_code", ""),
            r.get("section_code", ""),
            r.get("subtopic_code", ""),
            r.get("sku", ""),
        ),
    )


def main() -> int:
    args = parse_args()
    working_csv = Path(args.working_csv)
    catalog_json = Path(args.catalog_json)
    cie_json = Path(args.cie_json)
    edexcel_json = Path(args.edexcel_json)
    out_dir = Path(args.out_dir)

    working_rows = load_csv_rows(working_csv)
    catalog = load_json(catalog_json)
    cie_data = load_json(cie_json)
    edx_data = load_json(edexcel_json)

    section_meta, unit_stats, _ = build_structures(cie_data, edx_data)
    units_by_board = unit_maps(catalog)

    l1_rows = build_l1_rows(working_rows, catalog, section_meta, units_by_board)
    l2_rows = build_l2_rows(l1_rows, catalog, section_meta, units_by_board)
    l3_rows = build_l3_rows(catalog, unit_stats)

    board_subtopic_counts = defaultdict(int)
    board_section_counts = defaultdict(int)
    for row in l1_rows:
        board_subtopic_counts[row["board"]] += 1
    for row in l2_rows:
        board_section_counts[row["board"]] += 1

    l4_rows = build_l4_rows(catalog, board_subtopic_counts, board_section_counts)

    master_rows = sort_rows(l1_rows + l2_rows + l3_rows + l4_rows)

    master_path = out_dir / "kahoot-payhip-listings-master.csv"
    l1_path = out_dir / "kahoot-payhip-listings-l1.csv"
    l2_path = out_dir / "kahoot-payhip-listings-l2.csv"
    l3_path = out_dir / "kahoot-payhip-listings-l3.csv"
    l4_path = out_dir / "kahoot-payhip-listings-l4.csv"

    write_csv(master_path, master_rows)
    write_csv(l1_path, sort_rows(l1_rows))
    write_csv(l2_path, sort_rows(l2_rows))
    write_csv(l3_path, sort_rows(l3_rows))
    write_csv(l4_path, sort_rows(l4_rows))

    print("== Payhip Listing Matrix ==")
    print(f"L1 rows: {len(l1_rows)}")
    print(f"L2 rows: {len(l2_rows)}")
    print(f"L3 rows: {len(l3_rows)}")
    print(f"L4 rows: {len(l4_rows)}")
    print(f"Total rows: {len(master_rows)}")
    print(f"Master CSV: {master_path}")
    print(f"L1 CSV: {l1_path}")
    print(f"L2 CSV: {l2_path}")
    print(f"L3 CSV: {l3_path}")
    print(f"L4 CSV: {l4_path}")

    expected_total = len(l1_rows) + len(l2_rows) + len(l3_rows) + len(l4_rows)
    if len(master_rows) != expected_total:
        print("ERROR: master row count mismatch")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
