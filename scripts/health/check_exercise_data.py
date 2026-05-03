#!/usr/bin/env python3
"""Guard that the retired exercise product line stays offline."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

REMOVED_PATHS = [
    "_exercises",
    "_data/exercises",
    "_data/exercises_backup",
    "_data/exercise_registry.json",
    "exercises",
    "zh-cn/exercises",
    "_layouts/interactive_exercise.html",
    "assets/js/exercise_engine.js",
    "assets/js/exercise_hub.js",
    "assets/evidence/exercises-hub.webp",
    "functions/api/v1/exercise",
    "functions/api/v1/engagement/check-achievements.js",
    "institution/assignments.html",
]

SCAN_SUFFIXES = {".html", ".md", ".js", ".json", ".xml", ".yml", ".yaml", ".txt", ".sh", ".py", ".mjs"}
SCAN_ROOTS = {
    "_includes",
    "_layouts",
    "_posts",
    "assets",
    "_ops",
    "blog",
    "cie0580",
    "edx4ma1",
    "en",
    "functions",
    "kahoot",
    "membership",
    "start",
    "tests",
    "tools",
    "zh-cn",
}
SCAN_ROOT_FILES = {
    "404.html",
    "faq.html",
    "index.html",
    "sitemap.xml",
    "subscription.html",
}
SKIP_DIRS = {
    ".git",
    ".bundle",
    ".jekyll-cache",
    "_site",
    "build",
    "node_modules",
    "vendor",
}
ALLOWED_FILES = {
    "_redirects",
    "robots.txt",
    ".github/workflows/ci.yml",
    ".github/workflows/site-health-check.yml",
    "scripts/health/check_exercise_data.py",
}

FORBIDDEN_MARKERS = [
    "/exercises/",
    "site.exercises",
    "interactive_exercise",
    "exercise_engine.js",
    "exercise_hub.js",
    "exercise_registry",
    "exercise_path",
    "exerciseUrl",
    "check-achievements",
    "Interactive Exercises",
    "Interactive Exercise",
    "interactive exercise",
    "interactive practice",
    "互动练习",
]

failures = 0
warnings = 0


def pass_msg(message: str) -> None:
    print(f"PASS: {message}")


def warn(message: str) -> None:
    global warnings
    warnings += 1
    print(f"WARN: {message}")


def fail(message: str) -> None:
    global failures
    failures += 1
    print(f"FAIL: {message}")


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def iter_source_files():
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        relative = rel(path)
        first_part = path.relative_to(ROOT).parts[0]
        if relative not in SCAN_ROOT_FILES and first_part not in SCAN_ROOTS:
            continue
        if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        if relative in ALLOWED_FILES:
            continue
        if path.suffix not in SCAN_SUFFIXES and path.name not in {"sitemap.xml"}:
            continue
        yield path


def check_removed_paths() -> None:
    for item in REMOVED_PATHS:
        path = ROOT / item
        if path.exists():
            fail(f"Retired exercise path still exists: {item}")
        else:
            pass_msg(f"Retired exercise path absent: {item}")


def check_config() -> None:
    config = ROOT / "_config.yml"
    try:
        text = config.read_text(encoding="utf-8")
    except FileNotFoundError:
        fail("_config.yml missing")
        return

    forbidden_config = [
        "type: exercises",
        "permalink: /exercises/:path/",
        "active_global: exercises",
    ]
    for marker in forbidden_config:
        if marker in text:
            fail(f"_config.yml still contains retired collection marker: {marker}")
        else:
            pass_msg(f"_config.yml retired marker absent: {marker}")


def check_public_references() -> None:
    for path in iter_source_files():
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for marker in FORBIDDEN_MARKERS:
            if marker in text:
                fail(f"{rel(path)} contains retired exercise marker: {marker}")


def main() -> int:
    print("== Exercise Product Line Retirement Guard ==")
    check_removed_paths()
    check_config()
    check_public_references()

    print("== Summary ==")
    print(f"Failures: {failures}")
    print(f"Warnings: {warnings}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
