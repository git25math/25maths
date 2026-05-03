(() => {
  const container = document.querySelector('[data-reco-root]');
  if (!container) return;

  function isZh() {
    return String(document.documentElement.lang || '').toLowerCase() === 'zh-cn';
  }
  function t(en, zh) { return isZh() ? zh : en; }

  function escapeHtml(rawValue) {
    return String(rawValue ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatLastSeen(isoString) {
    if (!isoString) return t('no recent timestamp', '无近期记录');
    const ms = new Date(isoString).getTime();
    if (!Number.isFinite(ms)) return t('no recent timestamp', '无近期记录');
    const deltaDays = Math.max(0, Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000)));
    if (deltaDays === 0) return t('last wrong: today', '最近错误：今天');
    if (deltaDays === 1) return t('last wrong: 1 day ago', '最近错误：1天前');
    return t(`last wrong: ${deltaDays} days ago`, `最近错误：${deltaDays}天前`);
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
      const slug = String(row?.board || row?.resource_label || '').toLowerCase();
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

  function detectReviewUrl(skill, boardHint) {
    const board = detectBoardFromSkill(skill) || boardHint;
    const params = new URLSearchParams();
    params.set('q', skill);
    if (board) params.set('board', board);
    return `/kahoot/?${params.toString()}`;
  }

  function renderEmpty(message) {
    container.innerHTML = `<p class="text-sm text-gray-600">${message}</p>`;
  }

  function renderRecommendations(weakSkills, membershipActive, sessions) {
    if (!Array.isArray(weakSkills) || weakSkills.length === 0) {
      renderEmpty(t('Use the current resource loop: download the weekly pack, review with Kahoot, then move to the matching bundle when ready.', '使用当前资源路径：下载周练资料包，用 Kahoot 复习，准备好后进入对应合集。'));
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
      const reviewUrl = detectReviewUrl(skill, boardHint);
      const packUrl = detectPackUrl(skill, boardHint);
      const lockTag = membershipActive ? '' : `<span class="inline-flex rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5">${t('Member unlock', '会员解锁')}</span>`;
      return `<article class="border border-gray-200 rounded-xl p-4 bg-white">
        <div class="flex items-center justify-between gap-3">
          <p class="font-semibold text-gray-900 truncate">${escapeHtml(skill)}</p>
          ${lockTag}
        </div>
        <p class="mt-2 text-xs text-gray-600">${t('Recent mistakes:', '近期错误：')} ${count} • ${t('priority:', '优先级：')} ${weighted}</p>
        <p class="mt-1 text-xs text-gray-500">${formatLastSeen(item.last_seen_at)}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <a href="${escapeHtml(reviewUrl)}" class="inline-flex items-center rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition">${t('Review on Kahoot', '用 Kahoot 复习')}</a>
          <a href="${escapeHtml(packUrl)}" class="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition">${t('Matching pack', '匹配资料包')}</a>
        </div>
      </article>`;
    }).join('');
  }

  function apply(detail) {
    if (!detail || detail.error) {
      renderEmpty(t('Recommendation data unavailable. Please refresh after login.', '推荐数据不可用，请刷新登录后重试'));
      return;
    }
    if (!detail.loaded) {
      renderEmpty(t('Sign in to see your weak-point learning plan.', '登录后查看薄弱项学习计划'));
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
