(() => {
  const WRONG_ATTEMPT_LOOKBACK_DAYS = 60;
  const MAX_RECENT_SESSIONS = 50;
  const MAX_RECENT_WRONG_ATTEMPTS = 200;

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
    membershipMetaNode.textContent = 'Waiting for login';
    sessionsCountNode.textContent = '0';
    averageScoreNode.textContent = '-';
    weakSkillCountNode.textContent = '0';
    weakSkillListNode.innerHTML = '<li class="text-gray-500">No mistake data yet.</li>';
    recentSessionsNode.innerHTML = '<li class="text-gray-500">No sessions yet.</li>';
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
    const grouped = new Map();
    rows.forEach((row) => {
      const key = String(row.skill_tag || 'unclassified').trim() || 'unclassified';
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });
    return Array.from(grouped.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([skill, count]) => ({ skill, count }));
  }

  function renderWeakSkills(rows) {
    const weakSkills = computeWeakSkills(rows);
    if (!weakSkills.length) {
      weakSkillListNode.innerHTML = '<li class="text-gray-500">No wrong-attempt clusters yet.</li>';
      weakSkillCountNode.textContent = '0';
      return weakSkills;
    }

    weakSkillCountNode.textContent = String(weakSkills.length);
    weakSkillListNode.innerHTML = weakSkills.slice(0, 5).map((item) => {
      return `<li class="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2">
        <span class="truncate">${item.skill}</span>
        <span class="text-xs font-semibold rounded bg-red-100 text-red-700 px-2 py-0.5">${item.count}</span>
      </li>`;
    }).join('');

    return weakSkills;
  }

  function renderRecentSessions(rows) {
    if (!rows.length) {
      recentSessionsNode.innerHTML = '<li class="text-gray-500">No completed sessions yet.</li>';
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
        : 'in progress';
      const when = formatDate(row.completed_at || row.started_at);
      return `<li class="border border-gray-100 rounded-lg px-3 py-2">
        <p class="font-medium text-gray-900 truncate">${row.exercise_slug || 'interactive-exercise'}</p>
        <p class="mt-1 text-xs text-gray-600">Score: ${scoreText} • ${when}</p>
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
        .select('skill_tag')
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
      membershipStatusNode.textContent = 'Unknown';
      membershipMetaNode.textContent = 'No membership record found yet.';
      return;
    }
    const status = String(membership.status || 'unknown').toLowerCase();
    membershipStatusNode.textContent = status.toUpperCase();
    if (membership.period_end) {
      membershipMetaNode.textContent = `Current period ends: ${formatDate(membership.period_end)}`;
    } else {
      membershipMetaNode.textContent = 'No period end date recorded.';
    }
  }

  function emitDashboardData(detail) {
    window.dispatchEvent(new CustomEvent('member-dashboard-data', { detail }));
  }

  async function loadForUser(user) {
    if (!window.memberSupabase || !user || !user.id) {
      setBadge('NOT SIGNED IN', ['bg-gray-200', 'text-gray-700'], ['bg-emerald-100', 'text-emerald-800', 'bg-red-100', 'text-red-800']);
      helper.textContent = 'Sign in to see your latest progress and weak-point summary.';
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

    setBadge('LOADING', ['bg-blue-100', 'text-blue-800'], ['bg-gray-200', 'text-gray-700', 'bg-emerald-100', 'text-emerald-800', 'bg-red-100', 'text-red-800']);
    helper.textContent = 'Loading your latest learning telemetry...';

    try {
      const data = await fetchDashboardData(window.memberSupabase, user.id);
      applyMembershipState(data.membership);
      renderRecentSessions(data.sessions);
      const weakSkills = renderWeakSkills(data.wrongAttempts);

      const membershipActive = isMembershipRecordActive(data.membership);
      if (membershipActive) {
        setBadge('ACTIVE MEMBER', ['bg-emerald-100', 'text-emerald-800'], ['bg-gray-200', 'text-gray-700', 'bg-blue-100', 'text-blue-800', 'bg-red-100', 'text-red-800']);
      } else {
        setBadge('NOT ACTIVE', ['bg-red-100', 'text-red-800'], ['bg-gray-200', 'text-gray-700', 'bg-blue-100', 'text-blue-800', 'bg-emerald-100', 'text-emerald-800']);
      }
      helper.textContent = `Data updated from your member profile records. Weak-point window: last ${WRONG_ATTEMPT_LOOKBACK_DAYS} days.`;

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
      setBadge('LOAD ERROR', ['bg-red-100', 'text-red-800'], ['bg-gray-200', 'text-gray-700', 'bg-blue-100', 'text-blue-800', 'bg-emerald-100', 'text-emerald-800']);
      helper.textContent = 'Could not load member dashboard data. Please retry after login.';
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
