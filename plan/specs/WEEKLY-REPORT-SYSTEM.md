# Student Weekly Report System — Technical Specification

> Version: 1.0
> Created: 2026-02-27
> Owner: Claude Code Opus (Architecture) → Codex (Implementation)
> Status: Draft — awaiting approval

## 1. Overview

Automated weekly email reports sent to students (and optionally CC'd to parents/tutors) summarizing their practice activity, progress, and recommended next steps. Bilingual (EN/CN) support from day one.

## 2. Report Content

### Section 1: Weekly Summary Card

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Your Week in Numbers (Feb 20–27)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Practice Sessions:  8  (↑3 vs last week)
Questions Answered: 64
Accuracy Rate:      78% (↑5%)
Time Practiced:     2h 15m
Streak:             12 days 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 2: Topic Performance

```
📈 Topic Performance This Week
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Algebra       ████████░░ 82% ↑
Trigonometry  ██████░░░░ 61% ↓
Number        █████████░ 91% →
Geometry      ███████░░░ 72% ↑
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 3: Weak Points Focus

```
🎯 Areas to Focus On
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Trigonometry — Sine/Cosine rules
   5 mistakes this week (most frequent)
   → Practice now: [link]

2. Algebra — Quadratic factorisation
   3 mistakes this week
   → Practice now: [link]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 4: Achievement Progress

```
🏆 Achievements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New this week: "Week Warrior" 🔥 (7-day streak!)
Next unlock:  "Dedicated Learner" (32/50 sessions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 5: Recommended Action

```
📋 Your Plan for Next Week
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Complete 2 trigonometry sessions
□ Review sine/cosine rule method
□ Try 1 full past paper section
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Start Practice →]
```

## 3. Data Aggregation

### SQL Query: Weekly Stats

```sql
-- Weekly summary for a single user
WITH week_sessions AS (
    SELECT *
    FROM exercise_sessions
    WHERE user_id = $1
      AND started_at >= date_trunc('week', NOW() - INTERVAL '7 days')
      AND started_at < date_trunc('week', NOW())
      AND completed_at IS NOT NULL
),
week_attempts AS (
    SELECT qa.*
    FROM question_attempts qa
    JOIN week_sessions ws ON qa.session_id = ws.id
),
prev_week_sessions AS (
    SELECT *
    FROM exercise_sessions
    WHERE user_id = $1
      AND started_at >= date_trunc('week', NOW() - INTERVAL '14 days')
      AND started_at < date_trunc('week', NOW() - INTERVAL '7 days')
      AND completed_at IS NOT NULL
)
SELECT
    -- This week
    COUNT(DISTINCT ws.id) AS sessions_count,
    SUM(ws.question_count) AS questions_answered,
    ROUND(AVG(ws.score::NUMERIC / NULLIF(ws.question_count, 0) * 100), 1) AS accuracy_pct,
    SUM(ws.duration_seconds) AS total_seconds,

    -- Previous week (for comparison)
    (SELECT COUNT(*) FROM prev_week_sessions) AS prev_sessions_count,
    (SELECT ROUND(AVG(score::NUMERIC / NULLIF(question_count, 0) * 100), 1)
     FROM prev_week_sessions) AS prev_accuracy_pct,

    -- Topic breakdown
    (SELECT json_agg(topic_stats ORDER BY wrong_count DESC)
     FROM (
         SELECT
             SPLIT_PART(wa.skill_tag, '-', 1) AS topic_prefix,
             COUNT(*) FILTER (WHERE wa.is_correct) AS correct_count,
             COUNT(*) FILTER (WHERE NOT wa.is_correct) AS wrong_count,
             COUNT(*) AS total_count,
             ROUND(COUNT(*) FILTER (WHERE wa.is_correct)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 0) AS accuracy
         FROM week_attempts wa
         GROUP BY SPLIT_PART(wa.skill_tag, '-', 1)
     ) topic_stats
    ) AS topic_breakdown,

    -- Top mistakes
    (SELECT json_agg(mistake_stats ORDER BY mistake_count DESC LIMIT 3)
     FROM (
         SELECT
             wa.skill_tag,
             COUNT(*) AS mistake_count
         FROM week_attempts wa
         WHERE NOT wa.is_correct
         GROUP BY wa.skill_tag
         ORDER BY COUNT(*) DESC
     ) mistake_stats
    ) AS top_mistakes

FROM week_sessions ws;
```

### Query: Streak Data

```sql
SELECT
    current_streak,
    best_streak,
    total_active_days
