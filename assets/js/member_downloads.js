(() => {
  const grid = document.getElementById('weekly-releases-grid');
  if (!grid) return;

  const WEEKS = [
    { week: 1, topic: 'Fractions, Decimals & Percentages', en: 'member-week01-number-fdp-en-2026w10', bi: 'member-week01-number-fdp-bilingual-2026w10' },
    { week: 2, topic: 'Powers & Indices', en: 'member-week02-number-powers-indices-en-2026w11', bi: 'member-week02-number-powers-indices-bilingual-2026w11' },
    { week: 3, topic: 'Ratio & Proportion', en: 'member-week03-number-ratio-proportion-en-2026w12', bi: 'member-week03-number-ratio-proportion-bilingual-2026w12' },
    { week: 4, topic: 'Standard Form & Estimation', en: 'member-week04-number-standard-form-estimation-en-2026w13', bi: 'member-week04-number-standard-form-estimation-bilingual-2026w13' },
    { week: 5, topic: 'Expressions & Equations', en: 'member-week05-algebra-expressions-equations-en-2026w14', bi: 'member-week05-algebra-expressions-equations-bilingual-2026w14' },
    { week: 6, topic: 'Inequalities & Sequences', en: 'member-week06-algebra-inequalities-sequences-en-2026w15', bi: 'member-week06-algebra-inequalities-sequences-bilingual-2026w15' },
    { week: 7, topic: 'Coordinate Geometry', en: 'member-week07-coordinate-geometry-en-2026w16', bi: 'member-week07-coordinate-geometry-bilingual-2026w16' },
    { week: 8, topic: 'Angles & Symmetry', en: 'member-week08-geometry-angles-symmetry-en-2026w17', bi: 'member-week08-geometry-angles-symmetry-bilingual-2026w17' },
    { week: 9, topic: 'Area & Volume', en: 'member-week09-mensuration-area-volume-en-2026w18', bi: 'member-week09-mensuration-area-volume-bilingual-2026w18' },
    { week: 10, topic: 'Trigonometry & Pythagoras', en: 'member-week10-trigonometry-pythagoras-en-2026w19', bi: 'member-week10-trigonometry-pythagoras-bilingual-2026w19' },
    { week: 11, topic: 'Probability', en: 'member-week11-probability-en-2026w20', bi: 'member-week11-probability-bilingual-2026w20' },
    { week: 12, topic: 'Statistics', en: 'member-week12-statistics-en-2026w21', bi: 'member-week12-statistics-bilingual-2026w21' },
  ];

  function renderGuestState() {
    grid.innerHTML = `<article class="sm:col-span-2 md:col-span-3 lg:col-span-4 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
      <p class="text-gray-500 text-sm">Sign in with your Term Practice Pass email to access your weekly practice packs.</p>
      <a href="/subscription.html" class="inline-block mt-4 bg-primary text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition ui-focus-ring">Get Term Pass</a>
    </article>`;
  }

  function renderNonMemberState() {
    grid.innerHTML = `<article class="sm:col-span-2 md:col-span-3 lg:col-span-4 bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
      <p class="text-amber-900 text-sm font-semibold">No active Term Practice Pass found.</p>
      <p class="text-amber-800 text-sm mt-2">Purchase a pass to unlock 12 weeks of topical practice packs with full solutions.</p>
      <a href="/subscription.html" class="inline-block mt-4 bg-primary text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition ui-focus-ring">Get Term Pass &mdash; $24.99</a>
    </article>`;
  }

  function renderLoadingState() {
    grid.innerHTML = `<article class="sm:col-span-2 md:col-span-3 lg:col-span-4 bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
      <p class="text-blue-900 text-sm font-semibold">Loading your practice packs...</p>
    </article>`;
  }

  async function getAccessToken() {
    if (!window.memberSupabase) return '';
    const { data } = await window.memberSupabase.auth.getSession();
    return String(data?.session?.access_token || '').trim();
  }

  async function handleDownload(button, releaseId) {
    if (button.disabled) return;
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Loading...';

    try {
      const token = await getAccessToken();
      if (!token) {
        alert('Session expired. Please log in again.');
        return;
      }

      const response = await fetch(`/api/v1/download/${encodeURIComponent(releaseId)}?channel=member`, {
        method: 'GET',
        headers: { authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        alert(body.error || 'Download failed. Please try again.');
        return;
      }

      const result = await response.json();
      if (result.download_url) {
        window.open(result.download_url, '_blank');
      } else {
        alert('No download URL returned. Please try again.');
      }
    } catch (_error) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  function renderWeekCards() {
    grid.innerHTML = WEEKS.map((w) => {
      const weekLabel = String(w.week).padStart(2, '0');
      return `<article class="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col">
        <div class="flex items-center gap-2 mb-3">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-bold">${weekLabel}</span>
          <h3 class="text-sm font-semibold text-gray-900">Week ${w.week}</h3>
        </div>
        <p class="text-sm text-gray-700 mb-4 flex-1">${w.topic}</p>
        <div class="flex gap-2">
          <button type="button" data-download-release="${w.en}" class="flex-1 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition">EN</button>
          <button type="button" data-download-release="${w.bi}" class="flex-1 text-xs font-semibold px-3 py-2 rounded-lg border border-primary bg-primary bg-opacity-10 text-primary hover:bg-opacity-20 transition">Bilingual</button>
        </div>
      </article>`;
    }).join('');

    grid.querySelectorAll('[data-download-release]').forEach((button) => {
      button.addEventListener('click', () => {
        const releaseId = button.getAttribute('data-download-release');
        handleDownload(button, releaseId).catch(() => {
          button.disabled = false;
        });
      });
    });
  }

  function apply(detail) {
    if (!detail || !detail.loaded || detail.error) {
      renderGuestState();
      return;
    }
    if (!detail.membershipActive) {
      renderNonMemberState();
      return;
    }
    renderWeekCards();
  }

  window.addEventListener('member-dashboard-data', (event) => {
    apply(event?.detail || null);
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderGuestState();
  });
})();
