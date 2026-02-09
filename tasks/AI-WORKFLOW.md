# AI Workflow Guide: Multi-Tool Collaboration

> This document explains how to use Claude Code, Codex, and Gemini CLI together on this project.

---

## Recommended Assignment

| Agent | AI Tool | Why This Tool |
|-------|---------|---------------|
| **A** (Product pages) | **Codex** | Long-form HTML generation from template, works well with clear spec |
| **B** (Legal + SEO) | **Gemini CLI** | Content-heavy pages with boilerplate text generation |
| **C** (Homepage) | **Claude Code** | Precision editing of existing file, needs exact line-by-line changes |
| **D** (Products + Pricing) | **Claude Code** | Moderate edits to 2 existing files |
| **E** (About + Support + Free) | **Claude Code** | Mix of edits + new file + shell commands (PDF copy) |
| **F** (Consistency) | **Claude Code** | Cross-file audit requiring reading all files simultaneously |

---

## How to Give Tasks to Each AI

### For Codex (Agent A)

Open Codex and paste:
```
Read the following files in order:
1. PROJECT-PLAN.md — for design system, nav, footer templates
2. tasks/AGENT-A-product-pages.md — for your specific task
3. products/algebra.html — as the template to adapt

Then create:
- products/functions.html
- products/number.html

Follow the task doc exactly. Do not modify any other files.
```

### For Gemini CLI (Agent B)

Open Gemini CLI and paste:
```
Read the following files in order:
1. PROJECT-PLAN.md — for design system, nav, footer templates
2. tasks/AGENT-B-legal-seo.md — for your specific task
3. about.html — as the page structure reference

Then create:
- terms.html
- privacy.html
- sitemap.xml
- robots.txt

Follow the task doc exactly. Do not modify any other files.
```

### For Claude Code (Agents C, D, E — sequential or parallel)

Claude Code can handle multiple agents. Run them sequentially:

**Agent C**: "Read tasks/AGENT-C-homepage.md and PROJECT-PLAN.md, then modify index.html according to the task doc."

**Agent D**: "Read tasks/AGENT-D-products-pricing.md and PROJECT-PLAN.md, then modify products.html and pricing.html."

**Agent E**: "Read tasks/AGENT-E-support-free.md and PROJECT-PLAN.md, then modify about.html and support.html, copy PDFs, and create free/index.html."

**Agent F** (after all above complete): "Read tasks/AGENT-F-consistency.md, then audit all HTML files for consistency."

---

## Conflict Prevention

The file ownership matrix guarantees ZERO conflicts:

```
Codex     → products/functions.html, products/number.html (CREATE only)
Gemini    → terms.html, privacy.html, sitemap.xml, robots.txt (CREATE only)
Claude    → index.html, products.html, pricing.html, about.html, support.html (MODIFY)
            free/* (CREATE)
```

No two AI tools touch the same file. Wave 2 (Agent F) runs AFTER all Wave 1 agents complete.

---

## Progress Tracking

After each AI completes its work, update the Progress Tracking table in `PROJECT-PLAN.md`:
- Change status from `pending` to `completed`
- Note any issues encountered

---

## If Something Goes Wrong

1. Check `PROJECT-PLAN.md` for the design system specs
2. Check the specific `tasks/AGENT-{X}-*.md` for detailed instructions
3. Use `products/algebra.html` as the reference template
4. If in doubt, keep styling consistent with existing pages
