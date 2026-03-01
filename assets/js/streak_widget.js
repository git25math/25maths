(() => {
  'use strict';

  // Sync with functions/_lib/achievement_evaluator.js:XP_THRESHOLDS
  const LEVEL_THRESHOLDS = [
    { level: 1, title: 'Beginner', titleCn: '初学者', xp: 0 },
    { level: 2, title: 'Learner', titleCn: '学习者', xp: 50 },
    { level: 3, title: 'Practitioner', titleCn: '练习者', xp: 200 },
    { level: 4, title: 'Achiever', titleCn: '成就者', xp: 500 },
    { level: 5, title: 'Scholar', titleCn: '学者', xp: 1000 },
    { level: 6, title: 'Expert', titleCn: '专家', xp: 2000 },
    { level: 7, title: 'Master', titleCn: '大师', xp: 4000 },
    { level: 8, title: 'Grandmaster', titleCn: '宗师', xp: 8000 },
    { level: 9, title: 'Legend', titleCn: '传奇', xp: 16000 },
    { level: 10, title: 'IGCSE Champion', titleCn: 'IGCSE 冠军', xp: 32000 },
  ];

  function isZh() {
    return String(document.documentElement.lang || '').toLowerCase() === 'zh-cn';
  }

  function t(en, cn) {
    return isZh() ? cn : en;
  }

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
    const xpInLevel = totalXp - current.xp;
    const xpForNext = next ? (next.xp - current.xp) : 0;
    const pct = next ? Math.min(100, Math.round((xpInLevel / xpForNext) * 100)) : 100;
    return {
      level: current.level,
      title: isZh() ? current.titleCn : current.title,
      totalXp,
      xpInLevel,
      xpForNext,
      nextXp: next ? next.xp : current.xp,
      pct,
    };
  }

  function formatDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getHeatmapColor(sessions) {
    if (sessions <= 0) return 'bg-gray-100';
    if (sessions === 1) return 'bg-green-200';
    if (sessions <= 3) return 'bg-green-400';
    return 'bg-green-600';
  }

  function renderStreakWidget(data) {
    const widget = document.getElementById('streak-widget');
    if (!widget) return;

    const count = data.current_streak || 0;
    const best = data.best_streak || 0;
    const todayQualifies = data.today_qualifies || false;
    const freezeAvailable = data.freeze_available || false;

    const countEl = document.getElementById('streak-count');
    const bestEl = document.getElementById('streak-best');
    const statusEl = document.getElementById('streak-status');
    const iconEl = document.getElementById('streak-icon');
    const freezeBtn = document.getElementById('streak-freeze-btn');

    if (countEl) countEl.textContent = String(count);
    if (bestEl) bestEl.textContent = String(best);

    if (todayQualifies) {
      if (statusEl) statusEl.textContent = t('Today completed!', '今日已完成!');
      if (iconEl) iconEl.classList.add('animate-pulse');
    } else if (count > 0) {
      if (statusEl) statusEl.textContent = t('Practice today to keep it going!', '今天继续练习保持连续!');
    } else {
      if (statusEl) statusEl.textContent = t('Start your streak today!', '今天开始你的连续记录!');
    }

    if (freezeBtn && freezeAvailable && !todayQualifies && count > 0) {
      freezeBtn.classList.remove('hidden');
    }

    widget.classList.remove('hidden');
  }

  function renderHeatmap(calendar) {
    const grid = document.getElementById('heatmap-grid');
    const container = document.getElementById('activity-heatmap');
    if (!grid || !container) return;

    const today = new Date();
    const cells = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDateStr(d);
      const entry = (calendar || []).find(c => c.date === dateStr);
      const sessions = entry ? (entry.sessions || 0) : 0;
      const colorClass = getHeatmapColor(sessions);
      const dayLabel = d.getDate();
      cells.push(
        `<div class="w-full aspect-square rounded-sm ${colorClass} flex items-center justify-center text-[9px] text-gray-500 cursor-default" title="${dateStr}: ${sessions} session${sessions !== 1 ? 's' : ''}">${dayLabel}</div>`
      );
    }

    grid.innerHTML = cells.join('');
    container.classList.remove('hidden');
  }

  function renderXpBar(xpData) {
    const bar = document.getElementById('xp-bar');
    if (!bar) return;

    const info = getLevelInfo(xpData.total_xp || 0);

    const levelEl = document.getElementById('user-level');
    const progressEl = document.getElementById('xp-progress');
    const currentEl = document.getElementById('xp-current');
    const nextEl = document.getElementById('xp-next');
    const titleEl = document.getElementById('level-title');

    if (levelEl) levelEl.textContent = String(info.level);
    if (progressEl) progressEl.style.width = `${info.pct}%`;
    if (currentEl) currentEl.textContent = String(info.totalXp);
    if (nextEl) nextEl.textContent = String(info.nextXp);
    if (titleEl) titleEl.textContent = info.title;

    bar.classList.remove('hidden');
  }

  function renderAchievementBadges(achievements) {
    const container = document.getElementById('achievement-badges');
    if (!container) return;

    const unlocked = achievements.unlocked || [];
    if (!unlocked.length) {
      container.innerHTML = `<p class="text-sm text-gray-500">${t('No achievements yet. Start practicing!', '还没有成就。开始练习吧!')}</p>`;
      container.classList.remove('hidden');
      return;
    }

    const badges = unlocked.slice(0, 6).map(a => {
      const title = isZh() ? (a.title_cn || a.title) : a.title;
      const tierColor = {
        bronze: 'border-amber-600 bg-amber-50',
        silver: 'border-gray-400 bg-gray-50',
        gold: 'border-yellow-500 bg-yellow-50',
        diamond: 'border-blue-400 bg-blue-50',
      }[a.tier] || 'border-gray-300 bg-gray-50';
      return `<div class="flex flex-col items-center gap-1 p-2 border-2 rounded-xl ${tierColor} min-w-[72px]">
        <span class="text-2xl">${a.icon || '🏆'}</span>
        <span class="text-[10px] font-semibold text-gray-700 text-center leading-tight">${title}</span>
      </div>`;
    }).join('');

    const moreCount = unlocked.length > 6 ? unlocked.length - 6 : 0;
    const moreLink = moreCount > 0
      ? `<a href="/membership/achievements.html" class="text-xs text-purple-600 hover:underline ml-2">+${moreCount} ${t('more', '更多')}</a>`
      : '';

    container.innerHTML = `<div class="flex flex-wrap gap-2">${badges}</div>${moreLink}`;
    container.classList.remove('hidden');
  }

  async function fetchEngagementData(client, userId) {
    const today = formatDateStr(new Date());
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = formatDateStr(thirtyDaysAgo);

    const [streakResult, activityResult, xpResult, achievementsResult] = await Promise.all([
      client
        .from('user_streaks')
        .select('current_streak, best_streak, last_active_date, freeze_available, total_active_days')
        .eq('user_id', userId)
        .maybeSingle(),
      client
        .from('user_daily_activity')
        .select('activity_date, sessions_completed, questions_answered')
        .eq('user_id', userId)
        .gte('activity_date', startDate)
        .order('activity_date', { ascending: false }),
      client
        .from('user_xp')
        .select('total_xp, level')
        .eq('user_id', userId)
        .maybeSingle(),
      client
        .from('user_achievements')
        .select('achievement_id, unlocked_at, achievement_definitions(id, title_en, title_cn, icon, tier, category)')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false }),
    ]);

    const streak = streakResult.data || { current_streak: 0, best_streak: 0, last_active_date: null, freeze_available: false, total_active_days: 0 };
    const activities = activityResult.data || [];
    const xp = xpResult.data || { total_xp: 0, level: 1 };
    const achievements = achievementsResult.data || [];

    const calendar = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDateStr(d);
      const entry = activities.find(a => a.activity_date === dateStr);
      calendar.push({
        date: dateStr,
        active: entry ? (entry.sessions_completed >= 1 && entry.questions_answered >= 5) : false,
        sessions: entry ? (entry.sessions_completed || 0) : 0,
      });
    }

    const todayEntry = activities.find(a => a.activity_date === today);
    const todayQualifies = todayEntry ? (todayEntry.sessions_completed >= 1 && todayEntry.questions_answered >= 5) : false;

    const unlocked = achievements.map(a => {
      const def = a.achievement_definitions || {};
      return {
        id: def.id || a.achievement_id,
        title: def.title_en || a.achievement_id,
        title_cn: def.title_cn || '',
        icon: def.icon || '🏆',
        tier: def.tier || 'bronze',
        category: def.category || 'volume',
        unlocked_at: a.unlocked_at,
      };
    });

    return {
      streak: {
        current_streak: streak.current_streak || 0,
        best_streak: streak.best_streak || 0,
        last_active_date: streak.last_active_date,
        freeze_available: streak.freeze_available || false,
        total_active_days: streak.total_active_days || 0,
        today_qualifies: todayQualifies,
      },
      calendar,
      xp: { total_xp: xp.total_xp || 0, level: xp.level || 1 },
      achievements: { unlocked },
    };
  }

  function renderEmptyState() {
    const widget = document.getElementById('streak-widget');
    const heatmap = document.getElementById('activity-heatmap');
    const xpBar = document.getElementById('xp-bar');
    const badges = document.getElementById('achievement-badges');

    if (widget) widget.classList.add('hidden');
    if (heatmap) heatmap.classList.add('hidden');
    if (xpBar) xpBar.classList.add('hidden');
    if (badges) badges.classList.add('hidden');
  }

  function bindFreezeButton() {
    const freezeBtn = document.getElementById('streak-freeze-btn');
    if (!freezeBtn) return;

    freezeBtn.addEventListener('click', async () => {
      if (freezeBtn.disabled) return;
      freezeBtn.disabled = true;
      freezeBtn.textContent = t('Freezing…', '冻结中…');

      try {
        const { data: sessionData } = await window.memberSupabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) {
          freezeBtn.textContent = t('Login required', '需要登录');
          return;
        }

        const resp = await fetch('/api/v1/engagement/freeze', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
            'content-type': 'application/json',
          },
        });
        const result = await resp.json();

        if (resp.ok && result.success) {
          freezeBtn.textContent = t(
            `Frozen! Streak preserved at ${result.streak_preserved}`,
            `已冻结！连续记录保持在 ${result.streak_preserved} 天`
          );
          freezeBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
          freezeBtn.classList.add('bg-green-500');
          const statusEl = document.getElementById('streak-status');
          if (statusEl) statusEl.textContent = t('Streak freeze used today', '今日已使用连续冻结');
        } else {
          const reason = result.reason || result.error || 'Unknown error';
          freezeBtn.textContent = reason;
          freezeBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
          freezeBtn.classList.add('bg-red-400');
        }
      } catch (err) {
        freezeBtn.textContent = t('Network error', '网络错误');
        freezeBtn.classList.add('bg-red-400');
      }

      setTimeout(() => {
        freezeBtn.disabled = false;
      }, 5000);
    });
  }

  async function loadEngagement(user) {
    if (!window.memberSupabase || !user || !user.id) {
      renderEmptyState();
      return;
    }

    try {
      const data = await fetchEngagementData(window.memberSupabase, user.id);
      renderStreakWidget(data.streak);
      renderHeatmap(data.calendar);
      renderXpBar(data.xp);
      renderAchievementBadges(data.achievements);
      bindFreezeButton();

      window.dispatchEvent(new CustomEvent('engagement-data-loaded', { detail: data }));
    } catch (_error) {
      renderEmptyState();
    }
  }

  function start() {
    window.addEventListener('member-auth-change', (event) => {
      const user = event?.detail?.user || null;
      loadEngagement(user).catch(() => renderEmptyState());
    });

    if (!window.memberSupabase) {
      renderEmptyState();
      return;
    }

    window.memberSupabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user || null;
      return loadEngagement(user);
    }).catch(() => renderEmptyState());
  }

  document.addEventListener('DOMContentLoaded', start);
})();
