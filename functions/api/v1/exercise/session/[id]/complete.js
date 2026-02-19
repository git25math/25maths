import { getBearerToken, jsonResponse } from '../../../../../_lib/http.js';
import {
  completeExerciseSession,
  fetchExerciseSession,
  getUserFromAccessToken,
} from '../../../../../_lib/supabase_server.js';

function parseInteger(value) {
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

  const score = parseInteger(payload?.score);
  const questionCount = parseInteger(payload?.question_count);
  const durationSeconds = parseInteger(payload?.duration_seconds);

  if (!Number.isInteger(score) || score < 0) {
    return jsonResponse({ error: 'score must be a non-negative integer.' }, 422);
  }
  if (!Number.isInteger(questionCount) || questionCount <= 0) {
    return jsonResponse({ error: 'question_count must be a positive integer.' }, 422);
  }
  if (durationSeconds !== null && durationSeconds < 0) {
    return jsonResponse({ error: 'duration_seconds must be >= 0.' }, 422);
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

  if (session.completed_at) {
    return jsonResponse({
      session_id: session.id,
      completed_at: session.completed_at,
      score: session.score,
      question_count: session.question_count,
      duration_seconds: session.duration_seconds,
      already_completed: true,
    });
  }

  let updated = null;
  try {
    updated = await completeExerciseSession(env, sessionId, authUser.id, {
      completed_at: new Date().toISOString(),
      score,
      question_count: questionCount,
      duration_seconds: durationSeconds === null ? undefined : durationSeconds,
    });
  } catch (error) {
    return jsonResponse({ error: `Failed completing exercise session: ${error.message}` }, 500);
  }

  if (!updated || !updated.id) {
    return jsonResponse({ error: 'Failed completing exercise session.' }, 500);
  }

  return jsonResponse({
    session_id: updated.id,
    completed_at: updated.completed_at,
    score: updated.score,
    question_count: updated.question_count,
    duration_seconds: updated.duration_seconds,
    already_completed: false,
  });
}
