import { getBearerToken, jsonResponse } from '../../../../../_lib/http.js';
import {
  completeExerciseSession,
  fetchExerciseSession,
  getUserFromAccessToken,
  upsertUserDailyActivity,
  fetchUserXp,
  upsertUserXp,
  listUserAchievements,
  listAchievementDefinitions,
  insertUserAchievement,
  listRecentSessions,
} from '../../../../../_lib/supabase_server.js';
import {
  checkCriteria,
  fetchSkillImprovementData,
  fetchTotalCompletedSessions,
  computeLevel,
} from '../../../../../_lib/achievement_evaluator.js';
import { formatDateStr } from '../../../../../_lib/date_utils.js';
import { updateStreak } from '../../../../../_lib/streak_utils.js';

function parseInteger(value) {
  const num = Number(value);
  if (!Number.isInteger(num)) return null;
  return num;
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const sessionId = String(params?.id || '').trim();
  if (!sessionId) {
    return jsonResponse({ error: 'Missing session id.' }, 404);
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Supabase environment is not fully configured.' }, 500);
  }

  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return jsonResponse({ error: 'Authentication required.' }, 401);
  }

  const authUser = await getUserFromAccessToken(env, accessToken);
  if (!authUser || !authUser.id) {
    return jsonResponse({ error: 'Invalid or expired session token.' }, 401);
  }

  let payload = null;
  try {
    payload = await request.json();
  } catch (_error) {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400);
  }

  const score = parseInteger(payload?.score);
  const questionCount = parseInteger(payload?.question_count);
  const durationSeconds = parseInteger(payload?.duration_seconds);

  if (!Number.isInteger(score) || score < 0) {
    return jsonResponse({ error: 'score must be a non-negative integer.' }, 422);
  }
  if (!Number.isInteger(questionCount) || questionCount <= 0) {
    return jsonResponse({ error: 'question_count must be a positive integer.' }, 422);
  }
  if (durationSeconds !== null && durationSeconds < 0) {
    return jsonResponse({ error: 'duration_seconds must be >= 0.' }, 422);
  }

  let session = null;
  try {
    session = await fetchExerciseSession(env, sessionId);
  } catch (error) {
    return jsonResponse({ error: `Failed reading exercise session: ${error.message}` }, 500);
  }

  if (!session) {
    return jsonResponse({ error: 'Session not found.' }, 404);
  }
  if (String(session.user_id || '') !== String(authUser.id || '')) {
    return jsonResponse({ error: 'Session does not belong to current user.' }, 403);
  }

  if (session.completed_at) {
    return jsonResponse({
      session_id: session.id,
      completed_at: session.completed_at,
      score: session.score,
      question_count: session.question_count,
      duration_seconds: session.duration_seconds,
      already_completed: true,
    });
  }

  let updated = null;
  try {
    updated = await completeExerciseSession(env, sessionId, authUser.id, {
      completed_at: new Date().toISOString(),
      score,
      question_count: questionCount,
      duration_seconds: durationSeconds === null ? undefined : durationSeconds,
    });
  } catch (error) {
    return jsonResponse({ error: `Failed completing exercise session: ${error.message}` }, 500);
  }

  if (!updated || !updated.id) {
    return jsonResponse({ error: 'Failed completing exercise session.' }, 500);
  }

  // ── Engagement System Integration (best-effort) ──
  let engagement = null;
  try {
    engagement = await processEngagement(env, authUser.id, {
      score,
      question_count: questionCount,
      duration_seconds: durationSeconds || 0,
      exercise_slug: session.exercise_slug || '',
    });
  } catch (_error) {
    // Engagement processing is best-effort — session completion should not fail
    engagement = null;
  }

  const response = {
    session_id: updated.id,
    completed_at: updated.completed_at,
    score: updated.score,
    question_count: updated.question_count,
    duration_seconds: updated.duration_seconds,
    already_completed: false,
  };

  if (engagement) {
    response.streak = engagement.streak;
    response.newly_unlocked = engagement.newly_unlocked;
    response.xp_earned = engagement.xp_earned;
    response.total_xp = engagement.total_xp;
    response.level = engagement.level;
    response.level_up = engagement.level_up;
  }

  return jsonResponse(response);
}

