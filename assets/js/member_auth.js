(() => {
  const state = {
    client: null,
    user: null,
    enabled: false,
  };

  function eachNode(selector, callback) {
    const nodes = document.querySelectorAll(selector);
    for (let i = 0; i < nodes.length; i += 1) {
      callback(nodes[i]);
    }
  }

  function setHidden(node, hidden) {
    if (hidden) {
      node.classList.add('hidden');
    } else {
      node.classList.remove('hidden');
    }
  }

  function isZh() {
    return String(document.documentElement.lang || '').toLowerCase() === 'zh-cn';
  }

  function t(enText, zhText) {
    return isZh() ? zhText : enText;
  }

  function updateUi() {
    const isAuthed = Boolean(state.user);
    const email = state.user && state.user.email ? String(state.user.email) : '';

    eachNode('[data-member-status]', (node) => {
      node.textContent = isAuthed
        ? t('Member', '会员')
        : t('Guest', '访客');
    });

    eachNode('[data-member-email]', (node) => {
      if (isAuthed && email) {
        node.textContent = email;
        node.classList.remove('hidden');
      } else {
        node.textContent = '';
        node.classList.add('hidden');
      }
    });

    eachNode('[data-member-login]', (button) => {
      setHidden(button, isAuthed);
      button.disabled = !state.enabled;
    });

    eachNode('[data-member-logout]', (button) => {
      setHidden(button, !isAuthed);
      button.disabled = !state.enabled;
    });
  }

  function emitAuthChange() {
    window.dispatchEvent(
      new CustomEvent('member-auth-change', {
        detail: {
          user: state.user,
          isAuthenticated: Boolean(state.user),
          enabled: state.enabled,
        },
      })
    );
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
      state.user = data && data.session && data.session.user ? data.session.user : null;
    }
    updateUi();
    emitAuthChange();
  }

  async function handleLoginClick() {
    if (!state.client) {
      alert(t('Member login is not configured yet.', '会员登录尚未配置完成。'));
      return;
    }
    const email = window.prompt(
      t('Enter your email to receive a login link:', '请输入邮箱以接收登录链接：')
    );
    if (!email) return;

    const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const { error } = await state.client.auth.signInWithOtp({
      email: String(email).trim(),
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      alert(t('Failed to send login email.', '发送登录邮件失败。'));
      return;
    }
    alert(t('Login email sent. Please check your inbox.', '登录邮件已发送，请检查邮箱。'));
  }

  async function handleLogoutClick() {
    if (!state.client) return;
    const { error } = await state.client.auth.signOut();
    if (error) {
      alert(t('Logout failed. Please retry.', '退出失败，请重试。'));
      return;
    }
    await refreshSession();
  }

  function bindButtons() {
    eachNode('[data-member-login]', (button) => {
      button.addEventListener('click', () => {
        handleLoginClick().catch(() => {
          alert(t('Login failed. Please retry.', '登录失败，请重试。'));
        });
      });
    });

    eachNode('[data-member-logout]', (button) => {
      button.addEventListener('click', () => {
        handleLogoutClick().catch(() => {
          alert(t('Logout failed. Please retry.', '退出失败，请重试。'));
        });
      });
    });
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
        state.user = session && session.user ? session.user : null;
        updateUi();
        emitAuthChange();
      });
    } else {
      state.client = null;
      state.enabled = false;
      state.user = null;
    }

    bindButtons();
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
