#!/usr/bin/env python3
"""Build, archive, diff, release-tag, and clean Mastery Series immutable PDF artifacts."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Set, Tuple

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PACK_ROOT = ROOT / "payhip/presale/mastery-series/quadratics-mastery-pack"
DEFAULT_ARTIFACT_ROOT = ROOT / "payhip/presale/mastery-series/_artifacts"
GENERATED_EXTS = {".aux", ".log", ".out", ".pdf", ".toc", ".fdb_latexmk", ".fls"}
INDEX_FIELDS = [
    "timestamp_utc",
    "build_ref",
    "content_version",
    "build_version",
    "git_commit",
    "git_dirty",
    "channel",
    "compare_baseline_ref",
    "compare_diff_path",
    "compare_semantically_equal",
    "engine",
    "runs",
    "module",
    "tex_file",
    "pdf_path",
    "pdf_sha256",
    "pdf_pages",
    "pdf_size_bytes",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build/archive/diff Mastery Series module PDFs")
    sub = parser.add_subparsers(dest="command", required=True)

    build = sub.add_parser("build", help="Compile one module .tex and archive immutable artifact")
    build.add_argument("--pack-root", default=str(DEFAULT_PACK_ROOT), help="Pack root path")
    build.add_argument("--artifact-root", default=str(DEFAULT_ARTIFACT_ROOT), help="Artifact root path")
    build.add_argument("--module", required=True, help="Module directory name (for example: 01-structured-workbook)")
    build.add_argument("--tex-file", help="Optional .tex file path (absolute or relative to module dir)")
    build.add_argument("--content-version", required=True, help="Manual content version (for example: 1.0.0)")
    build.add_argument("--build-version", help="Optional build version override")
    build.add_argument("--engine", default="pdflatex", help="LaTeX engine (default: pdflatex)")
    build.add_argument("--runs", type=int, default=2, help="Compile runs (default: 2)")
    build.add_argument(
        "--channel",
        choices=["draft", "release"],
        default="draft",
        help="Build lifecycle channel (default: draft)",
    )
    build.add_argument(
        "--baseline-ref",
        help="Optional comparison baseline build ref (<content_version>/<build_version>)",
    )
    build.add_argument(
        "--no-auto-diff",
        action="store_true",
        help="Disable automatic diff generation against baseline/latest prior build",
    )
    build.add_argument(
        "--skip-visual-diff",
        action="store_true",
        help="Skip visual page-level diff for auto-generated compare outputs",
    )
    build.add_argument(
        "--max-visual-pages",
        type=int,
        default=40,
        help="Max pages for visual diff (default: 40)",
    )
    build.add_argument("--force", action="store_true", help="Allow overwriting existing artifact dir")

    diff = sub.add_parser("diff", help="Compare two archived builds for one module")
    diff.add_argument("--artifact-root", default=str(DEFAULT_ARTIFACT_ROOT), help="Artifact root path")
    diff.add_argument("--pack-name", default=DEFAULT_PACK_ROOT.name, help="Pack name under artifact root")
    diff.add_argument("--module", required=True, help="Module directory name")
    diff.add_argument("--from-ref", required=True, help="From build ref: <content_version>/<build_version>")
    diff.add_argument("--to-ref", required=True, help="To build ref: <content_version>/<build_version>")
    diff.add_argument("--out-dir", help="Optional output diff directory")
    diff.add_argument("--skip-visual", action="store_true", help="Skip visual page-level image diff")
    diff.add_argument("--max-visual-pages", type=int, default=40, help="Max pages for visual diff (default: 40)")

    listing = sub.add_parser("list", help="List archived builds for one module")
    listing.add_argument("--artifact-root", default=str(DEFAULT_ARTIFACT_ROOT), help="Artifact root path")
    listing.add_argument("--pack-name", default=DEFAULT_PACK_ROOT.name, help="Pack name under artifact root")
    listing.add_argument("--module", required=True, help="Module directory name")
    listing.add_argument("--limit", type=int, default=20, help="Show latest N rows (default: 20)")

    release = sub.add_parser("mark-release", help="Mark one build as release (immutable retained)")
    release.add_argument("--artifact-root", default=str(DEFAULT_ARTIFACT_ROOT), help="Artifact root path")
    release.add_argument("--pack-name", default=DEFAULT_PACK_ROOT.name, help="Pack name under artifact root")
    release.add_argument("--module", required=True, help="Module directory name")
    release.add_argument("--build-ref", required=True, help="Target build ref: <content_version>/<build_version>")

    cleanup = sub.add_parser("cleanup", help="Delete old draft builds while keeping release builds forever")
    cleanup.add_argument("--artifact-root", default=str(DEFAULT_ARTIFACT_ROOT), help="Artifact root path")
    cleanup.add_argument("--pack-name", default=DEFAULT_PACK_ROOT.name, help="Pack name under artifact root")
    cleanup.add_argument("--module", required=True, help="Module directory name")
    cleanup.add_argument("--keep-drafts", type=int, default=5, help="Keep latest N draft builds (default: 5)")
    cleanup.add_argument("--dry-run", action="store_true", help="Show cleanup plan without deleting")

    return parser.parse_args()


def run_cmd(cmd: Sequence[str], cwd: Optional[Path] = None, check: bool = True) -> subprocess.CompletedProcess:
    proc = subprocess.run(
        list(cmd),
        cwd=str(cwd) if cwd else None,
        text=True,
        capture_output=True,
    )
    if check and proc.returncode != 0:
        raise RuntimeError(
            f"Command failed ({proc.returncode}): {' '.join(cmd)}\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}"
        )
    return proc


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        while True:
            chunk = fh.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def git_info() -> Tuple[str, bool]:
    commit = run_cmd(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT).stdout.strip()
    dirty = bool(run_cmd(["git", "status", "--porcelain"], cwd=ROOT).stdout.strip())
    return commit, dirty


def default_build_version(commit: str, dirty: bool) -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    dirty_suffix = "-dirty" if dirty else ""
    return f"{stamp}-g{commit}{dirty_suffix}"


def safe_rel(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT))
    except Exception:
        return str(path.resolve())


def resolve_module_dir(pack_root: Path, module: str) -> Path:
    direct = pack_root / module
    if direct.is_dir():
        return direct
    nested = pack_root / "modules" / module
    if nested.is_dir():
        return nested
    raise FileNotFoundError(f"Module directory not found: {module}")


def resolve_tex_file(module_dir: Path, tex_file: Optional[str]) -> Path:
    if tex_file:
        cand = Path(tex_file)
        if not cand.is_absolute():
            cand = (module_dir / tex_file).resolve()
        if not cand.exists():
            raise FileNotFoundError(f"TeX file not found: {cand}")
        return cand

    tex_files = sorted(module_dir.glob("*.tex"))
    if len(tex_files) == 1:
        return tex_files[0]
    if not tex_files:
        raise FileNotFoundError(f"No .tex file found in module dir: {module_dir}")
    names = ", ".join(p.name for p in tex_files)
    raise RuntimeError(f"Multiple .tex files found ({names}); use --tex-file")


def parse_local_references(path: Path) -> Set[Path]:
    refs: Set[Path] = set()
    if not path.exists() or path.suffix.lower() not in {".tex", ".sty"}:
        return refs

    text = path.read_text(encoding="utf-8", errors="ignore")
    pattern = re.compile(r"\\(input|include|usepackage)\{([^}]+)\}")

    for cmd, body in pattern.findall(text):
        for token in [t.strip() for t in body.split(",") if t.strip()]:
            # External package short names (e.g. amsmath) are ignored.
            if cmd == "usepackage" and "/" not in token and "." not in token:
                continue

            candidates: List[Path] = []
            raw = (path.parent / token).resolve()
            candidates.append(raw)
            if cmd in {"input", "include"}:
                candidates.append((path.parent / f"{token}.tex").resolve())
            if cmd == "usepackage":
                candidates.append((path.parent / f"{token}.sty").resolve())

            for c in candidates:
                if c.exists() and c.is_file():
                    refs.add(c)
                    break

    return refs


def collect_dependency_files(tex_path: Path, module_dir: Path) -> List[Path]:
    files: Set[Path] = set()

    # Include all source files in module directory for full provenance.
    for p in module_dir.rglob("*"):
        if p.is_file() and p.suffix.lower() not in GENERATED_EXTS:
            files.add(p.resolve())

    # Add referenced shared files (for example mastery-style.sty).
    queue: List[Path] = [tex_path.resolve()]
    seen: Set[Path] = set()
    while queue:
        cur = queue.pop(0)
        if cur in seen:
            continue
        seen.add(cur)
        files.add(cur)
        refs = parse_local_references(cur)
        for r in refs:
            if r not in seen:
                queue.append(r)

    return sorted(files)


def parse_pdf_pages(pdf_path: Path) -> Optional[int]:
    if shutil.which("pdfinfo") is None:
        return None
    proc = run_cmd(["pdfinfo", str(pdf_path)], check=False)
    if proc.returncode != 0:
        return None
    m = re.search(r"^Pages:\s+(\d+)", proc.stdout, re.MULTILINE)
    if not m:
        return None
    return int(m.group(1))


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def append_index(index_csv: Path, row: Dict[str, str]) -> None:
    rows = read_index_rows(index_csv)
    rows.append(row)
    write_index_rows(index_csv, rows)


def read_index_rows(index_csv: Path) -> List[Dict[str, str]]:
    if not index_csv.exists():
        return []
    with index_csv.open("r", encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        rows = list(reader)
    normalized: List[Dict[str, str]] = []
    for r in rows:
        merged = {k: r.get(k, "") for k in INDEX_FIELDS}
        # Legacy field migration: stage -> channel.
        if not merged["channel"] and r.get("stage"):
            merged["channel"] = r.get("stage", "")
        if not merged["channel"]:
            merged["channel"] = "release"
        normalized.append(merged)
    return normalized


def write_index_rows(index_csv: Path, rows: List[Dict[str, str]]) -> None:
    ensure_dir(index_csv.parent)
    with index_csv.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=INDEX_FIELDS)
        writer.writeheader()
        for r in rows:
            out = {k: r.get(k, "") for k in INDEX_FIELDS}
            writer.writerow(out)


def write_manifest(path: Path, data: Dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_utc_timestamp(value: str) -> Optional[datetime]:
    if not value:
        return None
    raw = value.strip()
    if raw.endswith("Z"):
        raw = raw[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def build_dir_from_ref(module_root: Path, ref: str) -> Path:
    content_version, build_version = parse_ref(ref)
    return module_root / content_version / build_version


def build_ref_from_dir(module_root: Path, build_dir: Path) -> Optional[str]:
    try:
        rel = build_dir.resolve().relative_to(module_root.resolve())
    except Exception:
        return None
    if len(rel.parts) != 2:
        return None
    return f"{rel.parts[0]}/{rel.parts[1]}"


def sanitize_ref_token(ref: str) -> str:
    # Keep directory names filesystem-safe and stable.
    return ref.replace("/", "__").replace(" ", "_")


def infer_latest_build_ref(index_rows: List[Dict[str, str]], module_root: Path) -> Optional[str]:
    candidates: List[Tuple[datetime, str]] = []
    for row in index_rows:
        ref = (row.get("build_ref") or "").strip()
        if not ref:
            continue
        if not build_dir_from_ref(module_root, ref).exists():
            continue
        ts = parse_utc_timestamp(row.get("timestamp_utc", "")) or datetime.fromtimestamp(0, tz=timezone.utc)
        candidates.append((ts, ref))

    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0][1]


def build_command(args: argparse.Namespace) -> int:
    pack_root = Path(args.pack_root).resolve()
    artifact_root = Path(args.artifact_root).resolve()
    module_dir = resolve_module_dir(pack_root, args.module)
    tex_path = resolve_tex_file(module_dir, args.tex_file)

    commit, dirty = git_info()
    build_version = args.build_version or default_build_version(commit, dirty)
    content_version = args.content_version.strip()
    if not content_version:
        raise RuntimeError("--content-version cannot be empty")

    pack_name = pack_root.name
    module_name = module_dir.name
    module_artifact_root = artifact_root / pack_name / module_name

    if not args.build_version:
        probe = module_artifact_root / content_version / build_version
        suffix = 0
        while probe.exists():
            suffix += 1
            build_version = f"{default_build_version(commit, dirty)}-{suffix:02d}"
            probe = module_artifact_root / content_version / build_version

    artifact_dir = module_artifact_root / content_version / build_version
    if artifact_dir.exists() and not args.force:
        raise RuntimeError(f"Artifact already exists: {artifact_dir} (use --force to overwrite)")

    ensure_dir(artifact_dir)

    index_csv = module_artifact_root / "index.csv"
    index_rows = read_index_rows(index_csv)

    compile_log_lines: List[str] = []
    compile_commands: List[List[str]] = []
    tex_name = tex_path.name
    tex_stem = tex_path.stem

    with tempfile.TemporaryDirectory(prefix="mastery-build-") as tmp:
        out_dir = Path(tmp).resolve()
        for i in range(max(1, args.runs)):
            cmd = [
                args.engine,
                "-interaction=nonstopmode",
                "-halt-on-error",
                f"-output-directory={out_dir}",
                tex_name,
            ]
            compile_commands.append(cmd)
            proc = run_cmd(cmd, cwd=tex_path.parent, check=False)
            compile_log_lines.append(f"$ {' '.join(cmd)}")
            compile_log_lines.append(proc.stdout)
            compile_log_lines.append(proc.stderr)
            if proc.returncode != 0:
                (artifact_dir / "build.log").write_text("\n".join(compile_log_lines), encoding="utf-8")
                raise RuntimeError(
                    f"Compilation failed on run {i+1}. See build log: {artifact_dir / 'build.log'}"
                )

        built_pdf = out_dir / f"{tex_stem}.pdf"
        if not built_pdf.exists():
            (artifact_dir / "build.log").write_text("\n".join(compile_log_lines), encoding="utf-8")
            raise RuntimeError(f"Expected PDF not produced: {built_pdf}")

        artifact_pdf = artifact_dir / f"{module_name}.pdf"
        shutil.copy2(built_pdf, artifact_pdf)

    (artifact_dir / "build.log").write_text("\n".join(compile_log_lines), encoding="utf-8")

    pdf_hash = sha256_file(artifact_pdf)
    pdf_pages = parse_pdf_pages(artifact_pdf)
    pdf_size = artifact_pdf.stat().st_size

    sources = collect_dependency_files(tex_path, module_dir)
    source_lines: List[str] = []
    source_manifest: List[Dict[str, str]] = []
    for src in sources:
        h = sha256_file(src)
        rel = safe_rel(src)
        source_lines.append(f"{h}  {rel}")
        source_manifest.append(
            {
                "path": rel,
                "sha256": h,
                "bytes": str(src.stat().st_size),
            }
        )

    (artifact_dir / "source-files.txt").write_text("\n".join(source_lines) + "\n", encoding="utf-8")
    (artifact_dir / "sha256.txt").write_text(f"{pdf_hash}  {module_name}.pdf\n", encoding="utf-8")

    module_root = artifact_root / pack_name / module_name
    build_ref = f"{content_version}/{build_version}"
    baseline_ref = (args.baseline_ref or "").strip() or infer_latest_build_ref(index_rows, module_root)
    if baseline_ref == build_ref:
        baseline_ref = ""
    if baseline_ref and not build_dir_from_ref(module_root, baseline_ref).exists():
        if args.baseline_ref:
            raise RuntimeError(f"Baseline build not found: {baseline_ref}")
        baseline_ref = ""

    compare_diff_rel = ""
    compare_sem_equal = ""
    compare_summary: Dict[str, object] = {}
    auto_diff_error = ""
    should_auto_diff = (not args.no_auto_diff) and bool(baseline_ref)

    built_at = utc_now()
    manifest = {
        "pack": pack_name,
        "module": module_name,
        "pack_name": pack_name,
        "module_name": module_name,
        "content_version": content_version,
        "build_version": build_version,
        "build_ref": build_ref,
        "built_at": built_at,
        "built_at_utc": built_at,
        "git_commit": commit,
        "git_dirty": dirty,
        "release_channel": args.channel,
        "tex_engine": args.engine,
        "tex_commands": compile_commands,
        "tex_primary_command": compile_commands[0] if compile_commands else [],
        "compare_baseline_ref": baseline_ref,
        "compare_diff_path": compare_diff_rel,
        "compare_semantically_equal": compare_sem_equal,
        "compare_error": auto_diff_error,
        "engine": args.engine,
        "runs": max(1, args.runs),
        "source_tex": safe_rel(tex_path),
        "artifact_dir": safe_rel(artifact_dir),
        "output_pdf": {
            "path": safe_rel(artifact_pdf),
            "sha256": pdf_hash,
            "pages": pdf_pages,
            "size_bytes": pdf_size,
        },
        "pdf": {
            "path": safe_rel(artifact_pdf),
            "sha256": pdf_hash,
            "pages": pdf_pages,
            "size_bytes": pdf_size,
        },
        "input_sources": source_manifest,
        "source_files": source_manifest,
    }
    write_manifest(artifact_dir / "manifest.json", manifest)

    if should_auto_diff and baseline_ref:
        try:
            diff_result = run_diff(
                artifact_root=artifact_root,
                pack_name=pack_name,
                module=module_name,
                from_ref=baseline_ref,
                to_ref=build_ref,
                out_dir=None,
                skip_visual=args.skip_visual_diff,
                max_visual_pages=args.max_visual_pages,
            )
            compare_diff_rel = safe_rel(diff_result["out_dir"])
            compare_sem_equal = str(bool(diff_result["summary"].get("semantically_equal", False))).lower()
            compare_summary = {
                "from_ref": baseline_ref,
                "path": compare_diff_rel,
                "semantically_equal": diff_result["summary"].get("semantically_equal", False),
            }
            manifest["compare_diff_path"] = compare_diff_rel
            manifest["compare_semantically_equal"] = compare_sem_equal
            manifest["compare_error"] = ""
            manifest["compare_result"] = compare_summary
            write_manifest(artifact_dir / "manifest.json", manifest)
        except Exception as exc:
            auto_diff_error = str(exc)
            manifest["compare_error"] = auto_diff_error
            write_manifest(artifact_dir / "manifest.json", manifest)
            if args.baseline_ref:
                raise
            print(f"WARN: auto diff skipped: {auto_diff_error}", file=sys.stderr)

    append_index(
        index_csv,
        {
            "timestamp_utc": manifest["built_at_utc"],
            "build_ref": build_ref,
            "content_version": content_version,
            "build_version": build_version,
            "git_commit": commit,
            "git_dirty": str(dirty).lower(),
            "channel": args.channel,
            "compare_baseline_ref": baseline_ref,
            "compare_diff_path": compare_diff_rel,
            "compare_semantically_equal": compare_sem_equal,
            "engine": args.engine,
            "runs": str(max(1, args.runs)),
            "module": module_name,
            "tex_file": safe_rel(tex_path),
            "pdf_path": safe_rel(artifact_pdf),
            "pdf_sha256": pdf_hash,
            "pdf_pages": "" if pdf_pages is None else str(pdf_pages),
            "pdf_size_bytes": str(pdf_size),
        },
    )

    print(f"Built and archived: {safe_rel(artifact_pdf)}")
    print(f"Build ref: {build_ref}")
    print(f"Channel: {args.channel}")
    if baseline_ref:
        print(f"Baseline ref: {baseline_ref}")
    if compare_diff_rel:
        print(f"Auto diff: {compare_diff_rel}")
    return 0


def parse_ref(ref: str) -> Tuple[str, str]:
    parts = ref.split("/", 1)
    if len(parts) != 2 or not parts[0].strip() or not parts[1].strip():
        raise RuntimeError(f"Invalid ref '{ref}'. Expected format: <content_version>/<build_version>")
    return parts[0].strip(), parts[1].strip()


def find_module_pdf(build_dir: Path, module: str) -> Path:
    preferred = build_dir / f"{module}.pdf"
    if preferred.exists():
        return preferred
    pdfs = sorted(build_dir.glob("*.pdf"))
    if len(pdfs) == 1:
        return pdfs[0]
    raise FileNotFoundError(f"Cannot determine module PDF in: {build_dir}")


def read_manifest_if_any(build_dir: Path) -> Dict:
    path = build_dir / "manifest.json"
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def pdfinfo_map(pdf_path: Path) -> Dict[str, str]:
    if shutil.which("pdfinfo") is None:
        return {}
    proc = run_cmd(["pdfinfo", str(pdf_path)], check=False)
    if proc.returncode != 0:
        return {}
    out: Dict[str, str] = {}
    for line in proc.stdout.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        out[k.strip()] = v.strip()
    return out


def count_unified_diff(diff_text: str) -> Tuple[int, int]:
    added = 0
    removed = 0
    for line in diff_text.splitlines():
        if line.startswith("+++") or line.startswith("---") or line.startswith("@@"):
            continue
        if line.startswith("+"):
            added += 1
        elif line.startswith("-"):
            removed += 1
    return added, removed


def visual_diff(from_pdf: Path, to_pdf: Path, out_dir: Path, max_pages: int) -> Dict[str, object]:
    result: Dict[str, object] = {
        "enabled": False,
        "tool_status": "missing",
        "pages_compared": 0,
        "pages_changed": 0,
        "page_metrics": [],
        "note": "",
    }

    if shutil.which("magick") is None or shutil.which("compare") is None:
        result["note"] = "magick/compare not available"
        return result

    ensure_dir(out_dir)
    result["enabled"] = True
    result["tool_status"] = "ok"

    with tempfile.TemporaryDirectory(prefix="mastery-diff-") as tmp:
        tmp_dir = Path(tmp)
        from_pat = tmp_dir / "from-%03d.png"
        to_pat = tmp_dir / "to-%03d.png"

        run_cmd(["magick", "-density", "144", str(from_pdf), str(from_pat)], check=True)
        run_cmd(["magick", "-density", "144", str(to_pdf), str(to_pat)], check=True)

        from_pages = sorted(tmp_dir.glob("from-*.png"))
        to_pages = sorted(tmp_dir.glob("to-*.png"))

        compare_count = min(len(from_pages), len(to_pages), max_pages)
        metrics: List[Dict[str, object]] = []
        changed = 0

        for i in range(compare_count):
            fimg = from_pages[i]
            timg = to_pages[i]
            out_img = out_dir / f"page-{i+1:03d}.png"
            proc = run_cmd(["compare", "-metric", "AE", str(fimg), str(timg), str(out_img)], check=False)
            metric_text = (proc.stderr or "").strip()
            metric_val = -1
            metric_match = re.search(r"([0-9]+(?:\.[0-9]+)?)", metric_text)
            if metric_match:
                try:
                    metric_val = int(float(metric_match.group(1)))
                except Exception:
                    metric_val = -1

            changed_page = metric_val not in {0, -1}
            if changed_page:
                changed += 1
            else:
                if out_img.exists():
                    out_img.unlink()

            metrics.append(
                {
                    "page": i + 1,
                    "ae_metric": metric_val,
                    "changed": changed_page,
                }
            )

        result["pages_compared"] = compare_count
        result["pages_changed"] = changed
        result["page_metrics"] = metrics

        if len(from_pages) != len(to_pages):
            result["note"] = f"page count mismatch: from={len(from_pages)}, to={len(to_pages)}"

    return result


def run_diff(
    artifact_root: Path,
    pack_name: str,
    module: str,
    from_ref: str,
    to_ref: str,
    out_dir: Optional[Path],
    skip_visual: bool,
    max_visual_pages: int,
) -> Dict[str, object]:
    from_content, from_build = parse_ref(from_ref)
    to_content, to_build = parse_ref(to_ref)

    from_dir = artifact_root / pack_name / module / from_content / from_build
    to_dir = artifact_root / pack_name / module / to_content / to_build

    if not from_dir.exists():
        raise FileNotFoundError(f"From build not found: {from_dir}")
    if not to_dir.exists():
        raise FileNotFoundError(f"To build not found: {to_dir}")

    if out_dir is None:
        safe_from = sanitize_ref_token(from_ref)
        safe_to = sanitize_ref_token(to_ref)
        out_dir = artifact_root / pack_name / module / "diffs" / f"{safe_from}_to_{safe_to}"
    else:
        out_dir = out_dir.resolve()
    ensure_dir(out_dir)

    from_pdf = find_module_pdf(from_dir, module)
    to_pdf = find_module_pdf(to_dir, module)

    from_text = out_dir / "from.txt"
    to_text = out_dir / "to.txt"

    if shutil.which("pdftotext") is None:
        raise RuntimeError("pdftotext is required for diff command")

    run_cmd(["pdftotext", "-layout", str(from_pdf), str(from_text)], check=True)
    run_cmd(["pdftotext", "-layout", str(to_pdf), str(to_text)], check=True)

    diff_proc = run_cmd(["diff", "-u", str(from_text), str(to_text)], check=False)
    diff_text = diff_proc.stdout
    text_diff_path = out_dir / "text.diff"
    text_diff_path.write_text(diff_text, encoding="utf-8")
    added, removed = count_unified_diff(diff_text)

    visual_summary: Dict[str, object] = {
        "enabled": False,
        "tool_status": "skipped",
        "pages_compared": 0,
        "pages_changed": 0,
        "page_metrics": [],
        "note": "skipped by flag",
    }
    if not skip_visual:
        visual_summary = visual_diff(from_pdf, to_pdf, out_dir / "visual", max_visual_pages)

    from_info = pdfinfo_map(from_pdf)
    to_info = pdfinfo_map(to_pdf)
    page_count_equal = (
        from_info.get("Pages") == to_info.get("Pages") if from_info.get("Pages") and to_info.get("Pages") else True
    )
    metadata_compare = {
        "from_pages": from_info.get("Pages", ""),
        "to_pages": to_info.get("Pages", ""),
        "pages_equal": page_count_equal,
        "from_page_size": from_info.get("Page size", ""),
        "to_page_size": to_info.get("Page size", ""),
        "page_size_equal": from_info.get("Page size", "") == to_info.get("Page size", ""),
        "from_file_size_bytes": from_pdf.stat().st_size,
        "to_file_size_bytes": to_pdf.stat().st_size,
        "file_size_equal": from_pdf.stat().st_size == to_pdf.stat().st_size,
    }
    semantically_equal = bool(
        (diff_proc.returncode == 0)
        and (
            not visual_summary.get("enabled")
            or int(visual_summary.get("pages_changed", 0)) == 0
        )
        and page_count_equal
    )

    summary = {
        "pack_name": pack_name,
        "module": module,
        "from_ref": from_ref,
        "to_ref": to_ref,
        "created_at_utc": utc_now(),
        "from_pdf": {
            "path": safe_rel(from_pdf),
            "sha256": sha256_file(from_pdf),
            "size_bytes": from_pdf.stat().st_size,
            "pdfinfo": from_info,
            "manifest": read_manifest_if_any(from_dir),
        },
        "to_pdf": {
            "path": safe_rel(to_pdf),
            "sha256": sha256_file(to_pdf),
            "size_bytes": to_pdf.stat().st_size,
            "pdfinfo": to_info,
            "manifest": read_manifest_if_any(to_dir),
        },
        "text_diff": {
            "path": safe_rel(text_diff_path),
            "has_changes": diff_proc.returncode == 1,
            "added_lines": added,
            "removed_lines": removed,
        },
        "metadata_compare": metadata_compare,
        "visual_diff": visual_summary,
        "semantically_equal": semantically_equal,
    }

    summary_json = out_dir / "summary.json"
    write_manifest(summary_json, summary)

    lines: List[str] = []
    lines.append("# PDF Diff Summary")
    lines.append("")
    lines.append(f"- Module: `{module}`")
    lines.append(f"- From: `{from_ref}`")
    lines.append(f"- To: `{to_ref}`")
    lines.append(f"- Generated: `{summary['created_at_utc']}`")
    lines.append("")
    lines.append("## Hash Compare")
    lines.append("")
    lines.append(f"- From hash: `{summary['from_pdf']['sha256']}`")
    lines.append(f"- To hash: `{summary['to_pdf']['sha256']}`")
    if summary["from_pdf"]["sha256"] != summary["to_pdf"]["sha256"] and semantically_equal:
        lines.append("- Note: `Binary hash differs, but semantic diff is clean (likely metadata timestamp variance).`")
    lines.append("")
    lines.append("## Text Diff")
    lines.append("")
    lines.append(f"- Changed: `{summary['text_diff']['has_changes']}`")
    lines.append(f"- Added lines: `{summary['text_diff']['added_lines']}`")
    lines.append(f"- Removed lines: `{summary['text_diff']['removed_lines']}`")
    lines.append(f"- File: `{safe_rel(text_diff_path)}`")
    lines.append("")
    lines.append("## PDF Metadata")
    lines.append("")
    lines.append(f"- Pages: `{metadata_compare['from_pages']}` -> `{metadata_compare['to_pages']}`")
    lines.append(f"- Page size: `{metadata_compare['from_page_size']}` -> `{metadata_compare['to_page_size']}`")
    lines.append(
        f"- File size bytes: `{metadata_compare['from_file_size_bytes']}` -> `{metadata_compare['to_file_size_bytes']}`"
    )
    lines.append("")
    lines.append("## Visual Diff")
    lines.append("")
    lines.append(f"- Enabled: `{visual_summary.get('enabled')}`")
    lines.append(f"- Pages compared: `{visual_summary.get('pages_compared')}`")
    lines.append(f"- Pages changed: `{visual_summary.get('pages_changed')}`")
    note = str(visual_summary.get("note") or "")
    if note:
        lines.append(f"- Note: `{note}`")
    lines.append("")
    lines.append("## Conclusion")
    lines.append("")
    lines.append(f"- Semantically equal: `{semantically_equal}`")
    lines.append("")
    lines.append(f"JSON: `{safe_rel(summary_json)}`")

    (out_dir / "summary.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    return {
        "out_dir": out_dir,
        "summary": summary,
    }


def diff_command(args: argparse.Namespace) -> int:
    artifact_root = Path(args.artifact_root).resolve()
    output_dir = Path(args.out_dir).resolve() if args.out_dir else None
    result = run_diff(
        artifact_root=artifact_root,
        pack_name=args.pack_name,
        module=args.module,
        from_ref=args.from_ref,
        to_ref=args.to_ref,
        out_dir=output_dir,
        skip_visual=args.skip_visual,
        max_visual_pages=args.max_visual_pages,
    )
    print(f"Diff written to: {safe_rel(result['out_dir'])}")
    return 0


def list_command(args: argparse.Namespace) -> int:
    index_csv = Path(args.artifact_root).resolve() / args.pack_name / args.module / "index.csv"
    if not index_csv.exists():
        print(f"No index found: {safe_rel(index_csv)}")
        return 0

    rows = read_index_rows(index_csv)
    rows = rows[-max(1, args.limit) :]
    if not rows:
        print("No builds recorded.")
        return 0

    print(f"Latest {len(rows)} builds for {args.module}:")
    for r in rows:
        print(
            " | ".join(
                [
                    r.get("timestamp_utc", ""),
                    r.get("build_ref", ""),
                    r.get("channel", ""),
                    r.get("compare_baseline_ref", ""),
                    r.get("git_commit", ""),
                    r.get("engine", ""),
                    r.get("pdf_sha256", "")[:12],
                ]
            )
        )
    return 0


def update_index_channel(index_csv: Path, build_ref: str, channel: str) -> bool:
    rows = read_index_rows(index_csv)
    updated = False
    for row in rows:
        if row.get("build_ref", "").strip() == build_ref:
            row["channel"] = channel
            updated = True
    if updated:
        write_index_rows(index_csv, rows)
    return updated


def mark_release_command(args: argparse.Namespace) -> int:
    artifact_root = Path(args.artifact_root).resolve()
    module_root = artifact_root / args.pack_name / args.module
    build_dir = build_dir_from_ref(module_root, args.build_ref)
    if not build_dir.exists():
        raise FileNotFoundError(f"Build not found: {build_dir}")

    manifest_path = build_dir / "manifest.json"
    manifest = read_manifest_if_any(build_dir)
    if not manifest:
        raise RuntimeError(f"manifest.json missing or unreadable: {manifest_path}")

    manifest["release_channel"] = "release"
    manifest["release_marked_at_utc"] = utc_now()
    write_manifest(manifest_path, manifest)

    index_csv = module_root / "index.csv"
    update_index_channel(index_csv, args.build_ref, "release")

    print(f"Marked release: {args.build_ref}")
    return 0


def discover_build_dirs(module_root: Path) -> List[Path]:
    out: List[Path] = []
    if not module_root.exists():
        return out
    for content_dir in sorted(module_root.iterdir()):
        if not content_dir.is_dir() or content_dir.name == "diffs":
            continue
        for build_dir in sorted(content_dir.iterdir()):
            if build_dir.is_dir():
                out.append(build_dir)
    return out


def build_sort_key(build_dir: Path, manifest: Dict) -> datetime:
    for key in ["built_at", "built_at_utc"]:
        ts = parse_utc_timestamp(str(manifest.get(key, "")))
        if ts is not None:
            return ts
    return datetime.fromtimestamp(build_dir.stat().st_mtime, tz=timezone.utc)


def cleanup_command(args: argparse.Namespace) -> int:
    artifact_root = Path(args.artifact_root).resolve()
    module_root = artifact_root / args.pack_name / args.module
    if not module_root.exists():
        print(f"No module artifacts found: {safe_rel(module_root)}")
        return 0

    keep_n = max(0, int(args.keep_drafts))
    build_entries: List[Tuple[datetime, str, str, Path]] = []
    for build_dir in discover_build_dirs(module_root):
        ref = build_ref_from_dir(module_root, build_dir)
        if not ref:
            continue
        manifest = read_manifest_if_any(build_dir)
        # Safety-first default: unknown channel treated as release (never deleted).
        channel = str(manifest.get("release_channel") or "release").strip().lower()
        ts = build_sort_key(build_dir, manifest)
        build_entries.append((ts, ref, channel, build_dir))

    if not build_entries:
        print("No build artifacts found.")
        return 0

    build_entries.sort(key=lambda x: x[0], reverse=True)
    draft_entries = [e for e in build_entries if e[2] == "draft"]
    to_delete = draft_entries[keep_n:]

    if not to_delete:
        print(f"No draft cleanup needed. Draft count={len(draft_entries)}, keep={keep_n}.")
        return 0

    for _, ref, _, build_dir in to_delete:
        if args.dry_run:
            print(f"DRY-RUN delete: {safe_rel(build_dir)} ({ref})")
        else:
            shutil.rmtree(build_dir)
            print(f"Deleted draft: {safe_rel(build_dir)} ({ref})")

    deleted_refs = {ref for _, ref, _, _ in to_delete}
    if deleted_refs and not args.dry_run:
        index_csv = module_root / "index.csv"
        rows = read_index_rows(index_csv)
        kept_rows = [r for r in rows if r.get("build_ref", "").strip() not in deleted_refs]
        write_index_rows(index_csv, kept_rows)

    return 0


def main() -> int:
    args = parse_args()
    try:
        if args.command == "build":
            return build_command(args)
        if args.command == "diff":
            return diff_command(args)
        if args.command == "list":
            return list_command(args)
        if args.command == "mark-release":
            return mark_release_command(args)
        if args.command == "cleanup":
            return cleanup_command(args)
        raise RuntimeError(f"Unknown command: {args.command}")
    except Exception as exc:  # pragma: no cover - CLI guard
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
