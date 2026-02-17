#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "_data"
EXERCISE_DATA_DIR = DATA_DIR / "exercises"
EXERCISE_PAGE_DIR = ROOT / "_exercises"
SUBTOPIC_INDEX_FILES = (
    DATA_DIR / "kahoot_cie0580_subtopics.json",
    DATA_DIR / "kahoot_edexcel4ma1_subtopics.json",
)
SOURCE_FILENAMES = (
    "kahoot-question-set.md",
    "worksheet-student.md",
    "worksheet-answers.md",
    "listing-copy.md",
)
BOARD_LABELS = {
    "cie0580": "CIE 0580",
    "edexcel-4ma1": "Edexcel 4MA1",
}
PLACEHOLDER_PATTERNS = (
    r"syllabus micro-topic",
    r"\[fill with exact official wording\]",
)


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def quoted(value: str) -> str:
    safe = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{safe}"'


def load_subtopic_index() -> dict[str, dict]:
    index: dict[str, dict] = {}
    for file_path in SUBTOPIC_INDEX_FILES:
        data = json.loads(file_path.read_text(encoding="utf-8"))
        for section in data.get("sections", []):
            for item in section.get("items", []):
                subtopic_id = item.get("id")
                if not subtopic_id:
                    continue
                board_slug = subtopic_id.split(":", 1)[0]
                index[subtopic_id] = {
                    "board_slug": board_slug,
                    "board_label": BOARD_LABELS.get(board_slug, board_slug),
                    "section_key": section.get("section_key", ""),
                    "domain": section.get("domain", ""),
                    "tier": item.get("tier", section.get("tier", "")),
                    "title": item.get("title", ""),
                    "code": item.get("code", ""),
                    "slug": item.get("slug", ""),
                    "folder_path": item.get("folder_path", ""),
                }
    return index


def load_source_material(meta: dict) -> tuple[Path, dict[str, str]]:
    folder_value = meta.get("folder_path", "")
    if not folder_value:
        raise FileNotFoundError("Missing folder_path in subtopic metadata.")
    folder = ROOT / folder_value.lstrip("/")
    if not folder.exists():
        raise FileNotFoundError(f"Subtopic folder does not exist: {folder}")

    sources: dict[str, str] = {}
    for name in SOURCE_FILENAMES:
        path = folder / name
        if path.exists():
            sources[name] = path.read_text(encoding="utf-8").strip()
    if not sources:
        raise FileNotFoundError(f"No source markdown found in {folder}")
    return folder, sources


def has_placeholder_content(sources: dict[str, str]) -> bool:
    combined = "\n".join(sources.values()).lower()
    for pattern in PLACEHOLDER_PATTERNS:
        if re.search(pattern, combined, flags=re.IGNORECASE):
            return True
    return False


def build_prompt(
    subtopic_id: str,
    meta: dict,
    sources: dict[str, str],
    question_count: int,
    lang: str,
) -> str:
    source_chunks = []
    for name, content in sources.items():
        source_chunks.append(f"### {name}\n{content}\n")
    source_block = "\n".join(source_chunks)

    language_note = (
        "Write questionText and explanation in Simplified Chinese."
        if lang == "zh-cn"
        else "Write questionText and explanation in English."
    )

    return textwrap.dedent(
        f"""
        You are generating a production-ready interactive exercise JSON for 25Maths.

        Hard constraints:
        - Output JSON only. No markdown, no code fences, no extra narration.
        - Follow this exact top-level schema:
          {{
            "topic": string,
            "board": string,
            "subtopicId": string,
            "syllabusCode": string,
            "tier": string,
            "domain": string,
            "questions": [
              {{
                "type": "multiple-choice",
                "questionText": string,
                "options": [string, string, string, string],
                "correctAnswer": 0|1|2|3,
                "explanation": string
              }}
            ]
          }}
        - Exactly {question_count} questions.
        - All questions must be strictly aligned to the target micro-topic scope.
        - Use exam-style wording and realistic distractors based on common mistakes.
        - Keep explanations concise and method-focused.
        - Do not include out-of-syllabus skills.
        - {language_note}

        Target metadata:
        - board: {meta["board_label"]}
        - subtopicId: {subtopic_id}
        - syllabusCode: {meta["code"]}
        - domain: {meta["domain"]}
        - tier: {meta["tier"]}
        - micro-topic title: {meta["title"]}

        Source materials (authoritative for scope and style):
        {source_block}
        """
    ).strip()


