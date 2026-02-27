# Chief Engineer Operations Plan

> Created: 2026-02-27
> Author: Claude Opus (Chief Engineer role)
> Status: ACTIVE
> Scope: Full project orchestration — AI tool allocation, execution protocol, acceptance criteria

---

## 1) Project Status Snapshot (2026-02-27)

### Architecture

| Layer | Tech | Status |
|-------|------|--------|
| Static Site | Jekyll + Tailwind CSS CDN | Live |
| Hosting | Cloudflare Pages | Live |
| Payment | Payhip (5% fee) | Partial (free products live, subscription pending) |
| Identity | Supabase Auth | Code complete |
| Database | Supabase Postgres + RLS | Schema complete |
| API | Cloudflare Functions (19 files, ~3,200 LOC) | Code complete |
| Frontend JS | 9 member/exercise modules | Code complete |

### Gate Status

| Gate | Status | Blocking Items |
|------|--------|----------------|
| **A (Free MVP)** | PASS | None |
| **B (Paid MVP)** | IN PROGRESS | Payhip subscription product not created; Cloudflare env vars not set; `{PRODUCT_ID}` placeholders in 3 files |
| **C (Personalization)** | IN PROGRESS | Recommendation weight tuning; course-pack mapping |
| **D (Production Readiness)** | IN PROGRESS | E2E smoke test; rollback drill; exception injection |

### Workboard Status (from MEMBER-SYSTEM-WORKBOARD.md)

| Stream | Status | Notes |
|--------|--------|-------|
| W0 Orchestration | DONE | dispatch script operational |
| W1 Auth + Profile | DONE | Login, session, redirect all working |
| W2 Exercise Telemetry | DONE | session/attempt/complete API live |
| W3 Paid Model | DONE | membership_status/entitlements/RLS |
| W4 Webhook Sync | IN PROGRESS | Code done, needs live Payhip events |
| W5 Download Gateway | IN PROGRESS | Code done, needs live test |
| W6 Personalization | IN PROGRESS | First round done, weight tuning remaining |
| W7 Benefits/Coupons | IN PROGRESS | Trigger engine done, skill-tag mapping pending |
| W8 QA/Release Gate | IN PROGRESS | E2E script exists, full regression pending |

### Content Status

| Item | Status | Details |
|------|--------|---------|
| CIE 0580 Free Vocab (8 sets) | Live on Payhip | payhip.com/b/5j2Sz |
| Edexcel 4MA1 Free Vocab (6 sets) | Live on Payhip | payhip.com/b/JzU7h |
| Algebra Exam Prep Core v1.1.0 | PDF READY, not on Payhip | 86 pages, 533KB, $8.99, 195 drills + 30 worked examples |
| Number Exam Prep Core v1.0.0 | PDF READY, not on Payhip | 86 pages, 572KB |
| Functions Bundle | PDF exists (older format) | Needs review against new standard |
| Algebra supplementary products | Multiple exist | mastery-guide, worksheets, quick-ref, visual-notes, vocab-cards |
| Week 1 Subscription Pack (Algebra Foundations) | NOT created | Template defined in SUBSCRIPTION-PLAN.md |
| Weeks 2-8 Subscription Packs | NOT created | 8-week roadmap defined |
| 25Maths-4MA1 paid products | Infrastructure ready | 84% content reuse from CIE, 6 free products done |

---

## 2) AI Tool Inventory & Capability Matrix

### Available AI Engines

| Engine | Model | Access Method | Best For |
|--------|-------|---------------|----------|
| **Claude Code** | Opus 4.6 | CLI (current session) | Architecture, planning, complex multi-file edits, code review, document generation |
| **Codex** | GPT-5 | `codex exec` CLI | Backend/frontend implementation, iterative coding tasks |
| **Gemini Flash** | gemini-2.5-flash | `gemini` CLI | Fast QA checks, test matrix generation, exercise content QC |
| **Gemini Pro** | gemini-2.5-pro | `gemini` CLI | Architecture audit, risk analysis, design review |

### Claude Code Skills (Built-in)

| Skill | Trigger | Use Case |
|-------|---------|----------|
| `cie-0580-transcription` | Exam paper PDF -> LaTeX | Converting past papers for exercise bank |
| `specification-verify` | Format verification | Validating LaTeX command specs before writing docs |

### Existing Orchestration Infrastructure

