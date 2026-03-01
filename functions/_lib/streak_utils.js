import { fetchUserStreak, upsertUserStreak } from './supabase_server.js';
import { formatDateStr, subtractDays } from './date_utils.js';

export async function updateStreak(env, userId, todayActivity) {
  const today = formatDateStr(new Date());
  const streak = await fetchUserStreak(env, userId) || {
    user_id: userId,
    current_streak: 0,
    best_streak: 0,
    last_active_date: null,
    freeze_available: false,
    total_active_days: 0,
  };

  const qualifies = (todayActivity.sessions_completed || 0) >= 1
    && (todayActivity.questions_answered || 0) >= 5;
  if (!qualifies) return streak;
  if (streak.last_active_date === today) return streak;

  const yesterday = subtractDays(today, 1);

  if (streak.last_active_date === yesterday) {
    streak.current_streak += 1;
  } else if (streak.freeze_available && streak.last_active_date === subtractDays(today, 2)) {
    streak.current_streak += 1;
    streak.freeze_available = false;
    streak.freeze_used_at = yesterday;
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
