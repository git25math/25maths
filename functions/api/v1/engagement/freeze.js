import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import {
  getUserFromAccessToken,
  fetchUserStreak,
  upsertUserStreak,
  fetchMembershipStatus,
} from '../../../_lib/supabase_server.js';

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isMembershipActive(record) {
  if (!record) return false;
  if (String(record.status || '').toLowerCase() !== 'active') return false;
  if (!record.period_end) return true;
  const until = new Date(record.period_end).getTime();
  if (Number.isNaN(until)) return true;
  return until > Date.now();
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

  // Only paid members can use streak freeze
  let membership = null;
  try {
    membership = await fetchMembershipStatus(env, authUser.id);
  } catch (error) {
    return jsonResponse({ error: `Failed reading membership status: ${error.message}` }, 500);
  }

  if (!isMembershipActive(membership)) {
    return jsonResponse({ error: 'Streak freeze is only available to active paid members.' }, 403);
  }

  let streak = null;
  try {
    streak = await fetchUserStreak(env, authUser.id);
  } catch (error) {
    return jsonResponse({ error: `Failed reading streak: ${error.message}` }, 500);
  }

  if (!streak) {
    return jsonResponse({ error: 'No streak record found. Start practising first.' }, 404);
  }

  if (!streak.freeze_available) {
    return jsonResponse({
      success: false,
      reason: 'No streak freeze available. You earn a freeze every 7 consecutive days.',
    });
  }

  if (streak.current_streak <= 0) {
    return jsonResponse({
      success: false,
      reason: 'No active streak to freeze.',
    });
  }

  const today = formatDateStr(new Date());

  // Check if today is already active (no need for freeze)
  if (streak.last_active_date === today) {
    return jsonResponse({
      success: false,
      reason: 'You already have activity today. No freeze needed.',
    });
  }

  // Apply the freeze
  try {
    await upsertUserStreak(env, {
      user_id: authUser.id,
      current_streak: streak.current_streak,
      best_streak: streak.best_streak,
      last_active_date: today,
      freeze_available: false,
      freeze_used_at: today,
      total_active_days: streak.total_active_days,
    });
  } catch (error) {
    return jsonResponse({ error: `Failed applying freeze: ${error.message}` }, 500);
  }

  // Calculate next freeze availability (every 7 streak days)
  const nextFreezeAt = streak.current_streak + (7 - (streak.current_streak % 7));

  return jsonResponse({
    success: true,
    streak_preserved: streak.current_streak,
    freeze_used_at: today,
    next_freeze_available_at_streak: nextFreezeAt,
  });
}
