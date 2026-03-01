import { serviceHeaders } from './supabase_server.js';

export const XP_THRESHOLDS = [0, 50, 200, 500, 1000, 2000, 4000, 8000, 16000, 32000];

export function computeLevel(totalXp) {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function checkCriteria(criteria, context) {
  if (!criteria || !criteria.type) return false;

  switch (criteria.type) {
    case 'streak':
      return context.streak.current_streak >= (criteria.min_days || 0);
    case 'volume':
      return context.totalSessions >= (criteria.min_sessions || 0);
    case 'accuracy': {
      const minPct = criteria.min_pct || 0;
      const minSessions = criteria.min_sessions || 0;
      return context.sessionsAbovePct(minPct) >= minSessions;
    }
    case 'explorer':
      return context.distinctTopics >= (criteria.min_topics || 0);
    case 'speed':
      return context.sessionData
        && context.sessionData.duration_seconds <= (criteria.max_seconds || 300)
        && context.sessionData.accuracy >= (criteria.min_pct || 80);
    case 'improvement': {
      if (!context.improvementData) return false;
      const { bestDelta, bestNewPct } = context.improvementData;
      if (bestDelta < (criteria.min_delta || 0)) return false;
      if (criteria.target_pct != null && bestNewPct < criteria.target_pct) return false;
      return true;
    }
    default:
      return false;
  }
}

export async function fetchSkillImprovementData(env, userId) {
  const cutoff120 = new Date(Date.now() - 120 * 86400000).toISOString();
  const cutoff30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const query = new URLSearchParams({
    select: 'skill_tag,is_correct,created_at',
    user_id: `eq.${userId}`,
    created_at: `gte.${cutoff120}`,
    order: 'created_at.asc',
    limit: '2000',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/question_attempts?${query.toString()}`;
  const resp = await fetch(url, { headers: serviceHeaders(env) });
  if (!resp.ok) return null;

  const rows = await resp.json();
  if (!Array.isArray(rows) || rows.length < 6) return null;

  const skills = {};
  for (const r of rows) {
    const tag = r.skill_tag;
    if (!tag) continue;
    if (!skills[tag]) skills[tag] = { old: { correct: 0, total: 0 }, recent: { correct: 0, total: 0 } };
    const bucket = r.created_at >= cutoff30 ? 'recent' : 'old';
    skills[tag][bucket].total += 1;
    if (r.is_correct) skills[tag][bucket].correct += 1;
  }

  let bestDelta = 0;
  let bestNewPct = 0;
  for (const tag of Object.keys(skills)) {
    const { old, recent } = skills[tag];
    if (old.total < 3 || recent.total < 3) continue;
    const oldPct = Math.round((old.correct / old.total) * 100);
    const newPct = Math.round((recent.correct / recent.total) * 100);
    const delta = newPct - oldPct;
    if (delta > bestDelta) {
      bestDelta = delta;
      bestNewPct = newPct;
    }
  }

  if (bestDelta <= 0) return null;
  return { bestDelta, bestNewPct };
}

export async function fetchTotalCompletedSessions(env, userId) {
  const countQuery = new URLSearchParams({
    select: 'id',
    user_id: `eq.${userId}`,
    completed_at: 'not.is.null',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/exercise_sessions?${countQuery.toString()}`;
  const resp = await fetch(url, {
    headers: { ...serviceHeaders(env), Prefer: 'count=exact' },
  });
  const range = resp.headers.get('content-range') || '';
  const match = range.match(/\/(\d+)$/);
  return match ? Number(match[1]) : null;
}
