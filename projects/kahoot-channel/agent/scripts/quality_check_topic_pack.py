#!/usr/bin/env python3
"""Quality checks for full topic packs.

Checks:
- kahoot-question-set.md structure and 15-row MCQ table quality
- listing-copy.md required sections and non-placeholder content
"""

from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path


PLACEHOLDER_PATTERNS = [
    r"\btbd\b",
    r"\bplaceholder\b",
    r"\[fill",
    r"\[add",
    r"\?\?\?",
    r"\blorem\b",
]

ALLOWED_TYPES = {"fluency", "method", "context"}


def _find_header_index(lines: list[str], header: str) -> int:
    target = header.strip().lower()
    for i, line in enumerate(lines):
        if line.strip().lower() == target:
            return i
    return -1


def _first_content_after(lines: list[str], header_idx: int) -> str:
    if header_idx == -1:
        return ""
    for i in range(header_idx + 1, len(lines)):
        row = lines[i].strip()
        if not row:
            continue
        if row.startswith("## "):
            break
        return row
    return ""


def _has_placeholder(text: str) -> bool:
    low = text.lower()
    return any(re.search(pat, low) for pat in PLACEHOLDER_PATTERNS)


def _parse_kahoot_table(lines: list[str]) -> tuple[list[tuple[int, str, str]], list[str]]:
    """Return (rows, errors), where rows are (number, correct, type)."""
    errors: list[str] = []
    rows: list[tuple[int, str, str]] = []

    header_idx = -1
    for i, line in enumerate(lines):
        norm = re.sub(r"\s+", " ", line.strip().lower())
        if norm == "| # | question | a | b | c | d | correct | type |":
            header_idx = i
            break

    if header_idx == -1:
        return rows, ["Kahoot file missing MCQ table header."]

    # Expect separator row immediately after header.
    if header_idx + 1 >= len(lines) or not lines[header_idx + 1].strip().startswith("|"):
        errors.append("Kahoot table separator row is missing.")
        return rows, errors

    for i in range(header_idx + 2, len(lines)):
        line = lines[i].strip()
        if not line:
            break
        if not line.startswith("|"):
            break

        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) != 8:
            errors.append(f"Kahoot table row has {len(cells)} columns (expected 8): {line}")
            continue

        num, q, a, b, c, d, correct, qtype = cells
        if not re.fullmatch(r"[0-9]+", num):
            errors.append(f"Kahoot row number is invalid: {num}")
            continue
        n = int(num)

        if not q:
            errors.append(f"Kahoot question {n} is empty.")
        for label, opt in (("A", a), ("B", b), ("C", c), ("D", d)):
            if not opt:
                errors.append(f"Kahoot question {n} option {label} is empty.")

        correct_up = correct.upper()
        if correct_up not in {"A", "B", "C", "D"}:
            errors.append(f"Kahoot question {n} has invalid correct option: {correct}")

        qtype_low = qtype.lower()
        if qtype_low not in ALLOWED_TYPES:
            errors.append(f"Kahoot question {n} has invalid type: {qtype}")

        rows.append((n, correct_up, qtype_low))

    return rows, errors


def check_kahoot(path: Path) -> list[str]:
    errors: list[str] = []

    if not path.exists():
        return [f"Missing file: {path.name}"]

    lines = path.read_text(encoding="utf-8").splitlines()
    text = "\n".join(lines)

    if not lines or "kahoot question set" not in lines[0].strip().lower():
        errors.append("Kahoot file line 1 must include 'Kahoot Question Set'.")

    if _has_placeholder(text):
        errors.append("Kahoot file contains placeholder text.")

    rows, table_errors = _parse_kahoot_table(lines)
    errors.extend(table_errors)

    if rows:
        nums = [n for n, _, _ in rows]
        if nums != list(range(1, 16)):
            errors.append(f"Kahoot table numbering must be 1..15, found {nums}.")
        if len(rows) != 15:
            errors.append(f"Kahoot table must have 15 questions, found {len(rows)}.")

        type_counter = Counter(t for _, _, t in rows)
        expected = {"fluency": 5, "method": 6, "context": 4}
        if dict(type_counter) != expected:
            errors.append(
                "Kahoot type split must be Fluency=5, Method=6, Context=4; "
                f"found {dict(type_counter)}."
            )

    return errors


def check_listing(path: Path) -> list[str]:
    errors: list[str] = []

    if not path.exists():
        return [f"Missing file: {path.name}"]

    lines = path.read_text(encoding="utf-8").splitlines()
    text = "\n".join(lines)

    if not lines or not lines[0].startswith("# "):
        errors.append("Listing file line 1 must start with '# '.")

    if _has_placeholder(text):
        errors.append("Listing file contains placeholder text.")

    name_idx = _find_header_index(lines, "## Kahoot Name")
    desc_idx = _find_header_index(lines, "## Kahoot Description")
    tags_idx = _find_header_index(lines, "## Tags")

    if name_idx == -1:
        errors.append("Listing file missing header: ## Kahoot Name")
    if desc_idx == -1:
        errors.append("Listing file missing header: ## Kahoot Description")
    if tags_idx == -1:
        errors.append("Listing file missing header: ## Tags")

    if name_idx != -1 and desc_idx != -1 and name_idx > desc_idx:
        errors.append("Listing header order invalid: Kahoot Name must be before Kahoot Description.")
    if desc_idx != -1 and tags_idx != -1 and desc_idx > tags_idx:
        errors.append("Listing header order invalid: Kahoot Description must be before Tags.")

    name = _first_content_after(lines, name_idx)
    desc = _first_content_after(lines, desc_idx)
    tags = _first_content_after(lines, tags_idx)

    if not name or len(name) < 8:
        errors.append("Listing Kahoot Name is too short or missing.")
    if not desc or len(desc) < 24:
        errors.append("Listing Kahoot Description is too short or missing.")

    if not tags:
        errors.append("Listing Tags line is missing.")
    else:
        hash_tags = re.findall(r"#[A-Za-z0-9_-]+", tags)
        if hash_tags:
            if len(hash_tags) < 3:
                errors.append("Listing tags must contain at least 3 hashtag tags.")
        else:
            comma_tags = [x.strip() for x in tags.split(",") if x.strip()]
            if len(comma_tags) < 3:
                errors.append("Listing tags must contain at least 3 comma-separated tags.")

    return errors


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: quality_check_topic_pack.py <topic-dir>")
        return 2

    topic_dir = Path(sys.argv[1]).resolve()
    kahoot = topic_dir / "kahoot-question-set.md"
    listing = topic_dir / "listing-copy.md"

    errors: list[str] = []
    errors.extend(check_kahoot(kahoot))
    errors.extend(check_listing(listing))

    if errors:
        print(f"FAIL: {topic_dir}")
        for err in errors:
            print(f"- {err}")
        return 1

    print(f"PASS: {topic_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
