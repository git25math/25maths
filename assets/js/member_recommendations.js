(() => {
  const container = document.querySelector('[data-reco-root]');
  if (!container) return;

  function detectBoardFromSkill(skill) {
    const value = String(skill || '').toLowerCase();
    if (value.includes('edexcel') || value.includes('4ma1')) return 'edexcel-4ma1';
    if (value.includes('cie') || value.includes('0580')) return 'cie0580';
    return '';
  }

  function detectPackUrl(skill) {
    const board = detectBoardFromSkill(skill);
    if (board === 'edexcel-4ma1') return '/edx4ma1/products.html';
    if (board === 'cie0580') return '/cie0580/products.html';
    return '/membership/';
  }

  function detectExerciseUrl(skill) {
    const board = detectBoardFromSkill(skill);
    const params = new URLSearchParams();
    params.set('q', skill);
    if (board) params.set('board', board);
    return `/exercises/?${params.toString()}`;
  }

  function renderEmpty(message) {
    container.innerHTML = `<p class="text-sm text-gray-600">${message}</p>`;
  }

  function renderRecommendations(weakSkills, membershipActive) {
    if (!Array.isArray(weakSkills) || weakSkills.length === 0) {
      renderEmpty('Keep practicing to unlock targeted weak-point recommendations.');
      return;
    }

    const top = weakSkills.slice(0, 4);
    container.innerHTML = top.map((item) => {
      const skill = String(item.skill || 'unclassified');
      const count = Number(item.count || 0);
      const practiceUrl = detectExerciseUrl(skill);
      const packUrl = detectPackUrl(skill);
      const lockTag = membershipActive ? '' : '<span class="inline-flex rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5">Member unlock</span>';
      return `<article class="border border-gray-200 rounded-xl p-4 bg-white">
        <div class="flex items-center justify-between gap-3">
          <p class="font-semibold text-gray-900 truncate">${skill}</p>
          ${lockTag}
        </div>
        <p class="mt-2 text-xs text-gray-600">Recent mistakes: ${count}</p>
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
    renderRecommendations(detail.weakSkills || [], Boolean(detail.membershipActive));
  }

  window.addEventListener('member-dashboard-data', (event) => {
    apply(event?.detail || null);
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderEmpty('Sign in to see your weak-point learning plan.');
  });
})();