def run_gemini(prompt: str, model: str) -> str:
    cmd = ["gemini", "-m", model, "-p", prompt, "--output-format", "text"]
    result = subprocess.run(
        cmd,
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    output = (result.stdout or "").strip()
    if result.returncode != 0:
        raise RuntimeError(f"Gemini CLI failed:\n{result.stderr}\n{output}")
    return output


def extract_json_object(text: str) -> dict:
    # Gemini CLI may prepend short runtime logs before the model JSON.
    cursor = text.find("{")
    while cursor != -1:
        depth = 0
        in_string = False
        escaped = False
        for i in range(cursor, len(text)):
            ch = text[i]
            if in_string:
                if escaped:
                    escaped = False
                elif ch == "\\":
                    escaped = True
                elif ch == '"':
                    in_string = False
            else:
                if ch == '"':
                    in_string = True
                elif ch == "{":
                    depth += 1
                elif ch == "}":
                    depth -= 1
                    if depth == 0:
                        candidate = text[cursor : i + 1]
                        try:
                            parsed = json.loads(candidate)
                        except json.JSONDecodeError:
                            break
                        if isinstance(parsed, dict):
                            return parsed
                        break
        cursor = text.find("{", cursor + 1)
    raise ValueError("Could not parse JSON object from Gemini output.")


def validate_payload(payload: dict, question_count: int) -> dict:
    if not isinstance(payload, dict):
        raise ValueError("Payload must be a JSON object.")

    questions = payload.get("questions")
    if not isinstance(questions, list):
        raise ValueError("Payload.questions must be a list.")
    if len(questions) != question_count:
        raise ValueError(
            f"Expected {question_count} questions, got {len(questions)}."
        )

    normalized_questions = []
    for idx, q in enumerate(questions, start=1):
        if not isinstance(q, dict):
            raise ValueError(f"Question #{idx} is not an object.")
        question_text = str(q.get("questionText", "")).strip()
        explanation = str(q.get("explanation", "")).strip()
        options = q.get("options")
        correct = q.get("correctAnswer")

        if not question_text:
            raise ValueError(f"Question #{idx} missing questionText.")
        if not explanation:
            raise ValueError(f"Question #{idx} missing explanation.")
        if not isinstance(options, list) or len(options) != 4:
            raise ValueError(f"Question #{idx} must have exactly 4 options.")
        if not all(str(opt).strip() for opt in options):
            raise ValueError(f"Question #{idx} has empty option.")
        if not isinstance(correct, int) or correct < 0 or correct > 3:
            raise ValueError(
                f"Question #{idx} correctAnswer must be integer 0-3."
            )

        normalized_questions.append(
            {
                "type": "multiple-choice",
                "questionText": question_text,
                "options": [str(opt).strip() for opt in options],
                "correctAnswer": correct,
                "explanation": explanation,
            }
        )

    payload["questions"] = normalized_questions
    return payload


def write_outputs(
    subtopic_id: str,
    meta: dict,
    payload: dict,
    lang: str,
    dry_run: bool,
) -> tuple[Path, Path]:
    topic_slug = slugify(subtopic_id.replace(":", "-"))
    json_path = EXERCISE_DATA_DIR / f"{topic_slug}.json"
    page_path = EXERCISE_PAGE_DIR / f"{topic_slug}.md"

    topic_name = str(payload.get("topic", "")).strip() or meta["title"].title()
    subtitle = (
        f"{meta['board_label']} {meta['code']} interactive exam-style practice."
    )

    page_content = textwrap.dedent(
        f"""\
        ---
        title: {quoted(f"Practice: {topic_name}")}
        subtitle: {quoted(subtitle)}
        layout: "interactive_exercise"
        topic: "{topic_slug}"
        subtopic_id: "{subtopic_id}"
        board: "{meta['board_label']}"
        tier: "{meta['tier']}"
        syllabus_code: "{meta['code']}"
        lang: "{lang}"
        ---
        """
    )

    if not dry_run:
        EXERCISE_DATA_DIR.mkdir(parents=True, exist_ok=True)
        EXERCISE_PAGE_DIR.mkdir(parents=True, exist_ok=True)
        json_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        page_path.write_text(page_content, encoding="utf-8")

    return json_path, page_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Orchestrate Gemini CLI to generate 25Maths interactive exercise files."
    )
    parser.add_argument(
        "--subtopic-id",
        required=True,
        help="Subtopic ID (e.g. cie0580:number-c1:c1-16-money)",
    )
    parser.add_argument(
        "--model",
        default="gemini-2.5-pro",
        help="Gemini model name (default: gemini-2.5-pro)",
    )
    parser.add_argument(
        "--lang",
        default="en",
        choices=["en", "zh-cn"],
        help="Language for generated questions (en or zh-cn)",
    )
    parser.add_argument(
        "--question-count",
        type=int,
        default=12,
        help="Number of MCQ questions (default: 12)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run generation and validation without writing files.",
    )
    parser.add_argument(
        "--allow-placeholder",
        action="store_true",
        help="Allow generation even if source files contain placeholder syllabus text.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    index = load_subtopic_index()
    if args.subtopic_id not in index:
        known = ", ".join(sorted(index.keys())[:8])
        raise SystemExit(
            f"Unknown subtopic_id: {args.subtopic_id}\n"
            f"Example IDs: {known} ..."
        )

    meta = index[args.subtopic_id]
    folder, sources = load_source_material(meta)
    if has_placeholder_content(sources) and not args.allow_placeholder:
        raise SystemExit(
            "Detected placeholder syllabus content in source files. "
            "Lock official wording first or pass --allow-placeholder."
        )
    prompt = build_prompt(
        subtopic_id=args.subtopic_id,
        meta=meta,
        sources=sources,
        question_count=args.question_count,
        lang=args.lang,
    )

    raw_output = run_gemini(prompt=prompt, model=args.model)
    payload = extract_json_object(raw_output)
    payload = validate_payload(payload=payload, question_count=args.question_count)

    payload["board"] = meta["board_label"]
    payload["subtopicId"] = args.subtopic_id
    payload["syllabusCode"] = meta["code"]
    payload["tier"] = meta["tier"]
    payload["domain"] = meta["domain"]

    json_path, page_path = write_outputs(
        subtopic_id=args.subtopic_id,
        meta=meta,
        payload=payload,
        lang=args.lang,
        dry_run=args.dry_run,
    )

    mode = "DRY RUN" if args.dry_run else "WRITTEN"
    print(f"[{mode}] source folder: {folder}")
    print(f"[{mode}] exercise data: {json_path}")
    print(f"[{mode}] exercise page: {page_path}")


if __name__ == "__main__":
    main()
