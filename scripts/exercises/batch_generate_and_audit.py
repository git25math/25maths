#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import textwrap
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "_data"
EXERCISE_DATA_DIR = DATA_DIR / "exercises"
REPORT_DIR = ROOT / "plan" / "gemini-batch-reports"

SUBTOPIC_INDEX_FILES = {
    "cie0580": DATA_DIR / "kahoot_cie0580_subtopics.json",
    "edexcel-4ma1": DATA_DIR / "kahoot_edexcel4ma1_subtopics.json",
}

BOARD_LABELS = {
    "cie0580": "CIE 0580",
    "edexcel-4ma1": "Edexcel 4MA1",
}


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def extract_json_object(text: str) -> dict:
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
    raise ValueError("Could not parse JSON object from model output.")


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


def find_issues(payload: dict) -> list[str]:
    issues: list[str] = []
    for idx, q in enumerate(payload.get("questions", []), start=1):
        options = q.get("options", [])
        normalized = [str(opt).strip().lower() for opt in options]
        if len(set(normalized)) < len(normalized):
            issues.append(f"Q{idx}: duplicate options detected")
        answer = q.get("correctAnswer")
        if not isinstance(answer, int) or answer < 0 or answer > 3:
            issues.append(f"Q{idx}: invalid correctAnswer index")
    return issues


def load_subtopics(
    board: str,
    section_key: str | None,
    start_code: str | None,
    end_code: str | None,
    max_items: int | None,
) -> list[dict]:
    file_path = SUBTOPIC_INDEX_FILES[board]
    data = json.loads(file_path.read_text(encoding="utf-8"))
    rows: list[dict] = []

    for section in data.get("sections", []):
        if section_key and section.get("section_key") != section_key:
            continue
        for item in section.get("items", []):
            code = str(item.get("code", ""))
            if start_code and code < start_code:
                continue
            if end_code and code > end_code:
                continue
            subtopic_id = item.get("id")
            if not subtopic_id:
                continue
            rows.append(
                {
                    "id": subtopic_id,
                    "code": code,
                    "title": item.get("title", ""),
                    "tier": item.get("tier", section.get("tier", "")),
                    "domain": section.get("domain", ""),
                    "board_label": BOARD_LABELS[board],
                }
            )

    if max_items is not None:
        rows = rows[:max_items]
    return rows


