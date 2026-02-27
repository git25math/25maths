# North Star Vision: The World's Best IGCSE Math Prep Platform

> Created: 2026-02-27
> Status: STRATEGIC BLUEPRINT
> Ambition: #1 globally for IGCSE Mathematics preparation — marketing, UX, retention, data, reporting

---

## 1) Competitive Landscape (2026)

### Tier 1: Dominant Players

| Platform | Users | Model | Price | Strength | Weakness |
|----------|-------|-------|-------|----------|----------|
| **Save My Exams** | 2.5M/month | Freemium subscription | £4-12/mo | 20K+ revision notes, 10K+ questions, multi-subject, SmartMark AI | Generic content; no bilingual; no deep personalization; no exercise-level analytics |
| **Seneca Learning** | 10M+ users, 96% UK schools | Free + school licenses | Free/school | Massive adoption; adaptive learning; teacher dashboard | Acquired by GoStudent; IGCSE not primary focus; no CIE-specific depth |
| **Dr Frost Maths** | Large school base | Free for students, school license | £600/yr school | 1600+ question generators; gamification (points/trophies); exam board aligned | UK-centric; no bilingual; dated UI; limited parent reporting |
| **Revision Village** | Significant (IB-focused) | One-time purchase | ~$49-99 | Video solutions; Newton AI handwriting feedback; past paper walkthrough | IB primary, IGCSE secondary; no ongoing engagement model; no practice data loop |
| **PMT Education** | Large (UK) | Free (ad-supported) | Free | Massive free content library; trusted brand | Non-profit; ad-heavy UX; no personalization; no interactive exercises |

### Tier 2: Niche / Adjacent

| Platform | Focus | Price | Gap |
|----------|-------|-------|-----|
| **GCSEPod** | Video micro-lessons | School license | No math depth; video-only |
| **Mathspace** | Step-by-step solving | $9.99/mo | Not IGCSE-aligned; US-centric |
| **Corbett Maths** | Free video/worksheet | Free | UK GCSE only; no CIE |
| **MyiMaths** | School homework | School license | Closed ecosystem |

### Market Gaps Nobody Fills

1. **No bilingual EN/CN IGCSE platform exists** — 500K+ Chinese students study IGCSE globally
2. **No platform combines exam-frequency data analysis with personalized weak-point drilling**
3. **No platform offers parent-facing progress reports in Chinese** for international school families
4. **No platform has a LaTeX-quality exam prep content system** that can scale across boards
5. **No platform provides real-time mistake pattern analysis** with actionable study plans

---

## 2) Our Unfair Advantages

### What We Have That No One Else Does

| Advantage | Description | Defensibility |
|-----------|-------------|---------------|
| **Bilingual content system** | EN/CN at content level, not just UI translation | High — requires subject matter + language expertise |
| **NZH-MathPrep LaTeX framework** | Zero-marginal-cost content production | High — proprietary toolchain |
| **Exam frequency analysis** | 793+ real exam questions analyzed for priority weighting | Medium — data advantage compounds over time |
| **Multi-AI orchestration** | Claude + Codex + Gemini working in parallel | Medium — execution speed advantage |
| **Micro-topic exercise engine** | 202 subtopics with interactive practice | Medium — grows with content |
| **Full-stack member system** | Auth + telemetry + webhook + entitlements already built | High — 1,918 LOC production-ready API |

### What We Must Build

| Capability | Why Critical | Competitor Benchmark |
|------------|-------------|---------------------|
| **Adaptive difficulty engine** | Adjusts question difficulty based on performance | Seneca, Dr Frost |
| **Parent dashboard** | Chinese parents are the decision-makers and payers | No competitor does this in CN |
| **Spaced repetition system** | Proven to improve retention 2-3x | Anki-style, no IGCSE-specific exists |
| **Printable progress reports** | Schools and tutors need paper artifacts | Save My Exams has basic version |
| **Video walkthrough layer** | Students expect video explanations | Revision Village, Save My Exams |
| **SEO content machine** | Organic traffic is the cheapest acquisition channel | PMT dominates with free content |

---

## 3) Strategic Pillars

### Pillar 1: CONTENT MOAT — Deepest IGCSE Math Content in Any Language

**Target**: Every CIE 0580 and Edexcel 4MA1 question type, at every difficulty, in both EN and CN.

| Dimension | Current | Target (12mo) | Metric |
|-----------|---------|---------------|--------|
| Subtopics covered | 202 | 400+ (add 0606 Additional Maths) | Count |
| Exercise questions | ~2000 | 15,000+ | Count |
| Video walkthroughs | 0 | 500+ (top exam questions) | Count |
| Past paper solutions | 0 | 5 years x 6 papers = 30 full papers | Count |
| Weekly subscription packs | 0 | 52/year | Count |

