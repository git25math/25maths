# Agent B: Legal Pages + SEO Foundation Files

> **Assigned To**: Gemini CLI
> **Status**: `pending`
> **Files to CREATE**: `terms.html`, `privacy.html`, `sitemap.xml`, `robots.txt`
> **Files to READ (reference only)**: `PROJECT-PLAN.md`
> **DO NOT TOUCH**: Any other files
> **MANDATORY**: Read and follow `tasks/EXECUTION-PROTOCOL.md` before starting. Save report to `tasks/reports/AGENT-B-report.md`.

---

## IMPORTANT: Do NOT use about.html as reference

The existing about.html is incomplete (missing mobile menu, minimal footer). Use the templates provided in this document instead.

---

## Complete HTML Boilerplate for Legal Pages

Both `terms.html` and `privacy.html` use this EXACT structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{PAGE TITLE} | 25Maths</title>
    <meta name="description" content="{META DESCRIPTION}">

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#8B1538',
                        secondary: '#2563EB',
                        warning: '#F59E0B',
                        success: '#10B981',
                    }
                }
            }
        }
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    {NAVIGATION}
    {HERO}
    {CONTENT SECTIONS}
    {FOOTER}
    {MOBILE MENU JS}
</body>
</html>
```

---

## Standard Navigation (copy exactly — NO nav item highlighted for legal pages)

```html
<nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="/" class="text-2xl font-bold text-primary">25Maths</a>
            </div>
            <div class="hidden md:flex items-center space-x-8">
                <a href="/products.html" class="text-gray-700 hover:text-primary transition">Products</a>
                <a href="/pricing.html" class="text-gray-700 hover:text-primary transition">Pricing</a>
                <a href="/about.html" class="text-gray-700 hover:text-primary transition">About</a>
                <a href="/support.html" class="text-gray-700 hover:text-primary transition">Support</a>
            </div>
            <div class="md:hidden flex items-center">
                <button id="mobile-menu-button" class="text-gray-700">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
        <div class="px-4 pt-2 pb-4 space-y-2">
            <a href="/products.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Products</a>
            <a href="/pricing.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Pricing</a>
            <a href="/about.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">About</a>
            <a href="/support.html" class="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Support</a>
        </div>
    </div>
</nav>
```

---

## Standard Full Footer (copy exactly)

```html
<footer class="bg-gray-900 text-gray-300 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
            <div>
                <h3 class="text-white text-2xl font-bold mb-4">25Maths</h3>
                <p class="text-sm">Premium Bilingual IGCSE Mathematics Resources</p>
            </div>
            <div>
                <h4 class="text-white font-semibold mb-4">Products</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/products.html" class="hover:text-white transition">All Products</a></li>
                    <li><a href="/products/algebra.html" class="hover:text-white transition">Algebra Bundle</a></li>
                    <li><a href="/products/functions.html" class="hover:text-white transition">Functions Bundle</a></li>
                    <li><a href="/products/number.html" class="hover:text-white transition">Number Pack</a></li>
                    <li><a href="/pricing.html" class="hover:text-white transition">Pricing</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-semibold mb-4">Company</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/about.html" class="hover:text-white transition">About</a></li>
                    <li><a href="/support.html" class="hover:text-white transition">Support</a></li>
                    <li><a href="/free/" class="hover:text-white transition">Free Resources</a></li>
                    <li><a href="mailto:support@25maths.com" class="hover:text-white transition">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-semibold mb-4">Legal</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/terms.html" class="hover:text-white transition">Terms of Service</a></li>
                    <li><a href="/privacy.html" class="hover:text-white transition">Privacy Policy</a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 25Maths. All rights reserved.</p>
            <p class="mt-2"><a href="mailto:support@25maths.com" class="hover:text-white transition">support@25maths.com</a></p>
        </div>
    </div>
</footer>
```

---

## Standard Mobile Menu JS (add before `</body>`)

```html
<script>
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
</script>
```

---

## Task 1: Create `terms.html`

### Page Meta
- **Title**: `Terms of Service | 25Maths`
- **Description**: `Terms of Service for 25Maths digital mathematics resources. Learn about licensing, refund policy, and usage terms.`

### Hero Section
```html
<section class="bg-gradient-to-r from-primary to-purple-900 text-white py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-5xl font-bold mb-4">Terms of Service</h1>
        <p class="text-xl opacity-90">Last updated: February 2026</p>
    </div>
</section>
```

### Content

Wrap ALL content in ONE section:
```html
<section class="py-16 bg-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {ALL SECTIONS BELOW}
    </div>
