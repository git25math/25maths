import { getBearerToken, jsonResponse } from '../../../../../../_lib/http.js';
import {
  fetchExerciseSession,
  getUserFromAccessToken,
  insertQuestionAttempt,
} from '../../../../../../_lib/supabase_server.js';

function parseIntegerOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (!Number.isInteger(num)) return null;
  return num;
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const sessionId = String(params?.id || '').trim();
  if (!sessionId) {
    return jsonResponse({ error: 'Missing session id.' }, 404);
  }

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

  const questionIndex = parseIntegerOrNull(payload?.question_index);
  if (!Number.isInteger(questionIndex) || questionIndex < 0) {
    return jsonResponse({ error: 'question_index must be a non-negative integer.' }, 422);
  }

  if (typeof payload?.is_correct !== 'boolean') {
    return jsonResponse({ error: 'is_correct must be boolean.' }, 422);
  }

  let session = null;
  try {
    session = await fetchExerciseSession(env, sessionId);
  } catch (error) {
    return jsonResponse({ error: `Failed reading exercise session: ${error.message}` }, 500);
  }

  if (!session) {
    return jsonResponse({ error: 'Session not found.' }, 404);
  }
  if (String(session.user_id || '') !== String(authUser.id || '')) {
    return jsonResponse({ error: 'Session does not belong to current user.' }, 403);
  }

  const row = {
    session_id: sessionId,
    user_id: authUser.id,
    question_index: questionIndex,
    is_correct: payload.is_correct,
    selected_answer: parseIntegerOrNull(payload?.selected_answer),
    correct_answer: parseIntegerOrNull(payload?.correct_answer),
    skill_tag: String(payload?.skill_tag || '').trim() || null,
  };

  let created = null;
  try {
    created = await insertQuestionAttempt(env, row);
  } catch (error) {
    return jsonResponse({ error: `Failed recording question attempt: ${error.message}` }, 500);
  }

  if (!created || !created.id) {
    return jsonResponse({ error: 'Failed recording question attempt.' }, 500);
  }

  return jsonResponse({
    attempt_id: created.id,
    recorded_at: created.created_at || new Date().toISOString(),
  }, 201);
}
