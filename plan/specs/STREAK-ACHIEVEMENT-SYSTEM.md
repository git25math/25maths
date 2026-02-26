# Daily Streak & Achievement System — Technical Specification

> Version: 1.0
> Created: 2026-02-27
> Owner: Claude Code Opus (Architecture) → Codex (Implementation)
> Status: Draft — awaiting approval

## 1. Problem Statement

The current member dashboard shows **session counts and weak skills**, but provides no **daily engagement incentive** or **milestone recognition**. Students have no reason to return daily — the system records what they did but never celebrates or rewards consistency.

### Competitive Context

| Platform | Gamification Features |
|----------|----------------------|
| Duolingo | Daily streaks, XP, leagues, hearts, streak freeze |
| Seneca | Streaks, study sessions goal, progress percentages |
| Khan Academy | Points, badges, mastery progress, streak |
| 25Maths (current) | None |

## 2. Feature Design

### 2.1 Daily Streak

**Definition**: A streak day is counted when a user completes **at least 1 exercise session** (≥5 questions answered) in a calendar day (UTC).

**Mechanics**:
- Streak increments by 1 each qualifying day
- Streak resets to 0 if a day is missed (no qualifying activity)
- **Streak Freeze**: Paid members get 1 free freeze per 7-day period (preserves streak on missed day)
- **Streak Recovery**: Within 24 hours of breaking, user can "recover" streak by completing 2x sessions (paid members only)
- Streak milestones trigger achievements (see §2.2)

**Display**:
- Fire icon (🔥) with day count on member dashboard header
- Streak calendar (heatmap) showing last 30 days
- "Current streak" vs "Best streak" comparison

### 2.2 Achievement System

**Achievement Categories**:

| Category | Examples | Icon Theme |
|----------|----------|------------|
| Streak | 3-day, 7-day, 14-day, 30-day, 60-day, 100-day | 🔥 Fire stages |
| Volume | 10 sessions, 50, 100, 500, 1000 | 📚 Book stages |
| Accuracy | 80%+ on 5 sessions, 90%+ on 10 sessions | 🎯 Target stages |
| Mastery | Complete all questions in a topic, master a chapter | ⭐ Star stages |
| Speed | Finish 10-question session in <5 min with 80%+ | ⚡ Lightning |
| Improvement | Improve accuracy 20%+ on a weak skill | 📈 Growth |
| Explorer | Practice in 5 different topics, 10 topics, all topics | 🗺️ Map |

**Achievement Tiers**: Bronze → Silver → Gold → Diamond

**Achievement Properties**:
- `id`: Unique identifier
- `title`: Display name (EN + CN)
- `description`: How to earn it
- `icon`: Emoji or SVG reference
- `tier`: bronze/silver/gold/diamond
- `category`: streak/volume/accuracy/mastery/speed/improvement/explorer
- `criteria`: JSON rule object
- `xp_reward`: Points awarded on unlock
- `is_secret`: Hidden until unlocked (surprise achievements)

### 2.3 XP (Experience Points)

Simple point system that accumulates:

| Action | XP |
|--------|-----|
| Complete a session | 10 |
| Perfect score (100%) | +25 bonus |
| Streak day maintained | 5 |
| Achievement unlocked | 15–100 (varies by tier) |
| Practice a weak skill | +5 bonus |

**Levels** (thresholds):

| Level | Title | XP Required | Cumulative |
|-------|-------|-------------|------------|
| 1 | Beginner | 0 | 0 |
| 2 | Learner | 50 | 50 |
| 3 | Practitioner | 150 | 200 |
| 4 | Achiever | 300 | 500 |
| 5 | Scholar | 500 | 1,000 |
| 6 | Expert | 1,000 | 2,000 |
| 7 | Master | 2,000 | 4,000 |
| 8 | Grandmaster | 4,000 | 8,000 |
| 9 | Legend | 8,000 | 16,000 |
| 10 | IGCSE Champion | 16,000 | 32,000 |

## 3. Database Schema

### 3.1 `user_streaks` Table

