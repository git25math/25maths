(() => {
  'use strict';

  const TOAST_DISPLAY_MS = 5000;
  const TOAST_SLIDE_IN_MS = 500;
  const TOAST_QUEUE_DELAY_MS = 600;

  let toastQueue = [];
  let isShowing = false;

  function isZh() {
    return String(document.documentElement.lang || '').toLowerCase() === 'zh-cn';
  }

  function t(en, cn) {
    return isZh() ? cn : en;
  }

  function ensureToastElement() {
    let toast = document.getElementById('achievement-toast');
    if (toast) return toast;

    toast = document.createElement('div');
    toast.id = 'achievement-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 hidden bg-white border-2 border-yellow-400 rounded-2xl shadow-xl p-5 transform translate-y-4 opacity-0 transition-all duration-500 max-w-sm';
    toast.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="text-5xl" id="toast-icon">🏆</div>
        <div>
          <div class="text-xs font-semibold text-yellow-600 uppercase tracking-wide" id="toast-header">
            ${t('Achievement Unlocked!', '成就解锁!')}
          </div>
          <div class="text-lg font-bold text-gray-900" id="toast-title"></div>
          <div class="text-sm text-gray-500" id="toast-xp"></div>
        </div>
      </div>
    `;
    document.body.appendChild(toast);
    return toast;
  }

  function showToast(achievement) {
    const toast = ensureToastElement();
    const iconEl = document.getElementById('toast-icon');
    const headerEl = document.getElementById('toast-header');
    const titleEl = document.getElementById('toast-title');
    const xpEl = document.getElementById('toast-xp');

    if (iconEl) iconEl.textContent = achievement.icon || '🏆';
    if (headerEl) headerEl.textContent = t('Achievement Unlocked!', '成就解锁!');
    if (titleEl) {
      const title = isZh() ? (achievement.title_cn || achievement.title) : achievement.title;
      titleEl.textContent = title || 'Achievement';
    }
    if (xpEl) xpEl.textContent = achievement.xp_earned ? `+${achievement.xp_earned} XP` : '';

    toast.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
      });
    });

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => {
        toast.classList.add('hidden');
        isShowing = false;
        processQueue();
      }, TOAST_SLIDE_IN_MS);
    }, TOAST_DISPLAY_MS);
  }

  function showLevelUpToast(levelInfo) {
    const toast = ensureToastElement();
    const iconEl = document.getElementById('toast-icon');
    const headerEl = document.getElementById('toast-header');
    const titleEl = document.getElementById('toast-title');
    const xpEl = document.getElementById('toast-xp');

    if (iconEl) iconEl.textContent = '⬆️';
    if (headerEl) headerEl.textContent = t('Level Up!', '升级!');
    if (titleEl) titleEl.textContent = `${t('Level', '等级')} ${levelInfo.level} — ${levelInfo.title}`;
    if (xpEl) xpEl.textContent = '';

    toast.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
      });
    });

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => {
        toast.classList.add('hidden');
        isShowing = false;
        processQueue();
      }, TOAST_SLIDE_IN_MS);
    }, TOAST_DISPLAY_MS);
  }

  function processQueue() {
    if (isShowing || toastQueue.length === 0) return;
    isShowing = true;

    const item = toastQueue.shift();
    setTimeout(() => {
      if (item.type === 'level_up') {
        showLevelUpToast(item.data);
      } else {
        showToast(item.data);
      }
    }, TOAST_QUEUE_DELAY_MS);
  }

  function queueAchievement(achievement) {
    toastQueue.push({ type: 'achievement', data: achievement });
    processQueue();
  }

  function queueLevelUp(levelInfo) {
    toastQueue.push({ type: 'level_up', data: levelInfo });
    processQueue();
  }

  window.addEventListener('achievement-unlocked', (event) => {
    const achievements = event?.detail?.newly_unlocked || [];
    const levelUp = event?.detail?.level_up || false;
    const levelInfo = event?.detail?.level_info || null;

    achievements.forEach(a => queueAchievement(a));
    if (levelUp && levelInfo) {
      queueLevelUp(levelInfo);
    }
  });

  window.achievementToast = {
    show: queueAchievement,
    showLevelUp: queueLevelUp,
  };
})();
