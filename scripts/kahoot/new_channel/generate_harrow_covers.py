#!/usr/bin/env python3
"""Generate Kahoot topic covers for the Harrow-sequenced channels.

Each tier folder (foundation/standard/challenge) under
projects/kahoot-channel/harrow-y*-2025/micro-topics/<unit>/<topic>/<tier>/
gets a cover-2320x1520-kahoot-minimal.{svg,png,webp}, matching the visual
style already used by cie0580 / edexcel-4ma1.

Design constraint: the word "Harrow" must NOT appear on the cover. Only
neutral fields are used (grade group, unit heading, LO id, difficulty). The
"Harrow" naming is an internal syllabus-ordering label, not branding.

Rasterisation uses ImageMagick (`magick`) for svg->png and `cwebp` for
png->webp, both already used elsewhere in this repo.
"""
from __future__ import annotations
import argparse
import html
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CHANNELS_GLOB = "harrow-y*-2025"
COVER_STEM = "cover-2320x1520-kahoot-minimal"
TIERS = ("foundation", "standard", "challenge")

# ---- SVG template pieces (mirrors the existing minimal cover) -------------

def esc(s: str) -> str:
    return html.escape(s, quote=False)

def wrap_title(title: str):
    """Return (font_size, [lines], y_positions) fitting the card width."""
    words = title.split()
    # Try big font (2 lines, ~18 chars/line)
    def greedy(maxchars):
        lines, cur = [], ""
        for w in words:
            trial = (cur + " " + w).strip()
            if len(trial) <= maxchars:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines

    big = greedy(18)
    if len(big) <= 2:
        if len(big) == 1:
            return 49, big, [206]
        return 49, big, [188, 239]
    mid = greedy(26)
    if len(mid) <= 3:
        return 31, mid, [166, 202, 238]
    # very long: 4 lines, smaller, hard cap
    small = greedy(32)[:4]
    return 25, small, [156, 186, 216, 246]

def build_svg(grade: str, code: str, title: str, tier_label: str) -> str:
    grade_badge = esc(grade.upper())
    tier_badge = esc(f"{tier_label.upper()} TIER")
    code_e = esc(code)
    font, lines, ys = wrap_title(title)
    title_svg = "\n".join(
        f'  <text x="44" y="{y}" font-family="Avenir Next, Inter, Arial, sans-serif" '
        f'font-size="{font}" font-weight="800" fill="#1A5550">{esc(ln)}</text>'
        for ln, y in zip(lines, ys)
    )
    return f'''<svg width="2320" height="1520" viewBox="0 0 580 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{code_e} Kahoot cover" text-rendering="geometricPrecision" shape-rendering="geometricPrecision">
  <rect width="580" height="380" fill="#F8FCFB"/>

  <rect x="0" y="0" width="580" height="56" fill="#E4F2EF"/>
  <rect x="20" y="14" width="152" height="28" rx="14" fill="#B2DDD6"/>
  <text x="96" y="33" text-anchor="middle" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="13" font-weight="800" fill="#164E4A">TOPIC PRACTICE</text>

  <rect x="194" y="14" width="140" height="28" rx="14" fill="#C8E8E2"/>
  <text x="264" y="33" text-anchor="middle" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="13" font-weight="800" fill="#1D5D58">{grade_badge}</text>

  <rect x="394" y="14" width="172" height="28" rx="14" fill="#DEF0EC"/>
  <text x="480" y="33" text-anchor="middle" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="13" font-weight="800" fill="#245B57">{tier_badge}</text>

  <rect x="20" y="76" width="540" height="234" rx="20" fill="#FFFDF9"/>
  <rect x="20" y="76" width="8" height="234" fill="#77BDAF"/>

  <text x="44" y="134" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="21" font-weight="700" fill="#2F6D67">{code_e}</text>
{title_svg}
  <rect x="44" y="278" width="212" height="6" rx="3" fill="#77BDAF"/>

  <text x="44" y="304" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="#2F6D67">Maths Objective Practice</text>

  <rect x="0" y="332" width="580" height="48" fill="#2F7D74"/>
  <text x="20" y="361" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF">25Maths Kahoot Companion</text>
  <text x="560" y="361" text-anchor="end" font-family="Avenir Next, Inter, Arial, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">Objective Practice • Revision • Self Study</text>
</svg>
'''

