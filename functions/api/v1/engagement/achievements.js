import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import {
  getUserFromAccessToken,
  fetchUserXp,
  listUserAchievements,
  listAchievementDefinitions,
} from '../../../_lib/supabase_server.js';

const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Beginner', xp: 0 },
  { level: 2, title: 'Learner', xp: 50 },
  { level: 3, title: 'Practitioner', xp: 200 },
  { level: 4, title: 'Achiever', xp: 500 },
  { level: 5, title: 'Scholar', xp: 1000 },
  { level: 6, title: 'Expert', xp: 2000 },
  { level: 7, title: 'Master', xp: 4000 },
  { level: 8, title: 'Grandmaster', xp: 8000 },
  { level: 9, title: 'Legend', xp: 16000 },
  { level: 10, title: 'IGCSE Champion', xp: 32000 },
];

function getLevelInfo(totalXp) {
  let current = LEVEL_THRESHOLDS[0];
  let next = LEVEL_THRESHOLDS[1] || null;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] || null;
      break;
    }
  }
  return {
    level: current.level,
    level_title: current.title,
    xp_to_next_level: next ? (next.xp - totalXp) : 0,
    next_level_xp: next ? next.xp : current.xp,
  };
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

  let xpRecord = null;
  let userAchievements = [];
  let allDefinitions = [];

  try {
    [xpRecord, userAchievements, allDefinitions] = await Promise.all([
      fetchUserXp(env, authUser.id),
      listUserAchievements(env, authUser.id),
      listAchievementDefinitions(env),
    ]);
  } catch (error) {
    return jsonResponse({ error: `Failed reading engagement data: ${error.message}` }, 500);
  }

  const totalXp = xpRecord?.total_xp || 0;
  const levelInfo = getLevelInfo(totalXp);

  const unlockedIds = new Set(userAchievements.map(a => a.achievement_id));

  const unlocked = userAchievements.map(ua => {
    const def = allDefinitions.find(d => d.id === ua.achievement_id) || {};
    return {
      id: ua.achievement_id,
      title: def.title_en || ua.achievement_id,
      title_cn: def.title_cn || '',
      icon: def.icon || '🏆',
      tier: def.tier || 'bronze',
      category: def.category || 'volume',
      unlocked_at: ua.unlocked_at,
    };
  });

  const locked = allDefinitions
    .filter(d => !unlockedIds.has(d.id) && d.is_active !== false && !d.is_secret)
    .map(d => ({
      id: d.id,
      title: d.title_en || d.id,
      title_cn: d.title_cn || '',
      icon: d.icon || '🏆',
      tier: d.tier || 'bronze',
      category: d.category || 'volume',
    }));

  return jsonResponse({
    unlocked,
    locked,
    total_xp: totalXp,
    level: levelInfo.level,
    level_title: levelInfo.level_title,
    xp_to_next_level: levelInfo.xp_to_next_level,
    generated_at: new Date().toISOString(),
  });
}
