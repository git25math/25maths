import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import { getUserFromAccessToken, serviceHeaders } from '../../../_lib/supabase_server.js';

function anonymise(email) {
  if (!email) return 'Anonymous';
  const name = email.split('@')[0] || '';
  if (name.length <= 2) return name[0] + '***';
  return name[0] + name[1] + '***';
}

function weekBounds() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const thisMonday = new Date(now);
  thisMonday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
  thisMonday.setUTCHours(0, 0, 0, 0);
  const y = thisMonday.getFullYear();
  const m = String(thisMonday.getMonth() + 1).padStart(2, '0');
  const d = String(thisMonday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Supabase environment is not fully configured.' }, 500);
  }

  // Auth is optional — if logged in, we return the user's rank
  const accessToken = getBearerToken(request);
  let authUserId = null;
  if (accessToken) {
    try {
      const user = await getUserFromAccessToken(env, accessToken);
      if (user && user.id) authUserId = user.id;
    } catch (_e) {
      // proceed without auth
    }
  }

  const weekStart = weekBounds();

  // Fetch top users by XP gained this week from user_daily_activity
  // Aggregate sessions and questions per user since the start of the week
  const baseUrl = `${env.SUPABASE_URL}/rest/v1/user_daily_activity`;
  const params = new URLSearchParams({
    select: 'user_id,sessions_completed,questions_answered,correct_answers',
    activity_date: `gte.${weekStart}`,
    order: 'user_id',
  });
  const url = `${baseUrl}?${params.toString()}`;

  let weeklyActivity = [];
  try {
    const resp = await fetch(url, { headers: serviceHeaders(env) });
    if (resp.ok) {
      weeklyActivity = await resp.json();
    }
  } catch (_e) {
    // empty
  }

  // Aggregate per user
  const userStats = {};
  for (const row of weeklyActivity) {
    if (!userStats[row.user_id]) {
      userStats[row.user_id] = { sessions: 0, questions: 0, correct: 0 };
    }
    userStats[row.user_id].sessions += row.sessions_completed || 0;
    userStats[row.user_id].questions += row.questions_answered || 0;
    userStats[row.user_id].correct += row.correct_answers || 0;
  }

  // Also fetch XP for ranking
  const xpUrl = `${env.SUPABASE_URL}/rest/v1/user_xp`;
  const xpParams = new URLSearchParams({
    select: 'user_id,total_xp,level',
    order: 'total_xp.desc',
    limit: '50',
  });

  let xpRecords = [];
  try {
    const resp = await fetch(`${xpUrl}?${xpParams.toString()}`, { headers: serviceHeaders(env) });
    if (resp.ok) {
      xpRecords = await resp.json();
    }
  } catch (_e) {
    // empty
  }

  // Fetch display names from profiles (if available)
  const userIds = xpRecords.map((r) => r.user_id);
  let profileMap = {};
  if (userIds.length > 0) {
    try {
      const profileUrl = `${env.SUPABASE_URL}/rest/v1/profiles`;
      const profileParams = new URLSearchParams({
        select: 'id,display_name,email',
        id: `in.(${userIds.join(',')})`,
      });
      const resp = await fetch(`${profileUrl}?${profileParams.toString()}`, {
        headers: serviceHeaders(env),
      });
      if (resp.ok) {
        const profiles = await resp.json();
        for (const p of profiles) {
          profileMap[p.id] = p;
        }
      }
    } catch (_e) {
      // empty
    }
  }

  // Build leaderboard entries
  const leaderboard = xpRecords.slice(0, 20).map((xp, index) => {
    const profile = profileMap[xp.user_id] || {};
    const weekly = userStats[xp.user_id] || { sessions: 0, questions: 0, correct: 0 };
    const displayName =
      profile.display_name || anonymise(profile.email);
    const isCurrentUser = authUserId && xp.user_id === authUserId;

    return {
      rank: index + 1,
      display_name: displayName,
      total_xp: xp.total_xp || 0,
      level: xp.level || 1,
      weekly_sessions: weekly.sessions,
      weekly_questions: weekly.questions,
      weekly_accuracy:
        weekly.questions > 0
          ? Math.round((weekly.correct / weekly.questions) * 100)
          : 0,
      is_you: isCurrentUser,
    };
  });

  // Find current user's rank if not in top 20
  let myRank = null;
  if (authUserId) {
    const existing = leaderboard.find((e) => e.is_you);
    if (existing) {
      myRank = existing.rank;
    } else {
      // Count how many users have more XP
      const myXp = xpRecords.find((r) => r.user_id === authUserId);
      if (myXp) {
        const rank = xpRecords.filter((r) => (r.total_xp || 0) > (myXp.total_xp || 0)).length + 1;
        myRank = rank;
      }
    }
  }

  return jsonResponse({
    leaderboard,
    week_start: weekStart,
    total_ranked: xpRecords.length,
    your_rank: myRank,
    generated_at: new Date().toISOString(),
  });
}