# ---- rendering -------------------------------------------------------------

def render_png(svg_path: Path, png_path: Path):
    subprocess.run(
        ["magick", "-background", "none", "-density", "96", str(svg_path),
         "-resize", "2320x1520", str(png_path)],
        check=True, capture_output=True,
    )

def render_webp(png_path: Path, webp_path: Path, quality: int = 78):
    subprocess.run(
        ["cwebp", "-quiet", "-q", str(quality), str(png_path), "-o", str(webp_path)],
        check=True, capture_output=True,
    )

# ---- metadata --------------------------------------------------------------

def load_meta(tier_dir: Path):
    """Return (grade, code, title, tier_label) from topic-spec.json, with
    a fallback to the question-set H1. Never reads Harrow-branded fields."""
    spec = tier_dir / "topic-spec.json"
    if spec.exists():
        d = json.loads(spec.read_text(encoding="utf-8"))
        grade = d.get("grade_group", "").strip()
        lo = d.get("learning_objective", {})
        code = (lo.get("lo_id") or "").strip()
        title = (lo.get("source_heading") or "").strip()
        tier = (d.get("difficulty", {}).get("label") or tier_dir.name).strip()
        if grade and code and title:
            return grade, code, title, tier
    # fallback: parse "# Year 9 | Y9-TRI-004 | Title | Foundation"
    qs = tier_dir / "kahoot-question-set.md"
    if qs.exists():
        first = qs.read_text(encoding="utf-8").splitlines()[0].lstrip("# ").strip()
        parts = [p.strip() for p in first.split("|")]
        if len(parts) >= 4:
            return parts[0], parts[1], parts[2], parts[3]
    return None

def iter_tier_dirs(channels):
    for ch in channels:
        mt = ch / "micro-topics"
        if not mt.exists():
            continue
        for tier_dir in sorted(mt.glob("*/*/*")):
            if tier_dir.name in TIERS and tier_dir.is_dir() \
               and (tier_dir / "kahoot-question-set.md").exists():
                yield tier_dir

# ---- main ------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="only first N (sample)")
    ap.add_argument("--force", action="store_true", help="overwrite existing")
    ap.add_argument("--svg-only", action="store_true", help="skip png/webp")
    ap.add_argument("--out-dir", type=Path, default=None,
                    help="write sample covers here instead of the repo tree")
    args = ap.parse_args()

    channels = sorted((ROOT / "projects/kahoot-channel").glob(CHANNELS_GLOB))
    made = skipped = failed = 0
    tier_dirs = list(iter_tier_dirs(channels))
    if args.limit:
        tier_dirs = tier_dirs[: args.limit]
    print(f"Channels: {[c.name for c in channels]}")
    print(f"Tier folders to process: {len(tier_dirs)}")

    for tier_dir in tier_dirs:
        meta = load_meta(tier_dir)
        if not meta:
            print(f"  ! no metadata: {tier_dir}")
            failed += 1
            continue
        grade, code, title, tier = meta
        dest = args.out_dir if args.out_dir else tier_dir
        dest.mkdir(parents=True, exist_ok=True)
        base = f"{COVER_STEM}" if not args.out_dir else f"{code}-{tier}".lower()
        svg_path = dest / f"{base}.svg"
        png_path = dest / f"{base}.png"
        webp_path = dest / f"{base}.webp"
        if svg_path.exists() and not args.force:
            skipped += 1
            continue
        try:
            svg_path.write_text(build_svg(grade, code, title, tier), encoding="utf-8")
            if not args.svg_only:
                render_png(svg_path, png_path)
                render_webp(png_path, webp_path)
            made += 1
        except subprocess.CalledProcessError as e:
            print(f"  ! render failed {code}: {e.stderr.decode()[:200]}")
            failed += 1

    print(f"\nDone. made={made} skipped={skipped} failed={failed}")

if __name__ == "__main__":
    sys.exit(main())
