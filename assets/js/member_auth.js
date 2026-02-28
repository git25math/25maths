(() => {
  const state = {
    client: null,
    user: null,
    enabled: false,
  };
  const reconcileState = {
    inFlight: false,
    lastUserId: '',
  };

  function isZh() {
    return String(document.documentElement.lang || '').toLowerCase() === 'zh-cn';
  }

  function t(enText, zhText) {
    return isZh() ? zhText : enText;
  }

  function getMemberCenterPath() {
    return '/membership/';
  }

  function emitAuthNotice(level, message, extras = {}) {
    const detail = {
      level: String(level || 'info'),
      message: String(message || '').trim(),
      ...extras,
    };
    window.dispatchEvent(new CustomEvent('member-auth-notice', { detail }));
  }

  function updateUi() {
    const isAuthed = Boolean(state.user);
    const email = state.user?.email || '';

    document.querySelectorAll('[data-member-status]').forEach((node) => {
      node.textContent = isAuthed
        ? t('Member', '会员')
        : t('Guest', '访客');
    });

    document.querySelectorAll('[data-member-email]').forEach((node) => {
      if (isAuthed && email) {
        node.textContent = email;
        node.classList.remove('hidden');
      } else {
        node.textContent = '';
        node.classList.add('hidden');
      }
    });

    document.querySelectorAll('[data-member-login]').forEach((button) => {
      button.classList.toggle('hidden', isAuthed);
      button.disabled = !state.enabled;
    });

    document.querySelectorAll('[data-member-logout]').forEach((button) => {
      button.classList.toggle('hidden', !isAuthed);
      button.disabled = !state.enabled;
    });
  }

  function emitAuthChange() {
    const detail = {
      user: state.user,
      isAuthenticated: Boolean(state.user),
      enabled: state.enabled,
    };
    window.memberState = {
      isAuthed: detail.isAuthenticated,
      user: detail.user,
      enabled: detail.enabled,
    };
    window.dispatchEvent(
      new CustomEvent('member-auth-change', {
        detail,
      })
    );
  }

  async function triggerMembershipReconcileIfNeeded() {
    if (!state.client || !state.user || !state.user.id) return;
    if (reconcileState.inFlight) return;
    if (reconcileState.lastUserId === state.user.id) return;

    reconcileState.inFlight = true;
    try {
      const { data } = await state.client.auth.getSession();
      const accessToken = String(data?.session?.access_token || '').trim();
      if (!accessToken) return;
      const response = await fetch('/api/v1/membership/reconcile', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      let payload = null;
      try {
        payload = await response.json();
      } catch (_error) {
        payload = null;
      }
      window.dispatchEvent(new CustomEvent('member-reconcile-complete', {
        detail: {
          ok: response.ok,
          status: response.status,
          payload,
          userId: state.user.id,
        },
      }));
      reconcileState.lastUserId = state.user.id;
    } catch (_error) {
      // Reconcile is best-effort; auth UI should not be blocked.
    } finally {
      reconcileState.inFlight = false;
    }
  }

  async function refreshSession() {
    if (!state.client) {
      state.user = null;
      updateUi();
      emitAuthChange();
      return;
    }
    const { data, error } = await state.client.auth.getSession();
    if (error) {
      state.user = null;
    } else {
      state.user = data?.session?.user || null;
    }
    updateUi();
    emitAuthChange();
    await triggerMembershipReconcileIfNeeded();
  }

  function openLoginDialog() {
    const dialog = document.getElementById('member-login-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') {
      // Fallback for browsers without <dialog> support
      const email = window.prompt(
        t('Enter your email to receive a login link:', '请输入邮箱以接收登录链接：')
      );
      if (email) submitLoginEmail(String(email).trim());
      return;
    }
    const input = dialog.querySelector('[data-login-email-input]');
    const errorNode = dialog.querySelector('[data-login-error]');
    if (input) input.value = '';
    if (errorNode) errorNode.textContent = '';
    dialog.showModal();
  }

  function closeLoginDialog() {
    const dialog = document.getElementById('member-login-dialog');
    if (dialog && typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    }
  }

  async function submitLoginEmail(email) {
    if (!email) return;
    const redirectTo = `${window.location.origin}${getMemberCenterPath()}`;
    const { error } = await state.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    closeLoginDialog();
    if (error) {
      emitAuthNotice('error', t('Failed to send login email.', '发送登录邮件失败。'));
      return;
    }
    emitAuthNotice('success', t('Login email sent. Please check your inbox.', '登录邮件已发送，请检查邮箱。'));
  }

  async function handleLoginClick() {
    if (!state.client) {
      emitAuthNotice('warning', t('Member login is not configured yet.', '会员登录尚未配置完成。'));
      return;
    }
    openLoginDialog();
  }

  async function handleLogoutClick() {
    if (!state.client) return;
    const { error } = await state.client.auth.signOut();
    if (error) {
      emitAuthNotice('error', t('Logout failed. Please retry.', '退出失败，请重试。'));
      return;
    }
    await refreshSession();
  }

  function normalizeOtpType(rawType) {
    const value = String(rawType || '').trim().toLowerCase();
    if (!value) return 'magiclink';
    const allowed = new Set(['magiclink', 'recovery', 'invite', 'email_change', 'email', 'signup']);
    if (allowed.has(value)) return value;
    return 'magiclink';
  }

  function safeDecode(value) {
    const text = String(value || '');
    if (!text) return '';
    try {
      return decodeURIComponent(text.replace(/\+/g, ' '));
    } catch (_error) {
      return text;
    }
  }

  function stripAuthParamsFromUrl() {
    const url = new URL(window.location.href);
    const keys = ['code', 'token_hash', 'type', 'email', 'error', 'error_code', 'error_description'];
    let changed = false;
    keys.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    });
    const hadHash = Boolean(window.location.hash);
    if (!changed && !hadHash) return;

    const query = url.searchParams.toString();
    const nextUrl = `${url.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState({}, '', nextUrl);
  }

  async function recoverSessionFromUrlIfNeeded() {
    if (!state.client) return;

    const queryParams = new URLSearchParams(window.location.search || '');
    const rawHash = String(window.location.hash || '').replace(/^#/, '');
    const hashParams = new URLSearchParams(rawHash);

    const callbackError = String(queryParams.get('error') || hashParams.get('error') || '').trim();
    const callbackErrorDescription = safeDecode(
      String(queryParams.get('error_description') || hashParams.get('error_description') || '')
    ).trim();

    if (callbackError) {
      emitAuthNotice(
        'error',
        t(
          `Login callback failed: ${callbackErrorDescription || callbackError}.`,
          `登录回跳失败：${callbackErrorDescription || callbackError}。`
        ),
        {
          code: callbackError,
          description: callbackErrorDescription || null,
        }
      );
      stripAuthParamsFromUrl();
      return;
    }

    const accessToken = String(hashParams.get('access_token') || queryParams.get('access_token') || '').trim();
    const refreshToken = String(hashParams.get('refresh_token') || queryParams.get('refresh_token') || '').trim();
    if (accessToken && refreshToken) {
      const { data, error } = await state.client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (!error && data?.session) {
        stripAuthParamsFromUrl();
        emitAuthNotice('success', t('Login completed.', '登录成功。'));
        return;
      }
    }

    const oauthCode = String(queryParams.get('code') || '').trim();
    if (oauthCode && typeof state.client.auth.exchangeCodeForSession === 'function') {
      const { data, error } = await state.client.auth.exchangeCodeForSession(oauthCode);
      if (!error && data?.session) {
        stripAuthParamsFromUrl();
        emitAuthNotice('success', t('Login completed.', '登录成功。'));
        return;
      }
    }

    const tokenHash = String(queryParams.get('token_hash') || '').trim();
    if (tokenHash && typeof state.client.auth.verifyOtp === 'function') {
      const otpType = normalizeOtpType(queryParams.get('type'));
      const email = String(queryParams.get('email') || '').trim();
      const payload = {
        token_hash: tokenHash,
        type: otpType,
      };
      if (email) {
        payload.email = email;
      }
      const { data, error } = await state.client.auth.verifyOtp(payload);
      if (!error && data?.session) {
        stripAuthParamsFromUrl();
        emitAuthNotice('success', t('Login completed.', '登录成功。'));
        return;
      }
    }

    if (oauthCode || tokenHash || accessToken || refreshToken) {
      emitAuthNotice(
        'warning',
        t(
          'Login link callback was detected, but no session was created. Please request a fresh login email.',
          '检测到登录回跳，但未成功创建会话。请重新获取一次登录邮件。'
        )
      );
      stripAuthParamsFromUrl();
    }
  }

  function bindButtons() {
    document.querySelectorAll('[data-member-login]').forEach((button) => {
      button.addEventListener('click', () => {
        handleLoginClick().catch(() => {
          emitAuthNotice('error', t('Login failed. Please retry.', '登录失败，请重试。'));
        });
      });
    });

    document.querySelectorAll('[data-member-logout]').forEach((button) => {
      button.addEventListener('click', () => {
        handleLogoutClick().catch(() => {
          emitAuthNotice('error', t('Logout failed. Please retry.', '退出失败，请重试。'));
        });
      });
    });

    // Bind login dialog form
    const dialog = document.getElementById('member-login-dialog');
    if (dialog) {
      const form = dialog.querySelector('[data-login-form]');
      const cancelBtn = dialog.querySelector('[data-login-cancel]');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = dialog.querySelector('[data-login-email-input]');
          const email = String(input?.value || '').trim();
          if (!email) return;
          submitLoginEmail(email).catch(() => {
            closeLoginDialog();
            emitAuthNotice('error', t('Login failed. Please retry.', '登录失败，请重试。'));
          });
        });
      }
      if (cancelBtn) {
        cancelBtn.addEventListener('click', closeLoginDialog);
      }
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) closeLoginDialog();
      });
    }
  }

  async function initialize() {
    const config = window.__SUPABASE_CONFIG__ || {};
    const supabaseUrl = String(config.url || '').trim();
    const supabaseAnonKey = String(config.anonKey || '').trim();

    if (window.supabase && supabaseUrl && supabaseAnonKey) {
      state.client = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      state.enabled = true;
      window.memberSupabase = state.client;

      state.client.auth.onAuthStateChange((_event, session) => {
        state.user = session?.user || null;
        updateUi();
        emitAuthChange();
        triggerMembershipReconcileIfNeeded().catch(() => {});
      });
    } else {
      state.client = null;
      state.enabled = false;
      state.user = null;
    }

    bindButtons();
    await recoverSessionFromUrlIfNeeded();
    await refreshSession();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initialize().catch(() => {
      state.client = null;
      state.user = null;
      state.enabled = false;
      updateUi();
      emitAuthChange();
    });
  });
})();
