(() => {
  const boardSelect = document.getElementById('exercise-filter-board');
  const tierSelect = document.getElementById('exercise-filter-tier');
  const queryInput = document.getElementById('exercise-filter-query');
  const resetBtn = document.getElementById('exercise-filter-reset');
  const summary = document.getElementById('exercise-filter-summary');
  const summaryZh = document.getElementById('exercise-filter-summary-zh');
  const empty = document.getElementById('exercise-empty');
  const emptyResetBtn = document.getElementById('exercise-empty-reset');
  const resumePanel = document.getElementById('exercise-resume');
  const resumeLink = document.getElementById('exercise-resume-link');
  const resumeTitle = document.getElementById('exercise-resume-title');
  const resumeMeta = document.getElementById('exercise-resume-meta');
  const resumeTitleZh = document.getElementById('exercise-resume-title-zh');
  const resumeMetaZh = document.getElementById('exercise-resume-meta-zh');
  const resumeClear = document.getElementById('exercise-resume-clear');
  const cards = Array.from(document.querySelectorAll('[data-exercise-card]'));

  if (!boardSelect || !tierSelect || !queryInput || !summary || !empty || cards.length === 0) {
    return;
  }

  const fallbackI18n = {
    summaryTemplate: 'Showing {visible} of {total} exercises.',
    summaryTemplateZh: '当前显示 {visible}/{total} 个互动练习。',
    resumeTitleFallback: 'Last interactive exercise',
    resumeTitleFallbackZh: '上次互动练习',
    resumeMetaFallback: 'Re-open your latest practice page.',
    resumeMetaFallbackZh: '可一键返回最近一次练习页面。',
  };
  const i18n = (typeof window.exerciseHubI18n === 'object' && window.exerciseHubI18n)
    ? { ...fallbackI18n, ...window.exerciseHubI18n }
    : fallbackI18n;
  const boardTierMap = {
    cie0580: ['core', 'extended'],
    'edexcel-4ma1': ['foundation', 'higher'],
  };
  const baseTierOptions = Array.from(tierSelect.options).map((option) => ({
    value: option.value,
    label: option.textContent || option.value,
  }));

  const hasOptionValue = (selectElement, value) => {
    if (!selectElement || !value) return false;
    return Array.from(selectElement.options).some((option) => option.value === value);
  };

  const formatTemplate = (template, tokens) => {
    return String(template || '').replace(/\{(\w+)\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(tokens, key) ? String(tokens[key]) : '';
    });
  };

  const sanitizeResumeUrl = (rawUrl) => {
    const value = String(rawUrl || '').trim();
    if (!value) return '';
    try {
      const parsed = new URL(value, window.location.origin);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
      if (parsed.origin !== window.location.origin) return '';
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch (error) {
      return '';
    }
  };

  const syncTierOptionsForBoard = () => {
    const board = boardSelect.value;
    const allowedTiers = boardTierMap[board] || null;
    const currentTier = tierSelect.value;
    const nextOptions = baseTierOptions.filter((option) => {
      if (option.value === 'all') return true;
      if (!allowedTiers) return true;
      return allowedTiers.includes(option.value);
    });

    tierSelect.innerHTML = '';
    nextOptions.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      tierSelect.appendChild(optionElement);
    });

    if (nextOptions.some((option) => option.value === currentTier)) {
      tierSelect.value = currentTier;
      return;
    }
    tierSelect.value = 'all';
  };

  const params = new URLSearchParams(window.location.search);
  const boardFromUrl = params.get('board');
  const tierFromUrl = params.get('tier');
  const queryFromUrl = params.get('q');

  if (boardFromUrl && hasOptionValue(boardSelect, boardFromUrl)) {
    boardSelect.value = boardFromUrl;
  }
  syncTierOptionsForBoard();

  const normalizedTier = String(tierFromUrl || '').toLowerCase();
  if (normalizedTier && hasOptionValue(tierSelect, normalizedTier)) {
    tierSelect.value = normalizedTier;
  }

  if (queryFromUrl) {
    queryInput.value = queryFromUrl;
  }

  const syncUrl = () => {
    const next = new URLSearchParams();
    if (boardSelect.value !== 'all') next.set('board', boardSelect.value);
    if (tierSelect.value !== 'all') next.set('tier', tierSelect.value);
    if (queryInput.value.trim() !== '') next.set('q', queryInput.value.trim());

    const nextQuery = next.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, '', nextUrl);
    }
  };

  const setResetButtonState = () => {
    if (!resetBtn) return;
    const hasFilters =
      boardSelect.value !== 'all' ||
      tierSelect.value !== 'all' ||
      queryInput.value.trim() !== '';
    resetBtn.disabled = !hasFilters;
  };

  const loadResumeExercise = () => {
    if (!resumePanel || !resumeLink || !resumeTitle || !resumeMeta) return;
    try {
      const raw = window.localStorage.getItem('lastInteractiveExerciseV1');
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (!payload || typeof payload !== 'object') return;

      const safeHref = sanitizeResumeUrl(payload.url);
      if (!safeHref) return;

      const metaParts = [payload.board, payload.tier, payload.syllabusCode]
        .filter((part) => String(part || '').trim() !== '')
        .map((part) => String(part).trim());

      resumeLink.href = safeHref;
      resumeTitle.textContent = String(payload.title || '').trim() || i18n.resumeTitleFallback;
      resumeMeta.textContent = metaParts.length
        ? metaParts.join(' · ')
        : i18n.resumeMetaFallback;
      if (resumeTitleZh) {
        const zhTitleSource = String(payload.titleZh || payload.title || '').trim();
        resumeTitleZh.textContent = zhTitleSource
          ? `最近练习：${zhTitleSource}`
          : i18n.resumeTitleFallbackZh;
      }
      if (resumeMetaZh) {
        resumeMetaZh.textContent = metaParts.length
          ? `筛选标签：${metaParts.join(' · ')}`
          : i18n.resumeMetaFallbackZh;
      }
      resumePanel.classList.remove('hidden');
    } catch (error) {
      // Ignore malformed local cache.
    }
  };

  const applyFilters = () => {
    const board = boardSelect.value;
    const tier = tierSelect.value;
    const query = queryInput.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const boardOk = board === 'all' || card.dataset.board === board;
      const tierOk = tier === 'all' || card.dataset.tier === tier;
      const queryOk = !query || (card.dataset.search || '').includes(query);
      const show = boardOk && tierOk && queryOk;
      card.hidden = !show;
      if (show) visible += 1;
    });

    summary.textContent = formatTemplate(i18n.summaryTemplate, {
      visible,
      total: cards.length,
    });
    if (summaryZh) {
      summaryZh.textContent = formatTemplate(i18n.summaryTemplateZh, {
        visible,
        total: cards.length,
      });
    }
    empty.classList.toggle('hidden', visible !== 0);
    setResetButtonState();
    syncUrl();
  };

  boardSelect.addEventListener('change', () => {
    syncTierOptionsForBoard();
    applyFilters();
  });
  tierSelect.addEventListener('change', applyFilters);
  queryInput.addEventListener('input', applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      boardSelect.value = 'all';
      syncTierOptionsForBoard();
      tierSelect.value = 'all';
      queryInput.value = '';
      applyFilters();
      queryInput.focus();
    });
  }

  if (emptyResetBtn) {
    emptyResetBtn.addEventListener('click', () => {
      boardSelect.value = 'all';
      syncTierOptionsForBoard();
      tierSelect.value = 'all';
      queryInput.value = '';
      applyFilters();
      queryInput.focus();
    });
  }

  if (resumeClear) {
    resumeClear.addEventListener('click', () => {
      window.localStorage.removeItem('lastInteractiveExerciseV1');
      if (resumePanel) resumePanel.classList.add('hidden');
    });
  }

  loadResumeExercise();
  applyFilters();
})();