FROM user_streaks
WHERE user_id = $1;
```

### Query: Recent Achievements

```sql
SELECT
    ad.title_en,
    ad.title_cn,
    ad.icon,
    ua.unlocked_at
FROM user_achievements ua
JOIN achievement_definitions ad ON ua.achievement_id = ad.id
WHERE ua.user_id = $1
  AND ua.unlocked_at >= NOW() - INTERVAL '7 days'
ORDER BY ua.unlocked_at DESC;
```

## 4. Email Delivery

### Option A: Supabase Edge Function + Resend (Recommended)

```
Cron (weekly, Sunday 8:00 UTC) →
  Supabase Edge Function →
    Query user data →
    Render template →
    Send via Resend API
```

**Why Resend:**
- Free tier: 3,000 emails/month (sufficient for MVP)
- API-first, easy integration from Edge Functions
- Custom domain sending (reports@25maths.com)
- Delivery analytics

### Option B: Cloudflare Workers + SendGrid

```
Cloudflare Cron Trigger (weekly) →
  Worker function →
    Query Supabase →
    Render template →
    Send via SendGrid
```

### Recommended: Option A

Supabase Edge Functions have direct DB access, reducing latency and complexity.

## 5. Email Template

### HTML Structure

{% raw %}
```html
<!DOCTYPE html>
<html lang="{{lang}}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        /* Inline styles for email client compatibility */
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white;
                   padding: 24px; border-radius: 12px 12px 0 0; }
        .card { background: #f9fafb; border: 1px solid #e5e7eb;
                border-radius: 8px; padding: 16px; margin: 12px 0; }
        .stat-row { display: flex; justify-content: space-between;
                    padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; }
        .progress-fill { height: 100%; background: #2563eb; border-radius: 4px; }
        .cta-button { display: inline-block; background: #2563eb; color: white;
                      padding: 12px 24px; border-radius: 8px; text-decoration: none;
                      font-weight: 600; }
        .trend-up { color: #059669; }
        .trend-down { color: #dc2626; }
        .trend-flat { color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 style="margin:0;font-size:20px;">{{greeting}}</h1>
            <p style="margin:8px 0 0;opacity:0.9;">{{date_range}}</p>
        </div>

        <!-- Weekly Summary -->
        <div class="card">
            <h2>{{summary_title}}</h2>
            {{#each stats}}
            <div class="stat-row">
                <span>{{label}}</span>
                <span><strong>{{value}}</strong> {{trend_arrow}}</span>
            </div>
            {{/each}}
        </div>

        <!-- Topic Performance -->
        <div class="card">
            <h2>{{topics_title}}</h2>
            {{#each topics}}
            <div style="margin:8px 0;">
                <div style="display:flex;justify-content:space-between;">
                    <span>{{name}}</span>
                    <span class="{{trend_class}}">{{accuracy}}% {{trend_arrow}}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:{{accuracy}}%"></div>
                </div>
            </div>
            {{/each}}
        </div>

        <!-- Weak Points -->
        <div class="card">
            <h2>{{focus_title}}</h2>
            {{#each weak_points}}
            <p><strong>{{rank}}. {{skill_name}}</strong> — {{mistake_count}} {{mistakes_label}}<br>
            <a href="{{practice_url}}">{{practice_label}} →</a></p>
            {{/each}}
        </div>

        <!-- CTA -->
        <div style="text-align:center;padding:24px 0;">
            <a href="https://www.25maths.com/cie0580/free/" class="cta-button">
                {{cta_text}}
            </a>
        </div>

        <!-- Footer -->
        <div style="text-align:center;color:#9ca3af;font-size:12px;padding:16px 0;">
            <p>{{footer_text}}</p>
            <a href="{{unsubscribe_url}}" style="color:#9ca3af;">{{unsubscribe_text}}</a>
        </div>
    </div>
</body>
</html>
```
{% endraw %}

## 6. Bilingual Support

### Language Selection

User's `profiles.preferred_lang` determines the email language. Default: `en`.

### String Table

| Key | EN | CN |
|-----|-----|-----|
| `greeting` | Your Weekly Progress Report | 你的每周学习报告 |
| `summary_title` | This Week's Numbers | 本周数据 |
| `sessions_label` | Practice Sessions | 练习次数 |
| `questions_label` | Questions Answered | 答题数量 |
| `accuracy_label` | Accuracy Rate | 正确率 |
| `time_label` | Time Practiced | 练习时长 |
| `streak_label` | Current Streak | 当前连续天数 |
| `topics_title` | Topic Performance | 各主题表现 |
| `focus_title` | Areas to Focus On | 需要加强的领域 |
| `mistakes_label` | mistakes this week | 本周错误次数 |
| `practice_label` | Practice now | 立即练习 |
| `cta_text` | Start This Week's Practice | 开始本周练习 |
| `footer_text` | You receive this because you are a 25Maths member. | 你收到此邮件是因为你是25Maths会员。 |
| `unsubscribe_text` | Unsubscribe from weekly reports | 取消订阅每周报告 |

## 7. Parent CC Feature

### Opt-in Flow

On the member dashboard, add a "Share with parent/tutor" card:

```
┌─────────────────────────────────────┐
│ 📧 Share Progress with Parent/Tutor │
│                                      │
│ Email: [parent@example.com      ]   │
│ Language: [EN ▼]                    │
│                                      │
│ [Save] [Remove]                     │
│                                      │
│ They will receive a copy of your    │
│ weekly report every Sunday.         │
└─────────────────────────────────────┘
```

### Database

```sql
ALTER TABLE profiles ADD COLUMN
    report_cc_email TEXT,
    report_cc_lang TEXT DEFAULT 'en' CHECK (report_cc_lang IN ('en', 'zh-CN')),
    weekly_report_enabled BOOLEAN DEFAULT TRUE;
```

### Parent Report Variant

The parent-facing email includes:
- All student data (same as student report)
- Comparison to "cohort average" (anonymized)
- Exam readiness indicator (% of syllabus practiced)
- Tone: informative, not judgmental

### Institution Variant (B2B)

For tutoring institutions (see B2B spec separately):
- Teacher receives aggregate report for all assigned students
- Highlights students who are falling behind
- Links to teacher dashboard

## 8. Sending Schedule

| Event | Trigger | Recipients |
|-------|---------|-----------|
| Weekly Report | Sunday 08:00 UTC (cron) | All members with `weekly_report_enabled = true` |
| Streak at Risk | Daily 20:00 UTC | Members with active streak who haven't practiced today |
| Achievement | Immediately after unlock | Student only (in-app toast, not email) |
| Inactivity nudge | After 7 days no activity | All registered users (max 1 per 30 days) |

## 9. Opt-out & Compliance

- One-click unsubscribe link in every email (CAN-SPAM / GDPR)
- `weekly_report_enabled` toggled via link (no login required, using signed token)
- Unsubscribe token: `HMAC-SHA256(user_id + 'unsubscribe', secret)`
- Physical address in footer (required by CAN-SPAM)
- Under-13 users: no email unless parent-provided (COPPA)

## 10. Metrics

| Metric | Target | Source |
|--------|--------|--------|
| Open rate | 35%+ | Resend analytics |
| Click-through (CTA) | 15%+ | UTM tracking |
| Unsubscribe rate | < 1% per month | Database |
| Return rate (users who practice within 24h of email) | 25%+ | Session data correlation |

## 11. Migration Plan

### Phase 1: Infrastructure
- [ ] Add `report_cc_email`, `report_cc_lang`, `weekly_report_enabled` to profiles
- [ ] Set up Resend account + verify domain (reports@25maths.com)
- [ ] Create Supabase Edge Function: `weekly-report-sender`

### Phase 2: Template
- [ ] Build HTML email template with Handlebars/Mustache
- [ ] Create bilingual string table
- [ ] Test rendering in Gmail, Outlook, Apple Mail, QQ Mail, 163 Mail

### Phase 3: Data Pipeline
- [ ] Implement weekly aggregation queries
- [ ] Cache weekly stats in a `user_weekly_snapshots` table for history
- [ ] Build parent CC logic

### Phase 4: Launch
- [ ] Enable for 10% of active users (canary)
- [ ] Monitor open rates and unsubscribes
- [ ] Roll out to 100%

## 12. Implementation Assignment

| Task | Assigned To |
|------|------------|
| Schema migration | Codex-Backend |
| Aggregation queries | Codex-Backend |
| Edge Function (sender) | Codex-Backend |
| HTML email template | Codex-Frontend |
| Bilingual strings | Claude Code Opus |
| Parent CC flow (dashboard UI) | Codex-Frontend |
| Email client testing | Gemini-QA |
| QQ Mail / 163 Mail compatibility | Gemini-QA |
