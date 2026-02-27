#!/usr/bin/env python3
"""Content-level quality checks for worksheet files.

This checker is stricter than the structural validator and is focused on
practical worksheet quality:
- avoid unresolved dependencies on missing diagrams/tables
- avoid placeholder or non-answers
- avoid duplicate questions
- flag suspicious repetition patterns
"""

from __future__ import annotations

import math
import re
import sys
from collections import Counter
from pathlib import Path


NUMBERED_LINE_RE = re.compile(r"^\s*(\d+)\.\s+(.+?)\s*$")
REF_RE = re.compile(r"\b(?:Question|Q)\s*([0-9]{1,2})\b", re.IGNORECASE)

FORBIDDEN_DEPENDENCY_PATTERNS = [
    r"\bas shown\b",
    r"\bfrom the diagram\b",
    r"\bfrom the figure\b",
    r"\bin the diagram\b",
    r"\bin the figure\b",
    r"\buse the diagram\b",
    r"\buse the figure\b",
    r"\bshown below\b",
    r"\bgraph below\b",
    r"\btable below\b",
    r"\bsee below\b",
]

FORBIDDEN_PLACEHOLDER_PATTERNS = [
    r"\btbd\b",
    r"\bplaceholder\b",
    r"\bto be filled\b",
    r"\?\?\?",
    r"\bdepends\b",
    r"\bvaries\b",
]


def _norm(text: str) -> str:
    text = text.lower().replace("`", "")
    text = re.sub(r"[^a-z0-9]+", " ", text).strip()
    return text


def _dup_key(text: str) -> str:
    text = text.lower().replace("`", "").strip()
    text = re.sub(r"\s+", " ", text)
    return text


def _extract_numbered(path: Path) -> list[tuple[int, str]]:
    rows: list[tuple[int, str]] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        m = NUMBERED_LINE_RE.match(raw)
        if not m:
            continue
        rows.append((int(m.group(1)), m.group(2).strip()))
    return rows


def _clean_answer(text: str) -> str:
    return text.replace("`", "").strip()


def _is_number(text: str) -> bool:
    return bool(re.fullmatch(r"-?[0-9]+(?:\.[0-9]+)?", text))


def _round_sig(value: float, sig_figs: int) -> float:
    if value == 0:
        return 0.0
    shift = sig_figs - int(math.floor(math.log10(abs(value)))) - 1
    return round(value, shift)


