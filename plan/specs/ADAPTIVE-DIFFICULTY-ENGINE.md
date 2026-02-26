# Adaptive Difficulty Engine — Technical Specification

> Version: 1.0
> Created: 2026-02-27
> Owner: Claude Code Opus (Architecture) → Codex (Implementation)
> Status: Draft — awaiting approval

## 1. Problem Statement

The current exercise system serves questions in **fixed linear order** with **no difficulty metadata**. All students get the same questions in the same sequence regardless of ability. This creates two failure modes:

1. **Boredom** — Strong students waste time on trivially easy questions
2. **Frustration** — Weaker students hit walls of questions beyond their current level

### Current Architecture Gaps

| Component | Current State | Required State |
|-----------|--------------|----------------|
| Question difficulty | Not tracked | 1.0–5.0 scale per question |
| Question sequencing | Fixed array order | Adaptive selection |
| Time per question | Not tracked | Measured and stored |
| User ability estimate | Not modeled | Elo/IRT theta per skill |
| Next-question API | Does not exist | New endpoint |
| Mistake categorization | binary correct/wrong | correct/careless/conceptual/computational |

## 2. Algorithm Design

### 2.1 Difficulty Rating System

Each question gets a **difficulty score** on a 1.0–5.0 continuous scale:

| Band | Label | Description | Target Accuracy |
|------|-------|-------------|-----------------|
| 1.0–1.9 | Recall | Direct formula application | 85–95% |
| 2.0–2.9 | Apply | Single-step reasoning | 70–85% |
| 3.0–3.9 | Analyze | Multi-step with setup | 50–70% |
| 4.0–4.9 | Evaluate | Non-routine problems | 30–50% |
| 5.0 | Create | Novel combinations | 15–30% |

### 2.2 Initial Difficulty Assignment

Questions are tagged by **two methods** (in priority order):

1. **Empirical** — After 30+ attempts, use actual correct-rate to calibrate:
   ```
   difficulty = 5.0 - (correct_rate * 4.0)
   ```
   (100% correct → 1.0, 0% correct → 5.0)

2. **Heuristic** — Before 30 attempts, assign based on:
   - Tier: Core/Foundation → base 1.5, Extended/Higher → base 3.0
   - Position in topic: first third → -0.5, last third → +0.5
   - Number of reasoning steps (from question text analysis)
   - Presence of "show that" / "explain" / "prove" → +1.0

### 2.3 User Ability Estimation (Simplified Elo)

Each user has a **per-skill ability score** (θ):

```
Initial θ = 2.5 (mid-range)

After each attempt:
  expected = 1 / (1 + 10^((question_difficulty - θ) / 2))
  actual = 1 if correct, 0 if wrong
  θ_new = θ + K * (actual - expected)

where K = 0.4 (early, < 20 attempts) or 0.2 (stable, ≥ 20 attempts)
```

This is a simplified Elo-style update that:
- Rewards correct answers on hard questions more
- Penalizes wrong answers on easy questions more
- Converges toward true ability after ~15 questions

### 2.4 Question Selection Algorithm

When the user requests the next question:

```python
def select_next_question(user_theta, available_questions, history):
    # Target: questions where expected accuracy ≈ 70% (optimal learning zone)
    target_difficulty = user_theta + 0.5  # slightly above current ability

    # Filter out recently-seen questions (last 7 days)
    candidates = [q for q in available_questions
                  if q.id not in recent_ids(history, days=7)]

    # Score each candidate
    for q in candidates:
        distance = abs(q.difficulty - target_difficulty)
        recency_bonus = 0.3 if q.skill_tag in weak_skills else 0
        q.selection_score = -distance + recency_bonus

    # Weighted random from top 5 (avoid always picking same question)
    top5 = sorted(candidates, key=lambda q: q.selection_score)[:5]
    return weighted_random_choice(top5)
```

Key principles:
- Target the **zone of proximal development** (70% expected accuracy)
- Prioritize weak skills identified by error tracking
- Avoid repeating recently-seen questions
- Include randomness to prevent predictability

### 2.5 Session Difficulty Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `adaptive` | Algorithm selects difficulty dynamically | Default for logged-in users |
| `fixed-easy` | Only difficulty 1.0–2.5 | Confidence building |
| `fixed-medium` | Only difficulty 2.0–3.5 | Standard practice |
| `fixed-hard` | Only difficulty 3.0–5.0 | Exam preparation |
| `linear` | Original fixed order | Fallback / anonymous users |

## 3. Database Schema Changes

### 3.1 New Table: `question_metadata`