async function processEngagement(env, userId, sessionData) {
  const today = formatDateStr(new Date());

  // 1. Update daily activity
  const activity = await upsertUserDailyActivity(env, {
    user_id: userId,
    activity_date: today,
    sessions_delta: 1,
    questions_delta: sessionData.question_count,
    correct_delta: sessionData.score,
    time_delta: sessionData.duration_seconds,
    skill_tag: sessionData.exercise_slug,
  });

  // 2. Update streak
  const streak = await updateStreak(env, userId, activity);
  const qualifies = (activity.sessions_completed || 0) >= 1 && (activity.questions_answered || 0) >= 5;

  // 3. Evaluate achievements (full criteria coverage via shared module)
  const [xpRecord, existingAchievements, allDefinitions, recentSessions] = await Promise.all([
    fetchUserXp(env, userId),
    listUserAchievements(env, userId),
    listAchievementDefinitions(env),
    listRecentSessions(env, userId, { lookbackDays: 365, limit: 1000 }),
  ]);

  const existingIds = new Set(existingAchievements.map(a => a.achievement_id));
  const accuracy = sessionData.question_count > 0
    ? Math.round((sessionData.score / sessionData.question_count) * 100)
    : 0;

  const totalSessions = recentSessions.length;
  const sessionTopics = new Set(recentSessions.map(s => String(s.exercise_slug || '')).filter(Boolean));

  function sessionsAbovePct(minPct) {
    return recentSessions.filter(s => {
      if (!s.score || !s.question_count || s.question_count <= 0) return false;
      return Math.round((s.score / s.question_count) * 100) >= minPct;
    }).length;
  }

  // Lazy-fetch improvement data only when needed
  const hasImprovementCriteria = allDefinitions.some(
    d => !existingIds.has(d.id) && d.is_active && d.criteria?.type === 'improvement'
  );
  let improvementData = null;
  if (hasImprovementCriteria) {
    try {
      improvementData = await fetchSkillImprovementData(env, userId);
    } catch (_e) { /* best-effort */ }
  }

  // Lazy-fetch total completed sessions for volume achievements
  const hasVolumeCriteria = allDefinitions.some(
    d => !existingIds.has(d.id) && d.is_active && d.criteria?.type === 'volume'
  );
  let volumeTotalSessions = totalSessions;
  if (hasVolumeCriteria) {
    try {
      const count = await fetchTotalCompletedSessions(env, userId);
      if (count != null) volumeTotalSessions = count;
    } catch (_e) { /* fall back to recentSessions count */ }
  }

  const evalContext = {
    streak,
    totalSessions: volumeTotalSessions,
    distinctTopics: sessionTopics.size,
    sessionsAbovePct,
    sessionData: { ...sessionData, accuracy },
    improvementData,
  };

  let xpEarned = 10;
  if (accuracy === 100 && sessionData.question_count > 0) xpEarned += 25;
  if (qualifies) xpEarned += 5;

  const newlyUnlocked = [];
  for (const def of allDefinitions) {
    if (existingIds.has(def.id) || !def.is_active) continue;

    const met = checkCriteria(def.criteria, evalContext);
    if (met) {
      try {
        await insertUserAchievement(env, { user_id: userId, achievement_id: def.id });
        xpEarned += (def.xp_reward || 15);
        newlyUnlocked.push({
          id: def.id,
          title: def.title_en || def.id,
          title_cn: def.title_cn || '',
          icon: def.icon || '🏆',
          tier: def.tier || 'bronze',
          xp_earned: def.xp_reward || 15,
        });
        existingIds.add(def.id);
      } catch (_e) { /* duplicate — safe to ignore */ }
    }
  }

  // 4. Update XP
  const previousXp = xpRecord?.total_xp || 0;
  const newTotalXp = previousXp + xpEarned;
  const previousLevel = xpRecord?.level || 1;
  const newLevel = computeLevel(newTotalXp);
  await upsertUserXp(env, { user_id: userId, total_xp: newTotalXp, level: newLevel });

  return {
    streak: { current_streak: streak.current_streak, best_streak: streak.best_streak },
    newly_unlocked: newlyUnlocked,
    xp_earned: xpEarned,
    total_xp: newTotalXp,
    level: newLevel,
    level_up: newLevel > previousLevel,
  };
}