```sql
CREATE TABLE user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,

    current_streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    -- Calendar date (UTC) of last qualifying activity

    freeze_available BOOLEAN DEFAULT FALSE,
    freeze_used_at DATE,
    -- When the last freeze was consumed

    total_active_days INTEGER DEFAULT 0,
    -- Lifetime count of qualifying days

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their streak" ON user_streaks
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### 3.2 `user_daily_activity` Table

```sql
CREATE TABLE user_daily_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    activity_date DATE NOT NULL,
    -- Calendar date (UTC)

    sessions_completed INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    skills_practiced TEXT[] DEFAULT '{}',

    qualifies_for_streak BOOLEAN GENERATED ALWAYS AS (
        sessions_completed >= 1 AND questions_answered >= 5
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, activity_date)
);

CREATE INDEX idx_uda_user_date ON user_daily_activity(user_id, activity_date DESC);

ALTER TABLE user_daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their activity" ON user_daily_activity
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### 3.3 `achievement_definitions` Table

```sql
CREATE TABLE achievement_definitions (
    id TEXT PRIMARY KEY,
    -- e.g., "streak-7", "volume-100", "accuracy-90-10"

    title_en TEXT NOT NULL,
    title_cn TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_cn TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🏆',
    tier TEXT NOT NULL CHECK (tier IN ('bronze','silver','gold','diamond')),
    category TEXT NOT NULL CHECK (category IN (
        'streak','volume','accuracy','mastery','speed','improvement','explorer'
    )),
    criteria JSONB NOT NULL,
    -- e.g., {"type":"streak","min_days":7}
    -- e.g., {"type":"accuracy","min_pct":90,"min_sessions":10}

    xp_reward INTEGER NOT NULL DEFAULT 15,
    is_secret BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 `user_achievements` Table

```sql
CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    achievement_id TEXT REFERENCES achievement_definitions NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    notified BOOLEAN DEFAULT FALSE,
    -- Whether the user has seen the unlock toast

    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_ua_user ON user_achievements(user_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### 3.5 `user_xp` Table

```sql
CREATE TABLE user_xp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,

    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    -- Computed from total_xp thresholds

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their xp" ON user_xp
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

## 4. API Endpoints

### 4.1 `GET /api/v1/engagement/streak`

Returns current streak status for the authenticated user.

```json
{
    "current_streak": 12,
    "best_streak": 23,
    "last_active_date": "2026-02-26",
    "today_qualifies": false,
    "freeze_available": true,
    "total_active_days": 45,
    "calendar": [
        {"date": "2026-02-27", "active": false, "sessions": 0},
        {"date": "2026-02-26", "active": true, "sessions": 2},
        ...
    ]
}
```

### 4.2 `POST /api/v1/engagement/streak/freeze`

Uses a streak freeze for today (if available).

```json
{
    "success": true,
    "streak_preserved": 12,
    "next_freeze_available_at": "2026-03-05"
}
```

### 4.3 `GET /api/v1/engagement/achievements`

Returns all achievements and user's progress.

```json
{
    "unlocked": [
        {
            "id": "streak-7",
            "title": "Week Warrior",
            "icon": "🔥",
            "tier": "bronze",
            "unlocked_at": "2026-02-20T10:30:00Z"
        }
    ],
    "locked": [
        {
            "id": "streak-30",
            "title": "Monthly Maven",
            "icon": "🔥",
            "tier": "silver",
            "progress": {"current": 12, "target": 30, "pct": 40}
        }
    ],
    "total_xp": 340,
    "level": 4,
    "level_title": "Achiever",
    "xp_to_next_level": 160
}
```

### 4.4 `POST /api/v1/engagement/check-achievements` (Internal)

Called after each session completion to evaluate and unlock new achievements.
Returns newly unlocked achievements for toast notifications.

```json
{
    "newly_unlocked": [
        {
            "id": "volume-50",
            "title": "Dedicated Learner",
            "icon": "📚",
            "tier": "silver",
            "xp_earned": 30
        }
    ],
    "xp_earned_total": 45,
    "level_up": false
}
```

## 5. Frontend Integration

### 5.1 Streak Widget (Dashboard Header)

Location: `membership/index.html` — top of dashboard

```html
<div id="streak-widget" class="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 mb-6">
    <div class="text-4xl" id="streak-icon">🔥</div>
    <div>
        <div class="text-2xl font-bold text-orange-700">
            <span id="streak-count">12</span> day streak
        </div>
        <div class="text-sm text-orange-600">
            Best: <span id="streak-best">23</span> days
            · <span id="streak-status">Practice today to keep it going!</span>
        </div>
    </div>
    <div id="streak-freeze-btn" class="ml-auto hidden">
        <button class="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            ❄️ Use Freeze
        </button>
    </div>
</div>
```

### 5.2 Activity Heatmap (30-Day Calendar)

Location: Below streak widget

```html
<div id="activity-heatmap" class="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">Last 30 Days</h3>
    <div class="grid grid-cols-7 gap-1" id="heatmap-grid">
        <!-- 30 cells, colored by activity intensity -->
        <!-- gray-100: no activity, green-200: 1 session, green-400: 2-3, green-600: 4+ -->
    </div>
    <div class="flex justify-between text-xs text-gray-400 mt-2">
        <span>Less</span>
        <div class="flex gap-1">
            <span class="w-3 h-3 bg-gray-100 rounded-sm"></span>
            <span class="w-3 h-3 bg-green-200 rounded-sm"></span>
            <span class="w-3 h-3 bg-green-400 rounded-sm"></span>
            <span class="w-3 h-3 bg-green-600 rounded-sm"></span>
        </div>
        <span>More</span>
    </div>
</div>
```

### 5.3 Achievement Unlock Toast

Shown after session completion when new achievement unlocked:

```html
<div id="achievement-toast" class="fixed bottom-6 right-6 z-50 hidden
    bg-white border-2 border-yellow-400 rounded-2xl shadow-xl p-5
    transform translate-y-4 opacity-0 transition-all duration-500">
    <div class="flex items-center gap-4">
        <div class="text-5xl animate-bounce" id="toast-icon">🏆</div>
        <div>
            <div class="text-xs font-semibold text-yellow-600 uppercase tracking-wide">
                Achievement Unlocked!
            </div>
            <div class="text-lg font-bold text-gray-900" id="toast-title">
                Week Warrior
            </div>
            <div class="text-sm text-gray-500" id="toast-xp">
                +30 XP
            </div>
        </div>
    </div>
</div>
```

### 5.4 XP & Level Bar

Location: Dashboard sidebar or header

```html
<div id="xp-bar" class="flex items-center gap-3">
    <div class="text-sm font-semibold text-purple-700">
        Lv.<span id="user-level">4</span>
    </div>
    <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div id="xp-progress" class="h-full bg-purple-500 rounded-full transition-all duration-700"
             style="width: 68%"></div>
    </div>
    <div class="text-xs text-gray-500">
        <span id="xp-current">340</span> / <span id="xp-next">500</span> XP
    </div>
</div>
```

### 5.5 Achievement Gallery Page

New page: `/membership/achievements.html`

Displays all achievements in a grid, with unlocked ones highlighted and locked ones grayed with progress bars.

## 6. Achievement Evaluation Logic

### Server-Side Check (called after session complete)

```javascript
async function evaluateAchievements(userId, sessionData) {
    const newlyUnlocked = [];

    // Fetch current state
    const streak = await getStreak(userId);
    const stats = await getUserStats(userId);
    const existing = await getUnlockedAchievements(userId);
    const definitions = await getActiveDefinitions();

    for (const def of definitions) {
        if (existing.includes(def.id)) continue; // Already unlocked

        const met = checkCriteria(def.criteria, { streak, stats, sessionData });
        if (met) {
            await unlockAchievement(userId, def.id);
            await addXP(userId, def.xp_reward);
            newlyUnlocked.push(def);
        }
    }

    return newlyUnlocked;
}

function checkCriteria(criteria, context) {
    switch (criteria.type) {
        case 'streak':
            return context.streak.current_streak >= criteria.min_days;
        case 'volume':
            return context.stats.total_sessions >= criteria.min_sessions;
        case 'accuracy':
            return context.stats.sessions_above_pct(criteria.min_pct) >= criteria.min_sessions;
        case 'mastery':
            return context.stats.topics_completed.includes(criteria.topic_id);
        case 'speed':
            return context.sessionData.duration_seconds <= criteria.max_seconds
                && context.sessionData.accuracy >= criteria.min_pct;
        case 'improvement':
            return context.stats.skill_improvement(criteria.skill_tag) >= criteria.min_delta;
        case 'explorer':
            return context.stats.distinct_topics >= criteria.min_topics;
        default:
            return false;
    }
}
```

### Streak Update Logic (called after session complete)

```javascript
async function updateStreak(userId) {
    const today = new Date().toISOString().slice(0, 10); // UTC date
    const streak = await getOrCreateStreak(userId);
    const activity = await getDailyActivity(userId, today);

    if (!activity.qualifies_for_streak) return streak;
    if (streak.last_active_date === today) return streak; // Already counted

    const yesterday = subtractDays(today, 1);

    if (streak.last_active_date === yesterday) {
        // Consecutive day
        streak.current_streak += 1;
    } else if (streak.freeze_available && streak.last_active_date === subtractDays(today, 2)) {
        // Freeze covers the gap
        streak.current_streak += 1;
        streak.freeze_available = false;
        streak.freeze_used_at = yesterday;
    } else {
        // Streak broken
        streak.current_streak = 1;
    }

    streak.last_active_date = today;
    streak.best_streak = Math.max(streak.best_streak, streak.current_streak);
    streak.total_active_days += 1;

    // Replenish freeze every 7 streak days
    if (streak.current_streak % 7 === 0) {
        streak.freeze_available = true;
    }

    await saveStreak(userId, streak);
    return streak;
}
```

## 7. Seed Data: Achievement Definitions

```sql
INSERT INTO achievement_definitions (id, title_en, title_cn, description_en, description_cn, icon, tier, category, criteria, xp_reward, sort_order) VALUES
-- Streak achievements
('streak-3', '3-Day Streak', '三天连续', 'Practice 3 days in a row', '连续练习3天', '🔥', 'bronze', 'streak', '{"type":"streak","min_days":3}', 15, 1),
('streak-7', 'Week Warrior', '一周勇士', 'Practice 7 days in a row', '连续练习7天', '🔥', 'bronze', 'streak', '{"type":"streak","min_days":7}', 30, 2),
('streak-14', 'Fortnight Fighter', '两周战士', 'Practice 14 days in a row', '连续练习14天', '🔥', 'silver', 'streak', '{"type":"streak","min_days":14}', 50, 3),
('streak-30', 'Monthly Maven', '月度达人', 'Practice 30 days in a row', '连续练习30天', '🔥', 'gold', 'streak', '{"type":"streak","min_days":30}', 100, 4),
('streak-100', 'Century Club', '百日突破', 'Practice 100 days in a row', '连续练习100天', '🔥', 'diamond', 'streak', '{"type":"streak","min_days":100}', 250, 5),

-- Volume achievements
('volume-10', 'Getting Started', '初出茅庐', 'Complete 10 practice sessions', '完成10次练习', '📚', 'bronze', 'volume', '{"type":"volume","min_sessions":10}', 15, 10),
('volume-50', 'Dedicated Learner', '勤学好问', 'Complete 50 practice sessions', '完成50次练习', '📚', 'silver', 'volume', '{"type":"volume","min_sessions":50}', 30, 11),
('volume-100', 'Century Practitioner', '百炼成钢', 'Complete 100 practice sessions', '完成100次练习', '📚', 'gold', 'volume', '{"type":"volume","min_sessions":100}', 75, 12),
('volume-500', 'Relentless', '坚持不懈', 'Complete 500 practice sessions', '完成500次练习', '📚', 'diamond', 'volume', '{"type":"volume","min_sessions":500}', 200, 13),

-- Accuracy achievements
('accuracy-80-5', 'Sharp Shooter', '神射手', 'Score 80%+ on 5 sessions', '5次练习得分超过80%', '🎯', 'bronze', 'accuracy', '{"type":"accuracy","min_pct":80,"min_sessions":5}', 20, 20),
('accuracy-90-10', 'Precision Player', '精准玩家', 'Score 90%+ on 10 sessions', '10次练习得分超过90%', '🎯', 'silver', 'accuracy', '{"type":"accuracy","min_pct":90,"min_sessions":10}', 50, 21),
('accuracy-100-5', 'Perfectionist', '完美主义者', 'Score 100% on 5 sessions', '5次练习满分', '🎯', 'gold', 'accuracy', '{"type":"accuracy","min_pct":100,"min_sessions":5}', 100, 22),

-- Explorer achievements
('explorer-5', 'Curious Mind', '好奇宝宝', 'Practice in 5 different topics', '练习5个不同主题', '🗺️', 'bronze', 'explorer', '{"type":"explorer","min_topics":5}', 20, 30),
('explorer-15', 'Wide Learner', '博学多才', 'Practice in 15 different topics', '练习15个不同主题', '🗺️', 'silver', 'explorer', '{"type":"explorer","min_topics":15}', 50, 31),
('explorer-all', 'Completionist', '全能选手', 'Practice every available topic', '练习所有可用主题', '🗺️', 'diamond', 'explorer', '{"type":"explorer","min_topics":999}', 300, 32),

-- Speed achievements
('speed-5min', 'Quick Thinker', '思维敏捷', 'Complete a session in under 5 minutes with 80%+', '5分钟内完成练习且正确率80%+', '⚡', 'silver', 'speed', '{"type":"speed","max_seconds":300,"min_pct":80}', 40, 40),

-- Improvement achievements
('improve-20', 'Comeback Kid', '逆袭达人', 'Improve accuracy by 20%+ on a previously weak skill', '在薄弱技能上提高20%+正确率', '📈', 'gold', 'improvement', '{"type":"improvement","min_delta":20}', 75, 50);
```

## 8. Integration with Existing System

### Trigger Points

1. **Session Complete** (`POST /api/v1/exercise/session/[id]/complete`)
   - Update `user_daily_activity` (upsert for today)
   - Call `updateStreak(userId)`
   - Call `evaluateAchievements(userId, sessionData)`
   - Return new achievements + streak info in response

2. **Dashboard Load** (`member_center.js`)
   - Fetch streak via `GET /api/v1/engagement/streak`
   - Fetch achievements via `GET /api/v1/engagement/achievements`
   - Render streak widget + heatmap + XP bar

3. **Exercise Complete Screen** (`exercise_engine.js`)
   - After cloud session complete, check response for `newly_unlocked`
   - Show achievement toast if any

### Event Flow

```
Session Complete →
  ├── [existing] Update exercise_sessions
  ├── [new] Upsert user_daily_activity
  ├── [new] Update user_streaks
  ├── [new] Evaluate achievement_definitions
  ├── [new] Insert user_achievements (if any)
  ├── [new] Update user_xp
  └── Return: { session_summary, streak, newly_unlocked, xp_earned }
```

## 9. Migration Strategy

### Phase 1: Schema (Day 1)
- [ ] Create all 5 new tables with RLS
- [ ] Insert achievement seed data
- [ ] Backfill `user_daily_activity` from existing `exercise_sessions`
- [ ] Backfill `user_streaks` from `user_daily_activity`
- [ ] Backfill `user_xp` from historical session counts

### Phase 2: Backend (Day 2–3)
- [ ] Implement streak update logic in session complete handler
- [ ] Implement achievement evaluation engine
- [ ] Create engagement API endpoints (4 endpoints)
- [ ] Add streak/achievement data to session complete response

### Phase 3: Frontend (Day 4–5)
- [ ] Add streak widget to member dashboard
- [ ] Add activity heatmap component
- [ ] Add XP bar to dashboard
- [ ] Add achievement unlock toast to exercise engine
- [ ] Create achievements gallery page

### Phase 4: Polish (Day 6–7)
- [ ] Animations (streak fire animation, toast slide-in, XP bar fill)
- [ ] Sound effects (optional, off by default)
- [ ] Email notification for streak at risk (if opted in)
- [ ] QA: edge cases (timezone, multiple sessions, streak freeze)

## 10. Implementation Assignment

| Task | Assigned To | File |
|------|------------|------|
| Migration SQL | Codex-Backend | `supabase/migrations/20260305_engagement_system.sql` |
| Streak logic | Codex-Backend | `functions/_lib/streak_engine.js` |
| Achievement evaluator | Codex-Backend | `functions/_lib/achievement_engine.js` |
| Engagement endpoints | Codex-Backend | `functions/api/v1/engagement/*.js` |
| Session complete integration | Codex-Backend | `functions/api/v1/exercise/session/[id]/complete.js` |
| Streak widget | Codex-Frontend | `assets/js/streak_widget.js` |
| Heatmap component | Codex-Frontend | `assets/js/activity_heatmap.js` |
| Achievement toast | Codex-Frontend | `assets/js/achievement_toast.js` |
| Achievements page | Codex-Frontend | `membership/achievements.html` |
| QA & edge cases | Gemini-QA | Test scenarios document |
