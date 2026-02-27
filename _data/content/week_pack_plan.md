# 12-Week Term Practice Pass — Topic Plan

> CIE 0580 IGCSE Mathematics · Core + Extended · 2026 Term 2
> Each week: 4-8 Core + 3-6 Extended questions, bilingual (EN/ZH), full solutions

---

## Schedule

| Week | Topic | Syllabus Refs | Subtopics | Status |
|------|-------|---------------|-----------|--------|
| 01 | **Number: Money, Fractions, Decimals & Percentages** | C1.2, C1.5, E1.2, E1.5 | FDP conversions, percentage increase/decrease, reverse percentages, money problems | DONE |
| 02 | **Number: Types, Powers, Roots & Indices** | C1.1, C1.3, C1.7, E1.7 | Types of number, HCF/LCM, prime factorisation, squares/cubes/roots, index laws | DONE |
| 03 | **Number: Ratio, Proportion & Rates** | C1.11, C1.12, E1.11, E1.12 | Simplifying ratios, dividing in a ratio, direct/inverse proportion, speed/distance/time, unit rates | DONE |
| 04 | **Number: Standard Form, Estimation & Accuracy** | C1.8, C1.9, C1.10, E1.8, E1.10 | Standard form conversions & arithmetic, significant figures, upper/lower bounds, error intervals | DONE |
| 05 | **Algebra: Expressions, Manipulation & Equations** | C2.1, C2.2, C2.5, E2.1, E2.2, E2.5 | Substitution, expanding brackets, factorising, solving linear equations, simultaneous equations | DONE |
| 06 | **Algebra: Inequalities, Sequences & Functions** | C2.6, C2.7, E2.6, E2.7, E2.13 | Linear inequalities, number patterns, nth term, quadratic sequences, function notation (Extended) | DONE |
| 07 | **Coordinate Geometry & Linear Graphs** | C3.1-C3.6, E3.1-E3.7 | Plotting coordinates, gradient, y = mx + c, parallel/perpendicular lines, midpoint & distance (Extended) | |
| 08 | **Geometry: Angles, Symmetry & Constructions** | C4.1-C4.6, E4.1-E4.6 | Angle properties (triangles, parallel lines, polygons), line/rotational symmetry, constructions, loci, circle theorems (Extended) | |
| 09 | **Mensuration: Area, Volume & Surface Area** | C5.1-C5.5, E5.1-E5.5 | Perimeter & area (rectangles, triangles, circles), arc length & sector area, surface area & volume (prisms, cylinders, cones, spheres) | |
| 10 | **Trigonometry & Pythagoras** | C6.1, C6.2, E6.1-E6.6 | Pythagoras' theorem, SOHCAHTOA, exact trig values, sine/cosine rule, area = ½ab sin C, 3D problems (Extended) | |
| 11 | **Probability** | C8.1-C8.3, E8.1-E8.4 | Probability scale, experimental probability, expected frequency, combined events (tree diagrams, Venn diagrams), conditional probability (Extended) | |
| 12 | **Statistics** | C9.1-C9.4, E9.1-E9.7 | Data types, averages & range, pie/bar charts, scatter diagrams & correlation, cumulative frequency, histograms (Extended) | |

---

## Design Principles

1. **Progressive difficulty**: Number → Algebra → Geometry → Statistics
2. **Core + Extended**: Every week has both tiers, Extended adds 3-6 harder questions
3. **Exam relevance**: Topics weighted by frequency in past papers (Number & Algebra heavier)
4. **Dual edition**: Each week produces `week-{nn}-en.pdf` + `week-{nn}-bilingual.pdf`

## Per-Week Targets

| Metric | Target | Acceptable |
|--------|--------|------------|
| Core questions | 7 | 4-8 |
| Extended questions | 4 | 3-6 |
| Total marks | 30-40 | 24-50 |
| Key vocabulary | 15-20 | 10-25 |
| Checklist items | 7 | 5-8 |
| EN edition pages | 6 | 5-8 |
| Bilingual pages | 8 | 7-10 |

## Production Pipeline

```
1. Create _data/content/week{nn}.json (questions, solutions, vocabulary)
2. Validate: python3 scripts/health/check_week_pack_data.py _data/content/week{nn}.json
3. Build:    bash scripts/build_week_pack.sh week{nn}
4. QA:       Review against _ops/OUTPUT_CONTRACTS/week_pack_qa_checklist.md
5. Upload:   Supabase Storage → member-files/week{nn}/
6. Register: _data/releases.json + sync_release_registry.js
7. Commit & push
```

## JSON Template

Each `week{nn}.json` follows the same structure as `week01.json`:

```json
{
  "week_number": N,
  "topic": "...",
  "board": "CIE 0580",
  "tier": "Core + Extended",
  "release_id": "member-week{nn}-{slug}-2026w{ww}",
  "version": "v1",
  "subtopic_ids": ["cie0580:..."],
  "syllabus_refs": ["C1.x", "E1.x"],
  "key_vocabulary": [
    { "term_en": "...", "term_zh": "...", "definition": "...", "definition_zh": "..." }
  ],
  "questions_core": [
    {
      "id": "q001", "board": "CIE 0580", "track": "Core", "marks": N,
      "topic": ["..."],
      "question": { "en": "...", "zh": "..." },
      "answer": { "en": "...", "zh": "..." },
      "solution": { "en": ["step1", "step2"], "zh": ["步骤1", "步骤2"] },
      "common_mistake": { "en": "...", "zh": "..." }
    }
  ],
  "questions_extended": [ ... ],
  "review_checklist": [
    { "en": "I can ...", "zh": "我能..." }
  ]
}
```
