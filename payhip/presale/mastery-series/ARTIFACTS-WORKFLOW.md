# Mastery PDF Artifact Workflow

Immutable build archives + comparable indexes for Mastery Series modules.

## 1) Versioning Model

- Content version: manual semantic version, e.g. `1.2.0`
- Build version: auto-generated compile version, e.g. `20260227-gabc1234`

`build_ref = <content_version>/<build_version>`

## 2) Immutable Artifact Layout

Every build writes to a new folder and never overwrites old outputs:

`payhip/presale/mastery-series/_artifacts/<pack>/<module>/<content_version>/<build_version>/`

Each build folder contains:

- `<module>.pdf`
- `manifest.json`
- `sha256.txt`
- `source-files.txt`
- `build.log`

`manifest.json` records at minimum:

- `pack/module`
- `content_version/build_version`
- `built_at` (UTC)
- `git_commit`
- `tex_engine` and full compile commands
- source input files + hashes
- output PDF hash

## 3) Comparable Index

Each module keeps an append-only index:

`.../_artifacts/<pack>/<module>/index.csv`

Key fields include:

- version refs (`build_ref`, `content_version`, `build_version`)
- build timestamp and git commit
- PDF path/hash/size/pages
- compare baseline (`compare_baseline_ref`)
- compare output path (`compare_diff_path`)
- lifecycle channel (`draft` or `release`)

## 4) Diff Output

Diff artifacts are generated under:

`.../_artifacts/<pack>/<module>/diffs/<from>_to_<to>/`

Outputs:

- text compare: `from.txt`, `to.txt`, `text.diff`
- metadata compare: page count, page size, file size in `summary.json` / `summary.md`
- optional visual compare: `visual/page-*.png`

## 5) Commands

### Build + archive (+ auto diff)

```bash
python3 scripts/payhip/mastery_build_archive.py build \
  --module 01-structured-workbook \
  --content-version 1.0.0 \
  --channel draft
```

Behavior:

- Always writes a new immutable build folder.
- Auto-selects baseline from latest prior build (or `--baseline-ref`).
- Auto-generates diff unless `--no-auto-diff`.

Example with explicit baseline:

```bash
python3 scripts/payhip/mastery_build_archive.py build \
  --module 01-structured-workbook \
  --content-version 1.0.0 \
  --build-version demo-c \
  --baseline-ref 1.0.0/demo-b \
  --skip-visual-diff
```

### List builds

```bash
python3 scripts/payhip/mastery_build_archive.py list \
  --module 01-structured-workbook \
  --limit 20
```

### Manual diff

```bash
python3 scripts/payhip/mastery_build_archive.py diff \
  --module 01-structured-workbook \
  --from-ref 1.0.0/demo-a \
  --to-ref 1.0.0/demo-b
```

### Mark release (release is never cleaned)

```bash
python3 scripts/payhip/mastery_build_archive.py mark-release \
  --module 01-structured-workbook \
  --build-ref 1.0.0/demo-c
```

### Clean draft builds (keep latest N)

```bash
python3 scripts/payhip/mastery_build_archive.py cleanup \
  --module 01-structured-workbook \
  --keep-drafts 5
```

Dry-run:

```bash
python3 scripts/payhip/mastery_build_archive.py cleanup \
  --module 01-structured-workbook \
  --keep-drafts 5 \
  --dry-run
```

## 6) Release Rule

- `release` builds: never deleted by cleanup.
- `draft` builds: cleanup may keep only latest `N`.
- Any outward-facing PDF must be traceable to its sibling `manifest.json` and source hashes.