| Script | Path | Purpose |
|--------|------|---------|
| `dispatch_member_agents.sh preflight` | scripts/member/ | Verify all tools available |
| `dispatch_member_agents.sh kickoff` | scripts/member/ | Launch 4 parallel agents (2 Codex + 2 Gemini) |
| `dispatch_member_agents.sh gate` | scripts/member/ | Sequential verification (build, syntax, DB, health) |
| `dispatch_member_agents.sh qa` | scripts/member/ | Health check runner |
| `e2e_payhip_flow.sh` | scripts/member/ | Webhook -> reconcile -> download E2E test |
| `sync_release_registry.js` | scripts/member/ | Sync releases.json -> release_registry.js |

---

## 3) Work Allocation: Which AI Does What

### Principle: Match task type to engine strength

```
Architecture / Planning / Orchestration  -> Claude Code (Opus)
Backend Implementation / Iterative Code  -> Codex (GPT-5)
Frontend Implementation                  -> Codex (GPT-5)
Architecture Audit / Risk Review         -> Gemini Pro
QA / Test Matrix / Content QC            -> Gemini Flash
Exercise Content Generation              -> Gemini Flash + Claude skills
LaTeX Content Production                 -> Claude Code + cie-0580-transcription
Document Authoring / Strategy            -> Claude Code (Opus)
Manual Operations (Payhip/Cloudflare)    -> Human
```

### Detailed Assignment Table

| Task ID | Task | Assigned To | Rationale |
|---------|------|-------------|-----------|
| T1 | Create Payhip subscription product | **Human** | Requires Payhip dashboard access |
| T2 | Set Cloudflare env vars | **Human** | Requires Cloudflare dashboard access |
| T3 | Replace `{PRODUCT_ID}` placeholders | **Claude Code** | Simple find-replace across 3 files once T1 done |
| T4 | Upload 3 paid bundles to Payhip | **Human** | Manual upload with product descriptions |
| T5 | Week 1 PDF content creation | **Gemini Pro** (draft) + **Human** (review) + **LaTeX** (compile) | Gemini drafts questions/solutions, human validates math accuracy |
| T6 | Upload Week 1 PDF to Supabase Storage | **Human** | Manual upload via Supabase dashboard |
| T7 | E2E webhook test | **Claude Code** orchestrating `e2e_payhip_flow.sh` | Needs env vars from T2 |
| T8 | Gate B closure verification | **Claude Code** + `dispatch gate` | Sequential build/syntax/DB checks |
| T9 | W6 recommendation weight tuning | **Codex** (backend) + **Gemini Pro** (review) | Iterative code + architecture review |
| T10 | W7 skill-tag coupon mapping | **Codex** (backend+frontend) | Implementation task |
| T11 | W8 rollback drill | **Gemini QA** (checklist) + **Human** (execute) | QA generates plan, human validates |
| T12 | Exception injection testing | **Gemini QA** (test cases) + **Codex** (test scripts) | QA designs, Codex implements |
| T13 | Weeks 2-8 subscription content | **Gemini Pro** (draft) + **Human** (review) | Ongoing weekly deliverable |
| T14 | Gemini interactive exercise generation | **Gemini Flash** via existing pipeline | Continue `orchestrate_gemini_exercise.py` |
| T15 | Production monitoring setup | **Claude Code** (plan) + **Human** (implement) | Plausible/Umami analytics |

---

## 4) Execution Phases & Acceptance Criteria

### Phase 1: Gate B Closure (CRITICAL PATH)

**Goal**: User can pay $9.99/mo and receive member benefits.

**Dependencies**: T1 -> T2 -> T3 -> T6 -> T7 -> T8

| Step | Action | Owner | Acceptance Criteria | Verification Method |
|------|--------|-------|--------------------|--------------------|
| 1.1 | Create Payhip subscription product | Human | Product ID obtained; webhook URLs configured | Screenshot of Payhip dashboard |
| 1.2 | Set Cloudflare env vars | Human | All 4 vars set in Production + Preview | Cloudflare dashboard screenshot |
| 1.3 | Replace `{PRODUCT_ID}` in code | Claude Code | `grep -r '{PRODUCT_ID}'` returns 0 matches | `grep` verification |
| 1.4 | Jekyll build passes | Claude Code | Exit code 0; `_site/subscription.html` contains `data-payhip-product` with real ID; no `{PRODUCT_ID}` in output | `bundle exec jekyll build && grep` |
| 1.5 | Upload Week 1 PDF | Human | File exists at `member-files/week01/algebra-foundations-pack.pdf` in Supabase Storage | Supabase dashboard check |
| 1.6 | E2E webhook test | Claude Code | `e2e_payhip_flow.sh` exits 0; membership_status updated; download URL returned | Script output log |
| 1.7 | Gate verification | Claude Code | `dispatch gate` all 5 checks green | Gate log files |

