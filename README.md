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

### Step 3: Connect www.25maths.com (5 min)

1. Cloudflare Pages → Custom domains → Add `www.25maths.com`
2. Auto-configured if domain on Cloudflare
3. Otherwise add CNAME: `www` → `your-site.pages.dev`

✅ Done! Site live at www.25maths.com

---

## 💰 Cost: $0/year (Free!)

- GitHub: Free
- Cloudflare Pages: Free
- SSL/CDN: Free
- Total: **FREE** 🎉

---

## 📁 Current Status (2026-02-11)

- ✅ Portal + module architecture (Jekyll)
- ✅ CIE 0580 module (products, pricing, free page)
- ✅ Edexcel 4MA1 free resources (products/pricing placeholders)
- ✅ Legal pages + SEO + sitemap
- ⏳ Payhip paid product listings (waiting on live URLs)

## 🧾 Latest Updates (2026-02-11)

- Added weekly membership page ($9.99/month) and subscription plan doc
- Implemented waitlist forms + thank-you flow for paid products
- Standardized pricing and bundle deal messaging
- Removed direct-download PDFs to enforce Payhip email gate
- Added membership CTAs across homepage, CIE pages, and product pages
- Launched blog section with starter articles for SEO and lead capture
- Added blog highlights on homepage and blog link in global navigation
- Added EN / 简体 / 繁體 paths for home, subscription, and blog with language switcher
- Added EN / 简体 / 繁體 versions for About, Support, Terms, Privacy
- Removed AMC8 and IAL modules from site navigation and sitemap

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
```

---

© 2026 25Maths
