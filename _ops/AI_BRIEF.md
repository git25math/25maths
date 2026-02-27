# 25Maths — AI Agent Brief

> Drop this file (+ `OUTPUT_CONTRACTS/`) into any LLM context to onboard it.
> Last updated: 2026-02-27

---

## What is 25Maths?

25Maths (www.25maths.com) is an exam-aligned mathematics practice platform for international school students preparing for **CIE 0580** (Cambridge IGCSE) and **Edexcel 4MA1** (Pearson IGCSE). It provides free interactive exercises, downloadable worksheet packs, Kahoot quizzes, and a paid Term Practice Pass. Built by an international school mathematics educator. Bilingual (English primary, Simplified Chinese support).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Static site | Jekyll (GitHub Pages) |
| Styling | Tailwind CSS v3 (CDN) |
| Database + Auth | Supabase (PostgreSQL + RLS + Auth) |
| Serverless API | Cloudflare Pages Functions (Node.js) |
| Payments | Payhip (5% fee, webhook integration) |
| Hosting | GitHub Pages + Cloudflare Pages proxy |
| Domain | www.25maths.com (Cloudflare DNS) |

No build step beyond Jekyll. No bundler/webpack. Tailwind loaded via CDN.

---

## Directory Structure (key paths)

```
/                           Root (English primary)
├── _config.yml             Module definitions, Supabase config, CSP
├── _data/
│   ├── exercises/          202 exercise JSON files (one per subtopic)
│   ├── releases.json       Product registry (Payhip IDs, asset keys)
│   ├── kahoot_subtopic_links.json
│   └── kahoot_*_subtopics.json
├── _exercises/             204 Markdown stubs (frontmatter only)
├── _includes/
│   ├── head.html           <head> (Tailwind CDN, OG, CSP, Payhip.js)
│   ├── global-nav.html     Top nav bar
│   ├── module-nav.html     Board-specific sub-nav
│   ├── footer.html         5-column footer
│   └── evidence-strip.html Product screenshot strip
├── _layouts/
│   ├── global.html         Portal / global pages
│   ├── module.html         Board pages (cie0580/, edx4ma1/)
│   └── interactive_exercise.html  Exercise player
├── assets/
│   ├── js/                 exercise_engine.js, member_auth.js, bilingual_support.js
│   ├── css/site.css
│   └── evidence/           Auto-generated product screenshots
├── functions/
│   ├── _lib/               release_registry.js, supabase_server.js, payhip_events.js
│   └── api/v1/             exercise/, membership/, download/, engagement/, reports/
├── supabase/migrations/    SQL schema (engagement, membership, learning, institution)
├── scripts/health/         check_bilingual_coverage.sh, check_style_consistency.sh, etc.
├── en/                     English variant (redirects to /)
├── zh-cn/                  Simplified Chinese variant
├── cie0580/                CIE 0580 module pages + free/ + products/
├── edx4ma1/                Edexcel 4MA1 module pages + free/ + products/
├── _ops/                   AI agent onboarding + output contracts
└── plan/                   Specs (adaptive difficulty, streaks, B2B, subscription plan)
```

---

## Content Types

### 1. Interactive Exercises (free, 202 sets)
- **Data**: `_data/exercises/{subtopic_id}.json` — 10-12 MCQ per file
- **Page**: `_exercises/{subtopic_id}.md` — frontmatter only, rendered by `interactive_exercise.html` layout
- **Player**: `assets/js/exercise_engine.js` — client-side quiz engine with session tracking

### 2. Worksheet Packs (free + paid, PDF)
- **Free**: 14 vocab card PDFs (8 CIE, 6 Edexcel) hosted in `cie0580/free/`, `edx4ma1/free/`
- **Paid bundles**: Algebra ($17), Functions ($17), Number ($12) via Payhip
- **Sold via**: Payhip embed buttons (`data-payhip-product` attribute)

### 3. Kahoot Quizzes (free, 40+ rooms)
- **Data**: `_data/kahoot_subtopic_links.json` — maps subtopic IDs to Kahoot room URLs
- **Hub**: `/kahoot/` directory with board-specific listings

### 4. Term Practice Pass (paid, $24.99 one-time)
- **Product**: 12 weekly topical practice packs with full solutions, built for CIE 0580
- **Payhip Product ID**: `eN4l6`
- **Delivery**: Supabase Storage signed URLs via `/api/v1/download/:release_id`
- **Registry**: `_data/releases.json` → `functions/_lib/release_registry.js`

---

## Naming Conventions

### Subtopic ID
```
{board}:{domain}-{section}:{code}-{slug}
Examples:
  cie0580:algebra-c2:c2-01-introduction-to-algebra
  edexcel-4ma1:number-h1:h1-05-set-language-and-notation
```

### File Naming
```
Exercises:  _data/exercises/{subtopic_id_with_hyphens}.json
Releases:   {board}-{type}-{descriptor}-{version_or_week}
URLs:       /exercises/{subtopic_id_with_hyphens}/
```

### Language Paths
```
/                  English (canonical)
/zh-cn/            Simplified Chinese
/en/               English alias (redirects to /)
```

---

## Data Formats

### Exercise Question (in JSON)
```json
{
  "type": "multiple-choice",
  "questionText": "Simplify `4a + 5a - 2a`.",
  "options": ["7a", "11a", "9a - 2a", "7"],
  "correctAnswer": 0,
  "explanation": "Combine coefficients: 4 + 5 - 2 = 7, so the answer is 7a."
}
```
- Math notation: backtick-wrapped LaTeX (`x^2 + y = 5`)
- 10-12 questions per exercise set

### Release Entry (in releases.json)
```json
{
  "release_id": "member-week01-algebra-foundations-2026w09",
  "version": "v1",
  "subtopic_id": "cie0580:algebra-c2:c2-01-introduction-to-algebra",
  "channels": ["member"],
  "payhip_product_id": "eN4l6",
  "payhip_url": "https://payhip.com/b/eN4l6",
  "membership_tier": "active",
  "asset_key": "member-files/week01/algebra-foundations-pack.pdf",
  "status": "active"
}
```

---

## Output Standards

All AI-generated content must conform to the contracts in `_ops/OUTPUT_CONTRACTS/`:
- `week_pack.contract.md` — PDF practice pack structure
- `evidence.contract.md` — Homepage screenshot strip specifications
- `data.contract.json` — Exercise/content data schema

---

## Key API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/exercise/session/start` | Optional | Start exercise session |
| POST | `/api/v1/exercise/session/:id/attempt` | Optional | Record question attempt |
| POST | `/api/v1/exercise/session/:id/complete` | Optional | Complete session |
| POST | `/api/v1/membership/webhook/payhip` | HMAC | Payhip purchase webhook |
| GET | `/api/v1/membership/benefits` | Bearer | List member benefits |
| GET | `/api/v1/download/:release_id` | Bearer | Signed download URL |
| GET | `/api/v1/engagement/leaderboard` | None | Public leaderboard |
| POST | `/api/v1/engagement/streak` | Bearer | Update streak |

---

## Health Checks

```bash
bash scripts/health/check_bilingual_coverage.sh   # Language parity
bash scripts/health/check_style_consistency.sh     # CSS token usage
python3 scripts/health/check_exercise_data.py      # Exercise JSON schema
python3 scripts/health/check_kahoot_data.py        # Kahoot link integrity
```

---

## Deployment

Push to `main` → GitHub Pages builds Jekyll → Cloudflare proxies + runs Functions → live in ~2 min.

Environment variables required on Cloudflare Pages:
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYHIP_API_KEY`