**AI Allocation**:
- Gemini Flash: Bulk question generation from syllabus taxonomy
- Gemini Pro: Solution walkthrough scripts, quality review
- Claude Code: Content pipeline orchestration, LaTeX integration
- Human: Math accuracy verification, CN translation quality

### Pillar 2: INTELLIGENCE LAYER — Know Every Student Better Than Their Teacher

**Target**: Real-time learning analytics that drive personalized study plans.

| Feature | Description | Priority |
|---------|-------------|----------|
| **Mistake pattern engine** | Cluster wrong answers by skill_tag; identify systematic errors vs careless mistakes | P0 |
| **Adaptive difficulty** | Auto-adjust next question difficulty based on rolling accuracy | P0 |
| **Spaced repetition scheduler** | Surface weak topics at optimal review intervals (Leitner/SM-2) | P1 |
| **Study plan generator** | Weekly auto-generated plan: "This week focus on X because you got Y wrong" | P1 |
| **Predicted grade** | Based on historical performance, predict likely exam grade | P2 |
| **Comparative analytics** | "You're in top 20% for algebra but bottom 40% for geometry" | P2 |

**AI Allocation**:
- Codex: Implement adaptive engine, spaced repetition scheduler, prediction model
- Gemini Pro: Design algorithm architecture, validate statistical approaches
- Claude Code: Data model design, API contract definition
- Human: Validate pedagogical soundness

### Pillar 3: EXPERIENCE LAYER — So Good They Can't Leave

**Target**: Best-in-class UX that creates daily habits.

| Feature | Description | Retention Impact |
|---------|-------------|-----------------|
| **Daily practice streak** | Gamification: maintain daily streak, earn badges | High — proven by Duolingo |
| **Progress visualization** | Topic mastery heatmap, strength/weakness radar chart | High — visual motivation |
| **1-minute daily challenge** | Push notification with single quick question | High — low friction re-engagement |
| **Achievement system** | Milestones: "100 questions", "7-day streak", "Algebra master" | Medium |
| **Leaderboard** (optional) | Anonymized ranking within cohort | Medium — competitive students love it |
| **Offline mode** | Download practice packs for exam-day offline review | Medium |

**AI Allocation**:
- Codex: Frontend implementation (streak, badges, charts)
- Gemini Flash: Achievement design, gamification balance testing
- Claude Code: Architecture, data model for engagement tracking

### Pillar 4: REPORTING LAYER — Reports Parents Will Pay For

**Target**: Professional progress reports that justify subscription cost.

| Report Type | Audience | Content | Frequency |
|-------------|----------|---------|-----------|
| **Student weekly summary** | Student | Topics practiced, accuracy trend, weak areas, next steps | Weekly (email + dashboard) |
| **Parent progress report** | Parent (EN + CN) | Child's progress, grade prediction, areas needing attention | Monthly (PDF + email) |
| **Teacher class report** | Teacher/tutor | Class-wide analytics, individual flags, curriculum coverage | Monthly |
| **Exam readiness report** | Student + parent | "You are X% ready for Paper 2" with topic breakdown | Pre-exam (6 weeks before) |

**Unique differentiator**: Parent reports in Chinese. No competitor does this.

**AI Allocation**:
- Gemini Pro: Report template design, data visualization specs
- Codex: Report generation engine, PDF rendering, email scheduling
- Claude Code: Report data aggregation API, bilingual template system

### Pillar 5: MARKETING ENGINE — Own the Search Results

**Target**: #1 organic ranking for all high-value IGCSE math keywords.

| Channel | Strategy | Target |
|---------|----------|--------|
| **SEO / Blog** | One article per subtopic: "How to solve [topic] in CIE 0580" | 200+ pages indexed |
| **Free tool** | "IGCSE Math Grade Predictor" — viral free tool | 10K monthly visitors |
| **YouTube** | Short-form (60s) problem walkthrough per subtopic | 200+ videos |
| **XiaoHongShu (小红书)** | Chinese parent community: study tips, exam prep advice | 1K followers |
| **WeChat articles** | Share to Chinese parent groups | Forwarding chain |
| **Email sequences** | Free -> trial -> subscription conversion funnel | 30% trial-to-paid |
| **Referral program** | "Give 1 month, get 1 month" | 20% of new users |

**AI Allocation**:
- Gemini Flash: Bulk SEO article drafts (200+ topics)
- Gemini Pro: YouTube script writing, content strategy
- Claude Code: Blog post generation pipeline, email sequence authoring
- Human: CN social media (小红书/WeChat), community building

