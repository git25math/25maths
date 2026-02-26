#!/usr/bin/env python3
import argparse
import re
import sys
from pathlib import Path


PLACEHOLDER_PATTERNS = [
    r"\[Fill with exact official wording\]",
    r"syllabus micro-topic",
    r"\[Add one worked example\]",
    r"\[Add a one-line exam strategy reminder\]",
]


def read_lines(path: Path) -> list[str]:
    return path.read_text(encoding="utf-8").splitlines()


def find_header_index(lines: list[str], header: str) -> int:
    for i, line in enumerate(lines):
        if line.strip().lower() == header.lower():
            return i
    return -1


def collect_numbered_items(lines: list[str], start_idx: int, stop_on_header: bool = True) -> list[tuple[int, str]]:
    items: list[tuple[int, str]] = []
    for i in range(start_idx, len(lines)):
        line = lines[i].strip()
        if stop_on_header and line.startswith("## "):
            break
        m = re.match(r"^([0-9]+)\.\s*(.*)$", line)
        if m:
            items.append((int(m.group(1)), m.group(2).strip()))
    return items


def expected_board_from_path(topic_dir: Path) -> str:
    parts = {p.lower() for p in topic_dir.parts}
    if "cie0580" in parts:
        return "CIE 0580"
    if "edexcel-4ma1" in parts:
        return "Edexcel 4MA1"
    return ""


def validate_topic(topic_dir: Path) -> tuple[bool, list[str]]:
    errors: list[str] = []
    student = topic_dir / "worksheet-student.md"
    answers = topic_dir / "worksheet-answers.md"

    if not student.is_file():
        errors.append(f"Missing file: {student}")
    if not answers.is_file():
        errors.append(f"Missing file: {answers}")
    if errors:
        return False, errors

    s_lines = read_lines(student)
    a_lines = read_lines(answers)

    if not s_lines or not s_lines[0].strip().endswith("Worksheet (Student)"):
        errors.append("Student file line 1 must end with 'Worksheet (Student)'.")
    if not a_lines or not a_lines[0].strip().endswith("Worksheet (Answers)"):
        errors.append("Answers file line 1 must end with 'Worksheet (Answers)'.")

    expected_board = expected_board_from_path(topic_dir)
    if expected_board:
        expected_student = f"# {expected_board} Worksheet (Student)"
        expected_answers = f"# {expected_board} Worksheet (Answers)"
        if s_lines and s_lines[0].strip() != expected_student:
            errors.append(
                f"Student file line 1 must be '{expected_student}' for this topic path."
            )
        if a_lines and a_lines[0].strip() != expected_answers:
            errors.append(
                f"Answers file line 1 must be '{expected_answers}' for this topic path."
            )

    s_h2 = s_lines[1].strip() if len(s_lines) > 1 else ""
    a_h2 = a_lines[1].strip() if len(a_lines) > 1 else ""
    if not s_h2.startswith("## "):
        errors.append("Student file line 2 must start with '## '.")
    if not a_h2.startswith("## "):
        errors.append("Answers file line 2 must start with '## '.")
    if s_h2 and a_h2 and s_h2 != a_h2:
        errors.append("Student and answers line-2 topic headers do not match.")

    name_line = "Name: ____________________   Date: ____________________"
    if not any(line.strip() == name_line for line in s_lines):
        errors.append("Student file must include exact Name/Date line.")

    syllabus_idx = find_header_index(s_lines, "## Syllabus focus")
    model_idx = find_header_index(s_lines, "## Model example")
    practice_idx = find_header_index(s_lines, "## Practice (10)")

    if syllabus_idx == -1:
        errors.append("Student file missing header: ## Syllabus focus")
    if model_idx == -1:
        errors.append("Student file missing header: ## Model example")
    if practice_idx == -1:
        errors.append("Student file missing header: ## Practice (10)")
    if syllabus_idx != -1 and model_idx != -1 and syllabus_idx > model_idx:
        errors.append("Header order invalid: Syllabus focus must appear before Model example.")
    if model_idx != -1 and practice_idx != -1 and model_idx > practice_idx:
        errors.append("Header order invalid: Model example must appear before Practice (10).")

    forbidden_headers = ["## Tier", "## Marker notes"]
    for header in forbidden_headers:
        if find_header_index(s_lines, header) != -1:
            errors.append(f"Student file contains forbidden header: {header}")
        if find_header_index(a_lines, header) != -1:
            errors.append(f"Answers file contains forbidden header: {header}")

    if any(line.strip().lower().startswith("tier:") for line in a_lines):
        errors.append("Answers file contains forbidden 'Tier:' line.")

    student_questions: list[tuple[int, str]] = []
    if practice_idx != -1:
        student_questions = collect_numbered_items(s_lines, practice_idx + 1, stop_on_header=True)

    answer_items = collect_numbered_items(a_lines, 0, stop_on_header=False)

    if len(student_questions) != 10:
        errors.append(f"Student file must contain exactly 10 practice questions, found {len(student_questions)}.")
    if len(answer_items) != 10:
        errors.append(f"Answers file must contain exactly 10 numbered answers, found {len(answer_items)}.")

    expected = list(range(1, 11))
    if student_questions:
        s_nums = [n for n, _ in student_questions]
        if s_nums != expected:
            errors.append(f"Student question numbering must be 1..10, found {s_nums}.")
    if answer_items:
        a_nums = [n for n, _ in answer_items]
        if a_nums != expected:
            errors.append(f"Answer numbering must be 1..10, found {a_nums}.")

    for n, text in student_questions:
        if text == "":
            errors.append(f"Student question {n} is empty.")
    for n, text in answer_items:
        if text == "":
            errors.append(f"Answer {n} is empty.")

    joined_student = "\n".join(s_lines)
    joined_answers = "\n".join(a_lines)
    combined = joined_student + "\n" + joined_answers

    for pat in PLACEHOLDER_PATTERNS:
        if re.search(pat, combined, flags=re.IGNORECASE):
            errors.append(f"Placeholder text detected by pattern: {pat}")

    return len(errors) == 0, errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate worksheet-student.md and worksheet-answers.md for one topic dir.")
    parser.add_argument("topic_dir", help="Path to micro-topic directory.")
    parser.add_argument("--quiet", action="store_true", help="Only set exit code, no stdout on success.")
    args = parser.parse_args()

    topic_dir = Path(args.topic_dir).resolve()
    ok, errors = validate_topic(topic_dir)

    if ok:
        if not args.quiet:
            print(f"PASS: {topic_dir}")
        return 0

    print(f"FAIL: {topic_dir}")
    for e in errors:
        print(f"- {e}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