**Gate B Definition of Done**:
- [ ] Payhip checkout overlay opens from subscription.html
- [ ] Test purchase triggers webhook -> `payhip_event_log` written
- [ ] `membership_status` row created with status='active'
- [ ] `/membership/` shows member benefits after login
- [ ] `/api/v1/download/{release_id}?channel=member` returns signed URL
- [ ] Subscription cancellation updates status to 'cancelled'

### Phase 2: Content Pipeline (PARALLEL)

**Goal**: Sustainable weekly content delivery.

| Step | Action | Owner | Acceptance Criteria |
|------|--------|-------|---------------------|
| 2.1 | Define Week 1 question set | Gemini Pro + Human | 8-page PDF following SUBSCRIPTION-PLAN.md template |
| 2.2 | LaTeX compilation | Human + NZH-MathPrep | PDF compiles with no errors; <300KB |
| 2.3 | Math accuracy review | Human | All solutions verified correct |
| 2.4 | Upload to Supabase Storage | Human | File accessible via signed URL |
| 2.5 | Update releases.json if needed | Claude Code | Entry points to correct asset_key |
| 2.6 | Repeat for Weeks 2-8 | Pipeline | One pack per week |

**Content Pack Acceptance Criteria**:
- Follows 8-page template (overview, examples, practice A/B, challenge, answers, mistakes, checklist)
- Aligned to CIE 0580 syllabus
- Bilingual (EN primary, CN annotations)
- PDF < 300KB
- No mathematical errors

### Phase 3: Gate C Enhancement (AFTER Gate B)

**Goal**: Personalized learning recommendations work correctly.

| Step | Action | Owner | Acceptance Criteria |
|------|--------|-------|---------------------|
| 3.1 | Tune recommendation weights | Codex Backend | Recommendations change based on actual wrong-answer patterns |
| 3.2 | Course-pack skill-tag mapping | Codex Backend + Frontend | Benefits endpoint returns relevant offers based on skill_tag_prefixes |
| 3.3 | Architecture review | Gemini Pro | No critical risks identified |
| 3.4 | UX validation | Human | Member center shows meaningful, non-generic recommendations |

### Phase 4: Gate D Production Hardening (AFTER Gate C)

| Step | Action | Owner | Acceptance Criteria |
|------|--------|-------|---------------------|
| 4.1 | Full E2E smoke test | Gemini QA + Codex | Test matrix covers all 7 API endpoints + all event types |
| 4.2 | Exception injection | Gemini QA | Invalid token, expired entitlement, webhook replay all handled gracefully |
| 4.3 | Rollback drill | Human + Gemini QA | Can revert to pre-member-system state within documented steps |
| 4.4 | Monitoring setup | Human | Basic analytics live (page views, checkout clicks) |

### Phase 5: Commercial Expansion (ONGOING)

| Step | Action | Owner | Acceptance Criteria |
|------|--------|-------|---------------------|
| 5.1 | Upload 3 paid bundles to Payhip | Human | Products live with correct pricing |
| 5.2 | Update product page Payhip links | Claude Code | All `{PRODUCT_ID}` replaced on product pages |
| 5.3 | Edexcel 4MA1 paid products | Gemini Pro + LaTeX pipeline | 3 new bundles created |
| 5.4 | Interactive exercise expansion | Gemini Flash | More micro-topics covered |

---

## 5) Collaboration Protocol

### How AI Engines Interact

```
                    +-----------------+
                    |  Human (Owner)  |
                    | Manual ops,     |
                    | final approval  |
                    +--------+--------+
                             |
                    +--------v--------+
                    | Claude Code     |
                    | (Chief Engineer)|
                    | Plans, reviews, |
                    | orchestrates    |
                    +--+-----------+--+
                       |           |
              +--------v--+   +---v----------+
              | Codex      |   | Gemini       |
              | (GPT-5)    |   | (Flash/Pro)  |
              | Implements |   | Reviews, QA, |
              | code       |   | content gen  |
              +-----------+   +--------------+
```

