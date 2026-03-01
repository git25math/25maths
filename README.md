# 25Maths.com Website

Premium bilingual IGCSE Mathematics resources website.

## 🚀 Quick Deploy: GitHub → Cloudflare Pages (15 minutes total)

### Step 1: Push to GitHub (5 min)

```bash
cd /Users/zhuxingzhe/Project/ExamBoard/25maths-website
git init
git add .
git commit -m "Initial: 25Maths website"
git branch -M main

# Create repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/25maths-website.git
git push -u origin main
```

### Step 2: Deploy on Cloudflare Pages (5 min)

1. https://dash.cloudflare.com → Pages → Create project
2. Connect GitHub → Select `25maths-website`
3. Build settings: **Framework: None** → Deploy
4. Live in 1 minute at: `your-site.pages.dev`
5. Platform redirects: `_redirects` is committed at repo root for HTTP 301 canonicalization (`/en/*`, `/zh-cn/*` -> primary routes)

### Step 3: Connect www.25maths.com (5 min)

1. Cloudflare Pages → Custom domains → Add `www.25maths.com`
2. Auto-configured if domain on Cloudflare
3. Otherwise add CNAME: `www` → `your-site.pages.dev`

✅ Done! Site live at www.25maths.com

### Redirect Verification (Post Deploy)

Run after deployment to confirm edge-level 301 behavior:

```bash
curl -I https://www.25maths.com/en/
curl -I https://www.25maths.com/zh-cn/
curl -I https://www.25maths.com/zh-cn/cie0580/products/algebra.html
```

Expected:
- Status: `301 Moved Permanently`
- `Location` points to canonical primary route
- Troubleshooting signal:
  - If headers show `server: GitHub.com` (and no `cf-ray`), Cloudflare proxy is bypassed; enable orange-cloud proxy for `www` in Cloudflare DNS first.

---

## 💰 Cost: $0/year (Free!)

- GitHub: Free
- Cloudflare Pages: Free
- SSL/CDN: Free
- Total: **FREE** 🎉

---

## 📁 Current Status (2026-03-01)

- ✅ Portal + module architecture (Jekyll + Cloudflare Pages)
- ✅ CIE 0580 + Edexcel 4MA1 bilingual worksheet content is fully indexed (202 active subtopics)
- ✅ Kahoot + worksheet + section bundle + unit bundle link fields are complete for all active records
- ✅ Legal pages + SEO + sitemap
- ✅ Membership system (auth/payment/engagement/downloads) — 90% complete
- ✅ Engagement system (streak/XP/achievements/leaderboard/parent dashboard)
- ✅ Bilingual support: static toggle + JS t(en,zh) dynamic translations — 100% complete
- ✅ LaTeX math rendering Phase 1-2 (superscripts/roots/fractions, 278 JSON files) — 60% overall
- ⏳ Kahoot sellable readiness is **186 / 202** (`presale`/`live`), with 16 still `planned`

## 🧾 Latest Updates (2026-03-01)

- Account settings page with Profile CRUD API (ab48f5e)
- Member JS/HTML bilingual completion: 6 files, ~60 Chinese translations using isZh()+t() (269fe7f)
- Hero color override fix: text-gray-300/text-blue-300 mapped to brand colors (47bc9b9)
- LaTeX Phase 1: Unicode superscripts/roots/Greek → LaTeX (108 JSON) (bd78109)
- LaTeX Phase 2: Plain-text fractions → \frac{}{} (170 JSON) (731ad30)

---

## Health Checks

Run data consistency checks before publishing:

```bash
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/check_exercise_data.py
bash scripts/health/check_style_consistency.sh
bash scripts/health/check_bilingual_coverage.sh
```

Run deployment checks against production:

```bash
scripts/health/check_site.sh
scripts/health/check_redirect_301_live.sh https://www.25maths.com
scripts/health/check_cloudflare_security_baseline.sh https://www.25maths.com
```

Cloudflare Redirect Rules playbook:

- `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/infra/cloudflare/REDIRECT-RULES-PLAYBOOK.md`

Cloudflare Security Baseline playbook:

- `/Users/zhuxingzhe/Project/ExamBoard/25maths-website/infra/cloudflare/SECURITY-BASELINE-PLAYBOOK.md`

Optional CLI apply (if you have Cloudflare API credentials):

```bash
export CF_API_TOKEN="***"
export CF_ZONE_ID="***"
scripts/deploy/apply_cloudflare_redirect_rules.sh
```

---

© 2026 25Maths
