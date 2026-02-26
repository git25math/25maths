#!/usr/bin/env python3
from __future__ import annotations

import csv
import re
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
SNAPSHOT = BASE / "snapshot"
OUT = SNAPSHOT / "exports"
OUT.mkdir(parents=True, exist_ok=True)


def parse_listing_copy(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")

    def section(name: str) -> str:
        # capture until next ## heading or EOF
        pat = rf"^##\s+{re.escape(name)}\s*$\n(.*?)(?=^##\s+|\Z)"
        m = re.search(pat, text, flags=re.M | re.S)
        return m.group(1).strip() if m else ""

    name = section("Kahoot Name")
    desc = section("Kahoot Description (EN)") or section("Kahoot Description")
    tags = section("Tags")

    return {
        "kahoot_name": " ".join(name.split()),
        "kahoot_description_en": " ".join(desc.split()),
        "tags": " ".join(tags.split()),
    }


def infer_board_tier_from_path(path: Path, kahoot_name: str) -> tuple[str, str, str]:
    p = str(path).lower()
    code = ""

    # Prefer syllabus code parsed from name (e.g. C1.4 / H2.7 or C1 / H6).
    name_u = kahoot_name.upper()
    m_name = re.search(r"\b([CEFH]\d+\.\d+)\b", name_u)
    if m_name:
        code = m_name.group(1)
    else:
        m_name2 = re.search(r"\b([CEFH]\d+)\b", name_u)
        if m_name2:
            code = m_name2.group(1)

    # Fallback: parse micro-topic folder slug like c1-4-xxx -> C1.4
    if not code:
        m_slug = re.search(r"/([cefh])(\d+)-(\d+)\b", p)
        if m_slug:
            code = f"{m_slug.group(1).upper()}{m_slug.group(2)}.{m_slug.group(3)}"

    # Fallback: parse coarse code from path.
    if not code:
        m = re.search(r"/([cefh]\d(?:\.\d+)?)\b", p)
        if m:
            code = m.group(1).upper()
        else:
            # course-pack folder names like c1-xxx-course-pack
            m2 = re.search(r"/([cefh]\d)-", path.parent.name.lower())
            if m2:
                code = m2.group(1).upper()

    if "/cie0580/" in p:
        board = "CIE 0580"
        if code.startswith("C"):
            tier = "Core"
        elif code.startswith("E"):
            tier = "Extended"
        else:
            tier = ""
    elif "/edexcel-4ma1/" in p:
        board = "Edexcel 4MA1"
        if code.startswith("F"):
            tier = "Foundation Tier"
        elif code.startswith("H"):
            tier = "Higher Tier"
        else:
            tier = ""
    else:
        board = ""
        tier = ""

    return board, tier, code


def build_rows(root: Path, category: str) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for lp in sorted(root.rglob("listing-copy.md")):
        info = parse_listing_copy(lp)
        board, tier, code = infer_board_tier_from_path(lp, info["kahoot_name"])
        rows.append(
            {
                "category": category,
                "board": board,
                "tier": tier,
                "syllabus_code": code,
                "kahoot_name": info["kahoot_name"],
                "kahoot_description_en": info["kahoot_description_en"],
                "tags": info["tags"],
                "source_listing_file": str(lp),
            }
        )
    return rows


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    fields = [
        "category",
        "board",
        "tier",
        "syllabus_code",
        "kahoot_name",
        "kahoot_description_en",
        "tags",
        "source_listing_file",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def main() -> None:
    free_rows = build_rows(SNAPSHOT / "free-showcase", "free_showcase")

    cp_rows = []
    cp_rows.extend(build_rows(SNAPSHOT / "cie0580" / "course-packs", "course_pack"))
    cp_rows.extend(build_rows(SNAPSHOT / "edexcel-4ma1" / "course-packs", "course_pack"))

    all_rows = free_rows + cp_rows

    write_csv(OUT / "kahoot_free_showcase.csv", free_rows)
    write_csv(OUT / "kahoot_course_packs.csv", cp_rows)
    write_csv(OUT / "kahoot_all_upload_copy.csv", all_rows)

    print(f"free_showcase_rows={len(free_rows)}")
    print(f"course_pack_rows={len(cp_rows)}")
    print(f"all_rows={len(all_rows)}")
    print(str(OUT / "kahoot_free_showcase.csv"))
    print(str(OUT / "kahoot_course_packs.csv"))
    print(str(OUT / "kahoot_all_upload_copy.csv"))


if __name__ == "__main__":
    main()
