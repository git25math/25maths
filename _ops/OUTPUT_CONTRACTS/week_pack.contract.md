# Week Pack PDF — Output Contract

> Defines what a Term Practice Pass weekly PDF must contain.
> Any AI agent producing week packs MUST conform to this spec.

---

## Metadata

| Field | Example | Required |
|-------|---------|----------|
| `week_number` | `01` | Yes |
| `topic` | Algebra Foundations & Manipulation | Yes |
| `board` | CIE 0580 | Yes |
| `tier` | Core + Extended | Yes |
| `subtopic_ids` | `["cie0580:algebra-c2:c2-01-...", ...]` | Yes |
| `version` | `v1` | Yes |
| `release_id` | `member-week01-algebra-foundations-2026w09` | Yes |

---

## PDF Structure (8 pages target, 6-10 acceptable)

### Page 1: Cover
- Title: `Week {nn}: {Topic Name}`
- Subtitle: `CIE 0580 Term Practice Pass`
- Board + tier badge
- 25Maths branding (logo, URL)
- Version stamp (bottom-right): `v1 · 2026-W09`

### Page 2: Topic Overview
- 3-5 bullet summary of what this topic covers
- Syllabus reference codes (e.g., C2.1, C2.2)
- Key vocabulary table (English term | Definition | Common mistake)
- If bilingual: add Chinese term column

### Pages 3-5: Practice Questions
- **Section A — Core** (6-8 questions, difficulty 1-3/5)
- **Section B — Extended** (4-6 questions, difficulty 3-5/5)
- Each question:
  - Numbered sequentially across sections
  - Mark allocation shown: `[2]`, `[3]`, `[4]`
  - Space indication for working (or "Show your working" instruction)
- Total marks: 30-40 per pack

### Pages 6-7: Full Solutions
- Every question with step-by-step working
- Mark scheme annotations (where marks are awarded)
- Common error callouts: `⚠ Common mistake: ...`

### Page 8: Review Checklist
- 5-8 checkbox items: "I can... [skill]"
- Self-assessment rating (Confident / Needs practice / Not sure)
- Link to related interactive exercises on 25maths.com
- QR code to exercise page (optional)

---

## Formatting Standards

| Element | Standard |
|---------|----------|
| Paper size | A4 (210 x 297 mm) |
| Margins | 20mm all sides |
| Body font | 11pt, serif or clean sans-serif |
| Math notation | LaTeX-rendered (via KaTeX/MathJax or native PDF) |
| Diagrams | Vector preferred (SVG/TikZ), raster at 300dpi minimum |
| Colour | Minimal; black text, blue for annotations, red for common errors |
| Header | `25Maths · Week {nn} · {Topic}` on every page |
| Footer | `Page {n} of {total} · CIE 0580 Term Practice Pass · v1` |

---

## Dual Editions

Each week pack produces **two PDFs** from the same JSON data:

| Edition | Flag | Cover label | Content |
|---------|------|-------------|---------|
| English | `--lang en` | English Edition | English only throughout |
| Bilingual | `--lang bilingual` | Bilingual Edition 双语版 | English + Chinese in solutions, mistakes, checklist, self-assessment |

## File Naming & Delivery

```
Filenames: week-{nn}-en.pdf, week-{nn}-bilingual.pdf
Example:   week-01-en.pdf, week-01-bilingual.pdf

Storage:   Supabase Storage → member-files/week{nn}/
Asset keys: member-files/week01/week-01-en.pdf
            member-files/week01/week-01-bilingual.pdf
```

Each edition has its own release entry in `_data/releases.json`:
- `release_id`: `member-week{nn}-{slug}-en-2026w{ww}` / `member-week{nn}-{slug}-bilingual-2026w{ww}`
- `status: "active"`
- `channels: ["member"]`
- `asset_key` matching the storage path

After updating `releases.json`, run: `node scripts/member/sync_release_registry.js`

---

## Quality Gates

Before release, verify:
- [ ] All questions have complete, correct solutions
- [ ] Mark totals match stated total
- [ ] No broken LaTeX rendering
- [ ] Topic aligns with stated syllabus codes
- [ ] File size < 500KB per PDF
- [ ] PDF is text-searchable (not image-only)
- [ ] Version stamp matches release_id
- [ ] English edition contains zero Chinese characters
- [ ] Bilingual edition has Chinese in solutions, mistakes, checklist, self-assessment
- [ ] See `week_pack_qa_checklist.md` for full acceptance criteria
