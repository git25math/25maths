(() => {
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

  function renderWeakSkills(rows) {
    if (!rows.length) {
      weakSkillListNode.innerHTML = '<li class="text-gray-500">No wrong-attempt clusters yet.</li>';
      weakSkillCountNode.textContent = '0';
      return;
    }

    const grouped = new Map();
    rows.forEach((row) => {
      const key = String(row.skill_tag || 'unclassified').trim() || 'unclassified';
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });
    const sorted = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1]);

    weakSkillCountNode.textContent = String(sorted.length);
    weakSkillListNode.innerHTML = sorted.slice(0, 5).map(([skill, count]) => {
      return `<li class="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2">
        <span class="truncate">${skill}</span>
        <span class="text-xs font-semibold rounded bg-red-100 text-red-700 px-2 py-0.5">${count}</span>
      </li>`;
    }).join('');
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
        .limit(50),
      client
        .from('question_attempts')
        .select('skill_tag')
        .eq('user_id', userId)
        .eq('is_correct', false)
        .order('created_at', { ascending: false })
        .limit(200),
    ]);

    if (membershipResult.error) throw membershipResult.error;
    if (sessionsResult.error) throw sessionsResult.error;
    if (attemptsResult.error) throw attemptsResult.error;

    return {
      membership: membershipResult.data || null,
      sessions: sessionsResult.data || [],
      wrongAttempts: attemptsResult.data || [],
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

  async function loadForUser(user) {
    if (!window.memberSupabase || !user || !user.id) {
      setBadge('NOT SIGNED IN', ['bg-gray-200', 'text-gray-700'], ['bg-emerald-100', 'text-emerald-800', 'bg-red-100', 'text-red-800']);
      helper.textContent = 'Sign in to see your latest progress and weak-point summary.';
      resetUi();
      return;
    }

    setBadge('LOADING', ['bg-blue-100', 'text-blue-800'], ['bg-gray-200', 'text-gray-700', 'bg-emerald-100', 'text-emerald-800', 'bg-red-100', 'text-red-800']);
    helper.textContent = 'Loading your latest learning telemetry...';

    try {
      const data = await fetchDashboardData(window.memberSupabase, user.id);
      applyMembershipState(data.membership);
      renderRecentSessions(data.sessions);
      renderWeakSkills(data.wrongAttempts);

      const isActive = String(data.membership?.status || '').toLowerCase() === 'active';
      if (isActive) {
        setBadge('ACTIVE MEMBER', ['bg-emerald-100', 'text-emerald-800'], ['bg-gray-200', 'text-gray-700', 'bg-blue-100', 'text-blue-800', 'bg-red-100', 'text-red-800']);
      } else {
        setBadge('NOT ACTIVE', ['bg-red-100', 'text-red-800'], ['bg-gray-200', 'text-gray-700', 'bg-blue-100', 'text-blue-800', 'bg-emerald-100', 'text-emerald-800']);
      }
      helper.textContent = 'Data updated from your member profile records.';
    } catch (error) {
      setBadge('LOAD ERROR', ['bg-red-100', 'text-red-800'], ['bg-gray-200', 'text-gray-700', 'bg-blue-100', 'text-blue-800', 'bg-emerald-100', 'text-emerald-800']);
      helper.textContent = 'Could not load member dashboard data. Please retry after login.';
      resetUi();
    }
  }

  function start() {
    window.addEventListener('member-auth-change', (event) => {
      const user = event?.detail?.user || null;
      loadForUser(user).catch(() => {
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