### Handoff Protocol Between AI Engines

1. **Claude Code -> Codex**: Write a prompt file to `plan/member-agent-runs/<timestamp>/prompt-codex-*.txt` with exact file change plan. Codex outputs `.md` report + code.
2. **Claude Code -> Gemini**: Write a prompt file to `plan/member-agent-runs/<timestamp>/prompt-gemini-*.txt`. Gemini outputs review/test plan.
3. **Codex/Gemini -> Claude Code**: Output files reviewed by Claude Code for integration. Claude Code merges, resolves conflicts, runs gate verification.
4. **Any -> Human**: Decision points, manual operations, and final approvals escalated to human.

### Dispatch Commands Quick Reference

```bash
# Full parallel agent run (4 agents)
bash scripts/member/dispatch_member_agents.sh kickoff

# Gate verification (sequential, safe)
bash scripts/member/dispatch_member_agents.sh gate

# Health checks only
bash scripts/member/dispatch_member_agents.sh qa

# E2E Payhip flow test
BASE_URL="https://www.25maths.com" \
PAYHIP_API_KEY="<key>" \
CUSTOMER_EMAIL="test@example.com" \
PRODUCT_ID="<id>" \
bash scripts/member/e2e_payhip_flow.sh
```

---

## 6) Progress Tracking System

### Where Progress Is Recorded

| Document | Purpose | Update Frequency |
|----------|---------|-----------------|
| `plan/CHIEF-ENGINEER-OPS-PLAN.md` (this file) | Master orchestration plan | Per phase transition |
| `plan/MEMBER-SYSTEM-WORKBOARD.md` | Sprint-level stream board | Per work item completion |
| `plan/MEMBER-SYSTEM-COMMAND-CENTER.md` | Gate status + evidence trail | Per gate evidence |
| `plan/member-agent-runs/<timestamp>/` | Individual agent run logs | Per dispatch run |
| `scripts/member/dispatch_member_agents.selfheal.md` | Failure patterns + fixes | Per failure event |
| `DECISIONS.md` | Strategic/architectural decisions | Per decision |

### Status Update Protocol

After each significant action:

1. Update the relevant workboard stream status.
2. If a gate changes status, update COMMAND-CENTER gate snapshot.
3. If a new decision is made, prepend to DECISIONS.md.
4. If dispatch is run, logs auto-captured in `member-agent-runs/`.
5. This ops plan updated at phase boundaries.

---

## 7) Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Payhip webhook signature format changes | Gate B blocked | Low | Dual verification strategy already implemented (header + payload) |
| Supabase free tier limits reached | Service degraded | Medium | Monitor row counts; upgrade plan if >50K rows |
| Week 1 content delay | First subscriber gets nothing | High | Start content creation in parallel with Gate B; 7-day buffer after first sub |
| Bundler version mismatch blocks local build | Can't verify locally | Medium | Fix: `gem install bundler:2.7.1` or use Docker |
| `{PRODUCT_ID}` placeholders deployed to production | Checkout broken | High | Pre-deploy grep check in gate script |

---

## 8) Immediate Next Actions (Priority Order)

### For Human (You):
1. **Create Payhip subscription product** (Step 1 of Gate B plan)
2. **Set Cloudflare env vars** (Step 2 of Gate B plan)
3. **Fix bundler**: `gem install bundler:2.7.1`
4. Give Claude Code the Product ID to replace placeholders

### For Claude Code (Me):
1. Replace `{PRODUCT_ID}` once you provide the ID
2. Run gate verification
3. Orchestrate E2E test

### For Codex (Next dispatch):
1. W6 recommendation weight tuning
2. W7 skill-tag coupon mapping refinement

### For Gemini (Next dispatch):
1. Architecture audit of Gate B flow
2. QA test matrix for webhook/download paths
3. Begin Week 1 content draft (algebra foundations questions)

---

## 9) Long-Term Vision Roadmap

> Full strategic vision: `plan/NORTH-STAR-VISION.md`
> Goal: **#1 globally for IGCSE Mathematics preparation**

