import { getBearerToken, jsonResponse } from '../../../../_lib/http.js';
import { getUserFromAccessToken, insertExerciseSession } from '../../../../_lib/supabase_server.js';

function parseIsoOrNow(value) {
  const text = String(value || '').trim();
  if (!text) return new Date().toISOString();
  const ms = new Date(text).getTime();
  if (!Number.isFinite(ms)) return new Date().toISOString();
  return new Date(ms).toISOString();
}

export async function onRequestPost(context) {
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

  let payload = null;
  try {
    payload = await request.json();
  } catch (_error) {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400);
  }

  const exerciseSlug = String(payload?.exercise_slug || '').trim();
  if (!exerciseSlug) {
    return jsonResponse({ error: 'exercise_slug is required.' }, 422);
  }

  const row = {
    user_id: authUser.id,
    exercise_slug: exerciseSlug,
    board: String(payload?.board || '').trim() || 'unknown',
    tier: String(payload?.tier || '').trim() || null,
    syllabus_code: String(payload?.syllabus_code || '').trim() || null,
    started_at: parseIsoOrNow(payload?.started_at),
  };

  let created = null;
  try {
    created = await insertExerciseSession(env, row);
  } catch (error) {
    return jsonResponse({ error: `Failed creating exercise session: ${error.message}` }, 500);
  }

  if (!created || !created.id) {
    return jsonResponse({ error: 'Failed creating exercise session.' }, 500);
  }

  return jsonResponse({
    session_id: created.id,
    started_at: created.started_at || row.started_at,
  }, 201);
}
