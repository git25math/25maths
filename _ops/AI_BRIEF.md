# 25Maths — AI Agent Brief

> Drop this file (+ `_ops/OUTPUT_CONTRACTS/`) into any LLM context to onboard it fast.
> Last updated: 2026-05-03

---

## What is 25Maths?

25Maths (www.25maths.com) is an exam-aligned mathematics practice platform for international school students preparing for **CIE 0580** (Cambridge IGCSE) and **Edexcel 4MA1** (Pearson IGCSE).
It provides:
- Free + paid worksheet packs (PDF)
- Free Kahoot practice hubs
- A paid **Term Practice Pass** (weekly packs)

Built by an international school mathematics educator. English-first with Simplified Chinese support.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Static site | Jekyll (GitHub Pages) |
| Styling | Tailwind CSS v3 (CDN) |
| Dynamic API | Cloudflare Pages Functions (Node.js) |
| Database + Auth | Supabase (PostgreSQL + RLS + Auth) |
| Payments | Payhip (embed buttons + webhook integration) |
| Hosting | GitHub Pages + Cloudflare proxy |
| Domain/DNS | Cloudflare DNS (www.25maths.com) |

Notes:
- **No bundler/webpack**. Jekyll builds static HTML.
- Dynamic behaviors (membership/download/engagement) run via **Cloudflare Pages Functions**.

---

## Directory Structure (key paths)

```txt
/                           Root (English canonical)
/_config.yml                Site config, CSP, module definitions, Supabase config

/_data/
  releases.json             Product registry (Payhip IDs, asset keys, status)
  kahoot_subtopic_links.json
  kahoot_*_subtopics.json
  content/                  Week packs / releases content data (e.g. week01.*)

/_includes/
  head.html                 Tailwind CDN, OG meta, CSP, Payhip.js
  global-nav.html           Top nav
  module-nav.html           Board-specific nav
  footer.html               Footer
  evidence-strip.html       Homepage evidence strip (auto-hides if images missing)

/_layouts/
  global.html               Global/portal pages
  module.html               Board pages (cie0580/, edx4ma1/)

/assets/
  js/                       member_auth.js, bilingual_support.js, member dashboards
  css/site.css
  evidence/                 Auto-generated screenshots for evidence strip (webp/png)

/functions/
  _lib/                     release_registry.js, supabase_server.js, payhip_events.js
  api/v1/                   membership/, download/, engagement/, reports/

/supabase/migrations/       SQL schema (engagement, membership, learning, institution)

/scripts/health/            Health checks, site checks, visual snapshots

/en/                        English alias (redirects to /)
/zh-cn/                     Simplified Chinese variant

/cie0580/                   CIE 0580 module pages + free/ + products/
/edx4ma1/                   Edexcel 4MA1 module pages + free/ + products/

/_ops/                      AI onboarding + output contracts
/plan/                      Specs (adaptive difficulty, streaks, B2B, subscription plan)
```

---

## Content Types

### 1) Worksheet Packs (PDF)

- **Free packs**: 14 packs across both boards, hosted under:
  - `cie0580/free/`
  - `edx4ma1/free/`
- **Paid bundles** (examples): Algebra, Functions, Number (Payhip products)
- **Sales**: Payhip embed buttons (`data-payhip-product`)

### 2) Kahoot Quizzes (free hub, 40+)

- **Data**: `_data/kahoot_subtopic_links.json` (maps subtopic IDs to Kahoot room URLs)
- **Hub**: `/kahoot/` (board listings)

### 3) Term Practice Pass (paid, $24.99 one-time)

- **Product**: 12 weekly topical practice packs with full solutions (CIE 0580 aligned)
- **Payhip Product ID**: `eN4l6`
- **Delivery**: Signed URLs from Supabase Storage via `/api/v1/download/:release_id`
- **Registry**: `_data/releases.json` + `functions/_lib/release_registry.js`

---

## Naming Conventions

### Subtopic ID (canonical)

Format:

```txt
{board}:{domain}-{section}:{code}-{slug}
```

Examples:

```txt
cie0580:algebra-c2:c2-01-introduction-to-algebra
edexcel-4ma1:number-h1:h1-05-set-language-and-notation
```

### Language Paths

```txt
/                  English (canonical)
/zh-cn/            Simplified Chinese
/en/               English alias (redirects to /)
```

---

## Data Formats (JSON)

### Exercise Question

```json
{
  "type": "multiple-choice",
  "questionText": "Simplify `4a + 5a - 2a`.",
  "questionText_zh": "化简 `4a + 5a - 2a`。",
  "options": ["7a", "11a", "9a - 2a", "7"],
  "correctAnswer": 0,
  "explanation": "Combine coefficients: 4 + 5 - 2 = 7, so the answer is 7a.",
  "explanation_zh": "合并同类项系数：4 + 5 - 2 = 7，所以答案是 7a。"
}
```

Conventions:

- Math is wrapped in backticks: `` `x^2 + 3x - 4` ``
- MCQ only (3-5 options)
- `correctAnswer` is **0-based index**
- Keep explanations concise and correct

### Release Entry (`_data/releases.json`)

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

### Week Pack Spec (for PDF generation)

- Authoritative schema: `_ops/OUTPUT_CONTRACTS/data.contract.json` (`week_pack_spec`)
- Reference sample: `_data/content/week01.sample.json`

---

## Output Standards (MANDATORY)

All AI-generated outputs must conform to contracts in `_ops/OUTPUT_CONTRACTS/`:

- `week_pack.contract.md` — Week Pack PDF structure + checklist
- `evidence.contract.md` — Homepage evidence screenshots spec (sizes/names/refresh cadence)
- `data.contract.json` — Schema for `release_entry`, `week_pack_spec`, and PDF question content

---

## Key API Endpoints (Cloudflare Pages Functions)

Authoritative source: `functions/api/v1/` route tree.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/membership/webhook/payhip` | HMAC | Payhip webhook |
| GET | `/api/v1/membership/benefits` | Bearer | Member benefits |
| GET | `/api/v1/download/:release_id` | Bearer | Signed download URL |
| GET | `/api/v1/engagement/leaderboard` | None | Public leaderboard |
| POST | `/api/v1/engagement/streak` | Bearer | Update streak |

---

## Health Checks

Run from repo root:

```bash
bash scripts/health/check_site.sh
bash scripts/health/check_bilingual_coverage.sh
bash scripts/health/check_style_consistency.sh

python3 scripts/health/check_exercise_data.py
python3 scripts/health/check_kahoot_data.py
```

`check_exercise_data.py` is now a retirement guard: it verifies that the retired online exercise product line stays offline and that public entry points do not reintroduce it.

Screenshots (evidence strip):

```bash
npm install playwright
npx playwright install chromium
node _ops/screenshots/shot.mjs
```

---

## Deployment

Push to `main`:

- GitHub Pages builds Jekyll static site
- Cloudflare proxy serves site and runs Functions
- Live in ~minutes (depends on cache)

Cloudflare Pages env vars:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYHIP_API_KEY`
