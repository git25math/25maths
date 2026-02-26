#!/usr/bin/env python3
"""Import SubTopic link updates from CSV into _data/kahoot_subtopic_links.json.

Usage example:
  python3 scripts/kahoot/import_subtopic_links_csv.py \
    --csv payhip/presale/kahoot-subtopic-link-import-template.csv \
    --dry-run
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path
from typing import Dict
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_LINKS_FILE = ROOT / "_data/kahoot_subtopic_links.json"

LINK_FIELDS = [
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
    "status",
    "notes",
]

CONTEXT_FIELDS = [
    "board",
    "tier",
    "section_code",
    "subtopic_code",
    "title",
    "section_key",
    "unit_key",
]

STATUS_VALUES = {"planned", "presale", "live", "archived"}
DATE_FIELDS = {"presale_release_date", "presale_early_bird_end_date"}
URL_FIELDS = {
    "kahoot_url",
    "worksheet_payhip_url",
    "section_bundle_payhip_url",
    "unit_bundle_payhip_url",
    "bundle_url",
    "past_paper_analysis_url",
    "variant_practice_url",
}
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import SubTopic link fields from CSV")
    parser.add_argument("--csv", required=True, help="Path to CSV file")
    parser.add_argument(
        "--links-file",
        default=str(DEFAULT_LINKS_FILE),
        help=f"Path to kahoot_subtopic_links.json (default: {DEFAULT_LINKS_FILE})",
    )
    parser.add_argument(
        "--mode",
        choices=["fill-empty", "overwrite"],
        default="fill-empty",
        help="fill-empty: only fill blank fields; overwrite: replace existing values",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing to JSON",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat unknown columns/IDs and invalid values as errors",
    )
    parser.add_argument(
        "--allow-new-id",
        action="store_true",
        help="Allow creating new records when ID is not found in JSON",
    )
    return parser.parse_args()


def load_links(path: Path) -> Dict[str, Dict[str, str]]:
    if not path.exists():
        raise FileNotFoundError(f"Links file not found: {path}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Links file must be a JSON object map: {path}")
    return payload


def default_link_entry() -> Dict[str, str]:
    return {
        "kahoot_url": "",
        "worksheet_payhip_url": "",
        "section_bundle_payhip_url": "",
        "unit_bundle_payhip_url": "",
        "bundle_url": "",
        "past_paper_analysis_url": "",
        "variant_practice_url": "",
        "presale_release_date": "",
        "presale_early_bird_end_date": "",
        "presale_notes": "",
        "status": "planned",
        "notes": "",
    }


def normalize(value: str) -> str:
    return (value or "").strip()


def is_valid_url(value: str) -> bool:
    if not value:
        return True
    if value.startswith("/"):
        return True
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def validate_field(field: str, value: str) -> str | None:
    if field in DATE_FIELDS and value and not DATE_RE.match(value):
        return f"{field} expects YYYY-MM-DD, got '{value}'"
    if field in URL_FIELDS and value and not is_valid_url(value):
        return f"{field} expects URL (http/https or /path), got '{value}'"
    if field == "status" and value and value.lower() not in STATUS_VALUES:
        return f"status must be one of {sorted(STATUS_VALUES)}, got '{value}'"
    return None


def main() -> int:
    args = parse_args()
    csv_path = Path(args.csv)
    links_path = Path(args.links_file)

    if not csv_path.exists():
        print(f"ERROR: CSV file not found: {csv_path}", file=sys.stderr)
        return 1

    try:
        links = load_links(links_path)
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    errors = 0
    warnings = 0
    rows_total = 0
    rows_with_id = 0
    records_created = 0
    records_touched = 0
    fields_updated = 0
    fields_skipped_nonempty = 0
    rows_unknown_id = 0

    with csv_path.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        if not reader.fieldnames:
            print("ERROR: CSV has no header", file=sys.stderr)
            return 1

        header = [h.strip() for h in reader.fieldnames if h is not None]
        if "id" not in header:
            print("ERROR: CSV header must include 'id' column", file=sys.stderr)
            return 1

        unknown_cols = [h for h in header if h not in {"id", *LINK_FIELDS, *CONTEXT_FIELDS}]
        if unknown_cols:
            msg = f"Unknown CSV columns ignored: {unknown_cols}"
            if args.strict:
                print(f"ERROR: {msg}", file=sys.stderr)
                return 1
            print(f"WARN: {msg}")
            warnings += 1

        update_fields = [h for h in header if h in LINK_FIELDS]
        if not update_fields:
            print("ERROR: CSV has no recognized update fields", file=sys.stderr)
            return 1

        for row_num, row in enumerate(reader, start=2):
            rows_total += 1
            subtopic_id = normalize((row or {}).get("id", ""))
            if not subtopic_id:
                print(f"WARN: row {row_num} skipped (empty id)")
                warnings += 1
                continue
            rows_with_id += 1

            existing = links.get(subtopic_id)
            if existing is None:
                rows_unknown_id += 1
                if args.allow_new_id:
                    existing = default_link_entry()
                    links[subtopic_id] = existing
                    records_created += 1
                else:
                    msg = f"row {row_num} unknown id: {subtopic_id}"
                    if args.strict:
                        print(f"ERROR: {msg}", file=sys.stderr)
                        errors += 1
                    else:
                        print(f"WARN: {msg}")
                        warnings += 1
                    continue

            if not isinstance(existing, dict):
                print(f"ERROR: row {row_num} id has invalid record type: {subtopic_id}", file=sys.stderr)
                errors += 1
                continue

            row_touched = False
            for field in update_fields:
                raw = normalize((row or {}).get(field, ""))
                if not raw:
                    continue

                if field == "status":
                    raw = raw.lower()

                problem = validate_field(field, raw)
                if problem:
                    msg = f"row {row_num} {problem}"
                    if args.strict:
                        print(f"ERROR: {msg}", file=sys.stderr)
                        errors += 1
                        continue
                    print(f"WARN: {msg}")
                    warnings += 1

                current = normalize(str(existing.get(field, "")))
                if args.mode == "fill-empty" and current:
                    fields_skipped_nonempty += 1
                    continue

                if current != raw:
                    existing[field] = raw
                    row_touched = True
                    fields_updated += 1

            if row_touched:
                records_touched += 1

    print("== Import Summary ==")
    print(f"CSV: {csv_path}")
    print(f"Links file: {links_path}")
    print(f"Mode: {args.mode}")
    print(f"Dry run: {args.dry_run}")
    print(f"Rows total: {rows_total}")
    print(f"Rows with id: {rows_with_id}")
    print(f"Rows unknown id: {rows_unknown_id}")
    print(f"Records created: {records_created}")
    print(f"Records touched: {records_touched}")
    print(f"Fields updated: {fields_updated}")
    print(f"Fields skipped (non-empty + fill-empty): {fields_skipped_nonempty}")
    print(f"Warnings: {warnings}")
    print(f"Errors: {errors}")

    if errors:
        return 1

    if args.dry_run:
        print("No file written (--dry-run).")
        return 0

    ordered = dict(sorted(links.items()))
    links_path.write_text(json.dumps(ordered, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
    print("Updated links file written.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