---

## 4) Technical Architecture Evolution

### Current State (v1)
```
Jekyll Static Site → Cloudflare Pages → Payhip Payment → Supabase Backend
```

### Target State (v2) — 6 months
```
Jekyll + Dynamic Islands → Cloudflare Pages + Workers
  ├── Supabase Auth + Postgres (identity, data)
  ├── Adaptive Exercise Engine (real-time difficulty adjustment)
  ├── Spaced Repetition Scheduler (review queue)
  ├── Report Generator (PDF + email)
  ├── Payhip Billing (subscription + one-time)
  └── Analytics Pipeline (Plausible + custom events)
```

### Target State (v3) — 18 months
```
Full SPA or Hybrid App (Astro/Next.js) → Cloudflare
  ├── Real-time Practice Mode (WebSocket for live sessions)
  ├── AI Tutor (Claude-powered hint system)
  ├── Parent Portal (separate login, CN-first)
  ├── Teacher Portal (class management, assignment setting)
  ├── Mobile PWA (offline-first practice)
  ├── Video Layer (embedded walkthroughs per question)
  └── Notification System (daily challenge push)
```

### Key Architecture Decisions Needed

| Decision | Options | Recommendation | Reason |
|----------|---------|----------------|--------|
| Frontend framework migration | Stay Jekyll / Move to Astro / Move to Next.js | **Astro** | Static-first with dynamic islands; incremental migration possible |
| Video hosting | YouTube embed / Cloudflare Stream / Bunny CDN | **YouTube embed** first, Cloudflare Stream later | Free to start; YouTube SEO bonus |
| Push notifications | Web Push API / Email-only / WeChat mini-program | **Email first**, Web Push v2 | Email works everywhere; push requires PWA |
| Parent portal | Same site / Separate subdomain | **Subdomain** (parents.25maths.com) | Cleaner UX; CN-first design |
| AI tutor | Claude API / Gemini API / Fine-tuned model | **Claude API** | Best at math reasoning; bilingual |

---

## 5) Revenue Model Evolution

### Phase 1: Current ($9.99/mo subscription + one-time products)
- Target: $500 MRR by month 6
- Source: Direct subscribers + exam prep bundle sales

### Phase 2: Multi-tier (6-12 months)

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 5 questions/day, basic progress view, 1 topic per board |
| **Student** | $9.99/mo | Unlimited practice, full analytics, weekly packs, study plans |
| **Student + Parent** | $14.99/mo | Everything above + parent dashboard (CN), monthly PDF reports |
| **School License** | $299/yr per class | Teacher dashboard, class analytics, assignment tools, bulk student accounts |

### Phase 3: Premium services (12-18 months)

| Service | Price | Description |
|---------|-------|-------------|
| **AI Tutor Sessions** | $2.99/session | 15-minute AI-powered tutoring on weak topics |
| **Exam Readiness Report** | $4.99/report | Comprehensive pre-exam analysis with personalized study plan |
| **1-on-1 Human Tutor** | $40/hour | Matched based on student's data profile |

### Revenue Projection

| Metric | Month 6 | Month 12 | Month 24 |
|--------|---------|----------|----------|
| Free users | 2,000 | 10,000 | 50,000 |
| Paid subscribers | 50 | 300 | 2,000 |
| School licenses | 0 | 5 | 30 |
| MRR | $500 | $4,000 | $30,000 |
| ARR | $6,000 | $48,000 | $360,000 |

---

## 6) Execution Roadmap

### NOW (Weeks 1-4): Gate B Closure + Content Pipeline Start

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create Payhip subscription product | Human | Product ID |
| Set Cloudflare env vars | Human | 4 vars configured |
| Replace {PRODUCT_ID} placeholders | Claude Code | 3 files updated |
| E2E webhook test | Claude Code | Test passes |
| Week 1 content pack (Algebra Foundations) | Gemini Pro + Human | PDF uploaded to Supabase |
| Upload Algebra Exam Prep to Payhip | Human | Product live at $8.99 |
| Upload Number Exam Prep to Payhip | Human | Product live |
| 5 SEO blog posts (top IGCSE topics) | Gemini Flash + Human | Published |

### QUARTER 2 (Months 2-3): Intelligence + Engagement Foundation

