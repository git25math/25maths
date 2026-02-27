#!/usr/bin/env python3
"""
Validate week pack JSON files against data.contract.json (week_pack_spec).

Usage:
    python3 scripts/health/check_week_pack_data.py                  # all _data/content/week*.json
    python3 scripts/health/check_week_pack_data.py path/to/file.json  # single file

Requires: pip install jsonschema (>=4.0)
"""

import json
import sys
import glob
import os

try:
    from jsonschema import validate, ValidationError, Draft202012Validator
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

    # Build a standalone schema that validates week_pack_spec specifically
    schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$defs": contract.get("definitions", {}),
        "type": "object",
        "required": ["week_number", "topic", "board", "tier", "subtopic_ids",
                      "questions_core", "questions_extended"],
        "additionalProperties": False,
        "properties": {}
    }

    # Pull properties from the week_pack_spec definition
    week_spec = contract.get("definitions", {}).get("week_pack_spec", {})
    schema["properties"] = week_spec.get("properties", {})
    schema["required"] = week_spec.get("required", schema["required"])

    # Fix $ref paths: #/definitions/... → #/$defs/...
    schema_str = json.dumps(schema)
    schema_str = schema_str.replace("#/definitions/", "#/$defs/")
    schema = json.loads(schema_str)

    return schema


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

    # Strip _comment field before validation (allowed but not in schema)
    data_clean = {k: v for k, v in data.items() if k != "_comment"}

    try:
        validate(instance=data_clean, schema=schema)
        passes.append(f"PASS: {filename}")
    except ValidationError as e:
        path = " → ".join(str(p) for p in e.absolute_path) if e.absolute_path else "(root)"
        failures.append(f"FAIL: {filename}: [{path}] {e.message}")

    # Additional content-level checks (warnings, not failures)
    core_q = data.get("questions_core", [])
    ext_q = data.get("questions_extended", [])

    if len(core_q) < 6:
        warnings.append(f"WARN: {filename}: Only {len(core_q)} core questions (minimum 6)")
    if len(ext_q) < 4:
        warnings.append(f"WARN: {filename}: Only {len(ext_q)} extended questions (minimum 4)")

    total_marks = sum(q.get("marks", 0) for q in core_q + ext_q)
    if total_marks < 30:
        warnings.append(f"WARN: {filename}: Total marks = {total_marks} (target: 30-40)")
    elif total_marks > 40:
        warnings.append(f"WARN: {filename}: Total marks = {total_marks} (target: 30-40)")

    vocab = data.get("key_vocabulary", [])
    if len(vocab) < 4:
        warnings.append(f"WARN: {filename}: Only {len(vocab)} vocabulary entries (recommend 4+)")

    checklist = data.get("review_checklist", [])
    if len(checklist) < 5:
        warnings.append(f"WARN: {filename}: Only {len(checklist)} checklist items (minimum 5)")

    # Check all questions have explanations
    for i, q in enumerate(core_q + ext_q):
        if not q.get("explanation"):
            warnings.append(f"WARN: {filename}: question[{i}] has no explanation")

    return passes, failures, warnings


def main():
    if len(sys.argv) > 1:
        files = [sys.argv[1]]
    else:
        files = sorted(glob.glob(DEFAULT_GLOB))
        # Exclude .sample.json from default validation
        files = [f for f in files if ".sample." not in f]

    if not files:
        # If no production files, validate the sample as a smoke test
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

    # Print results
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
