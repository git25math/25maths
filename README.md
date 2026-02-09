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

## 📁 Current Status

- ✅ index.html - Complete
- ⏳ Other pages - Creating...

---

© 2026 25Maths