def _deterministic_math_checks(
    questions: list[tuple[int, str]], answer_rows: list[tuple[int, str]]
) -> list[str]:
    errors: list[str] = []
    q_map = {n: q for n, q in questions}
    a_map = {n: _clean_answer(a) for n, a in answer_rows}

    # Check: simplified fraction questions.
    for idx, q in q_map.items():
        m = re.match(
            r"^Write `([0-9]+)/24 \+ ([0-9]+)/24` as a simplified fraction\.$", q
        )
        if not m:
            continue
        raw = a_map.get(idx, "")
        mm = re.fullmatch(r"([0-9]+)/([0-9]+)", raw)
        if not mm:
            errors.append(
                f"Answer {idx} should be a fraction for simplified-fraction question."
            )
            continue
        got_num, got_den = int(mm.group(1)), int(mm.group(2))
        exp_num = int(m.group(1)) + int(m.group(2))
        exp_den = 24
        if got_num * exp_den != got_den * exp_num:
            errors.append(
                f"Answer {idx} does not match question value ({exp_num}/{exp_den})."
            )
        if math.gcd(got_num, got_den) != 1:
            errors.append(f"Answer {idx} fraction is not fully simplified.")

    # Check: simultaneous equations x+y=s, x-y=d.
    for idx, q in q_map.items():
        m = re.match(
            r"^Solve simultaneously: `x \+ y = ([0-9]+)`, `x - y = ([0-9]+)`\.$", q
        )
        if not m:
            continue
        raw = a_map.get(idx, "")
        mm = re.fullmatch(
            r"x\s*=\s*(-?[0-9]+(?:\.[0-9]+)?)\s*,\s*y\s*=\s*(-?[0-9]+(?:\.[0-9]+)?)",
            raw,
        )
        if not mm:
            errors.append(
                f"Answer {idx} must be in format 'x = ..., y = ...' for simultaneous equations."
            )
            continue
        s = int(m.group(1))
        d = int(m.group(2))
        exp_x = (s + d) / 2
        exp_y = (s - d) / 2
        got_x = float(mm.group(1))
        got_y = float(mm.group(2))
        if abs(got_x - exp_x) > 1e-9 or abs(got_y - exp_y) > 1e-9:
            errors.append(
                f"Answer {idx} simultaneous solution mismatch: expected ({exp_x}, {exp_y}), got ({got_x}, {got_y})."
            )

    # Check: arithmetic evaluate pattern.
    for idx, q in q_map.items():
        m = re.match(r"^Evaluate `([0-9]+) \+ ([0-9]+) x ([0-9]+)`\.$", q)
        if not m:
            continue
        raw = a_map.get(idx, "")
        if not re.fullmatch(r"-?[0-9]+", raw):
            errors.append(f"Answer {idx} must be an integer for evaluate question.")
            continue
        exp = int(m.group(1)) + int(m.group(2)) * int(m.group(3))
        if int(raw) != exp:
            errors.append(
                f"Answer {idx} evaluate mismatch: expected {exp}, got {raw}."
            )

    # Check: rounding must provide a final value, not guidance text.
    for idx, q in q_map.items():
        if not q.startswith("Round "):
            continue
        raw = a_map.get(idx, "")
        low = raw.lower()
        if "place value" in low or "working" in low:
            errors.append(
                f"Answer {idx} for rounding question must provide a final rounded value."
            )
            continue
        m = re.match(
            r"^Round `(-?[0-9]+(?:\.[0-9]+)?)` to `([0-9]+)` significant figures\.$",
            q,
        )
        if m and _is_number(raw):
            source = float(m.group(1))
            sf = int(m.group(2))
            exp = _round_sig(source, sf)
            got = float(raw)
            if abs(got - exp) > 1e-9:
                errors.append(
                    f"Answer {idx} rounding mismatch: expected {exp}, got {got}."
                )

    return errors


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: quality_check_worksheet.py <topic-dir>")
        return 2

    topic_dir = Path(sys.argv[1]).resolve()
    student = topic_dir / "worksheet-student.md"
    answers = topic_dir / "worksheet-answers.md"

    if not student.exists() or not answers.exists():
        print(f"FAIL: {topic_dir}")
        print("- Missing worksheet-student.md or worksheet-answers.md.")
        return 1

    questions = _extract_numbered(student)
    answer_rows = _extract_numbered(answers)

    errors: list[str] = []
    warnings: list[str] = []

    if len(questions) != 10:
        errors.append(f"Expected 10 questions, found {len(questions)}.")
    if len(answer_rows) != 10:
        errors.append(f"Expected 10 answers, found {len(answer_rows)}.")

    q_nums = [n for n, _ in questions]
    a_nums = [n for n, _ in answer_rows]
    if q_nums and q_nums != list(range(1, 11)):
        errors.append("Question numbering is not exactly 1..10.")
    if a_nums and a_nums != list(range(1, 11)):
        errors.append("Answer numbering is not exactly 1..10.")

    q_keys = [_dup_key(text) for _, text in questions]
    duplicates = [k for k, v in Counter(q_keys).items() if v > 1 and k]
    if duplicates:
        errors.append("Duplicate question text detected.")

    for idx, text in questions:
        low = text.lower()
        for pat in FORBIDDEN_DEPENDENCY_PATTERNS:
            if re.search(pat, low):
                errors.append(
                    f"Question {idx} depends on missing external visual context ('{pat}')."
                )
                break

        refs = [int(x) for x in REF_RE.findall(text)]
        for ref in refs:
            if ref < 1 or ref > 10:
                errors.append(f"Question {idx} references invalid question number {ref}.")
            elif ref >= idx:
                errors.append(
                    f"Question {idx} has forward/self reference to Question {ref}."
                )

    ans_norm = [_norm(text) for _, text in answer_rows]
    for idx, text in answer_rows:
        low = text.lower()
        if not text.strip():
            errors.append(f"Answer {idx} is empty.")
        for pat in FORBIDDEN_PLACEHOLDER_PATTERNS:
            if re.search(pat, low):
                errors.append(f"Answer {idx} contains placeholder language ('{pat}').")
                break
        if _norm(text) in {"answer", "solution", "to do"}:
            errors.append(f"Answer {idx} is non-specific.")

    yes_no_count = sum(1 for t in ans_norm if t in {"yes", "no", "true", "false"})
    if yes_no_count > 4:
        warnings.append("Many answers are yes/no style; check discriminative quality.")

    repeated_answer_counts = [
        count for ans, count in Counter(ans_norm).items() if ans and count > 4
    ]
    if repeated_answer_counts:
        warnings.append("High repetition in answers detected; verify variety.")

    errors.extend(_deterministic_math_checks(questions, answer_rows))

    if errors:
        print(f"FAIL: {topic_dir}")
        for err in errors:
            print(f"- {err}")
        if warnings:
            print("Warnings:")
            for warn in warnings:
                print(f"- {warn}")
        return 1

    print(f"PASS: {topic_dir}")
    for warn in warnings:
        print(f"WARN: {warn}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