```sql
CREATE TABLE question_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id TEXT NOT NULL UNIQUE,
    -- Format: "{exercise_slug}:{question_index}"
    -- Example: "cie0580-algebra-c2-c2-01:3"

    exercise_slug TEXT NOT NULL,
    question_index INTEGER NOT NULL,

    -- Difficulty
    difficulty_heuristic NUMERIC(2,1) NOT NULL DEFAULT 2.5,
    difficulty_empirical NUMERIC(2,1),
    difficulty_final NUMERIC(2,1) GENERATED ALWAYS AS (
        COALESCE(difficulty_empirical, difficulty_heuristic)
    ) STORED,

    -- Statistics
    total_attempts INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    avg_time_seconds NUMERIC(6,1),

    -- Classification
    cognitive_level TEXT CHECK (cognitive_level IN (
        'recall', 'apply', 'analyze', 'evaluate', 'create'
    )),
    skill_tags TEXT[] DEFAULT '{}',
    prerequisite_skills TEXT[] DEFAULT '{}',
    common_mistakes TEXT[] DEFAULT '{}',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(exercise_slug, question_index)
);

CREATE INDEX idx_qm_exercise ON question_metadata(exercise_slug);
CREATE INDEX idx_qm_difficulty ON question_metadata(difficulty_final);
CREATE INDEX idx_qm_skill_tags ON question_metadata USING GIN(skill_tags);
```

### 3.2 New Table: `user_skill_ability`

```sql
CREATE TABLE user_skill_ability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    skill_tag TEXT NOT NULL,

    theta NUMERIC(3,2) NOT NULL DEFAULT 2.50,
    -- Elo-style ability estimate (1.0–5.0)

    total_attempts INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    streak_current INTEGER DEFAULT 0,
    streak_best INTEGER DEFAULT 0,

    last_practiced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, skill_tag)
);

CREATE INDEX idx_usa_user ON user_skill_ability(user_id);
CREATE INDEX idx_usa_skill ON user_skill_ability(skill_tag);

-- RLS: Users can only read/write their own rows
ALTER TABLE user_skill_ability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their ability data"
    ON user_skill_ability FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### 3.3 Alter Existing: `question_attempts`

```sql
ALTER TABLE question_attempts ADD COLUMN
    time_spent_ms INTEGER,
    -- Milliseconds from question render to answer submit

ALTER TABLE question_attempts ADD COLUMN
    question_difficulty NUMERIC(2,1),
    -- Snapshot of difficulty at time of attempt

ALTER TABLE question_attempts ADD COLUMN
    user_theta_before NUMERIC(3,2);
    -- Snapshot of user ability before this attempt
```

### 3.4 Alter Existing: `exercise_sessions`

```sql
ALTER TABLE exercise_sessions ADD COLUMN
    difficulty_mode TEXT DEFAULT 'linear'
        CHECK (difficulty_mode IN ('adaptive','fixed-easy','fixed-medium','fixed-hard','linear')),

ALTER TABLE exercise_sessions ADD COLUMN
    questions_served TEXT[];
    -- Ordered list of question_ids served (for replay/analysis)
```

## 4. API Changes

### 4.1 New Endpoint: `GET /api/v1/exercise/next-question`

```
GET /api/v1/exercise/next-question?session_id={id}&exercise_slug={slug}
Authorization: Bearer {token}

Response 200:
{
    "question_id": "cie0580-algebra-c2-c2-01:3",
    "question_index": 3,
    "difficulty": 2.8,
    "cognitive_level": "apply",
    "question_data": {
        "type": "multiple-choice",
        "questionText": "...",
        "options": [...],
        "correctAnswer": 0,
        "explanation": "..."
    },
    "session_progress": {
        "answered": 4,
        "total": 10,
        "current_score": 3,
        "user_theta": 2.65
    }
}
```

### 4.2 Modified Endpoint: `POST /api/v1/exercise/session/[id]/attempt`

Add to request body:
```json
{
    "question_index": 3,
    "is_correct": true,
    "selected_answer": 0,
    "correct_answer": 0,
    "skill_tag": "c2-01",
    "time_spent_ms": 34200,
    "question_id": "cie0580-algebra-c2-c2-01:3"
}
```

Add to response:
```json
{
    "attempt_id": "uuid",
    "recorded_at": "...",
    "theta_update": {
        "skill_tag": "c2-01",
        "theta_before": 2.50,
        "theta_after": 2.65,
        "delta": 0.15
    }
}
```

### 4.3 Modified Endpoint: `POST /api/v1/exercise/session/start`

Add to request body:
```json
{
    "difficulty_mode": "adaptive"
}
```

### 4.4 New Endpoint: `GET /api/v1/exercise/ability-profile`

```
GET /api/v1/exercise/ability-profile
Authorization: Bearer {token}

Response 200:
{
    "skills": [
        {
            "skill_tag": "c2-01",
            "theta": 3.20,
            "total_attempts": 45,
            "accuracy": 0.73,
            "trend": "improving",
            "last_practiced": "2026-02-25T14:30:00Z"
        },
        ...
    ],
    "overall_theta": 2.85,
    "recommended_difficulty": "medium"
}
```

## 5. Frontend Changes

### 5.1 `exercise_engine.js` Modifications

**Current flow:**
```
init → renderQuestion(0) → submit → renderQuestion(1) → ... → complete
```

**New flow (adaptive mode):**
```
init → fetchNextQuestion() → renderQuestion(data) → submit(+timing) →
  fetchNextQuestion() → renderQuestion(data) → ... → complete
