# Week Pack QA Checklist — Acceptance Criteria

> Based on issues encountered during Week 01 production.
> Every new week pack MUST pass all checks before release.

---

## 1. JSON Data Quality

- [ ] `review_checklist` uses bilingual `{en, zh}` object format (not plain strings)
- [ ] All questions have `question.en` and `question.zh`
- [ ] All solutions have `solution.en` and `solution.zh` arrays with matching step counts
- [ ] All `common_mistake` entries have both `.en` and `.zh`
- [ ] All `answer` entries have both `.en` and `.zh`
- [ ] Key vocabulary has `term_en`, `term_zh`, `definition`, `definition_zh`
- [ ] Passes `python3 scripts/health/check_week_pack_data.py <file>` with no FAIL
- [ ] `subtopic_ids` are valid and match actual syllabus codes
- [ ] `release_id` follows convention: `member-week{nn}-{slug}-{en|bilingual}-2026w{ww}`

## 2. English Edition (`--lang en`)

- [ ] **Zero Chinese characters** in generated `week_pack_content.tex` and `week_pack_vars.tex`
- [ ] `\weekedition` = "English Edition"
- [ ] Vocabulary shows term + definition only (no `term_zh`, no `definition_zh`)
- [ ] Questions show English text only (no gray Chinese translation)
- [ ] Solutions show English steps only (no interleaved Chinese)
- [ ] Common mistakes show English only
- [ ] Checklist shows English items only
- [ ] Self-assessment shows English options only

## 3. Bilingual Edition (`--lang bilingual`)

- [ ] `\weekedition` = "Bilingual Edition 双语版"
- [ ] Vocabulary: Chinese term (`term_zh`) + Chinese definition (`definition_zh`) present
- [ ] Questions: Chinese translation displayed in `{\small\color{gray}}`
- [ ] Solutions: Chinese step interleaved below each English step in `{\footnotesize\color{textmuted}}`
- [ ] Common mistakes: Chinese line below English
- [ ] Checklist: Chinese `{zh}` below each English `{en}` item
- [ ] Self-assessment: Chinese translations (自信/需要练习/不确定) present

## 4. PDF Compilation

- [ ] Both editions compile with `xelatex` — zero fatal errors
- [ ] English edition: 6-8 pages
- [ ] Bilingual edition: 7-10 pages
- [ ] Cover subtitle shows correct edition name
- [ ] No overfull `\hbox` warnings > 10pt (check `xelatex_pass1.log`)
- [ ] All math renders correctly (backtick → `$...$` conversion)
- [ ] Solution section line spacing is readable (not cramped)
- [ ] File size < 500KB per PDF

## 5. Release & Upload

- [ ] `_data/releases.json` has two entries (en + bilingual) with correct `asset_key`
- [ ] `node scripts/member/sync_release_registry.js` run → `release_registry.js` updated
- [ ] Both PDFs uploaded to Supabase Storage: `member-files/week{nn}/week-{nn}-{en|bilingual}.pdf`
- [ ] Verify files exist via Storage API list

## 6. Build Script

- [ ] `bash scripts/build_week_pack.sh week{nn}` builds both editions without error
- [ ] `bash scripts/build_week_pack.sh week{nn} en` builds English only
- [ ] `bash scripts/build_week_pack.sh week{nn} bilingual` builds bilingual only
- [ ] Output filenames: `week-{nn}-en.pdf` and `week-{nn}-bilingual.pdf`

---

## Quick Verification Commands

```bash
# Validate JSON
python3 scripts/health/check_week_pack_data.py _data/content/week{nn}.json

# Check English has no Chinese
python3 tools/week_pack/render_week_pack.py _data/content/week{nn}.json --lang en
python3 -c "
import re
content = open('build/week_pack_content.tex').read() + open('build/week_pack_vars.tex').read()
cjk = re.findall(r'[\u4e00-\u9fff]+', content)
print('FAIL' if cjk else 'PASS: no Chinese in en edition')
"

# Check bilingual has Chinese in all sections
python3 tools/week_pack/render_week_pack.py _data/content/week{nn}.json --lang bilingual
python3 -c "
content = open('build/week_pack_content.tex').read()
checks = {
  'vocab': 'scriptsize' in content and any(ord(c) > 0x4e00 for c in content),
  'solutions': 'footnotesize' in content,
  'checklist': '我能' in content or '我可以' in content,
  'self-assessment': '自信' in content,
}
for k, v in checks.items(): print(f\"{'PASS' if v else 'FAIL'}: {k}\")
"

# Build both editions
bash scripts/build_week_pack.sh week{nn}

# Upload to Supabase
# (see build script output for upload commands)
```
