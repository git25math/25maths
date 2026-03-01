(() => {
  const WRONG_ATTEMPT_LOOKBACK_DAYS = 60;
  const MAX_RECENT_SESSIONS = 50;
  const MAX_RECENT_WRONG_ATTEMPTS = 200;

  function isZh() {
    return String(document.documentElement.lang || '').toLowerCase() === 'zh-cn';
  }
  function t(en, zh) { return isZh() ? zh : en; }

  function escapeHtml(rawValue) {
    return String(rawValue ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const stateBadge = document.querySelector('[data-member-center-state]');
  const helper = document.querySelector('[data-member-center-helper]');
  const membershipStatusNode = document.querySelector('[data-membership-status]');
  const membershipMetaNode = document.querySelector('[data-membership-meta]');
  const sessionsCountNode = document.querySelector('[data-sessions-count]');
  const averageScoreNode = document.querySelector('[data-average-score]');
  const weakSkillCountNode = document.querySelector('[data-weak-skill-count]');
  const weakSkillListNode = document.querySelector('[data-weak-skill-list]');
  const recentSessionsNode = document.querySelector('[data-recent-sessions]');

  if (!stateBadge || !helper || !membershipStatusNode || !membershipMetaNode || !sessionsCountNode
    || !averageScoreNode || !weakSkillCountNode || !weakSkillListNode || !recentSessionsNode) {
    return;
  }

  function resetUi() {
    membershipStatusNode.textContent = '-';
    membershipMetaNode.textContent = t('Waiting for login', '等待登录');
    sessionsCountNode.textContent = '0';
    averageScoreNode.textContent = '-';
    weakSkillCountNode.textContent = '0';
    weakSkillListNode.innerHTML = `<li class="text-gray-500">${t('No mistake data yet.', '暂无错题数据')}</li>`;
    recentSessionsNode.innerHTML = `<li class="text-gray-500">${t('No sessions yet.', '暂无练习记录')}</li>`;
  }

  function setBadge(text, classesToAdd = [], classesToRemove = []) {
    stateBadge.textContent = text;
    classesToRemove.forEach((cls) => stateBadge.classList.remove(cls));
    classesToAdd.forEach((cls) => stateBadge.classList.add(cls));
  }

  function formatDate(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString();
  }

  function isMembershipRecordActive(record) {
    if (!record) return false;
    if (String(record.status || '').toLowerCase() !== 'active') return false;
    if (!record.period_end) return true;
    const until = new Date(record.period_end).getTime();
    if (Number.isNaN(until)) return true;
    return until > Date.now();
  }

  window.memberDashboardHelpers = {
    isMembershipRecordActive,
  };

  function computeWeakSkills(rows) {
    const nowMs = Date.now();
    const grouped = new Map();
    rows.forEach((row) => {
      const key = String(row.skill_tag || 'unclassified').trim() || 'unclassified';
      const createdAtMs = new Date(row.created_at || '').getTime();
      const ageDays = Number.isFinite(createdAtMs)
        ? Math.max(0, (nowMs - createdAtMs) / (24 * 60 * 60 * 1000))
        : 30;

      let recencyWeight = 1;
      if (ageDays <= 7) recencyWeight = 1.5;
      else if (ageDays <= 30) recencyWeight = 1.0;
      else recencyWeight = 0.6;

      const current = grouped.get(key) || {
        count: 0,
        weightedScore: 0,
        lastSeenAt: null,
      };
      current.count += 1;
      current.weightedScore += recencyWeight;
      if (!current.lastSeenAt || (Number.isFinite(createdAtMs) && createdAtMs > new Date(current.lastSeenAt).getTime())) {
        current.lastSeenAt = row.created_at || null;
      }
      grouped.set(key, current);
    });

    return Array.from(grouped.entries()).map(([skill, value]) => ({
      skill,
      count: value.count,
      weighted_score: Number(value.weightedScore.toFixed(2)),
      last_seen_at: value.lastSeenAt,
    })).sort((a, b) => {
      if (b.weighted_score !== a.weighted_score) return b.weighted_score - a.weighted_score;
      if (b.count !== a.count) return b.count - a.count;
      return String(a.skill).localeCompare(String(b.skill));
    });
  }

  function renderWeakSkills(rows) {
    const weakSkills = computeWeakSkills(rows);
    if (!weakSkills.length) {
      weakSkillListNode.innerHTML = `<li class="text-gray-500">${t('No wrong-attempt clusters yet.', '暂无错题聚类')}</li>`;
      weakSkillCountNode.textContent = '0';
      return weakSkills;
    }

    weakSkillCountNode.textContent = String(weakSkills.length);
    weakSkillListNode.innerHTML = weakSkills.slice(0, 5).map((item) => {
      const weightedText = Number.isFinite(item.weighted_score) ? item.weighted_score.toFixed(2) : '0.00';
      return `<li class="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2">
        <span class="truncate">${escapeHtml(item.skill)}</span>
        <span class="text-xs font-semibold rounded bg-red-100 text-red-700 px-2 py-0.5">${item.count} / ${weightedText}</span>
      </li>`;
    }).join('');

    return weakSkills;
  }

  function renderRecentSessions(rows) {
    if (!rows.length) {
      recentSessionsNode.innerHTML = `<li class="text-gray-500">${t('No completed sessions yet.', '暂无已完成的练习')}</li>`;
      sessionsCountNode.textContent = '0';
      averageScoreNode.textContent = '-';
      return;
    }

    sessionsCountNode.textContent = String(rows.length);

    const scoredRows = rows.filter((row) => Number.isFinite(row.score) && Number.isFinite(row.question_count) && row.question_count > 0);
    if (scoredRows.length) {
      const ratioSum = scoredRows.reduce((sum, row) => sum + (row.score / row.question_count), 0);
      const avgPercent = Math.round((ratioSum / scoredRows.length) * 100);
      averageScoreNode.textContent = `${avgPercent}%`;
    } else {
      averageScoreNode.textContent = '-';
    }

    recentSessionsNode.innerHTML = rows.slice(0, 8).map((row) => {
      const scoreText = (Number.isFinite(row.score) && Number.isFinite(row.question_count))
        ? `${row.score}/${row.question_count}`
        : t('in progress', '进行中');
      const when = formatDate(row.completed_at || row.started_at);
      return `<li class="border border-gray-100 rounded-lg px-3 py-2">
        <p class="font-medium text-gray-900 truncate">${escapeHtml(row.exercise_slug || 'interactive-exercise')}</p>
        <p class="mt-1 text-xs text-gray-600">${t('Score:', '得分：')} ${scoreText} • ${when}</p>
      </li>`;
    }).join('');
  }

  async function fetchDashboardData(client, userId) {
    const attemptsCutoffIso = new Date(Date.now() - (WRONG_ATTEMPT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000)).toISOString();

    const [membershipResult, sessionsResult, attemptsResult] = await Promise.all([
      client
        .from('membership_status')
        .select('status, period_end')
        .eq('user_id', userId)
        .maybeSingle(),
      client
        .from('exercise_sessions')
        .select('exercise_slug, score, question_count, started_at, completed_at')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(MAX_RECENT_SESSIONS),
      client
        .from('question_attempts')
        .select('skill_tag, created_at')
        .eq('user_id', userId)
        .eq('is_correct', false)
        .gte('created_at', attemptsCutoffIso)
        .order('created_at', { ascending: false })
        .limit(MAX_RECENT_WRONG_ATTEMPTS),
    ]);

    if (membershipResult.error) throw membershipResult.error;
    if (sessionsResult.error) throw sessionsResult.error;
    if (attemptsResult.error) throw attemptsResult.error;

    return {
      membership: membershipResult.data || null,
      sessions: sessionsResult.data || [],
      wrongAttempts: attemptsResult.data || [],
      attemptsCutoffIso,
    };
  }

  function applyMembershipState(membership) {
    if (!membership) {
      membershipStatusNode.textContent = t('Unknown', '未知');
      membershipMetaNode.textContent = t('No membership record found yet.', '暂无会员记录');
      return;
    }
    const status = String(membership.status || 'unknown').toLowerCase();
    const statusLabels = { active: t('ACTIVE', '活跃会员'), inactive: t('INACTIVE', '非活跃'), unknown: t('UNKNOWN', '未知') };
    membershipStatusNode.textContent = statusLabels[status] || status.toUpperCase();
    if (membership.period_end) {
      membershipMetaNode.textContent = `${t('Current period ends:', '当前周期结束：')} ${formatDate(membership.period_end)}`;
    } else {
      membershipMetaNode.textContent = t('No period end date recorded.', '未记录到期日期');
    }
  }

  function emitDashboardData(detail) {
    window.dispatchEvent(new CustomEvent('member-dashboard-data', { detail }));
  }

  async function loadForUser(user) {
    if (!window.memberSupabase || !user || !user.id) {
      setBadge(t('NOT SIGNED IN', '未登录'), ['bg-gray-200', 'text-gray-700'], ['bg-emerald-100', 'text-emerald-800', 'bg-red-100', 'text-red-800']);
      helper.textContent = t('Sign in to see your latest progress and weak-point summary.', '登录后查看最新学习进度和薄弱环节');
      resetUi();
      emitDashboardData({
        loaded: false,
        error: false,
        userId: null,
        membership: null,
        membershipActive: false,
        sessions: [],
        wrongAttempts: [],
        weakSkills: [],
      });
      return;
    }

    setBadge(t('LOADING', '加载中'), ['bg-blue-100', 'text-blue-800'], ['bg-gray-200', 'text-gray-700', 'bg-emerald-100', 'text-emerald-800', 'bg-red-100', 'text-red-800']);
    helper.textContent = t('Loading your latest learning telemetry...', '正在加载学习数据...');

    try {
      const data = await fetchDashboardData(window.memberSupabase, user.id);
      applyMembershipState(data.membership);
      renderRecentSessions(data.sessions);
      const weakSkills = renderWeakSkills(data.wrongAttempts);

      const membershipActive = isMembershipRecordActive(data.membership);
      if (membershipActive) {
        setBadge(t('ACTIVE MEMBER', '活跃会员'), ['bg-emerald-100', 'text-emerald-800'], ['bg-gray-200', 'text-gray-700', 'bg-blue-100', 'text-blue-800', 'bg-red-100', 'text-red-800']);
      } else {
        setBadge(t('NOT ACTIVE', '未激活'), ['bg-red-100', 'text-red-800'], ['bg-gray-200', 'text-gray-700', 'bg-blue-100', 'text-blue-800', 'bg-emerald-100', 'text-emerald-800']);
      }
      helper.textContent = t(
        `Data updated from your member profile records. Weak-point window: last ${WRONG_ATTEMPT_LOOKBACK_DAYS} days.`,
        `数据已从会员档案更新，薄弱项窗口：最近 ${WRONG_ATTEMPT_LOOKBACK_DAYS} 天。`
      );

      emitDashboardData({
        loaded: true,
        error: false,
        userId: user.id,
        membership: data.membership,
        membershipActive,
        sessions: data.sessions,
        wrongAttempts: data.wrongAttempts,
        weakSkills,
        attemptsCutoffIso: data.attemptsCutoffIso,
      });
    } catch (error) {
      setBadge(t('LOAD ERROR', '加载失败'), ['bg-red-100', 'text-red-800'], ['bg-gray-200', 'text-gray-700', 'bg-blue-100', 'text-blue-800', 'bg-emerald-100', 'text-emerald-800']);
      helper.textContent = t('Could not load member dashboard data. Please retry after login.', '无法加载会员仪表板数据，请重新登录后重试');
      resetUi();
      emitDashboardData({
        loaded: false,
        error: true,
        userId: user.id,
        membership: null,
        membershipActive: false,
        sessions: [],
        wrongAttempts: [],
        weakSkills: [],
      });
    }
  }

  function start() {
    window.addEventListener('member-auth-notice', (event) => {
      const message = String(event?.detail?.message || '').trim();
      const level = String(event?.detail?.level || 'info').trim().toLowerCase();
      if (!message) return;
      helper.textContent = message;
      if (level === 'error' || level === 'warning') {
        setBadge('AUTH NOTICE', ['bg-amber-100', 'text-amber-800'], ['bg-gray-200', 'text-gray-700', 'bg-blue-100', 'text-blue-800', 'bg-emerald-100', 'text-emerald-800', 'bg-red-100', 'text-red-800']);
      }
    });

    window.addEventListener('member-auth-change', (event) => {
      const user = event?.detail?.user || null;
      loadForUser(user).catch(() => {
        setBadge('LOAD ERROR', ['bg-red-100', 'text-red-800'], ['bg-gray-200', 'text-gray-700']);
      });
    });

    window.addEventListener('member-reconcile-complete', (event) => {
      const reconcileUserId = String(event?.detail?.userId || '').trim();
      const currentUserId = String(window.memberState?.user?.id || '').trim();
      if (!reconcileUserId || reconcileUserId !== currentUserId) return;
      loadForUser(window.memberState?.user || null).catch(() => {
        setBadge('LOAD ERROR', ['bg-red-100', 'text-red-800'], ['bg-gray-200', 'text-gray-700']);
      });
    });

    if (!window.memberSupabase) {
      loadForUser(null).catch(() => {});
      return;
    }

    window.memberSupabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user || null;
      return loadForUser(user);
    }).catch(() => {
      loadForUser(null).catch(() => {});
    });
  }

  document.addEventListener('DOMContentLoaded', start);
})();
