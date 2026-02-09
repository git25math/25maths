# Agent F: Full-Site Consistency Audit (Wave 2)

> **Assigned To**: Claude Code
> **Status**: `blocked` (requires Wave 1 completion)
> **Files to MODIFY**: ALL HTML files as needed
> **Prerequisite**: Agents A, B, C, D, E must ALL complete first
> **MANDATORY**: Read and follow `tasks/EXECUTION-PROTOCOL.md` before starting. Save report to `tasks/reports/AGENT-F-report.md`.

---

## Pre-Flight Check: Verify Wave 1 Deliverables

Before starting any audit work, verify these files exist:

```
MUST EXIST (created by Wave 1):
- products/functions.html  (Agent A)
- products/number.html     (Agent A)
- terms.html               (Agent B)
- privacy.html             (Agent B)
- sitemap.xml              (Agent B)
- robots.txt               (Agent B)
- free/index.html          (Agent E)
- free/*.pdf               (Agent E — 8 PDF files)
```

**If ANY file is missing**: STOP and report which files are missing. Do NOT attempt to create them — they require their specific agent's task doc for correct content.

---

## Fix vs. Flag Policy

| Situation | Action |
|-----------|--------|
| Missing mobile menu | **FIX**: Add standard nav + JS |
| Incomplete/minimal footer | **FIX**: Replace with standard full footer |
| Missing/incomplete Tailwind config | **FIX**: Add full 4-color config |
| Missing Google Fonts preconnect | **FIX**: Add full font links |
| Wrong nav highlight | **FIX**: Correct the highlight |
| "Coming Soon" remnants | **FIX**: Remove/update the text |
| Missing Wave 1 files | **FLAG**: Report and stop |
| Broken Gumroad links (typos) | **FLAG**: Report for user to fix |
| Content errors in legal pages | **FLAG**: Report for review |

---

## Audit 1: Navigation Consistency

Check every page has the standard nav with:
1. Desktop nav with 4 links (Products, Pricing, About, Support)
2. Mobile menu button (`<button id="mobile-menu-button">`)
3. Mobile menu panel (`<div id="mobile-menu">`)
4. Mobile menu JS before `</body>`
5. Correct highlight for current page

| Page | Expected Highlight | Notes |
|------|-------------------|-------|
| `index.html` | None (has "Get Started" CTA button) | Already has mobile menu |
| `products.html` | Products | Agent D should have added |
| `pricing.html` | Pricing | Agent D should have added |
| `about.html` | About | Agent E should have added |
| `support.html` | Support | Agent E should have added |
| `products/algebra.html` | None | **Likely needs fix — original file has NO mobile menu** |
| `products/functions.html` | None | Agent A should have included |
| `products/number.html` | None | Agent A should have included |
| `terms.html` | None | Agent B should have included |
| `privacy.html` | None | Agent B should have included |
| `free/index.html` | None | Agent E should have included |

### How to Fix `products/algebra.html` Mobile Menu

This file was created before the mobile menu standard. Apply these specific changes:

**Step 1**: Find the nav closing `</div>` structure (around lines 49-52). The current nav ends:
```html
            </div>
        </div>
    </nav>
```

Add the mobile menu button BEFORE the closing `</div></div>` of the nav's flex container. Then add the mobile menu panel BEFORE `</nav>`.

**Step 2**: In the nav's `<div class="flex justify-between h-16">`, add after the desktop links div:
```html
<div class="md:hidden flex items-center">
    <button id="mobile-menu-button" class="text-gray-700">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    </button>
</div>
```

**Step 3**: Add the mobile menu panel inside `<nav>`, after the main container div:
```html
<div id="mobile-menu" class="hidden md:hidden bg-white border-t">
    <div class="px-4 pt-2 pb-4 space-y-2">
        <a href="/products.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Products</a>
        <a href="/pricing.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Pricing</a>
        <a href="/about.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">About</a>
        <a href="/support.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Support</a>
    </div>
</div>
```

**Step 4**: Add mobile menu JS before `</body>` (before the existing `<script>` block):
```html
<script>
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
</script>
```

