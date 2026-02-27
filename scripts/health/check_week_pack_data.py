#!/usr/bin/env python3
"""
Validate week pack JSON files against data.contract.json (week_pack_spec).

Supports both question formats:
  - MCQ:       questionText, options, correctAnswer, explanation
  - Bilingual: question.en/zh, answer, solution, common_mistake

Usage:
    python3 scripts/health/check_week_pack_data.py                    # all _data/content/week*.json
    python3 scripts/health/check_week_pack_data.py path/to/file.json  # single file

Requires: pip install jsonschema (>=4.0)
"""

import json
import sys
import glob
import os

try:
    from jsonschema import validate, ValidationError
except ImportError:
    print("ERROR: jsonschema not installed. Run: pip install jsonschema")
    sys.exit(2)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONTRACT_PATH = os.path.join(REPO_ROOT, "_ops", "OUTPUT_CONTRACTS", "data.contract.json")
DEFAULT_GLOB = os.path.join(REPO_ROOT, "_data", "content", "week*.json")


def load_week_pack_schema():
    """Load the contract and extract the week_pack_spec schema with $ref resolution."""
    with open(CONTRACT_PATH, "r", encoding="utf-8") as f:
        contract = json.load(f)

    schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$defs": contract.get("definitions", {}),
        "type": "object",
        "required": ["week_number", "topic", "board", "tier", "subtopic_ids",
                      "questions_core", "questions_extended"],
        "properties": {}
    }

    week_spec = contract.get("definitions", {}).get("week_pack_spec", {})
    schema["properties"] = week_spec.get("properties", {})
    schema["required"] = week_spec.get("required", schema["required"])

    # Fix $ref paths: #/definitions/... → #/$defs/...
    schema_str = json.dumps(schema)
    schema_str = schema_str.replace("#/definitions/", "#/$defs/")
    schema = json.loads(schema_str)

    return schema


def is_bilingual(q):
    """Return True if question uses bilingual open-ended format."""
    return isinstance(q.get("question"), dict)


def validate_file(filepath, schema):
    """Validate a single JSON file. Returns (passes, failures, warnings)."""
    passes = []
    failures = []
    warnings = []
    filename = os.path.basename(filepath)

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        failures.append(f"FAIL: {filename}: Invalid JSON: {e}")
        return passes, failures, warnings

    # Strip _comment field before validation
    data_clean = {k: v for k, v in data.items() if k != "_comment"}

    try:
        validate(instance=data_clean, schema=schema)
        passes.append(f"PASS: {filename}")
    except ValidationError as e:
        path = " → ".join(str(p) for p in e.absolute_path) if e.absolute_path else "(root)"
        failures.append(f"FAIL: {filename}: [{path}] {e.message}")

    # ── Content-level checks (warnings) ──
    core_q = data.get("questions_core", [])
    ext_q = data.get("questions_extended", [])
    all_q = core_q + ext_q

    if len(core_q) < 6:
        warnings.append(f"WARN: {filename}: Only {len(core_q)} core questions (recommend 6+)")
    if len(ext_q) < 4:
        warnings.append(f"WARN: {filename}: Only {len(ext_q)} extended questions (recommend 4+)")

    # Marks check — bilingual format may not have explicit marks
    has_marks = any(q.get("marks") for q in all_q)
    if has_marks:
        total_marks = sum(q.get("marks", 0) for q in all_q)
        if total_marks < 30:
            warnings.append(f"WARN: {filename}: Total marks = {total_marks} (target: 30-40)")
        elif total_marks > 40:
            warnings.append(f"WARN: {filename}: Total marks = {total_marks} (target: 30-40)")

    vocab = data.get("key_vocabulary", [])
    if len(vocab) < 4:
        warnings.append(f"WARN: {filename}: Only {len(vocab)} vocabulary entries (recommend 4+)")

    checklist = data.get("review_checklist", [])
    if len(checklist) < 5:
        warnings.append(f"WARN: {filename}: Only {len(checklist)} checklist items (recommend 5+)")

    # Format-specific checks
    for i, q in enumerate(all_q):
        if is_bilingual(q):
            # Bilingual: check required nested fields
            qtext = q.get("question", {})
            if not qtext.get("en"):
                warnings.append(f"WARN: {filename}: question[{i}] missing English text")
            sol = q.get("solution", {})
            if not sol.get("en"):
                warnings.append(f"WARN: {filename}: question[{i}] missing English solution steps")
            if not q.get("answer", {}).get("en"):
                warnings.append(f"WARN: {filename}: question[{i}] missing English answer")
        else:
            # MCQ: check explanation
            if not q.get("explanation"):
                warnings.append(f"WARN: {filename}: question[{i}] has no explanation")

    return passes, failures, warnings


def main():
    if len(sys.argv) > 1:
        files = [sys.argv[1]]
    else:
        files = sorted(glob.glob(DEFAULT_GLOB))
        files = [f for f in files if ".sample." not in f]

    if not files:
        sample = os.path.join(REPO_ROOT, "_data", "content", "week01.sample.json")
        if os.path.exists(sample):
            print("No production week*.json found. Validating sample file as smoke test.\n")
            files = [sample]
        else:
            print("No week pack files found to validate.")
            sys.exit(0)

    schema = load_week_pack_schema()

    all_passes = []
    all_failures = []
    all_warnings = []

    for filepath in files:
        p, f, w = validate_file(filepath, schema)
        all_passes.extend(p)
        all_failures.extend(f)
        all_warnings.extend(w)

    for msg in all_passes + all_warnings + all_failures:
        print(msg)

    print(f"\n== Week Pack Validation Summary ==")
    print(f"Files scanned: {len(files)}")
    print(f"Passes: {len(all_passes)}")
    print(f"Warnings: {len(all_warnings)}")
    print(f"Failures: {len(all_failures)}")

    sys.exit(1 if all_failures else 0)


if __name__ == "__main__":
    main()