```
2026 Q1 (Now - Mar) — FOUNDATION
  [x] Free MVP (Gate A)
  [ ] Paid MVP (Gate B)           <- CURRENT FOCUS (code done, pending Payhip + env vars)
  [ ] First subscriber
  [ ] Week 1-4 content delivered
  [ ] 2 paid products on Payhip (Algebra $8.99, Number)
  [x] 5 SEO blog posts (EN)
  [x] 5 SEO blog posts (CN translations)
  [x] FAQ page (EN + CN)
  [x] Competitive intelligence report
  [x] Tutoring institution research
  [x] B2B pricing research

2026 Q2 (Apr - Jun) — INTELLIGENCE
  [ ] Gate C Personalization (partial: recommendation engine built, weight tuning remaining)
  [ ] Gate D Production Ready
  [x] Adaptive difficulty engine spec — plan/specs/ADAPTIVE-DIFFICULTY-ENGINE.md
  [x] Daily streak + gamification — IMPLEMENTED: streak_widget.js, achievement_toast.js, 5 API endpoints, 5 DB tables
  [x] Student weekly report API — IMPLEMENTED: functions/api/v1/reports/weekly.js
  [ ] Student weekly email delivery — template built, scheduled sending TBD
  [x] B2B institution platform MVP — IMPLEMENTED: landing page, teacher dashboard, assignments page, 6 DB tables
  [ ] Weeks 5-12 content delivered
  [ ] XiaoHongShu channel launch
  [ ] 50 subscribers + 3 institution beta partners

2026 Q3 (Jul - Sep) — REPORTING + B2B
  [x] Parent dashboard (EN) — IMPLEMENTED: membership/parent-dashboard.html
  [x] Parent dashboard (CN) — IMPLEMENTED: zh-cn/membership/parent-dashboard.html
  [x] Chinese parent landing page — IMPLEMENTED: zh-cn/parents.html
  [ ] Monthly bilingual PDF progress reports (data API done, PDF generation TBD)
  [ ] Spaced repetition engine
  [ ] Predicted grade model (v1) — spec in B2B doc §7
  [x] B2B teacher dashboard — IMPLEMENTED: institution/dashboard.html
  [x] B2B homework system — IMPLEMENTED: institution/assignments.html
  [x] Leaderboard — IMPLEMENTED: membership/leaderboard.html + API
  [x] Achievement gallery — IMPLEMENTED: membership/achievements.html
  [ ] B2B institution: 10 institutions, ¥36K MRR
  [ ] 50 video walkthroughs
  [ ] 150 subscribers target

2026 Q4 (Oct - Dec) — SCALE
  [ ] AI Tutor (Claude-powered hints)
  [ ] PWA / offline mode
  [ ] Edexcel 4MA1 full content
  [ ] CIE 0606 Additional Maths
  [ ] B2B: exam prediction + parent WeChat portal
  [ ] B2B institution: 25 institutions, ¥130K MRR
  [ ] 300 B2C subscribers, $4K MRR target
```

---

## 10) Technical Specifications Library

> All specs in `plan/specs/` — ready for implementation by Codex/Gemini

| Spec | File | Status | Target Phase |
|------|------|--------|-------------|
| Adaptive Difficulty Engine | `plan/specs/ADAPTIVE-DIFFICULTY-ENGINE.md` | Draft | Q2 Intelligence |
| Daily Streak & Achievement System | `plan/specs/STREAK-ACHIEVEMENT-SYSTEM.md` | Draft | Q2 Intelligence |
| Student Weekly Report System | `plan/specs/WEEKLY-REPORT-SYSTEM.md` | Draft | Q2 Intelligence |
| B2B Institution Platform (教培机构) | `plan/specs/B2B-INSTITUTION-PLATFORM.md` | Draft | Q3-Q4 |

---

## Appendix A: File Change Audit Trail