**Step 5**: Check that the mobile menu button doesn't already exist before adding (if Agent A or another process already fixed it, skip this).

---

## Audit 2: Footer Consistency

Every page must have the standard 4-column footer with these exact links:

**Products column**: All Products, Algebra Bundle, Functions Bundle, Number Pack, Pricing
**Company column**: About, Support, Free Resources, Contact (mailto)
**Legal column**: Terms of Service, Privacy Policy
**Bottom**: © 2026, support@25maths.com

Check each page and replace any minimal/incomplete footer with the standard full footer from `PROJECT-PLAN.md`.

---

## Audit 3: Tailwind Config Consistency

Every page must have ALL 4 colors:
```javascript
primary: '#8B1538',
secondary: '#2563EB',
warning: '#F59E0B',
success: '#10B981',
```

Pages that originally only had `primary`: `pricing.html`, `about.html`, `support.html`
Wave 1 agents should have fixed these, but verify.

---

## Audit 4: Google Fonts Consistency

Every page must have the full font import with preconnect hints:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

And the body style:
```html
<style>
    body { font-family: 'Inter', sans-serif; }
</style>
```

---

## Audit 5: No "Coming Soon" Remnants

Search all HTML files for these patterns. Context matters — only flag/fix items related to product availability:

| Pattern | Where to look | Action |
|---------|--------------|--------|
| `COMING SOON` | Product card badges, hero text | Remove or replace with "AVAILABLE NOW" |
| `Coming Soon` | Button text, headings | Replace with active CTA |
| `Notify Me` | Button text | Replace with "View Details →" or "Learn More →" |
| `notifyMe` | JavaScript functions | Remove the function |
| `subscribeEmail` | JavaScript functions | Remove (replaced by Formspree) |
| `cursor-not-allowed` | Button classes | Remove class |
| `bg-gray-400` | On buttons that should be active | Change to `bg-primary` |
| `opacity-90` | On product card containers | Remove (cards should be full opacity) |
| `text-gray-400` | On prices/checkmarks | Change to `text-primary` (prices) or `text-success` (checkmarks) |

**Do NOT** remove `opacity-90` from non-card contexts (e.g., hero subtitle text uses `opacity-90` intentionally).

---

## Audit 6: Cross-Page Link Verification

Verify every internal link across all pages resolves to an existing file:

| Link | Target File |
|------|-------------|
| `/` | `index.html` |
| `/products.html` | `products.html` |
| `/products/algebra.html` | `products/algebra.html` |
| `/products/functions.html` | `products/functions.html` |
| `/products/number.html` | `products/number.html` |
| `/pricing.html` | `pricing.html` |
| `/about.html` | `about.html` |
| `/support.html` | `support.html` |
| `/terms.html` | `terms.html` |
| `/privacy.html` | `privacy.html` |
| `/free/` | `free/index.html` |

---

## Audit 7: Gumroad Links

Verify these placeholder links appear correctly:
- `https://gumroad.com/l/25maths-algebra` (in algebra.html)
- `https://gumroad.com/l/25maths-functions` (in functions.html)
- `https://gumroad.com/l/25maths-number` (in number.html)

**FLAG** any typos (e.g., `gumroad.co` instead of `gumroad.com`).

---

## Execution Steps

1. Pre-flight check: verify all Wave 1 files exist
2. Read all 11 HTML files
3. Run through Audits 1-7
4. Fix everything in the "FIX" category
5. Report everything in the "FLAG" category
6. After all fixes, read each file again to confirm changes are correct

---

## Final Verification

After all fixes:
- [ ] Every page has working mobile menu (button + panel + JS)
- [ ] Every page has full 4-column footer with all correct links
- [ ] Every page has full 4-color Tailwind config
- [ ] Every page has Google Fonts with 5 weights + preconnect
- [ ] No "Coming Soon" / "Notify Me" / gray buttons anywhere
- [ ] All internal links resolve to existing files
- [ ] All nav highlights match their respective pages
- [ ] algebra.html has mobile menu (was missing before)
- [ ] Gumroad links are correctly formatted
- [ ] Copyright year is 2026 on all pages
