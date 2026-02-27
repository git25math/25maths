# Evidence Strip — Output Contract

> Defines the homepage evidence strip: product screenshots that prove the platform is real and usable.

---

## Component

**File**: `_includes/evidence-strip.html`
**Inserted in**: `index.html` (after Practice Ecosystem section)

---

## Required Screenshots

| Slot | Page | Filename | What to capture |
|------|------|----------|----------------|
| 1 | `/exercises/` | `exercises-hub.webp` | Exercise hub with board/tier filters visible |
| 2 | `/cie0580/free/` | `free-packs.webp` | Free worksheet download cards |
| 3 | `/kahoot/` | `kahoot-hub.webp` | Kahoot explorer with topic listing |
| 4 | `/subscription.html` | `term-pass.webp` | Term Practice Pass purchase page |

---

## Image Specifications

| Property | Value |
|----------|-------|
| Format | WebP (fallback: PNG) |
| Width | 800px |
| Height | 500px (crop to viewport, no scrolling) |
| Quality | 80 (WebP) |
| Max file size | 150KB per image |
| Output path | `/assets/evidence/` |
| Naming | kebab-case, descriptive: `{page-slug}.webp` |

---

## Screenshot Script

**File**: `_ops/screenshots/shot.mjs`
**Runtime**: Node.js + Playwright

```bash
# Generate all screenshots
node _ops/screenshots/shot.mjs

# Generate single screenshot
node _ops/screenshots/shot.mjs --url /exercises/
```

**Configuration**:
- Base URL: `https://www.25maths.com` (production) or `http://localhost:4000` (local)
- Viewport: 1280x800
- Wait: `networkidle` + 500ms settle
- Output: `/assets/evidence/`

---

## HTML Component Structure

```html
<!-- _includes/evidence-strip.html -->
<section class="bg-gray-50 py-16 border-b border-gray-100">
  <div class="max-w-5xl mx-auto px-6 lg:px-8">
    <p class="text-xs tracking-widest uppercase text-gray-500 mb-6">
      Inside the Platform
    </p>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- 4 screenshot cards with caption -->
    </div>
  </div>
</section>
```

Each card:
- Rounded corners (`rounded-xl`)
- Subtle shadow (`shadow-sm`)
- Caption below image (page name, e.g., "Interactive Exercises")
- Links to the actual page
- `loading="lazy"` on all images

---

## Refresh Cadence

Re-run screenshot script:
- After any visual change to the 4 target pages
- Before major launches or PR reviews
- Monthly at minimum to keep screenshots current

---

## Fallback

If screenshots are not yet generated, the evidence strip should:
- Not render (use `{% if site.evidence_strip %}` guard)
- OR show placeholder cards with page name + "Screenshot coming soon" text
