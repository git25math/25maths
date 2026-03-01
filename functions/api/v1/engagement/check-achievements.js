import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import {
  getUserFromAccessToken,
  fetchUserStreak,
  fetchUserXp,
  listUserAchievements,
  listAchievementDefinitions,
  upsertUserDailyActivity,
  upsertUserStreak,
  insertUserAchievement,
  upsertUserXp,
  listRecentSessions,
} from '../../../_lib/supabase_server.js';
import {
  checkCriteria,
  fetchSkillImprovementData,
  computeLevel,
} from '../../../_lib/achievement_evaluator.js';

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function subtractDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return formatDateStr(d);
}

async function updateStreak(env, userId, todayActivity) {
  const today = formatDateStr(new Date());
  const streak = await fetchUserStreak(env, userId) || {
    user_id: userId,
    current_streak: 0,
    best_streak: 0,
    last_active_date: null,
    freeze_available: false,
    total_active_days: 0,
  };

  const qualifies = todayActivity.sessions_completed >= 1 && todayActivity.questions_answered >= 5;
  if (!qualifies) return streak;
  if (streak.last_active_date === today) return streak;

  const yesterday = subtractDays(today, 1);

  if (streak.last_active_date === yesterday) {
    streak.current_streak += 1;
  } else if (streak.freeze_available && streak.last_active_date === subtractDays(today, 2)) {
    streak.current_streak += 1;
    streak.freeze_available = false;
    streak.freeze_used_at = yesterday;
  } else if (!streak.last_active_date) {
    streak.current_streak = 1;
  } else {
    streak.current_streak = 1;
  }

  streak.last_active_date = today;
  streak.best_streak = Math.max(streak.best_streak, streak.current_streak);
  streak.total_active_days += 1;

  if (streak.current_streak > 0 && streak.current_streak % 7 === 0) {
    streak.freeze_available = true;
  }

  await upsertUserStreak(env, {
    user_id: userId,
    current_streak: streak.current_streak,
    best_streak: streak.best_streak,
    last_active_date: streak.last_active_date,
    freeze_available: streak.freeze_available,
    total_active_days: streak.total_active_days,
  });

  return streak;
}

export async function onRequestPost(context) {
  const { request, env } = context;

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

  const sessionData = {
    score: Number(payload?.score || 0),
    question_count: Number(payload?.question_count || 0),
    duration_seconds: Number(payload?.duration_seconds || 0),
    exercise_slug: String(payload?.exercise_slug || '').trim(),
    accuracy: 0,
  };
  if (sessionData.question_count > 0) {
    sessionData.accuracy = Math.round((sessionData.score / sessionData.question_count) * 100);
  }

  const today = formatDateStr(new Date());

  let todayActivity = null;
  try {
    todayActivity = await upsertUserDailyActivity(env, {
      user_id: authUser.id,
      activity_date: today,
      sessions_delta: 1,
      questions_delta: sessionData.question_count,
      correct_delta: sessionData.score,
      time_delta: sessionData.duration_seconds,
      skill_tag: sessionData.exercise_slug,
    });
  } catch (error) {
    return jsonResponse({ error: `Failed updating daily activity: ${error.message}` }, 500);
  }

  let streak = null;
  try {
    streak = await updateStreak(env, authUser.id, todayActivity);
  } catch (error) {
    return jsonResponse({ error: `Failed updating streak: ${error.message}` }, 500);
  }

  let xpRecord = null;
  let existingAchievements = [];
  let allDefinitions = [];
  let recentSessions = [];

  try {
    [xpRecord, existingAchievements, allDefinitions, recentSessions] = await Promise.all([
      fetchUserXp(env, authUser.id),
      listUserAchievements(env, authUser.id),
      listAchievementDefinitions(env),
      listRecentSessions(env, authUser.id, { lookbackDays: 365, limit: 1000 }),
    ]);
  } catch (error) {
    return jsonResponse({ error: `Failed reading engagement data: ${error.message}` }, 500);
  }

  const existingIds = new Set(existingAchievements.map(a => a.achievement_id));

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
      improvementData = await fetchSkillImprovementData(env, authUser.id);
    } catch (_e) {
      // best-effort — skip if query fails
    }
  }

  const evalContext = {
    streak,
    totalSessions,
    distinctTopics: sessionTopics.size,
    sessionsAbovePct,
    sessionData,
    improvementData,
  };

  const newlyUnlocked = [];
  let xpEarned = 10;

  if (sessionData.accuracy === 100 && sessionData.question_count > 0) {
    xpEarned += 25;
  }
  if (streak.last_active_date === today) {
    xpEarned += 5;
  }

  for (const def of allDefinitions) {
    if (existingIds.has(def.id)) continue;
    if (!def.is_active) continue;

    const met = checkCriteria(def.criteria, evalContext);
    if (met) {
      try {
        await insertUserAchievement(env, { user_id: authUser.id, achievement_id: def.id });
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
      } catch (_error) {
        // Achievement may already exist (race condition) — skip
      }
    }
  }

  const previousXp = xpRecord?.total_xp || 0;
  const newTotalXp = previousXp + xpEarned;

  const previousLevel = xpRecord?.level || 1;
  const newLevel = computeLevel(newTotalXp);

  try {
    await upsertUserXp(env, { user_id: authUser.id, total_xp: newTotalXp, level: newLevel });
  } catch (_error) {
    // XP update is best-effort
  }

  const levelUp = newLevel > previousLevel;

  return jsonResponse({
    newly_unlocked: newlyUnlocked,
    xp_earned_total: xpEarned,
    total_xp: newTotalXp,
    level: newLevel,
    level_up: levelUp,
    streak: {
      current_streak: streak.current_streak,
      best_streak: streak.best_streak,
    },
    generated_at: new Date().toISOString(),
  });
}
