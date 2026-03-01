import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import {
  getUserFromAccessToken,
  fetchUserStreak,
  fetchUserXp,
  listUserAchievements,
  listAchievementDefinitions,
  serviceHeaders,
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

// Fetch completed sessions for a date range using Supabase REST API
async function fetchSessionsInRange(env, userId, startDate, endDate) {
  const baseUrl = `${env.SUPABASE_URL}/rest/v1/exercise_sessions`;
  const params = new URLSearchParams({
    select: 'id,exercise_slug,question_count,score,duration_seconds,started_at,completed_at',
    user_id: `eq.${userId}`,
    started_at: `gte.${startDate}T00:00:00Z`,
    completed_at: `not.is.null`,
    order: 'started_at.desc',
  });
  // Also filter started_at < endDate
  const url = `${baseUrl}?${params.toString()}&started_at=lt.${endDate}T00:00:00Z`;
  const resp = await fetch(url, { headers: serviceHeaders(env) });
  if (!resp.ok) return [];
  return await resp.json();
}

// Fetch question attempts for given session IDs
async function fetchAttemptsForSessions(env, sessionIds) {
  if (!sessionIds.length) return [];
  const baseUrl = `${env.SUPABASE_URL}/rest/v1/question_attempts`;
  const idList = sessionIds.join(',');
  const params = new URLSearchParams({
    select: 'session_id,skill_tag,is_correct',
    session_id: `in.(${idList})`,
  });
  const url = `${baseUrl}?${params.toString()}`;
  const resp = await fetch(url, { headers: serviceHeaders(env) });
  if (!resp.ok) return [];
  return await resp.json();
}

// Aggregate topic stats from attempts
function aggregateTopics(attempts) {
  const byTopic = {};
  for (const a of attempts) {
    const tag = a.skill_tag || 'unknown';
    // Use first segment (e.g., "algebra" from "algebra-quadratics-factoring")
    const topic = tag.split('-')[0] || 'unknown';
    if (!byTopic[topic]) {
      byTopic[topic] = { correct: 0, wrong: 0, total: 0 };
    }
    byTopic[topic].total += 1;
    if (a.is_correct) {
      byTopic[topic].correct += 1;
    } else {
      byTopic[topic].wrong += 1;
    }
  }
  return Object.entries(byTopic).map(([name, stats]) => ({
    topic: name,
    correct: stats.correct,
    wrong: stats.wrong,
    total: stats.total,
    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
  }));
}

// Find top mistake skill tags
function topMistakes(attempts, limit = 3) {
  const mistakeCounts = {};
  for (const a of attempts) {
    if (!a.is_correct && a.skill_tag) {
      mistakeCounts[a.skill_tag] = (mistakeCounts[a.skill_tag] || 0) + 1;
    }
  }
  return Object.entries(mistakeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([skill_tag, count]) => ({ skill_tag, count }));
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

  // Fetch data in parallel
  const [
    thisWeekSessions,
    prevWeekSessions,
    streak,
    xpRecord,
    userAchievements,
    achievementDefs,
  ] = await Promise.all([
    fetchSessionsInRange(env, userId, bounds.weekStart, bounds.weekEnd),
    fetchSessionsInRange(env, userId, bounds.prevWeekStart, bounds.prevWeekEnd),
    fetchUserStreak(env, userId),
    fetchUserXp(env, userId),
    listUserAchievements(env, userId),
    listAchievementDefinitions(env),
  ]);

  // Session IDs for attempts lookup
  const thisWeekIds = thisWeekSessions.map((s) => s.id);
  const prevWeekIds = prevWeekSessions.map((s) => s.id);

  const [thisWeekAttempts, prevWeekAttempts] = await Promise.all([
    fetchAttemptsForSessions(env, thisWeekIds),
    fetchAttemptsForSessions(env, prevWeekIds),
  ]);

  // Weekly summary stats
  const sessionsCount = thisWeekSessions.length;
  const prevSessionsCount = prevWeekSessions.length;

  const questionsAnswered = thisWeekSessions.reduce((sum, s) => sum + (s.question_count || 0), 0);
  const prevQuestionsAnswered = prevWeekSessions.reduce(
    (sum, s) => sum + (s.question_count || 0),
    0
  );

  const totalCorrect = thisWeekAttempts.filter((a) => a.is_correct).length;
  const totalAttempts = thisWeekAttempts.length;
  const accuracyPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const prevCorrect = prevWeekAttempts.filter((a) => a.is_correct).length;
  const prevTotal = prevWeekAttempts.length;
  const prevAccuracyPct = prevTotal > 0 ? Math.round((prevCorrect / prevTotal) * 100) : 0;

  const totalSeconds = thisWeekSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const prevTotalSeconds = prevWeekSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

  // Topic performance
  const thisWeekTopics = aggregateTopics(thisWeekAttempts);
  const prevWeekTopics = aggregateTopics(prevWeekAttempts);

  // Merge with trend arrows
  const prevTopicMap = {};
  for (const t of prevWeekTopics) {
    prevTopicMap[t.topic] = t.accuracy;
  }
  const topicPerformance = thisWeekTopics
    .map((t) => ({
      ...t,
      prev_accuracy: prevTopicMap[t.topic] || 0,
      trend: trendArrow(t.accuracy, prevTopicMap[t.topic] || 0),
    }))
    .sort((a, b) => b.total - a.total);

  // Top mistakes
  const mistakes = topMistakes(thisWeekAttempts, 5);

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
