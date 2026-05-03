#!/usr/bin/env python3
"""Validate global navigation consistency and anti-regression rules."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GLOBAL_NAV_FILE = ROOT / "_includes" / "global-nav.html"
FOOTER_FILE = ROOT / "_includes" / "footer.html"

SITE_INDEX_FILE = ROOT / "index.html"
SITE_EN_INDEX_FILE = ROOT / "en" / "index.html"
SITE_ZH_INDEX_FILE = ROOT / "zh-cn" / "index.html"

LAYOUT_FILES = [
    ROOT / "_layouts" / "global.html",
    ROOT / "_layouts" / "module.html",
    ROOT / "_layouts" / "post.html",
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


def read_text(path: Path, label: str) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        fail(f"{label}: missing file {path}")
        return ""


def check_marker_order(section_text: str, section_label: str, markers: list[str]) -> None:
    positions: list[int] = []
    for marker in markers:
        count = section_text.count(marker)
        if count != 1:
            fail(f"{section_label}: marker '{marker}' appears {count} time(s), expected 1")
        idx = section_text.find(marker)
        if idx == -1:
            fail(f"{section_label}: missing marker '{marker}'")
        positions.append(idx)

    if positions and positions != sorted(positions):
        fail(
            f"{section_label}: marker order mismatch; expected "
            "Kahoot -> Membership"
        )
    elif positions:
        pass_msg(
            f"{section_label}: order verified (Kahoot -> Membership)"
        )


def check_global_nav() -> None:
    text = read_text(GLOBAL_NAV_FILE, "Global nav")
    if not text:
        return

    desktop_start = 'class="hidden md:flex items-center space-x-1"'
    desktop_end = "<!-- Mobile menu button -->"
    mobile_start = '<div id="global-mobile-menu"'

    desktop_start_idx = text.find(desktop_start)
    desktop_end_idx = text.find(desktop_end)
    mobile_start_idx = text.find(mobile_start)

    if desktop_start_idx == -1 or desktop_end_idx == -1:
        fail("Global nav: desktop section markers not found")
        desktop_text = ""
    else:
        desktop_text = text[desktop_start_idx:desktop_end_idx]

    if mobile_start_idx == -1:
        fail("Global nav: mobile section marker not found")
        mobile_text = ""
    else:
        mobile_text = text[mobile_start_idx:]

    ordered_markers = [
        '<a href="{{ kahoot_path }}"',
        '<a href="{{ membership_path }}"',
    ]

    if desktop_text:
        check_marker_order(desktop_text, "Global nav desktop", ordered_markers)
    if mobile_text:
        check_marker_order(mobile_text, "Global nav mobile", ordered_markers)

    for marker in ordered_markers:
        total = text.count(marker)
        if total != 2:
            fail(f"Global nav: marker '{marker}' appears {total} time(s), expected 2")

    forbidden_markers = [
        "blog_path",
        "about_label",
        "support_label",
        "/blog/",
        "/about.html",
        "/support.html",
        ">EN<",
        ">ZH-CN<",
    ]
    for marker in forbidden_markers:
        if marker in text:
            fail(f"Global nav: forbidden top-nav marker detected '{marker}'")

    if FAILURES == 0:
        pass_msg("Global nav: removed entries remain absent (Blog/Support/About/EN/ZH-CN)")


def check_footer_entry_preservation() -> None:
    text = read_text(FOOTER_FILE, "Footer")
    if not text:
        return

    required_markers = [
        "blog_path",
        "about_label",
        "support_label",
        "{{ kahoot_label }}",
        "{{ membership_label }}",
        "/about.html",
        "/support.html",
    ]
    missing = [marker for marker in required_markers if marker not in text]
    if missing:
        fail(f"Footer: missing expected retained entry markers {missing}")
    else:
        pass_msg("Footer: retained entry markers present (Blog/About/Support/Kahoot/Membership)")


def check_homepage_blog_entries() -> None:
    expected_links = [
        (SITE_INDEX_FILE, "Home default", "/blog/"),
        (SITE_EN_INDEX_FILE, "Home EN", "/blog/"),
        (SITE_ZH_INDEX_FILE, "Home ZH", "/zh-cn/blog/"),
    ]
    for path, label, marker in expected_links:
        text = read_text(path, label)
        if not text:
            continue
        if marker not in text:
            fail(f"{label}: missing lower-page Blog entry marker '{marker}'")
        else:
            pass_msg(f"{label}: lower-page Blog entry marker present")


def check_layout_usage() -> None:
    include_marker = "include global-nav.html"
    for path in LAYOUT_FILES:
        text = read_text(path, f"Layout {path.name}")
        if not text:
            continue
        if include_marker not in text:
            fail(f"Layout {path.name}: missing '{include_marker}'")
        else:
            pass_msg(f"Layout {path.name}: uses global nav include")


def main() -> int:
    print("== Navigation Consistency Check ==")
    check_global_nav()
    check_footer_entry_preservation()
    check_homepage_blog_entries()
    check_layout_usage()

    print("== Summary ==")
    print(f"Failures: {FAILURES}")
    print(f"Warnings: {WARNINGS}")
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
