#!/usr/bin/env python3
"""Validate Kahoot catalog/link data consistency for CI."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Dict, Iterable, List, Set, Tuple

ROOT = Path(__file__).resolve().parents[2]


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"Missing file: {path}")
        return {}
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {path}: {exc}")
        return {}


def pass_msg(message: str) -> None:
    print(f"PASS: {message}")


def warn(message: str) -> None:
    global WARNINGS
    WARNINGS += 1
    print(f"WARN: {message}")


def fail(message: str) -> None:
    global FAILURES
    FAILURES += 1
    print(f"FAIL: {message}")


def collect_subtopic_ids(board_data: dict, label: str) -> Tuple[List[str], Set[str], List[dict]]:
    sections = board_data.get("sections")
    if not isinstance(sections, list):
        fail(f"{label}: 'sections' must be a list")
        return [], set(), []

    ids: List[str] = []
    domains: Set[str] = set()
    items: List[dict] = []

    for sec in sections:
        if not isinstance(sec, dict):
            fail(f"{label}: each section must be an object")
            continue

        domain = sec.get("domain")
        if isinstance(domain, str) and domain:
            domains.add(domain)
        else:
            fail(f"{label}: section missing valid 'domain' value")

        sec_items = sec.get("items")
        if not isinstance(sec_items, list):
            fail(f"{label}: section '{sec.get('section_key', '<unknown>')}' has invalid 'items'")
            continue

        for item in sec_items:
            if not isinstance(item, dict):
                fail(f"{label}: item in section '{sec.get('section_key', '<unknown>')}' must be an object")
                continue
            item_id = item.get("id")
            if not isinstance(item_id, str) or not item_id:
                fail(f"{label}: item missing valid 'id' in section '{sec.get('section_key', '<unknown>')}'")
                continue
            ids.append(item_id)
            items.append(item)

    declared_total = board_data.get("total_subtopics")
    if isinstance(declared_total, int):
        if declared_total == len(ids):
            pass_msg(f"{label}: declared total_subtopics matches item count ({declared_total})")
        else:
            fail(
                f"{label}: declared total_subtopics={declared_total} but found {len(ids)} item ids"
            )
    else:
        fail(f"{label}: missing integer 'total_subtopics'")

    if len(ids) == len(set(ids)):
        pass_msg(f"{label}: no duplicate item ids")
    else:
        fail(f"{label}: duplicate item ids detected")

    return ids, domains, items


def validate_assets(items: Iterable[dict], label: str) -> None:
    missing_cover = 0
    missing_folder = 0
    missing_worksheet = 0

    for item in items:
        item_id = item.get("id", "<unknown>")
        cover = item.get("cover", "")
        folder = item.get("folder_path", "")

        if isinstance(cover, str) and cover:
            cover_path = ROOT / cover.lstrip("/")
            if not cover_path.exists():
                missing_cover += 1
                if missing_cover <= 5:
                    fail(f"{label}: cover file missing for {item_id}: {cover}")
        else:
            missing_cover += 1
            if missing_cover <= 5:
                fail(f"{label}: cover path missing for {item_id}")

        if isinstance(folder, str) and folder:
            folder_path = ROOT / folder.lstrip("/")
            if not folder_path.exists():
                missing_folder += 1
                if missing_folder <= 5:
                    fail(f"{label}: folder_path missing for {item_id}: {folder}")
                continue

            worksheet_path = folder_path / "worksheet-student.md"
            if not worksheet_path.exists():
                missing_worksheet += 1
                if missing_worksheet <= 5:
                    fail(f"{label}: worksheet-student.md missing for {item_id}: {worksheet_path}")
        else:
            missing_folder += 1
            if missing_folder <= 5:
                fail(f"{label}: folder_path missing for {item_id}")

    if missing_cover == 0:
        pass_msg(f"{label}: all cover assets exist")
    if missing_folder == 0:
        pass_msg(f"{label}: all folder_path directories exist")
    if missing_worksheet == 0:
        pass_msg(f"{label}: all worksheet-student.md files exist")


def validate_links(all_ids: Set[str], link_map: dict) -> None:
    if not isinstance(link_map, dict):
        fail("_data/kahoot_subtopic_links.json must be an object map")
        return

    link_ids = set(link_map.keys())
    missing = sorted(all_ids - link_ids)
    extra = sorted(link_ids - all_ids)

    if not missing:
        pass_msg("All active subtopic ids have link records")
    else:
        fail(f"Missing {len(missing)} link records for active subtopic ids")
        for key in missing[:5]:
            print(f"  - {key}")

    non_archived_extra = [key for key in extra if link_map.get(key, {}).get("status") != "archived"]
    archived_extra = [key for key in extra if link_map.get(key, {}).get("status") == "archived"]

    if non_archived_extra:
        fail(f"Found {len(non_archived_extra)} extra link records not marked archived")
        for key in non_archived_extra[:5]:
            print(f"  - {key}")
    else:
        pass_msg("No non-archived extra link records")

    if archived_extra:
        warn(f"Archived extra link records retained: {len(archived_extra)}")

    required_fields = [
        "kahoot_url",
        "worksheet_payhip_url",
        "section_bundle_payhip_url",
        "unit_bundle_payhip_url",
        "status",
    ]

    invalid_link_values = 0
    for key in all_ids:
        value = link_map.get(key)
        if not isinstance(value, dict):
            invalid_link_values += 1
            if invalid_link_values <= 5:
                fail(f"Link record for {key} must be an object")
            continue
        for field in required_fields:
            if field not in value:
                fail(f"Link record for {key} missing field '{field}'")

    if invalid_link_values == 0:
        pass_msg("All active link records are valid objects")

    empty_counts: Dict[str, int] = {
        "kahoot_url": 0,
        "worksheet_payhip_url": 0,
        "section_bundle_payhip_url": 0,
        "unit_bundle_payhip_url": 0,
        "presale_release_date": 0,
        "presale_early_bird_end_date": 0,
    }

    for key in all_ids:
        value = link_map.get(key, {})
        if not isinstance(value, dict):
            continue
        for field in empty_counts:
            if not str(value.get(field, "")).strip():
                empty_counts[field] += 1

    for field, count in empty_counts.items():
        if count == 0:
            pass_msg(f"All active links have '{field}'")
        else:
            warn(f"Active links missing '{field}': {count}/{len(all_ids)}")


def validate_catalog_domains(cie_domains: Set[str], edx_domains: Set[str], catalog: dict) -> None:
    boards = catalog.get("boards") if isinstance(catalog, dict) else None
    if not isinstance(boards, dict):
        fail("_data/kahoot_presale_catalog.json missing 'boards' object")
        return

    def unit_keys(board_key: str) -> Set[str]:
        board = boards.get(board_key)
        if not isinstance(board, dict):
            fail(f"Presale catalog missing board '{board_key}'")
            return set()

        units = board.get("units")
        if not isinstance(units, list):
            fail(f"Presale catalog board '{board_key}' has invalid 'units'")
            return set()

        keys: Set[str] = set()
        for unit in units:
            if not isinstance(unit, dict):
                fail(f"Presale catalog board '{board_key}' has non-object unit entry")
                continue
            key = unit.get("key")
            if isinstance(key, str) and key:
                keys.add(key)
            else:
                fail(f"Presale catalog board '{board_key}' has unit missing valid 'key'")
        return keys

    cie_keys = unit_keys("cie0580")
    edx_keys = unit_keys("edexcel-4ma1")

    if cie_keys == cie_domains:
        pass_msg("CIE presale unit keys match CIE subtopic domains")
    else:
        fail(
            "CIE presale unit/domain mismatch: "
            f"missing={sorted(cie_domains - cie_keys)} extra={sorted(cie_keys - cie_domains)}"
        )

    if edx_keys == edx_domains:
        pass_msg("Edexcel presale unit keys match Edexcel subtopic domains")
    else:
        fail(
            "Edexcel presale unit/domain mismatch: "
            f"missing={sorted(edx_domains - edx_keys)} extra={sorted(edx_keys - edx_domains)}"
        )


def main() -> int:
    print("== Kahoot Data Integrity Check ==")

    cie = load_json(ROOT / "_data/kahoot_cie0580_subtopics.json")
    edx = load_json(ROOT / "_data/kahoot_edexcel4ma1_subtopics.json")
    links = load_json(ROOT / "_data/kahoot_subtopic_links.json")
    catalog = load_json(ROOT / "_data/kahoot_presale_catalog.json")

    cie_ids, cie_domains, cie_items = collect_subtopic_ids(cie, "CIE 0580")
    edx_ids, edx_domains, edx_items = collect_subtopic_ids(edx, "Edexcel 4MA1")

    validate_assets(cie_items, "CIE 0580")
    validate_assets(edx_items, "Edexcel 4MA1")

    all_ids = set(cie_ids) | set(edx_ids)
    validate_links(all_ids, links)
    validate_catalog_domains(cie_domains, edx_domains, catalog)

    print("== Summary ==")
    print(f"Failures: {FAILURES}")
    print(f"Warnings: {WARNINGS}")
    return 1 if FAILURES else 0


FAILURES = 0
WARNINGS = 0


if __name__ == "__main__":
    sys.exit(main())