| Date | File | Change | By |
|------|------|--------|-----|
| 2026-02-27 | `subscription.html` | Added `payhip: true`; replaced waitlist form with Payhip checkout button | Claude Code |
| 2026-02-27 | `_data/releases.json` | Replaced demo draft with Week 1 active entry | Claude Code |
| 2026-02-27 | `functions/_lib/release_registry.js` | Synced with releases.json | Claude Code |
| 2026-02-27 | `plan/CHIEF-ENGINEER-OPS-PLAN.md` | Created master ops plan | Claude Code |
| 2026-02-27 | `plan/specs/ADAPTIVE-DIFFICULTY-ENGINE.md` | Created — Elo-based adaptive engine spec | Claude Code |
| 2026-02-27 | `plan/specs/STREAK-ACHIEVEMENT-SYSTEM.md` | Created — gamification system spec | Claude Code |
| 2026-02-27 | `plan/specs/WEEKLY-REPORT-SYSTEM.md` | Created — bilingual email report spec | Claude Code |
| 2026-02-27 | `plan/specs/B2B-INSTITUTION-PLATFORM.md` | Created — 教培机构 B2B platform spec | Claude Code |
| 2026-02-27 | `_posts/2026-02-27-igcse-maths-revision-strategy.md` | New SEO blog post | Claude Code |
| 2026-02-27 | `_posts/2026-02-27-cie0580-paper4-extended-tips.md` | New SEO blog post | Claude Code |
| 2026-02-27 | `_posts/2026-02-27-igcse-trigonometry-guide.md` | New SEO blog post | Claude Code |
| 2026-02-27 | `_posts/2026-02-27-igcse-percentage-problems.md` | New SEO blog post | Claude Code |
| 2026-02-27 | `_posts/2026-02-27-cie0580-vs-edexcel-4ma1.md` | New SEO blog post | Claude Code |
| 2026-02-27 | `sitemap.xml` | Added 5 new blog post entries | Claude Code |
| 2026-02-27 | `supabase/seed.demo_accounts.sql` | Demo student/teacher seed data with 30 days of sessions | Claude Code |
| 2026-02-27 | `scripts/seed_demo_accounts.js` | Node.js script to create demo auth users via Supabase Admin API | Claude Code |
| 2026-02-27 | `supabase/migrations/20260227000000_engagement_system.sql` | 5 new tables: user_streaks, user_daily_activity, achievement_definitions, user_achievements, user_xp | Claude Code |
| 2026-02-27 | `supabase/migrations/20260227010000_b2b_institution_tables.sql` | profiles extended + 6 B2B tables: institutions, members, classes, students, assignments, submissions | Claude Code |
| 2026-02-27 | `supabase/seed.achievement_definitions.sql` | 20 bilingual achievement definitions seed data | Claude Code |
| 2026-02-27 | `_posts/2026-02-27-zh-cn-*.md` (×5) | Chinese translations of all 5 English blog posts | Claude Code |
| 2026-02-27 | `institution/index.html` | B2B landing page with pricing tiers and pain points | Claude Code |
| 2026-02-27 | `institution/dashboard.html` | Teacher dashboard skeleton — stats, heatmap, at-risk, common mistakes | Claude Code |
| 2026-02-27 | `membership/index.html` | Added streak widget, XP bar, activity heatmap, achievement badges section | Claude Code |
| 2026-02-27 | `assets/js/streak_widget.js` | Streak/heatmap/XP rendering — fetches from user_streaks/user_daily_activity/user_xp/user_achievements | Claude Code |
| 2026-02-27 | `assets/js/achievement_toast.js` | Toast notification system for newly unlocked achievements + level ups | Claude Code |
| 2026-02-27 | `membership/achievements.html` | Full achievement gallery — category filters, XP summary, unlocked/locked grid | Claude Code |
| 2026-02-27 | `functions/api/v1/engagement/streak.js` | GET endpoint — returns streak data + 30-day calendar | Claude Code |
| 2026-02-27 | `functions/api/v1/engagement/achievements.js` | GET endpoint — returns unlocked/locked achievements + XP/level | Claude Code |
| 2026-02-27 | `functions/api/v1/engagement/check-achievements.js` | POST endpoint — evaluates criteria, unlocks new achievements, updates XP/streak | Claude Code |
| 2026-02-27 | `functions/_lib/supabase_server.js` | Added 10 engagement helper functions (fetch/upsert streak, XP, achievements, daily activity) | Claude Code |
| 2026-02-27 | `institution/assignments.html` | Teacher assignment management — create form, exercise selector, active/past lists | Claude Code |
| 2026-02-27 | `functions/api/v1/exercise/session/[id]/complete.js` | Integrated engagement processing — auto-updates streak/XP/achievements after session complete | Claude Code |
| 2026-02-27 | `assets/js/exercise_engine.js` | Added `dispatchEngagementEvents()` — dispatches `achievement-unlocked` and `streak-updated` CustomEvents | Claude Code |
| 2026-02-27 | `templates/emails/weekly-report.html` | Bilingual parent report email template — inline CSS, 5 sections, delta comparisons | Claude Code |
| 2026-02-27 | `functions/api/v1/engagement/freeze.js` | POST endpoint — streak freeze (paid members only) | Claude Code |
| 2026-02-27 | `_layouts/interactive_exercise.html` | Added `achievement_toast.js` script tag after `exercise_engine.js` | Claude Code |
| 2026-02-27 | `DECISIONS.md` | Added engagement full-chain implementation decision entry | Claude Code |
| 2026-02-27 | `plan/COMPETITIVE-INTELLIGENCE.md` | Full competitive intelligence report — 7 competitors, market data, bilingual gap analysis | Claude Code |
| 2026-02-27 | `zh-cn/parents.html` | Chinese parent landing page — WeChat/小红书 optimised, pain points, comparison table | Claude Code |
| 2026-02-27 | `sitemap.xml` | Added institution, parent-dashboard, zh-cn/parents entries; updated subscription.html date | Claude Code |
| 2026-02-27 | `functions/api/v1/reports/weekly.js` | GET endpoint — weekly report data aggregation (sessions, accuracy, topics, mistakes, achievements, XP) | Claude Code |
| 2026-02-27 | `assets/js/streak_widget.js` | Added `bindFreezeButton()` — wired freeze button click handler to `/api/v1/engagement/freeze` | Claude Code |
| 2026-02-27 | `membership/parent-dashboard.html` | Parent dashboard page — auth gate, summary cards, topic table, weak areas, recommendations | Claude Code |
| 2026-02-27 | `zh-cn/membership/parent-dashboard.html` | Chinese parent dashboard — full CN translation with topic name mapping | Claude Code |
| 2026-02-27 | `faq.html` | FAQ page — 11 questions, schema.org FAQPage structured data | Claude Code |
| 2026-02-27 | `zh-cn/faq.html` | Chinese FAQ page — 11 questions fully translated | Claude Code |
| 2026-02-27 | `functions/api/v1/engagement/leaderboard.js` | GET endpoint — top 20 by XP, anonymised display names, user rank | Claude Code |
| 2026-02-27 | `membership/leaderboard.html` | Weekly leaderboard page — medal icons, rank card, weekly stats table | Claude Code |
| 2026-02-27 | `_includes/head.html` | Enhanced OG meta — locale, default image fallback, twitter:image support | Claude Code |
| 2026-02-27 | `sitemap.xml` | Final update — added FAQ (EN+CN), leaderboard, zh-cn parent dashboard entries | Claude Code |
| 2026-02-27 | `plan/B2B-PRICING-RESEARCH.md` | B2B pricing research — 10 platforms (IXL, Sparx, Century, Mathspace, SME, RV, Squirrel, TAL, ClassIn, Quizlet) | Claude Code |
| 2026-02-27 | `membership/index.html` | Added quick-nav links to achievements, leaderboard, parent view, practice | Claude Code |
| 2026-02-27 | `_includes/footer.html` | Restructured columns: Platform (7 links) + Help & Info (7 links) — added FAQ, institution, parent dashboard, leaderboard | Claude Code |
| 2026-02-27 | `plan/TUTORING-INSTITUTION-RESEARCH.md` | Deep research — China/SE Asia tutoring market, 10 platform comparison, teacher needs, pricing models, WeChat requirements | Claude Code |
| 2026-02-27 | `plan/specs/WEEKLY-REPORT-SYSTEM.md` | Fixed Liquid warnings — wrapped Handlebars email template in raw/endraw tags | Claude Code |
| 2026-02-27 | `plan/CHIEF-ENGINEER-OPS-PLAN.md` §9 | Updated roadmap — marked completed Q2/Q3 items (streak, parent dashboard, B2B, FAQ, leaderboard, blog posts, research reports) | Claude Code |
| 2026-02-27 | `functions/_lib/supabase_server.js` | Exported `serviceHeaders()` function for shared use across API endpoints | Claude Code |
| 2026-02-27 | `functions/api/v1/engagement/leaderboard.js` | Removed duplicate `serviceHeaders()` — now imports from `supabase_server.js` | Claude Code |
| 2026-02-27 | `functions/api/v1/reports/weekly.js` | Removed duplicate `serviceHeaders()` — now imports from `supabase_server.js` | Claude Code |
| 2026-02-27 | `_includes/head.html` | Added hreflang alternate link tags for bilingual pages using `lang_links` frontmatter | Claude Code |
| 2026-02-27 | `institution/index.html` | Added schema.org SoftwareApplication JSON-LD structured data with pricing tiers | Claude Code |

---

*This document is the single source of truth for project orchestration. All phase transitions, gate changes, and strategic decisions should be reflected here.*
