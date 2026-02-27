import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import {
  getUserFromAccessToken,
  fetchUserStreak,
  listUserDailyActivity,
} from '../../../_lib/supabase_server.js';

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

  let streak = null;
  try {
    streak = await fetchUserStreak(env, authUser.id);
  } catch (error) {
    return jsonResponse({ error: `Failed reading streak: ${error.message}` }, 500);
  }

  let activities = [];
  try {
    activities = await listUserDailyActivity(env, authUser.id, { days: 30 });
  } catch (error) {
    return jsonResponse({ error: `Failed reading activity: ${error.message}` }, 500);
  }

  const today = formatDateStr(new Date());
  const todayEntry = activities.find(a => a.activity_date === today);
  const todayQualifies = todayEntry
    ? (todayEntry.sessions_completed >= 1 && todayEntry.questions_answered >= 5)
    : false;

  const calendar = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = formatDateStr(d);
    const entry = activities.find(a => a.activity_date === dateStr);
    calendar.push({
      date: dateStr,
      active: entry ? (entry.sessions_completed >= 1 && entry.questions_answered >= 5) : false,
      sessions: entry ? (entry.sessions_completed || 0) : 0,
    });
  }

  return jsonResponse({
    current_streak: streak?.current_streak || 0,
    best_streak: streak?.best_streak || 0,
    last_active_date: streak?.last_active_date || null,
    today_qualifies: todayQualifies,
    freeze_available: streak?.freeze_available || false,
    total_active_days: streak?.total_active_days || 0,
    calendar,
    generated_at: new Date().toISOString(),
  });
}
