#!/usr/bin/env python3
"""Generate one unified Payhip merchant copy pack for all L1-L4 listings."""

from __future__ import annotations

import argparse
import csv
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_IN = ROOT / "payhip/presale/kahoot-payhip-listings-master.csv"
DEFAULT_OUT_CSV = ROOT / "payhip/presale/kahoot-payhip-merchant-copy-pack.csv"
DEFAULT_OUT_MD = ROOT / "payhip/presale/kahoot-payhip-merchant-copy-pack.md"

OUT_COLUMNS = [
    "sku",
    "level",
    "board",
    "board_label",
    "tier_scope",
    "listing_title",
    "subtitle_en",
    "subtitle_zh",
    "short_description_en",
    "short_description_zh",
    "description_markdown_en",
    "description_markdown_zh",
    "seo_title_en",
    "seo_description_en",
    "cta_label_en",
    "cta_label_zh",
    "price_early_bird",
    "price_regular",
    "early_bird_end_date",
    "release_date",
    "early_bird_end_date_long_en",
    "release_date_long_en",
    "payhip_url_seed",
    "kahoot_url",
    "worksheet_url",
    "section_bundle_url",
    "unit_bundle_url",
    "deliver_now",
    "deliver_on_release",
    "bonus",
    "tags",
    "slug_candidate",
]

