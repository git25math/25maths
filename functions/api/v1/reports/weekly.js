import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import {
  getUserFromAccessToken,
  fetchUserStreak,
  fetchUserXp,
  listUserAchievements,
  listAchievementDefinitions,
} from '../../../_lib/supabase_server.js';
import { computeLevel } from '../../../_lib/achievement_evaluator.js';
import { formatDateStr } from '../../../_lib/date_utils.js';

function weekBounds() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const thisMonday = new Date(now);
  thisMonday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
  thisMonday.setUTCHours(0, 0, 0, 0);

  const lastMonday = new Date(thisMonday);
  lastMonday.setUTCDate(thisMonday.getUTCDate() - 7);

  const prevMonday = new Date(lastMonday);
  prevMonday.setUTCDate(lastMonday.getUTCDate() - 7);

  return {
    weekStart: formatDateStr(lastMonday),
    weekEnd: formatDateStr(thisMonday),
    prevWeekStart: formatDateStr(prevMonday),
    prevWeekEnd: formatDateStr(lastMonday),
  };
}

function trendArrow(current, previous) {
  if (current > previous) return '↑';
  if (current < previous) return '↓';
  return '→';
}

function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export async function onRequestGet(context) {
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

  const userId = authUser.id;
  const bounds = weekBounds();

  const [streak, xpRecord, userAchievements, achievementDefs] = await Promise.all([
    fetchUserStreak(env, userId),
    fetchUserXp(env, userId),
    listUserAchievements(env, userId),
    listAchievementDefinitions(env),
  ]);

  const sessionsCount = 0;
  const prevSessionsCount = 0;
  const questionsAnswered = 0;
  const prevQuestionsAnswered = 0;
  const accuracyPct = 0;
  const prevAccuracyPct = 0;
  const totalSeconds = 0;
  const prevTotalSeconds = 0;
  const topicPerformance = [];
  const mistakes = [];

  // Recent achievements (unlocked this week)
  const weekStartDate = new Date(`${bounds.weekStart}T00:00:00Z`);
  const defMap = {};
  for (const d of achievementDefs) {
    defMap[d.id] = d;
  }
  const recentAchievements = (userAchievements || [])
    .filter((ua) => {
      const unlocked = new Date(ua.unlocked_at);
      return unlocked >= weekStartDate;
    })
    .map((ua) => {
      const def = defMap[ua.achievement_id] || {};
      return {
        achievement_id: ua.achievement_id,
        title_en: def.title_en || ua.achievement_id,
        title_cn: def.title_cn || '',
        icon: def.icon || '',
        tier: def.tier || 'bronze',
        unlocked_at: ua.unlocked_at,
      };
    });

  // XP and level
  const totalXp = xpRecord ? xpRecord.total_xp || 0 : 0;
  const level = computeLevel(totalXp);

  return jsonResponse({
    report_period: {
      start: bounds.weekStart,
      end: bounds.weekEnd,
      prev_start: bounds.prevWeekStart,
      prev_end: bounds.prevWeekEnd,
    },
    summary: {
      sessions: sessionsCount,
      sessions_delta: sessionsCount - prevSessionsCount,
      sessions_trend: trendArrow(sessionsCount, prevSessionsCount),
      questions_answered: questionsAnswered,
      questions_delta: questionsAnswered - prevQuestionsAnswered,
      accuracy_pct: accuracyPct,
      accuracy_delta: accuracyPct - prevAccuracyPct,
      accuracy_trend: trendArrow(accuracyPct, prevAccuracyPct),
      time_practiced: formatDuration(totalSeconds),
      time_seconds: totalSeconds,
      time_delta_seconds: totalSeconds - prevTotalSeconds,
    },
    streak: streak
      ? {
          current: streak.current_streak || 0,
          best: streak.best_streak || 0,
          total_active_days: streak.total_active_days || 0,
        }
      : { current: 0, best: 0, total_active_days: 0 },
    topic_performance: topicPerformance,
    top_mistakes: mistakes,
    recent_achievements: recentAchievements,
    xp: {
      total: totalXp,
      level,
    },
    generated_at: new Date().toISOString(),
  });
}