def run_cmd(cmd: list[str]) -> tuple[int, str, str]:
    result = subprocess.run(
        cmd,
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    return result.returncode, result.stdout.strip(), result.stderr.strip()


def run_generation(
    subtopic_id: str,
    lang: str,
    question_count: int,
    model: str,
    allow_placeholder: bool,
) -> tuple[bool, str]:
    cmd = [
        sys.executable,
        str(ROOT / "scripts" / "exercises" / "orchestrate_gemini_exercise.py"),
        "--subtopic-id",
        subtopic_id,
        "--lang",
        lang,
        "--question-count",
        str(question_count),
        "--model",
        model,
    ]
    if allow_placeholder:
        cmd.append("--allow-placeholder")
    code, out, err = run_cmd(cmd)
    if code != 0:
        msg = f"generation failed: {err or out}"
        return False, msg
    return True, out


def build_audit_prompt(
    payload: dict,
    meta: dict,
    question_count: int,
    lang: str,
) -> str:
    language_note = (
        "Keep questionText and explanation in Simplified Chinese."
        if lang == "zh-cn"
        else "Keep questionText and explanation in English."
    )

    payload_block = json.dumps(payload, ensure_ascii=False, indent=2)

    return textwrap.dedent(
        f"""
        You are a strict math quality reviewer for 25Maths interactive exercises.

        Task:
        - Review the payload and fix any mathematical, logical, or exam-alignment issues.
        - Ensure each question has exactly one correct option.
        - Ensure correctAnswer matches the actually correct option.
        - Ensure explanations are consistent with the correct option.
        - Keep all questions within the micro-topic scope only.
        - {language_note}

        Hard output constraints:
        - Output JSON only.
        - Return the same top-level schema and exactly {question_count} questions.
        - Each question must keep:
          - type = "multiple-choice"
          - 4 options
          - correctAnswer in [0,1,2,3]
        - Do not add any extra keys.

        Target metadata:
        - board: {meta["board_label"]}
        - subtopicId: {meta["id"]}
        - syllabusCode: {meta["code"]}
        - tier: {meta["tier"]}
        - domain: {meta["domain"]}
        - micro-topic title: {meta["title"]}

        Payload to audit:
        {payload_block}
        """
    ).strip()


def run_audit(
    payload: dict,
    meta: dict,
    question_count: int,
    lang: str,
    model: str,
) -> dict:
    prompt = build_audit_prompt(
        payload=payload,
        meta=meta,
        question_count=question_count,
        lang=lang,
    )
    cmd = ["gemini", "-m", model, "-p", prompt, "--output-format", "text"]
    code, out, err = run_cmd(cmd)
    if code != 0:
        raise RuntimeError(f"audit model failed: {err or out}")
    audited = extract_json_object(out)
    audited = validate_payload(audited, question_count)
    return audited


def force_metadata(payload: dict, meta: dict) -> dict:
    payload["board"] = meta["board_label"]
    payload["subtopicId"] = meta["id"]
    payload["syllabusCode"] = meta["code"]
    payload["tier"] = meta["tier"]
    payload["domain"] = meta["domain"]
    return payload


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Batch generate and self-audit interactive exercise payloads."
    )
    parser.add_argument(
        "--board",
        required=True,
        choices=["cie0580", "edexcel-4ma1"],
        help="Board key.",
    )
    parser.add_argument(
        "--section-key",
        help="Optional section key filter (e.g. number-c1).",
    )
    parser.add_argument(
        "--start-code",
        help="Optional start syllabus code (inclusive, e.g. C1-04).",
    )
    parser.add_argument(
        "--end-code",
        help="Optional end syllabus code (inclusive, e.g. C1-16).",
    )
    parser.add_argument(
        "--max-items",
        type=int,
        help="Optional max number of subtopics to process.",
    )
    parser.add_argument(
        "--lang",
        default="en",
        choices=["en", "zh-cn"],
        help="Language for generation.",
    )
    parser.add_argument(
        "--question-count",
        type=int,
        default=12,
        help="Question count per topic.",
    )
    parser.add_argument(
        "--gen-model",
        default="gemini-2.5-pro",
        help="Generation model.",
    )
    parser.add_argument(
        "--audit-model",
        default="gemini-2.5-flash",
        help="Audit model.",
    )
    parser.add_argument(
        "--skip-audit",
        action="store_true",
        help="Skip model-based quality audit.",
    )
    parser.add_argument(
        "--allow-placeholder",
        action="store_true",
        help="Pass-through to generator for placeholder source content.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    subtopics = load_subtopics(
        board=args.board,
        section_key=args.section_key,
        start_code=args.start_code,
        end_code=args.end_code,
        max_items=args.max_items,
    )

    if not subtopics:
        raise SystemExit("No subtopics matched the filters.")

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    report_path = REPORT_DIR / f"batch-{args.board}-{timestamp}.json"

    results: list[dict] = []
    success_count = 0
    corrected_count = 0
    warning_count = 0
    failure_count = 0

    total = len(subtopics)
    for idx, meta in enumerate(subtopics, start=1):
        sid = meta["id"]
        topic_slug = slugify(sid.replace(":", "-"))
        json_path = EXERCISE_DATA_DIR / f"{topic_slug}.json"
        print(f"[{idx}/{total}] {sid} ({meta['code']})", flush=True)

        row = {
            "subtopicId": sid,
            "syllabusCode": meta["code"],
            "topicSlug": topic_slug,
            "status": "unknown",
            "generated": False,
            "audited": False,
            "corrected": False,
            "issues_before": [],
            "issues_after": [],
            "notes": "",
        }

        ok, message = run_generation(
            subtopic_id=sid,
            lang=args.lang,
            question_count=args.question_count,
            model=args.gen_model,
            allow_placeholder=args.allow_placeholder,
        )
        if not ok:
            row["status"] = "failed"
            row["notes"] = message
            results.append(row)
            failure_count += 1
            print("  - generation failed", flush=True)
            continue

        row["generated"] = True

        if not json_path.exists():
            row["status"] = "failed"
            row["notes"] = f"missing output json: {json_path}"
            results.append(row)
            failure_count += 1
            print("  - missing output json", flush=True)
            continue

        try:
            payload = json.loads(json_path.read_text(encoding="utf-8"))
            payload = validate_payload(payload, args.question_count)
            payload = force_metadata(payload, meta)
        except Exception as exc:
            row["status"] = "failed"
            row["notes"] = f"invalid generated payload: {exc}"
            results.append(row)
            failure_count += 1
            print("  - invalid generated payload", flush=True)
            continue

        issues_before = find_issues(payload)
        row["issues_before"] = issues_before

        final_payload = payload
        if not args.skip_audit:
            try:
                audited = run_audit(
                    payload=payload,
                    meta=meta,
                    question_count=args.question_count,
                    lang=args.lang,
                    model=args.audit_model,
                )
                audited = force_metadata(audited, meta)
                row["audited"] = True
                if audited != payload:
                    final_payload = audited
                    row["corrected"] = True
                    corrected_count += 1
            except Exception as exc:
                row["notes"] = f"audit failed, kept generated payload: {exc}"
                warning_count += 1
                print("  - audit failed, keeping generated payload", flush=True)

        issues_after = find_issues(final_payload)
        row["issues_after"] = issues_after
        if issues_after:
            warning_count += 1

        json_path.write_text(
            json.dumps(final_payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

        row["status"] = "ok"
        success_count += 1
        results.append(row)
        print(
            f"  - ok (audited={row['audited']}, corrected={row['corrected']}, issues={len(issues_after)})",
            flush=True,
        )

    report = {
        "timestamp_utc": timestamp,
        "board": args.board,
        "section_key": args.section_key,
        "start_code": args.start_code,
        "end_code": args.end_code,
        "lang": args.lang,
        "question_count": args.question_count,
        "gen_model": args.gen_model,
        "audit_model": None if args.skip_audit else args.audit_model,
        "totals": {
            "requested": total,
            "success": success_count,
            "failed": failure_count,
            "corrected": corrected_count,
            "warnings": warning_count,
        },
        "results": results,
    }
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print("\nBatch complete.", flush=True)
    print(f"- report: {report_path}", flush=True)
    print(
        "- totals: "
        f"requested={total}, success={success_count}, failed={failure_count}, "
        f"corrected={corrected_count}, warnings={warning_count}",
        flush=True,
    )


if __name__ == "__main__":
    main()
