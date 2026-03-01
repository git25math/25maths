import { getBearerToken, jsonResponse } from '../../../_lib/http.js';
import {
  getUserFromAccessToken,
  fetchProfile,
  upsertProfile,
  fetchMembershipStatus,
  fetchUserXp,
  listUserAchievements,
} from '../../../_lib/supabase_server.js';

const ALLOWED_FIELDS = ['display_name', 'preferred_lang', 'target_board', 'weekly_report_enabled'];
const VALID_LANGS = ['en', 'zh-CN'];
const VALID_BOARDS = ['cie0580', 'edexcel-4ma1'];

function validateFields(body) {
  const cleaned = {};
  for (const key of ALLOWED_FIELDS) {
    if (!(key in body)) continue;
    const val = body[key];
    if (key === 'display_name') {
      const name = String(val || '').trim().slice(0, 50);
      if (!name) return { error: 'display_name cannot be empty.' };
      cleaned.display_name = name;
    } else if (key === 'preferred_lang') {
      if (!VALID_LANGS.includes(val)) return { error: `preferred_lang must be one of: ${VALID_LANGS.join(', ')}` };
      cleaned.preferred_lang = val;
    } else if (key === 'target_board') {
      if (!VALID_BOARDS.includes(val)) return { error: `target_board must be one of: ${VALID_BOARDS.join(', ')}` };
      cleaned.target_board = val;
    } else if (key === 'weekly_report_enabled') {
      cleaned.weekly_report_enabled = Boolean(val);
    }
  }
  if (!Object.keys(cleaned).length) {
    return { error: 'No valid fields to update.' };
  }
  return { cleaned };
}

async function handleGet(env, userId, authUser) {
  const [profile, membership, xp, achievements] = await Promise.all([
    fetchProfile(env, userId).catch(() => null),
    fetchMembershipStatus(env, userId).catch(() => null),
    fetchUserXp(env, userId).catch(() => null),
    listUserAchievements(env, userId).catch(() => []),
  ]);

  return jsonResponse({
    email: authUser.email || '',
    display_name: profile?.display_name || '',
    preferred_lang: profile?.preferred_lang || 'en',
    target_board: profile?.target_board || '',
    weekly_report_enabled: profile?.weekly_report_enabled ?? true,
    membership: {
      status: membership?.status || 'none',
      period_end: membership?.period_end || null,
    },
    xp: {
      total_xp: xp?.total_xp || 0,
      level: xp?.level || 1,
    },
    achievements_unlocked: Array.isArray(achievements) ? achievements.length : 0,
  });
}

async function handlePatch(env, userId, request) {
  let body;
  try {
    body = await request.json();
  } catch (_e) {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400);
  }

  const result = validateFields(body);
  if (result.error) {
    return jsonResponse({ error: result.error }, 400);
  }

  const updated = await upsertProfile(env, userId, result.cleaned);
  return jsonResponse({
    success: true,
    profile: {
      display_name: updated?.display_name || '',
      preferred_lang: updated?.preferred_lang || 'en',
      target_board: updated?.target_board || '',
      weekly_report_enabled: updated?.weekly_report_enabled ?? true,
    },
  });
}

async function handleRequest(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Supabase environment is not fully configured.' }, 500);
  }

  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return jsonResponse({ error: 'Authentication required.' }, 401);
  }

  const authUser = await getUserFromAccessToken(env, accessToken);
  if (!authUser || !authUser.id) {
    return jsonResponse({ error: 'Invalid or expired session token.' }, 401);
  }

  const method = request.method.toUpperCase();

  if (method === 'GET') {
    return handleGet(env, authUser.id, authUser);
  }

  if (method === 'PATCH') {
    try {
      return await handlePatch(env, authUser.id, request);
    } catch (error) {
      return jsonResponse({ error: `Profile update failed: ${error.message}` }, 500);
    }
  }

  return jsonResponse({ error: `Method ${method} not allowed.` }, 405);
}

export const onRequestGet = handleRequest;
export const onRequestPatch = handleRequest;
