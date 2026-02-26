(() => {
  const container = document.querySelector('[data-reco-root]');
  if (!container) return;

  function formatLastSeen(isoString) {
    if (!isoString) return 'no recent timestamp';
    const ms = new Date(isoString).getTime();
    if (!Number.isFinite(ms)) return 'no recent timestamp';
    const deltaDays = Math.max(0, Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000)));
    if (deltaDays === 0) return 'last wrong: today';
    if (deltaDays === 1) return 'last wrong: 1 day ago';
    return `last wrong: ${deltaDays} days ago`;
  }

  function detectBoardFromSkill(skill) {
    const value = String(skill || '').toLowerCase();
    if (value.includes('edexcel') || value.includes('4ma1')) return 'edexcel-4ma1';
    if (value.includes('cie') || value.includes('0580')) return 'cie0580';
    return '';
  }

  function detectBoardFromSessions(sessions) {
    if (!Array.isArray(sessions)) return '';
    for (const row of sessions) {
      const slug = String(row?.exercise_slug || '').toLowerCase();
      if (slug.includes('edexcel') || slug.includes('4ma1')) return 'edexcel-4ma1';
      if (slug.includes('cie') || slug.includes('0580')) return 'cie0580';
    }
    return '';
  }

  function detectPackUrl(skill, boardHint) {
    const board = detectBoardFromSkill(skill) || boardHint;
    if (board === 'edexcel-4ma1') return '/edx4ma1/products.html';
    if (board === 'cie0580') return '/cie0580/products.html';
    return '/membership/';
  }

  function detectExerciseUrl(skill, boardHint) {
    const board = detectBoardFromSkill(skill) || boardHint;
    const params = new URLSearchParams();
    params.set('q', skill);
    if (board) params.set('board', board);
    return `/exercises/?${params.toString()}`;
  }

  function renderEmpty(message) {
    container.innerHTML = `<p class="text-sm text-gray-600">${message}</p>`;
  }

  function renderRecommendations(weakSkills, membershipActive, sessions) {
    if (!Array.isArray(weakSkills) || weakSkills.length === 0) {
      renderEmpty('Keep practicing to unlock targeted weak-point recommendations.');
      return;
    }

    const boardHint = detectBoardFromSessions(sessions);
    const sorted = weakSkills.slice().sort((a, b) => {
      const aWeighted = Number(a?.weighted_score || 0);
      const bWeighted = Number(b?.weighted_score || 0);
      if (bWeighted !== aWeighted) return bWeighted - aWeighted;
      return Number(b?.count || 0) - Number(a?.count || 0);
    });

    const top = sorted.slice(0, 4);
    container.innerHTML = top.map((item) => {
      const skill = String(item.skill || 'unclassified');
      const count = Number(item.count || 0);
      const weighted = Number(item.weighted_score || count || 0).toFixed(2);
      const practiceUrl = detectExerciseUrl(skill, boardHint);
      const packUrl = detectPackUrl(skill, boardHint);
      const lockTag = membershipActive ? '' : '<span class="inline-flex rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5">Member unlock</span>';
      return `<article class="border border-gray-200 rounded-xl p-4 bg-white">
        <div class="flex items-center justify-between gap-3">
          <p class="font-semibold text-gray-900 truncate">${skill}</p>
          ${lockTag}
        </div>
        <p class="mt-2 text-xs text-gray-600">Recent mistakes: ${count} • priority: ${weighted}</p>
        <p class="mt-1 text-xs text-gray-500">${formatLastSeen(item.last_seen_at)}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <a href="${practiceUrl}" class="inline-flex items-center rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition">Practice now</a>
          <a href="${packUrl}" class="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition">Matching pack</a>
        </div>
      </article>`;
    }).join('');
  }

  function apply(detail) {
    if (!detail || detail.error) {
      renderEmpty('Recommendation data unavailable. Please refresh after login.');
      return;
    }
    if (!detail.loaded) {
      renderEmpty('Sign in to see your weak-point learning plan.');
      return;
    }
    renderRecommendations(detail.weakSkills || [], Boolean(detail.membershipActive), detail.sessions || []);
  }

  window.addEventListener('member-dashboard-data', (event) => {
    apply(event?.detail || null);
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderEmpty('Sign in to see your weak-point learning plan.');
  });
})();