</section>
```

Use `<h2 class="text-2xl font-bold mb-4 mt-12">` for headings (first h2 uses `mt-0` instead of `mt-12`).
Use `<p class="text-gray-700 mb-4">` for paragraphs.
Use `<ul class="list-disc pl-6 text-gray-700 mb-4 space-y-2">` for bullet lists.
Email addresses should be `<a href="mailto:support@25maths.com" class="text-primary hover:underline">support@25maths.com</a>`.
Section numbers (1-10) should NOT appear in the rendered HTML — they are just for this doc's organization.

**Section: Agreement to Terms**
- By accessing www.25maths.com you agree to these terms.
- If you disagree with any part of these terms, please discontinue use of the website immediately.

**Section: Digital Products License**
- Single-user license for personal study or classroom use
- Teachers may print and distribute to their own students
- You may NOT resell, redistribute, or share files digitally
- You may NOT upload to file-sharing platforms or websites
- You may NOT claim the content as your own work

**Section: School & Institutional Licensing**
- Schools and institutions require a separate bulk license
- Contact support@25maths.com for institutional pricing
- Bulk licenses permit distribution within the licensed institution only

**Section: Pricing and Payment**
- All prices are listed in GBP (£)
- Payment is processed securely through Gumroad
- Prices may change at any time; existing purchases are unaffected
- Digital delivery is instant after successful payment

**Section: Refund Policy**
- We offer a 14-day money-back guarantee on all products
- Email support@25maths.com within 14 days of purchase for a full refund
- No questions asked, no hassle
- Refunds are processed within 5 business days

**Section: Intellectual Property**
- All content is copyright © 2026 25Maths
- Resources are created with professional LaTeX typesetting
- Unauthorized reproduction or distribution is prohibited

**Section: Disclaimer**
- Resources are supplementary study materials, not a substitute for classroom teaching
- While we strive for accuracy, we cannot guarantee completely error-free content
- Please report any errors to support@25maths.com for prompt correction

**Section: Limitation of Liability**
- 25Maths is not liable for examination outcomes
- Maximum liability is limited to the purchase price of the product
- We provide resources "as is" for educational purposes

**Section: Changes to Terms**
- We may update these terms at any time
- Continued use of the website constitutes acceptance of updated terms
- Please check this page periodically for changes

**Section: Contact**
- For questions about these terms, contact us at support@25maths.com
- Website: www.25maths.com

---

## Task 2: Create `privacy.html`

### Page Meta
- **Title**: `Privacy Policy | 25Maths`
- **Description**: `Privacy Policy for 25Maths. Learn how we collect, use, and protect your personal information.`

### Hero Section
```html
<section class="bg-gradient-to-r from-primary to-purple-900 text-white py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-5xl font-bold mb-4">Privacy Policy</h1>
        <p class="text-xl opacity-90">Last updated: February 2026</p>
    </div>
</section>
```

### Content

Same wrapper and styling as terms.html.

**Section: Information We Collect**
- Email address (when subscribing to updates or making a purchase)
- Payment information (processed by Gumroad — we never see or store your full card details)
- Usage data (pages visited, general analytics via GitHub Pages)

**Section: How We Use Your Information**
- Deliver purchased digital products
- Send free resources you have requested
- Notify you about new products (only if you opted in)
- Improve our website and resources

**Section: Third-Party Services**
We use the following third-party services:
- **Gumroad** — Payment processing and product delivery. See Gumroad's privacy policy.
- **Formspree** — Email form submissions. See Formspree's privacy policy.
- **GitHub Pages** — Website hosting. See GitHub's privacy policy.
- **Google Fonts** — Typography. See Google's privacy policy.

**Section: Email Communications**
- We only send emails if you explicitly subscribe
- Every email includes an unsubscribe link
- We never sell or share your email address with third parties
- You can request deletion of your email data at any time

**Section: Cookies**
- We do not use tracking cookies on our website
- Third-party services (Tailwind CDN, Google Fonts) may set technical cookies
- We do not use advertising or marketing cookies

**Section: Data Security**
- All payments are processed via Gumroad's secure infrastructure
- We do not store payment card information on our servers
- Email addresses are stored securely

**Section: Children's Privacy**
- Our resources are designed for students aged 14 and above
- We do not knowingly collect personal data from children under 13
- Parents or guardians may contact us to request removal of any child's data

**Section: Your Rights**
You have the right to:
- Request access to your personal data
- Request deletion of your personal data
- Unsubscribe from email communications at any time
- Contact us at support@25maths.com to exercise these rights

**Section: Changes to This Policy**
- We may update this privacy policy periodically
- Changes will be posted on this page with an updated date
- Continued use of the website constitutes acceptance

**Section: Contact**
- For privacy-related questions, contact us at support@25maths.com
- Website: www.25maths.com

---

## Task 3: Create `sitemap.xml`

Create this file with EXACT content (no modifications):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://www.25maths.com/</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://www.25maths.com/products.html</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://www.25maths.com/products/algebra.html</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://www.25maths.com/products/functions.html</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://www.25maths.com/products/number.html</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://www.25maths.com/pricing.html</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://www.25maths.com/about.html</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>https://www.25maths.com/support.html</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>https://www.25maths.com/free/</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://www.25maths.com/terms.html</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
    </url>
    <url>
        <loc>https://www.25maths.com/privacy.html</loc>
        <lastmod>2026-02-09</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
    </url>
</urlset>
```

---

## Task 4: Create `robots.txt`

Create this file with EXACT content:

```
User-agent: *
Allow: /

Sitemap: https://www.25maths.com/sitemap.xml
```

---

## Verification Checklist

- [ ] terms.html has `<!DOCTYPE html>`, `<html lang="en">`, complete head with all 4 Tailwind colors
- [ ] privacy.html has same complete head structure
- [ ] Both pages have Google Fonts with 5 weights (400;500;600;700;800)
- [ ] Both pages have `body { font-family: 'Inter', sans-serif; }` in style tag
- [ ] Both pages have working mobile menu (button + panel + JS)
- [ ] Both pages have full 4-column footer with all product/legal links
- [ ] No nav item is highlighted on either page
- [ ] All email addresses are clickable mailto: links
- [ ] sitemap.xml has all 11 URLs, valid XML syntax
- [ ] robots.txt references correct sitemap URL
- [ ] Section headings do NOT have numbers (1., 2., etc.) in the HTML output