| Task | Owner | Deliverable |
|------|-------|-------------|
| Adaptive difficulty engine (v1) | Codex Backend | API + algorithm |
| Daily streak system | Codex Frontend | UI + persistence |
| Topic mastery heatmap | Codex Frontend | Visual component |
| Student weekly email report | Codex + Claude | Email pipeline |
| 20 more SEO articles | Gemini Flash | Published |
| Weeks 2-8 content packs | Gemini Pro + Human | 7 PDFs |
| XiaoHongShu channel launch | Human | 10 posts |
| Google Search Console + Plausible | Human | Analytics live |

### QUARTER 3 (Months 4-6): Parent Portal + Reporting

| Task | Owner | Deliverable |
|------|-------|-------------|
| Parent dashboard (CN-first) | Codex Frontend | parents.25maths.com |
| Monthly parent PDF report (bilingual) | Codex + Claude | Generator + template |
| Spaced repetition engine | Codex Backend | Scheduler + API |
| Predicted grade model (v1) | Codex + Gemini Pro | Algorithm + display |
| 50 video walkthroughs (top questions) | Human + AI script | YouTube + embedded |
| Referral program | Claude + Codex | "Give 1 month get 1 month" |
| School license MVP | Claude + Codex | Teacher dashboard |

### QUARTER 4 (Months 7-12): Scale + Differentiate

| Task | Owner | Deliverable |
|------|-------|-------------|
| AI Tutor (Claude-powered hints) | Claude Code + Codex | Interactive hint system |
| PWA / offline mode | Codex Frontend | Installable app |
| Exam readiness report | All | Pre-exam PDF product |
| Edexcel 4MA1 full content | Gemini + LaTeX pipeline | All topics covered |
| CIE 0606 Additional Maths | Gemini + LaTeX pipeline | New board |
| Teacher assignment system | Codex | Set homework, track completion |
| Astro migration (if needed) | Claude + Codex | Performance + DX upgrade |

---

## 7) Metrics That Matter

### North Star Metric: **Weekly Active Practicing Students (WAPS)**

A student who completes at least 5 questions in a week.

### Supporting Metrics

| Category | Metric | Target (12mo) |
|----------|--------|---------------|
| **Growth** | Monthly new signups | 2,000 |
| **Growth** | Organic search traffic | 20,000/mo |
| **Activation** | First exercise completion rate | >60% |
| **Retention** | 30-day retention (free) | >30% |
| **Retention** | 30-day retention (paid) | >80% |
| **Revenue** | MRR | $4,000 |
| **Revenue** | Trial-to-paid conversion | >15% |
| **Engagement** | Avg questions/student/week | 25 |
| **Engagement** | 7-day streak holders | 20% of active |
| **Content** | Subtopics with exercises | 400+ |
| **Content** | Blog posts indexed | 200+ |
| **Satisfaction** | NPS score | >50 |

---

## 8) What Makes Us Win: The Compounding Flywheel

```
More Content (LaTeX + AI)
    → Better SEO → More Free Users
        → More Practice Data
            → Better Personalization
                → Higher Retention → More Paid Users
                    → More Revenue → More Content Investment
                        → [REPEAT]

                    + Parent Reports (CN)
                        → Word of Mouth in Chinese Parent Communities
                            → More Users from Underserved Market
                                → [AMPLIFY]
```

The bilingual angle is the **wedge**: no competitor serves Chinese-speaking IGCSE families. Once we own that niche, we expand outward to the broader English-speaking IGCSE market with superior technology.

---

## 9) Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Save My Exams adds Chinese | High | Move fast; depth > breadth; parent portal is hard to replicate |
| Content quality inconsistent | High | Human review gate on all AI-generated content; error bounty |
| Supabase free tier limits | Medium | Monitor; upgrade at 50K rows; budget $25/mo |
| One-person operation bottleneck | High | Maximize AI automation; hire part-time CN content reviewer |
| Student data privacy (GDPR/COPPA) | High | Minimal PII collection; parental consent flow; privacy-by-design |
| Math errors in AI-generated content | Critical | Mandatory human verification; student error reporting button |

---

## 10) Decision Log for This Vision

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Target market entry point | Chinese IGCSE families | Underserved; high willingness to pay; word-of-mouth culture |
| Pricing anchor | $9.99-14.99/mo | Below Save My Exams, above free alternatives |
| Content production | AI-first with human QA | Scale matters; accuracy non-negotiable |
| Frontend strategy | Stay Jekyll now, evaluate Astro at Q4 | Don't rewrite what works; migrate when needed |
| Reporting as differentiator | Yes — parent reports in CN | No competitor does this; high perceived value |
| School market entry | Q3 (month 4-6) | Need student traction first to prove value |

---

*This document defines where we're going. CHIEF-ENGINEER-OPS-PLAN.md defines how we get there step by step. Both are living documents updated as we learn.*