```

Key changes:
1. **Timer**: Start `performance.now()` on question render, capture on submit
2. **Question source**: Fetch from API instead of local JSON array
3. **Progress indicator**: Show difficulty trend (up/down arrows)
4. **Mode selector**: UI toggle for difficulty mode (before session starts)
5. **Ability display**: Show skill radar chart on completion screen

### 5.2 New UI Component: Difficulty Mode Selector

Rendered before exercise starts (only for authenticated users):

```html
<div id="difficulty-mode-selector" class="mb-6 p-4 bg-gray-50 rounded-xl border">
    <p class="text-sm font-medium text-gray-700 mb-3">Practice Mode</p>
    <div class="flex gap-2 flex-wrap">
        <button data-mode="adaptive" class="mode-btn active">
            🎯 Adaptive <span class="text-xs text-gray-500">(Recommended)</span>
        </button>
        <button data-mode="fixed-easy" class="mode-btn">Easy</button>
        <button data-mode="fixed-medium" class="mode-btn">Medium</button>
        <button data-mode="fixed-hard" class="mode-btn">Hard</button>
    </div>
</div>
```

### 5.3 New UI Component: Ability Profile (Member Dashboard)

```html
<div id="ability-profile" class="bg-white border border-gray-200 rounded-2xl p-5">
    <h3 class="font-semibold text-gray-900">Your Ability Profile</h3>
    <div id="skill-radar-chart"></div>  <!-- Canvas/SVG radar chart -->
    <div id="skill-list" class="mt-4 space-y-2">
        <!-- Skill rows with theta bars -->
    </div>
</div>
```

## 6. Migration Strategy

### Phase 1: Data Layer (Week 1)
- [ ] Create `question_metadata` table
- [ ] Create `user_skill_ability` table
- [ ] Add columns to `question_attempts` and `exercise_sessions`
- [ ] Backfill `question_metadata` using heuristic scoring for all 204+ exercises
- [ ] Backfill `user_skill_ability` from historical `question_attempts`

### Phase 2: Backend API (Week 2)
- [ ] Implement `/api/v1/exercise/next-question` endpoint
- [ ] Modify `attempt` endpoint to accept and store new fields
- [ ] Implement Elo update logic in attempt handler
- [ ] Implement `/api/v1/exercise/ability-profile` endpoint
- [ ] Add difficulty mode to session start

### Phase 3: Frontend Integration (Week 3)
- [ ] Add question timer to exercise_engine.js
- [ ] Implement adaptive question fetching (alongside keeping linear as fallback)
- [ ] Add difficulty mode selector UI
- [ ] Update completion screen with theta feedback

### Phase 4: Calibration (Week 4)
- [ ] Run heuristic → empirical calibration batch job
- [ ] Monitor question difficulty distribution
- [ ] Tune K-factor based on real user data
- [ ] A/B test adaptive vs linear for engagement metrics

### Backward Compatibility

- **Anonymous users**: Continue using linear mode (no API calls for next question)
- **Free members**: Get adaptive mode (drives engagement → conversion)
- **Existing sessions**: `difficulty_mode` defaults to `linear` for old data
- **Existing attempts**: New columns nullable; old data unaffected

## 7. Metrics & Success Criteria

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Avg questions per session | 10 (fixed) | 12+ (voluntary continuation) | exercise_sessions.question_count |
| Session completion rate | ~70% | 85%+ | completed_at IS NOT NULL ratio |
| Return rate (7-day) | Unknown | 40%+ | Distinct users with sessions in rolling 7d |
| Accuracy at target difficulty | N/A | 65–75% | is_correct rate at adaptive questions |
| Theta convergence speed | N/A | < 15 questions | Attempts until theta variance < 0.3 |

## 8. Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cold start (new questions, no data) | Poor difficulty estimates | Heuristic fallback + conservative K-factor |
| Gaming (intentional wrong answers) | Inflated easy questions | Detect answer-time < 2s + random sequences |
| API latency for next-question | Interrupted flow | Pre-fetch next question while current displays |
| Difficulty spiral (stuck in too-hard zone) | User abandonment | Floor at θ = 1.5, ceiling at θ = 4.5 |
| Question pool exhaustion | Repeated questions | Minimum 15 questions per topic required |

## 9. Implementation Assignment

| Task | Assigned To | Deliverable |
|------|------------|-------------|
| Database migration SQL | Codex-Backend | `supabase/migrations/20260301_adaptive_difficulty.sql` |
| Heuristic difficulty tagger | Codex-Backend | `scripts/tag_question_difficulty.js` |
| next-question endpoint | Codex-Backend | `functions/api/v1/exercise/next-question.js` |
| Elo update logic | Codex-Backend | `functions/_lib/adaptive_engine.js` |
| ability-profile endpoint | Codex-Backend | `functions/api/v1/exercise/ability-profile.js` |
| Frontend timer + fetch | Codex-Frontend | `assets/js/exercise_engine.js` modifications |
| Mode selector component | Codex-Frontend | Inline in exercise layout |
| Radar chart component | Codex-Frontend | `assets/js/ability_chart.js` |
| Calibration monitoring | Gemini-QA | Monitoring queries + dashboard |
| A/B test framework | Gemini-Architect | Feature flag design |
