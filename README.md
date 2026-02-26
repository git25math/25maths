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

## 📁 Current Status (2026-02-23)

- ✅ Portal + module architecture (Jekyll)
- ✅ CIE 0580 + Edexcel 4MA1 bilingual worksheet content is fully indexed (202 active subtopics)
- ✅ Kahoot + worksheet + section bundle + unit bundle link fields are complete for all active records
- ✅ Legal pages + SEO + sitemap
- ⏳ Kahoot sellable readiness is **186 / 202** (`presale`/`live`), with 16 still `planned`

## 🧾 Latest Updates (2026-02-23)

- Synced latest L1 Payhip URLs and Kahoot challenge links into release registry data
- Confirmed all active subtopics pass kahoot data integrity checks (0 failures / 0 warnings)
- Generated funnel health snapshot showing board-level planned gaps (CIE: 8, Edexcel: 8)
- Kept presale release-date metadata aligned across links and catalog (0 unit-date mismatches)

---

## Health Checks

Run data consistency checks before publishing:

```bash
python3 scripts/health/check_kahoot_data.py
python3 scripts/health/check_exercise_data.py
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