LEVEL_META = {
    "L1": {
        "subtitle_en": "Early-Bird Presale | SubTopic MVP",
        "subtitle_zh": "早鸟预售 | 小专题 MVP",
        "cta_label_en": "Get SubTopic Early-Bird Access",
        "cta_label_zh": "立即锁定小专题早鸟价",
    },
    "L2": {
        "subtitle_en": "Early-Bird Presale | Section Bundle",
        "subtitle_zh": "早鸟预售 | 章节合集",
        "cta_label_en": "Get Section Early-Bird Access",
        "cta_label_zh": "立即锁定章节早鸟价",
    },
    "L3": {
        "subtitle_en": "Early-Bird Presale | Unit Bundle",
        "subtitle_zh": "早鸟预售 | 单元合集",
        "cta_label_en": "Get Unit Early-Bird Access",
        "cta_label_zh": "立即锁定单元早鸟价",
    },
    "L4": {
        "subtitle_en": "Early-Bird Presale | All-Units Mega Bundle",
        "subtitle_zh": "早鸟预售 | 全科总合集",
        "cta_label_en": "Get All-Units Early-Bird Access",
        "cta_label_zh": "立即锁定全科早鸟价",
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate unified Payhip merchant copy pack.")
    parser.add_argument("--input", default=str(DEFAULT_IN), help="Input master listings CSV")
    parser.add_argument("--out-csv", default=str(DEFAULT_OUT_CSV), help="Output CSV path")
    parser.add_argument("--out-md", default=str(DEFAULT_OUT_MD), help="Output markdown guide path")
    return parser.parse_args()


def load_rows(path: Path) -> List[dict]:
    with path.open("r", encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def title_case(text: str) -> str:
    words = (text or "").replace("_", " ").replace("-", " ").split()
    return " ".join(w.capitalize() for w in words)


def date_long_en(value: str) -> str:
    try:
        return datetime.strptime(value, "%Y-%m-%d").strftime("%B %d, %Y").replace(" 0", " ")
    except ValueError:
        return value


def level_subtitle(level: str, tier_scope: str) -> Tuple[str, str]:
    meta = LEVEL_META.get(level, LEVEL_META["L1"])
    en = f"{meta['subtitle_en']} | {tier_scope}" if tier_scope else meta["subtitle_en"]
    zh = f"{meta['subtitle_zh']} | {tier_scope}" if tier_scope else meta["subtitle_zh"]
    return en, zh


def build_l1_copy(row: dict, eb_long: str, release_long: str) -> Tuple[str, str, str, str]:
    board = row.get("board_label", "")
    subtopic_code = row.get("subtopic_code", "")
    subtopic_title = title_case(row.get("subtopic_title", ""))
    tier = row.get("tier_scope", "")
    unit = row.get("unit_title", "")
    section = row.get("section_title", "")
    kahoot_url = row.get("kahoot_url", "")
    sec_url = row.get("section_bundle_url", "")
    unit_url = row.get("unit_bundle_url", "")
    bonus = row.get("bonus", "")

    short_en = (
        f"Early-bird presale for {board} {subtopic_code} {subtopic_title} ({tier}). "
        f"Worksheet + answers + Kahoot companion delivered on release."
    )
    short_zh = (
        f"{board} {subtopic_code} {subtopic_title}（{tier}）早鸟预售。"
        f"正式上线后交付 Worksheet、答案与 Kahoot 配套。"
    )

    full_en = (
        f"This listing is the early-bird presale for **{board} {subtopic_code} {subtopic_title}** "
        f"in **{unit} / {section}**.\n\n"
        f"### What you receive now\n"
        f"- Presale entitlement confirmation\n"
        f"- Early-bird price lock\n"
        f"- Release update notification\n\n"
        f"### What you receive on release ({release_long})\n"
        f"- SubTopic worksheet PDF\n"
        f"- Answer key / worked support\n"
        f"- Kahoot companion alignment\n\n"
        f"### Kahoot link\n"
        f"- {kahoot_url}\n\n"
        f"### Upgrade path\n"
        f"- L1 (this listing) -> L2 section bundle -> L3 unit bundle\n"
        f"- Section bundle: {sec_url}\n"
        f"- Unit bundle: {unit_url}\n\n"
        f"### Important dates\n"
        f"- Early-bird ends: **{eb_long}**\n"
        f"- Release date: **{release_long}**\n\n"
        f"### Bonus\n"
        f"- {bonus}"
    )

    full_zh = (
        f"这是 **{board} {subtopic_code} {subtopic_title}**（{unit} / {section}）的小专题早鸟预售。\n\n"
        f"### 现在下单可获得\n"
        f"- 预售购买资格确认\n"
        f"- 早鸟价格锁定\n"
        f"- 上线提醒通知\n\n"
        f"### 正式上线后交付（{release_long}）\n"
        f"- 小专题 Worksheet PDF\n"
        f"- 答案与讲解支持\n"
        f"- Kahoot 配套与复习衔接\n\n"
        f"### Kahoot 链接\n"
        f"- {kahoot_url}\n\n"
        f"### 升级路径\n"
        f"- L1（当前）-> L2（章节合集）-> L3（单元合集）\n"
        f"- L2 链接：{sec_url}\n"
        f"- L3 链接：{unit_url}\n\n"
        f"### 关键时间\n"
        f"- 早鸟截止：**{eb_long}**\n"
        f"- 正式上线：**{release_long}**\n\n"
        f"### 赠送与复购\n"
        f"- {bonus}"
    )

    return short_en, short_zh, full_en, full_zh


def build_l2_copy(row: dict, eb_long: str, release_long: str) -> Tuple[str, str, str, str]:
    board = row.get("board_label", "")
    section_code = row.get("section_code", "")
    section_title = row.get("section_title", "")
    unit = row.get("unit_title", "")
    tier = row.get("tier_scope", "")
    count = row.get("subtopic_count", "")
    unit_url = row.get("unit_bundle_url", "")
    bonus = row.get("bonus", "")

    short_en = (
        f"Early-bird presale for {board} {section_code} {section_title}. "
        f"Approx. {count} subtopics with section-level worksheet support."
    )
    short_zh = (
        f"{board} {section_code} {section_title} 章节合集早鸟预售。"
        f"覆盖约 {count} 个小专题，按章节系统复习。"
    )

    full_en = (
        f"This listing is the early-bird presale for **{board} {section_code} {section_title}** "
        f"({tier}) in **{unit}**.\n\n"
        f"### Section scope\n"
        f"- Approx. **{count} SubTopics**\n"
        f"- Section-level worksheet and answer support\n"
        f"- Kahoot-oriented revision sequence\n\n"
        f"### What you receive now\n"
        f"- Presale entitlement confirmation\n"
        f"- Early-bird price lock\n"
        f"- Section release updates\n\n"
        f"### What you receive on release ({release_long})\n"
        f"- Section worksheet pack\n"
        f"- Answer and worked support\n"
        f"- Section Kahoot alignment\n\n"
        f"### Upgrade path\n"
        f"- Upgrade to L3 unit bundle: {unit_url}\n\n"
        f"### Important dates\n"
        f"- Early-bird ends: **{eb_long}**\n"
        f"- Release date: **{release_long}**\n\n"
        f"### Bonus\n"
        f"- {bonus}"
    )

    full_zh = (
        f"这是 **{board} {section_code} {section_title}**（{tier}）章节合集早鸟预售，所属单元：**{unit}**。\n\n"
        f"### 章节覆盖范围\n"
        f"- 约 **{count} 个小专题**\n"
        f"- 章节级 Worksheet 与答案支持\n"
        f"- 与 Kahoot 复习流程衔接\n\n"
        f"### 现在下单可获得\n"
        f"- 预售购买资格确认\n"
        f"- 早鸟价格锁定\n"
        f"- 章节上线提醒\n\n"
        f"### 正式上线后交付（{release_long}）\n"
        f"- 章节 Worksheet 合集\n"
        f"- 答案与讲解支持\n"
        f"- 章节 Kahoot 配套\n\n"
        f"### 升级路径\n"
        f"- 可升级 L3 单元合集：{unit_url}\n\n"
        f"### 关键时间\n"
        f"- 早鸟截止：**{eb_long}**\n"
        f"- 正式上线：**{release_long}**\n\n"
        f"### 赠送与复购\n"
        f"- {bonus}"
    )

    return short_en, short_zh, full_en, full_zh


def build_l3_copy(row: dict, eb_long: str, release_long: str) -> Tuple[str, str, str, str]:
    board = row.get("board_label", "")
    unit_code = row.get("unit_code", "")
    unit_title = row.get("unit_title", "")
    tier = row.get("tier_scope", "")
    section_count = row.get("section_count", "")
    subtopic_count = row.get("subtopic_count", "")
    bonus = row.get("bonus", "")

    short_en = (
        f"Early-bird presale for {board} {unit_code} {unit_title}. "
        f"{section_count} sections / {subtopic_count} subtopics with full unit support."
    )
    short_zh = (
        f"{board} {unit_code} {unit_title} 单元合集早鸟预售。"
        f"覆盖 {section_count} 个章节、{subtopic_count} 个小专题。"
    )

    full_en = (
        f"This listing is the early-bird presale for **{board} {unit_code} {unit_title}** ({tier}).\n\n"
        f"### Unit scope\n"
        f"- **{section_count} sections**\n"
        f"- **{subtopic_count} SubTopics**\n"
        f"- Unit-level Kahoot + worksheet progression\n\n"
        f"### What you receive now\n"
        f"- Presale entitlement confirmation\n"
        f"- Early-bird price lock\n"
        f"- Unit release updates\n\n"
        f"### What you receive on release ({release_long})\n"
        f"- Full unit worksheet pack\n"
        f"- Answers and worked support\n"
        f"- Unit-level exam extension roadmap\n\n"
        f"### Important dates\n"
        f"- Early-bird ends: **{eb_long}**\n"
        f"- Release date: **{release_long}**\n\n"
        f"### Bonus\n"
        f"- {bonus}"
    )

    full_zh = (
        f"这是 **{board} {unit_code} {unit_title}**（{tier}）单元合集早鸟预售。\n\n"
        f"### 单元覆盖范围\n"
        f"- **{section_count} 个章节**\n"
        f"- **{subtopic_count} 个小专题**\n"
        f"- 单元级 Kahoot + Worksheet 复习闭环\n\n"
        f"### 现在下单可获得\n"
        f"- 预售购买资格确认\n"
        f"- 早鸟价格锁定\n"
        f"- 单元上线提醒\n\n"
        f"### 正式上线后交付（{release_long}）\n"
        f"- 单元 Worksheet 完整包\n"
        f"- 答案与讲解支持\n"
        f"- 单元级真题拓展路线\n\n"
        f"### 关键时间\n"
        f"- 早鸟截止：**{eb_long}**\n"
        f"- 正式上线：**{release_long}**\n\n"
        f"### 赠送与复购\n"
        f"- {bonus}"
    )

    return short_en, short_zh, full_en, full_zh


def build_l4_copy(row: dict, eb_long: str, release_long: str) -> Tuple[str, str, str, str]:
    board = row.get("board_label", "")
    unit_count = row.get("unit_count", "")
    section_count = row.get("section_count", "")
    subtopic_count = row.get("subtopic_count", "")
    bonus = row.get("bonus", "")

    short_en = (
        f"Early-bird presale for the full {board} all-units bundle: "
        f"{unit_count} units, {section_count} sections, {subtopic_count} subtopics."
    )
    short_zh = (
        f"{board} 全科总合集早鸟预售：{unit_count} 个单元、{section_count} 个章节、"
        f"{subtopic_count} 个小专题一站式打包。"
    )

    full_en = (
        f"This listing is the early-bird presale for the **{board} All-Units Mega Bundle**.\n\n"
        f"### Full board scope\n"
        f"- **{unit_count} units**\n"
        f"- **{section_count} sections**\n"
        f"- **{subtopic_count} SubTopics**\n\n"
        f"### What you receive now\n"
        f"- Presale entitlement for full-board package\n"
        f"- Early-bird price lock\n"
        f"- Board-level rollout updates\n\n"
        f"### What you receive on release ({release_long})\n"
        f"- All listed unit bundles\n"
        f"- Cross-unit worksheet and answer structure\n"
        f"- Kahoot-aligned roadmap across the board\n\n"
        f"### Important dates\n"
        f"- Early-bird ends: **{eb_long}**\n"
        f"- Release date: **{release_long}**\n\n"
        f"### Bonus\n"
        f"- {bonus}"
    )

    full_zh = (
        f"这是 **{board} 全科总合集** 的早鸟预售。\n\n"
        f"### 全科覆盖范围\n"
        f"- **{unit_count} 个单元**\n"
        f"- **{section_count} 个章节**\n"
        f"- **{subtopic_count} 个小专题**\n\n"
        f"### 现在下单可获得\n"
        f"- 全科预售购买资格确认\n"
        f"- 早鸟价格锁定\n"
        f"- 全科上线节奏通知\n\n"
        f"### 正式上线后交付（{release_long}）\n"
        f"- 该考纲全部单元合集\n"
        f"- 跨单元 Worksheet 与答案体系\n"
        f"- 全科 Kahoot 复习路线图\n\n"
        f"### 关键时间\n"
        f"- 早鸟截止：**{eb_long}**\n"
        f"- 正式上线：**{release_long}**\n\n"
        f"### 赠送与复购\n"
        f"- {bonus}"
    )

    return short_en, short_zh, full_en, full_zh


def build_copy(row: dict) -> Tuple[str, str, str, str]:
    level = (row.get("level", "") or "").upper()
    eb_long = date_long_en(row.get("early_bird_end_date", ""))
    release_long = date_long_en(row.get("release_date", ""))
    if level == "L1":
        return build_l1_copy(row, eb_long, release_long)
    if level == "L2":
        return build_l2_copy(row, eb_long, release_long)
    if level == "L3":
        return build_l3_copy(row, eb_long, release_long)
    return build_l4_copy(row, eb_long, release_long)


def to_output_row(row: dict) -> dict:
    level = (row.get("level", "") or "").upper()
    tier_scope = row.get("tier_scope", "")
    subtitle_en, subtitle_zh = level_subtitle(level, tier_scope)
    short_en, short_zh, full_en, full_zh = build_copy(row)
    meta = LEVEL_META.get(level, LEVEL_META["L1"])
    eb_long = date_long_en(row.get("early_bird_end_date", ""))
    release_long = date_long_en(row.get("release_date", ""))

    return {
        "sku": row.get("sku", ""),
        "level": level,
        "board": row.get("board", ""),
        "board_label": row.get("board_label", ""),
        "tier_scope": tier_scope,
        "listing_title": row.get("listing_title", ""),
        "subtitle_en": subtitle_en,
        "subtitle_zh": subtitle_zh,
        "short_description_en": short_en,
        "short_description_zh": short_zh,
        "description_markdown_en": full_en,
        "description_markdown_zh": full_zh,
        "seo_title_en": f"{row.get('listing_title', '')} | Early-Bird Presale",
        "seo_description_en": short_en,
        "cta_label_en": meta["cta_label_en"],
        "cta_label_zh": meta["cta_label_zh"],
        "price_early_bird": row.get("price_early_bird", ""),
        "price_regular": row.get("price_regular", ""),
        "early_bird_end_date": row.get("early_bird_end_date", ""),
        "release_date": row.get("release_date", ""),
        "early_bird_end_date_long_en": eb_long,
        "release_date_long_en": release_long,
        "payhip_url_seed": row.get("payhip_url", ""),
        "kahoot_url": row.get("kahoot_url", ""),
        "worksheet_url": row.get("worksheet_url", ""),
        "section_bundle_url": row.get("section_bundle_url", ""),
        "unit_bundle_url": row.get("unit_bundle_url", ""),
        "deliver_now": row.get("deliver_now", ""),
        "deliver_on_release": row.get("deliver_on_release", ""),
        "bonus": row.get("bonus", ""),
        "tags": row.get("tags", ""),
        "slug_candidate": row.get("slug_candidate", ""),
    }


def write_csv(path: Path, rows: List[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=OUT_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def write_markdown(path: Path, rows: List[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    counts: Dict[str, int] = {}
    for row in rows:
        counts[row["level"]] = counts.get(row["level"], 0) + 1

    samples: Dict[str, dict] = {}
    for row in rows:
        if row["level"] not in samples:
            samples[row["level"]] = row

    lines: List[str] = []
    lines.append("# Payhip Merchant Copy Pack (All Levels)")
    lines.append("")
    lines.append("This file summarizes the unified copy output for all Payhip listings.")
    lines.append("")
    lines.append("## SKU Counts")
    lines.append("")
    for level in ("L1", "L2", "L3", "L4"):
        lines.append(f"- {level}: {counts.get(level, 0)}")
    lines.append(f"- Total: {len(rows)}")
    lines.append("")
    lines.append("## Fields Included")
    lines.append("")
    lines.append("- Title / subtitle (EN + ZH)")
    lines.append("- Short description (EN + ZH)")
    lines.append("- Full markdown description (EN + ZH)")
    lines.append("- SEO title + SEO description")
    lines.append("- CTA labels (EN + ZH)")
    lines.append("- Pricing, dates, and links")
    lines.append("")
    lines.append("## One Sample Per Level")
    lines.append("")

    for level in ("L1", "L2", "L3", "L4"):
        row = samples.get(level)
        if not row:
            continue
        lines.append(f"### {level} - {row['sku']}")
        lines.append("")
        lines.append(f"- Listing title: `{row['listing_title']}`")
        lines.append(f"- Subtitle EN: `{row['subtitle_en']}`")
        lines.append(f"- Subtitle ZH: `{row['subtitle_zh']}`")
        lines.append(f"- Price: `{row['price_early_bird']} / {row['price_regular']}`")
        lines.append(f"- Dates: `{row['early_bird_end_date']} -> {row['release_date']}`")
        lines.append(f"- CTA EN: `{row['cta_label_en']}`")
        lines.append(f"- CTA ZH: `{row['cta_label_zh']}`")
        lines.append("")

    lines.append("## Usage")
    lines.append("")
    lines.append("1. Use CSV as master copy source for Payhip product setup.")
    lines.append("2. Paste EN or ZH blocks based on product language.")
    lines.append("3. Keep absolute dates unchanged to avoid presale ambiguity.")
    lines.append("")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    args = parse_args()
    in_path = Path(args.input)
    out_csv = Path(args.out_csv)
    out_md = Path(args.out_md)

    rows = load_rows(in_path)
    if not rows:
        print(f"No rows found in {in_path}")
        return 1

    ordered = sorted(
        rows,
        key=lambda r: (
            r.get("level", ""),
            r.get("board", ""),
            r.get("section_code", ""),
            r.get("subtopic_code", ""),
            r.get("sku", ""),
        ),
    )
    out_rows = [to_output_row(row) for row in ordered]

    write_csv(out_csv, out_rows)
    write_markdown(out_md, out_rows)

    print("== Payhip Merchant Copy Pack ==")
    print(f"Input rows: {len(rows)}")
    print(f"Output CSV: {out_csv}")
    print(f"Output MD: {out_md}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
