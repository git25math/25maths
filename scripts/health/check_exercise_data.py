#!/usr/bin/env python3
"""Validate interactive exercise data consistency for CI."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Set

import yaml

ROOT = Path(__file__).resolve().parents[2]
EXERCISE_DIR = ROOT / "_exercises"
DATA_DIR = ROOT / "_data" / "exercises"
LINKS_FILE = ROOT / "_data" / "kahoot_subtopic_links.json"
CIE_SUBTOPIC_FILE = ROOT / "_data" / "kahoot_cie0580_subtopics.json"
EDEXCEL_SUBTOPIC_FILE = ROOT / "_data" / "kahoot_edexcel4ma1_subtopics.json"
EXERCISE_HUB_EN_FILE = ROOT / "exercises" / "index.html"
EXERCISE_HUB_ZH_FILE = ROOT / "zh-cn" / "exercises" / "index.html"
SITE_INDEX_FILE = ROOT / "index.html"
SITE_EN_INDEX_FILE = ROOT / "en" / "index.html"
SITE_ZH_INDEX_FILE = ROOT / "zh-cn" / "index.html"
KAHOOT_HUB_FILE = ROOT / "kahoot" / "index.html"
KAHOOT_HUB_ZH_FILE = ROOT / "zh-cn" / "kahoot" / "index.html"
KAHOOT_CIE_FILE = ROOT / "kahoot" / "cie0580" / "index.html"
KAHOOT_EDEXCEL_FILE = ROOT / "kahoot" / "edexcel-4ma1" / "index.html"

FRONT_MATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*(?:\n|$)", re.S)
SYLLABUS_CODE_RE = re.compile(r"^[A-Za-z]\d{1,2}-\d{2}$")
SUBTOPIC_ID_RE = re.compile(
    r"^(cie0580|edexcel-4ma1):[a-z0-9-]+:[a-z]\d{1,2}-\d{2}-[a-z0-9-]+$",
    re.I,
)
URL_RE = re.compile(r"^https?://")

VALID_TIERS = {"core", "extended", "foundation", "higher"}
REQUIRED_FRONT_MATTER_FIELDS = [
    "layout",
    "topic",
    "subtopic_id",
    "board",
    "tier",
    "syllabus_code",
]

FAILURES = 0
WARNINGS = 0


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


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"Missing file: {path}")
        return {}
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {path}: {exc}")
        return {}


def load_front_matter(path: Path) -> Dict[str, Any]:
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        fail(f"Missing markdown file: {path}")
        return {}

    match = FRONT_MATTER_RE.match(text)
    if not match:
        fail(f"{path.name}: missing valid YAML front matter block")
        return {}

    try:
        payload = yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError as exc:
        fail(f"{path.name}: invalid YAML front matter ({exc})")
        return {}

    if not isinstance(payload, dict):
        fail(f"{path.name}: front matter must be a key/value object")
        return {}
    return payload


def collect_catalog_ids(path: Path, label: str) -> Set[str]:
    payload = load_json(path)
    sections = payload.get("sections")
    if not isinstance(sections, list):
        fail(f"{label}: missing 'sections' list")
        return set()

    ids: Set[str] = set()
    for section in sections:
        if not isinstance(section, dict):
            fail(f"{label}: section entry must be an object")
            continue
        items = section.get("items")
        if not isinstance(items, list):
            fail(f"{label}: section '{section.get('section_key', '<unknown>')}' has invalid 'items'")
            continue
        for item in items:
            if not isinstance(item, dict):
                fail(f"{label}: item in section '{section.get('section_key', '<unknown>')}' is not an object")
                continue
            item_id = item.get("id")
            if not isinstance(item_id, str) or not item_id.strip():
                fail(f"{label}: item in section '{section.get('section_key', '<unknown>')}' missing valid 'id'")
                continue
            ids.add(item_id.strip())
    return ids


def check_questions(slug: str, data: Dict[str, Any]) -> bool:
    questions = data.get("questions")
    if not isinstance(questions, list):
        fail(f"{slug}: questions must be a list")
        return False

    exact_count = len(questions) == 12
    if len(questions) == 12:
        pass
    else:
        warn(f"{slug}: question count is {len(questions)} (expected 12)")

    for index, question in enumerate(questions, start=1):
        prefix = f"{slug} Q{index}"
        if not isinstance(question, dict):
            fail(f"{prefix}: question must be an object")
            continue

        q_type = str(question.get("type", "")).strip()
        if q_type != "multiple-choice":
            warn(f"{prefix}: type is '{q_type}' (expected 'multiple-choice')")

        question_text = str(question.get("questionText", "")).strip()
        if not question_text:
            fail(f"{prefix}: missing questionText")

        options = question.get("options")
        if not isinstance(options, list):
            fail(f"{prefix}: options must be a list")
        else:
            if len(options) != 4:
                fail(f"{prefix}: options count is {len(options)} (expected 4)")
            for opt_index, option in enumerate(options, start=1):
                if str(option).strip() == "":
                    fail(f"{prefix}: option {opt_index} is empty")

        correct = question.get("correctAnswer")
        if not isinstance(correct, int) or not 0 <= correct <= 3:
            fail(f"{prefix}: correctAnswer must be an integer in [0, 3], got {correct!r}")

        explanation = str(question.get("explanation", "")).strip()
        if not explanation:
            warn(f"{prefix}: explanation is empty")

    return exact_count


def check_hub_page_structure() -> None:
    required_script_ref = "/assets/js/exercise_hub.js"
    required_i18n_marker = "window.exerciseHubI18n"
    legacy_marker = "const boardSelect = document.getElementById('exercise-filter-board')"

    for path, label in [
        (EXERCISE_HUB_EN_FILE, "Exercise Hub (EN)"),
        (EXERCISE_HUB_ZH_FILE, "Exercise Hub (ZH)"),
    ]:
        try:
            text = path.read_text(encoding="utf-8")
        except FileNotFoundError:
            fail(f"{label}: missing file {path}")
            continue

        if required_script_ref not in text:
            fail(f"{label}: missing shared script reference '{required_script_ref}'")
        else:
            pass_msg(f"{label}: shared script reference present")

        if required_i18n_marker not in text:
            fail(f"{label}: missing i18n configuration marker '{required_i18n_marker}'")
        else:
            pass_msg(f"{label}: i18n configuration marker present")

        if legacy_marker in text:
            fail(f"{label}: legacy inline filter logic detected; should use shared script")


def check_entry_point_coverage() -> None:
    required_entry_markers = [
        (SITE_INDEX_FILE, "Site index", ["/exercises/"]),
        (SITE_EN_INDEX_FILE, "Site index (EN)", ["/exercises/"]),
        (SITE_ZH_INDEX_FILE, "Site index (ZH)", ["/zh-cn/exercises/"]),
        (KAHOOT_HUB_FILE, "Kahoot hub", ["/exercises/"]),
        (KAHOOT_HUB_ZH_FILE, "Kahoot hub (ZH)", ["/zh-cn/exercises/"]),
        (KAHOOT_CIE_FILE, "Kahoot CIE directory", ["/exercises/?board=cie0580"]),
        (
            KAHOOT_EDEXCEL_FILE,
            "Kahoot Edexcel directory",
            ["/exercises/?board=edexcel-4ma1"],
        ),
    ]

    for path, label, markers in required_entry_markers:
        try:
            text = path.read_text(encoding="utf-8")
        except FileNotFoundError:
            fail(f"{label}: missing file {path}")
            continue

        missing_markers = [marker for marker in markers if marker not in text]
        if missing_markers:
            fail(f"{label}: missing exercise entry markers {missing_markers}")
        else:
            pass_msg(f"{label}: exercise entry markers present")


def main() -> int:
    print("== Exercise Data Integrity Check ==")

    md_paths = sorted(EXERCISE_DIR.glob("*.md"))
    json_paths = sorted(DATA_DIR.glob("*.json"))
    md_slugs = {path.stem for path in md_paths}
    json_slugs = {path.stem for path in json_paths}

    if len(md_paths) == len(json_paths):
        pass_msg(f"_exercises and _data/exercises counts match ({len(md_paths)})")
    else:
        fail(f"Count mismatch: _exercises={len(md_paths)} _data/exercises={len(json_paths)}")

    missing_json = sorted(md_slugs - json_slugs)
    missing_md = sorted(json_slugs - md_slugs)
    if not missing_json:
        pass_msg("Every exercise markdown file has a matching JSON file")
    else:
        fail(f"Missing JSON files for {len(missing_json)} markdown slugs")
        for slug in missing_json[:10]:
            print(f"  - {slug}")
    if not missing_md:
        pass_msg("No orphan JSON files in _data/exercises")
    else:
        fail(f"Found {len(missing_md)} orphan JSON files")
        for slug in missing_md[:10]:
            print(f"  - {slug}")

    subtopic_to_slug: Dict[str, str] = {}
    topic_to_slug: Dict[str, str] = {}
    exact_question_count = 0

    for md_path in md_paths:
        slug = md_path.stem
        front_matter = load_front_matter(md_path)
        if not front_matter:
            continue

        for field in REQUIRED_FRONT_MATTER_FIELDS:
            value = front_matter.get(field)
            if value is None or str(value).strip() == "":
                fail(f"{slug}: missing front matter field '{field}'")

        layout = str(front_matter.get("layout", "")).strip()
        if layout != "interactive_exercise":
            fail(f"{slug}: layout is '{layout}', expected 'interactive_exercise'")

        title = str(front_matter.get("title", "")).strip()
        if not title.startswith("Practice: "):
            fail(f"{slug}: title must start with 'Practice: '")
        elif len(title) <= len("Practice: "):
            fail(f"{slug}: title is missing topic name after 'Practice: '")
        else:
            topic_label = title[len("Practice: ") :]
            if topic_label and topic_label[0].islower():
                fail(f"{slug}: title topic label should start with uppercase, got '{topic_label}'")

        topic = str(front_matter.get("topic", "")).strip()
        if topic and topic != slug:
            fail(f"{slug}: topic='{topic}' must match filename slug")
        if topic:
            previous_topic_slug = topic_to_slug.get(topic)
            if previous_topic_slug and previous_topic_slug != slug:
                fail(f"Duplicate topic '{topic}' in {previous_topic_slug} and {slug}")
            topic_to_slug[topic] = slug

        subtopic_id = str(front_matter.get("subtopic_id", "")).strip()
        if subtopic_id and not SUBTOPIC_ID_RE.match(subtopic_id):
            warn(f"{slug}: unusual subtopic_id format '{subtopic_id}'")
        if subtopic_id:
            previous = subtopic_to_slug.get(subtopic_id)
            if previous and previous != slug:
                fail(f"Duplicate subtopic_id '{subtopic_id}' in {previous} and {slug}")
            subtopic_to_slug[subtopic_id] = slug

        board = str(front_matter.get("board", "")).strip()
        if subtopic_id.startswith("cie0580:") and board and board != "CIE 0580":
            fail(f"{slug}: board '{board}' mismatches CIE subtopic_id")
        if subtopic_id.startswith("edexcel-4ma1:") and board and board != "Edexcel 4MA1":
            fail(f"{slug}: board '{board}' mismatches Edexcel subtopic_id")

        tier = str(front_matter.get("tier", "")).strip().lower()
        if tier and tier not in VALID_TIERS:
            fail(f"{slug}: invalid tier '{tier}'")

        syllabus_code = str(front_matter.get("syllabus_code", "")).strip()
        if syllabus_code and not SYLLABUS_CODE_RE.match(syllabus_code):
            fail(f"{slug}: invalid syllabus_code '{syllabus_code}'")

        subtitle = str(front_matter.get("subtitle", "")).strip()
        expected_subtitle = f"{board} {syllabus_code} interactive exam-style practice.".strip()
        if subtitle != expected_subtitle:
            fail(
                f"{slug}: subtitle mismatch, expected '{expected_subtitle}', got '{subtitle}'"
            )

        lang = str(front_matter.get("lang", "")).strip()
        if lang and lang != "en":
            warn(f"{slug}: lang is '{lang}', expected 'en' for current exercise pages")

        json_path = DATA_DIR / f"{slug}.json"
        if not json_path.exists():
            fail(f"{slug}: missing JSON file {json_path}")
            continue

        payload = load_json(json_path)
        if not isinstance(payload, dict):
            fail(f"{slug}: JSON payload must be an object")
            continue

        if str(payload.get("subtopicId", "")).strip() != subtopic_id:
            fail(
                f"{slug}: subtopic mismatch md='{subtopic_id}' json='{payload.get('subtopicId', '')}'"
            )
        if str(payload.get("board", "")).strip() != board:
            fail(f"{slug}: board mismatch md='{board}' json='{payload.get('board', '')}'")
        if str(payload.get("tier", "")).strip().lower() != tier:
            fail(f"{slug}: tier mismatch md='{tier}' json='{payload.get('tier', '')}'")
        if str(payload.get("syllabusCode", "")).strip().upper() != syllabus_code.upper():
            fail(
                f"{slug}: syllabus mismatch md='{syllabus_code}' json='{payload.get('syllabusCode', '')}'"
            )

        if check_questions(slug=slug, data=payload):
            exact_question_count += 1

    active_subtopic_ids = set(subtopic_to_slug.keys())
    pass_msg(f"Collected {len(active_subtopic_ids)} exercise subtopic ids")
    if md_paths:
        pass_msg(f"Exercises with 12 questions: {exact_question_count}/{len(md_paths)}")

    links = load_json(LINKS_FILE)
    if not isinstance(links, dict):
        fail("_data/kahoot_subtopic_links.json must be an object map")
        links = {}

    link_ids = set(links.keys())
    missing_link_ids = sorted(active_subtopic_ids - link_ids)
    extra_link_ids = sorted(link_ids - active_subtopic_ids)

    if not missing_link_ids:
        pass_msg("All exercise subtopic ids have link records")
    else:
        fail(f"Missing {len(missing_link_ids)} link records for exercise subtopic ids")
        for key in missing_link_ids[:10]:
            print(f"  - {key}")

    non_archived_extra = [
        key
        for key in extra_link_ids
        if str((links.get(key) or {}).get("status", "")).strip().lower() != "archived"
    ]
    archived_extra = [key for key in extra_link_ids if key not in non_archived_extra]

    if not non_archived_extra:
        pass_msg("No non-archived extra link records")
    else:
        fail(f"Found {len(non_archived_extra)} non-archived extra link records")
        for key in non_archived_extra[:10]:
            print(f"  - {key}")
    if archived_extra:
        warn(f"Archived extra link records retained: {len(archived_extra)}")

    for subtopic_id in sorted(active_subtopic_ids):
        record = links.get(subtopic_id)
        if not isinstance(record, dict):
            fail(f"{subtopic_id}: link record must be an object")
            continue

        kahoot_url = str(record.get("kahoot_url", "")).strip()
        worksheet_url = str(record.get("worksheet_payhip_url", "")).strip()
        bundle_candidates = [
            str(record.get("bundle_url", "")).strip(),
            str(record.get("section_bundle_payhip_url", "")).strip(),
            str(record.get("unit_bundle_payhip_url", "")).strip(),
        ]

        if not kahoot_url:
            fail(f"{subtopic_id}: missing kahoot_url")
        elif not URL_RE.match(kahoot_url):
            fail(f"{subtopic_id}: invalid kahoot_url '{kahoot_url}'")

        if not worksheet_url:
            fail(f"{subtopic_id}: missing worksheet_payhip_url")
        elif not URL_RE.match(worksheet_url):
            fail(f"{subtopic_id}: invalid worksheet_payhip_url '{worksheet_url}'")

        bundle_url = next((value for value in bundle_candidates if value), "")
        if not bundle_url:
            fail(f"{subtopic_id}: missing bundle URL (bundle/section/unit)")
        elif not URL_RE.match(bundle_url):
            fail(f"{subtopic_id}: invalid bundle URL '{bundle_url}'")

        exercise_path = str(record.get("exercise_path", "")).strip()
        if exercise_path:
            expected_slug = subtopic_to_slug.get(subtopic_id, "")
            expected_path = f"/exercises/{expected_slug}/"
            if exercise_path != expected_path:
                fail(
                    f"{subtopic_id}: exercise_path '{exercise_path}' must be '{expected_path}'"
                )

    cie_ids = collect_catalog_ids(CIE_SUBTOPIC_FILE, "CIE 0580 subtopics")
    edexcel_ids = collect_catalog_ids(EDEXCEL_SUBTOPIC_FILE, "Edexcel 4MA1 subtopics")
    catalog_ids = cie_ids | edexcel_ids

    missing_in_exercises = sorted(catalog_ids - active_subtopic_ids)
    missing_in_catalog = sorted(active_subtopic_ids - catalog_ids)

    if not missing_in_exercises and not missing_in_catalog:
        pass_msg("Catalog subtopic ids and exercise subtopic ids are in sync")
    else:
        if missing_in_exercises:
            fail(f"Catalog has {len(missing_in_exercises)} ids missing exercise pages")
            for key in missing_in_exercises[:10]:
                print(f"  - {key}")
        if missing_in_catalog:
            fail(f"Exercises have {len(missing_in_catalog)} ids missing in catalog")
            for key in missing_in_catalog[:10]:
                print(f"  - {key}")

    check_hub_page_structure()
    check_entry_point_coverage()

    print("== Summary ==")
    print(f"Failures: {FAILURES}")
    print(f"Warnings: {WARNINGS}")
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
