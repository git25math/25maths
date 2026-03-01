function ensureEnv(env, keys) {
  const missing = keys.filter((key) => !env[key] || !String(env[key]).trim());
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

export function serviceHeaders(env) {
  const apiKey = String(env.SUPABASE_SERVICE_ROLE_KEY);
  return {
    apikey: apiKey,
    authorization: `Bearer ${apiKey}`,
    'content-type': 'application/json',
  };
}

function anonHeaders(env, bearerToken) {
  return {
    apikey: String(env.SUPABASE_ANON_KEY),
    authorization: `Bearer ${bearerToken}`,
  };
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_error) {
    return { raw: text };
  }
}

export async function getUserFromAccessToken(env, bearerToken) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_ANON_KEY']);
  const url = `${env.SUPABASE_URL}/auth/v1/user`;
  const response = await fetch(url, {
    method: 'GET',
    headers: anonHeaders(env, bearerToken),
  });
  if (!response.ok) {
    return null;
  }
  const payload = await parseJsonResponse(response);
  if (!payload || !payload.id) return null;
  return payload;
}

export async function upsertMembershipStatus(env, row) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const url = `${env.SUPABASE_URL}/rest/v1/membership_status?on_conflict=user_id`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`membership_status upsert failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  return parseJsonResponse(response);
}

export async function insertPayhipEventLog(env, row) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const url = `${env.SUPABASE_URL}/rest/v1/payhip_event_log?on_conflict=provider_event_id`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'resolution=ignore-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`payhip_event_log insert failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : payload;
}

async function fetchPayhipEventLog(env, providerEventId) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const query = new URLSearchParams({
    select: 'id,provider_event_id,attempts,handled_status,last_error',
    provider_event_id: `eq.${providerEventId}`,
    limit: '1',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/payhip_event_log?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`payhip_event_log fetch failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : null;
}

export async function updatePayhipEventLog(env, providerEventId, patch) {
  if (!providerEventId) return null;
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

  const nextPatch = {};
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      nextPatch[key] = value;
    }
  });
  if (!Object.keys(nextPatch).length) {
    return fetchPayhipEventLog(env, providerEventId);
  }

  const query = new URLSearchParams({
    provider_event_id: `eq.${providerEventId}`,
    select: 'id,provider_event_id,attempts,handled_status,last_error,handled_at',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/payhip_event_log?${query.toString()}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(nextPatch),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`payhip_event_log patch failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : payload;
}

export async function incrementPayhipEventAttempts(env, providerEventId) {
  if (!providerEventId) return null;
  const current = await fetchPayhipEventLog(env, providerEventId);
  const nextAttempts = Number(current?.attempts || 0) + 1;
  return updatePayhipEventLog(env, providerEventId, { attempts: nextAttempts });
}

export async function listPayhipEventsForEmail(env, email, options = {}) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return [];

  const limit = Number(options.limit || 50);
  const statusFilter = Array.isArray(options.statuses) && options.statuses.length
    ? options.statuses
    : ['pending', 'failed'];
  const validStatuses = statusFilter
    .map((item) => String(item || '').trim().toLowerCase())
    .filter(Boolean);

  const query = new URLSearchParams({
    select: 'id,provider_event_id,event_type,customer_email,payload,handled_status,attempts',
    customer_email: `eq.${normalizedEmail}`,
    order: 'id.asc',
    limit: String(Number.isFinite(limit) ? limit : 50),
  });
  if (validStatuses.length) {
    query.set('handled_status', `in.(${validStatuses.join(',')})`);
  }

  const url = `${env.SUPABASE_URL}/rest/v1/payhip_event_log?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`payhip_event_log list failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload : [];
}

export async function listAuthUsers(env, page = 1, perPage = 1000) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  const url = `${env.SUPABASE_URL}/auth/v1/admin/users?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`list auth users failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  if (payload && Array.isArray(payload.users)) return payload.users;
  if (Array.isArray(payload)) return payload;
  return [];
}

export async function findAuthUserByEmail(env, email) {
  const target = String(email || '').trim().toLowerCase();
  if (!target) return null;

  let page = 1;
  while (page <= 5) {
    const users = await listAuthUsers(env, page, 1000);
    if (!users.length) break;
    const matched = users.find((item) => String(item.email || '').trim().toLowerCase() === target);
    if (matched) return matched;
    page += 1;
  }
  return null;
}

export async function fetchMembershipStatus(env, userId) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const query = new URLSearchParams({
    select: 'status,period_end',
    user_id: `eq.${userId}`,
    limit: '1',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/membership_status?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`membership_status fetch failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : null;
}

export async function listMemberBenefitOffers(env, options = {}) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

  const availableFor = Array.isArray(options.availableFor)
    ? options.availableFor
      .map((value) => String(value || '').trim().toLowerCase())
      .filter(Boolean)
    : [];

  const query = new URLSearchParams({
    select: 'id,kind,title,description,cta_label,cta_url,coupon_code,available_for,is_active,priority,starts_at,ends_at,metadata',
    is_active: 'eq.true',
    order: 'priority.asc,created_at.asc',
    limit: String(Number.isFinite(Number(options.limit)) ? Number(options.limit) : 100),
  });

  const url = `${env.SUPABASE_URL}/rest/v1/member_benefit_offers?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`member_benefit_offers fetch failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }

  const payload = await parseJsonResponse(response);
  const rows = Array.isArray(payload) ? payload : [];
  const nowMs = Date.now();

  return rows.filter((row) => {
    const audience = String(row?.available_for || 'paid').trim().toLowerCase();
    if (availableFor.length && !availableFor.includes(audience)) {
      return false;
    }

    const startsAtMs = row?.starts_at ? new Date(row.starts_at).getTime() : Number.NaN;
    if (Number.isFinite(startsAtMs) && startsAtMs > nowMs) {
      return false;
    }

    const endsAtMs = row?.ends_at ? new Date(row.ends_at).getTime() : Number.NaN;
    if (Number.isFinite(endsAtMs) && endsAtMs <= nowMs) {
      return false;
    }
    return true;
  });
}

export async function listRecentWrongAttempts(env, userId, options = {}) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const lookbackDays = Number(options.lookbackDays || 60);
  const limit = Number(options.limit || 500);
  const sinceIso = new Date(Date.now() - (Math.max(1, lookbackDays) * 24 * 60 * 60 * 1000)).toISOString();

  const query = new URLSearchParams({
    select: 'skill_tag,created_at',
    user_id: `eq.${userId}`,
    is_correct: 'eq.false',
    created_at: `gte.${sinceIso}`,
    order: 'created_at.desc',
    limit: String(Number.isFinite(limit) ? limit : 500),
  });
  const url = `${env.SUPABASE_URL}/rest/v1/question_attempts?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`question_attempts list failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload : [];
}

export async function listRecentSessions(env, userId, options = {}) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const lookbackDays = Number(options.lookbackDays || 60);
  const limit = Number(options.limit || 200);
  const sinceIso = new Date(Date.now() - (Math.max(1, lookbackDays) * 24 * 60 * 60 * 1000)).toISOString();

  const query = new URLSearchParams({
    select: 'id,started_at,completed_at',
    user_id: `eq.${userId}`,
    started_at: `gte.${sinceIso}`,
    order: 'started_at.desc',
    limit: String(Number.isFinite(limit) ? limit : 200),
  });
  const url = `${env.SUPABASE_URL}/rest/v1/exercise_sessions?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`exercise_sessions list failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload : [];
}

export async function insertExerciseSession(env, row) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const url = `${env.SUPABASE_URL}/rest/v1/exercise_sessions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`exercise_sessions insert failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : payload;
}

export async function fetchExerciseSession(env, sessionId) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const query = new URLSearchParams({
    select: 'id,user_id,started_at,completed_at,score,question_count,duration_seconds',
    id: `eq.${sessionId}`,
    limit: '1',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/exercise_sessions?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`exercise_sessions fetch failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : null;
}

export async function insertQuestionAttempt(env, row) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const url = `${env.SUPABASE_URL}/rest/v1/question_attempts`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`question_attempts insert failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : payload;
}

export async function completeExerciseSession(env, sessionId, userId, patch) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

  const nextPatch = {};
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      nextPatch[key] = value;
    }
  });

  const query = new URLSearchParams({
    id: `eq.${sessionId}`,
    user_id: `eq.${userId}`,
    select: 'id,user_id,started_at,completed_at,score,question_count,duration_seconds',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/exercise_sessions?${query.toString()}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(nextPatch),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`exercise_sessions update failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : payload;
}

export async function fetchEntitlement(env, userId, releaseId) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const query = new URLSearchParams({
    select: 'id,expires_at',
    user_id: `eq.${userId}`,
    release_id: `eq.${releaseId}`,
    limit: '1',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/entitlements?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`entitlements fetch failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : null;
}

export async function upsertEntitlement(env, row) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const url = `${env.SUPABASE_URL}/rest/v1/entitlements?on_conflict=user_id,release_id,source`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`entitlements upsert failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  return parseJsonResponse(response);
}

export async function expireEntitlement(env, userId, releaseId, source = 'payhip', expiresAt = null) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const effectiveExpiresAt = expiresAt || new Date().toISOString();
  const query = new URLSearchParams({
    user_id: `eq.${userId}`,
    release_id: `eq.${releaseId}`,
    source: `eq.${source}`,
    select: 'id,user_id,release_id,source,expires_at',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/entitlements?${query.toString()}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ expires_at: effectiveExpiresAt }),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`entitlements expire failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload : [];
}

// ── Engagement System Helpers ──────────────────────────────────────

export async function fetchUserStreak(env, userId) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const query = new URLSearchParams({
    select: 'user_id,current_streak,best_streak,last_active_date,freeze_available,freeze_used_at,total_active_days',
    user_id: `eq.${userId}`,
    limit: '1',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/user_streaks?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`user_streaks fetch failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : null;
}

export async function upsertUserStreak(env, row) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const url = `${env.SUPABASE_URL}/rest/v1/user_streaks?on_conflict=user_id`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`user_streaks upsert failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : payload;
}

export async function listUserDailyActivity(env, userId, options = {}) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const days = Number(options.days || 30);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const query = new URLSearchParams({
    select: 'activity_date,sessions_completed,questions_answered,correct_answers,total_time_seconds',
    user_id: `eq.${userId}`,
    activity_date: `gte.${sinceStr}`,
    order: 'activity_date.desc',
    limit: String(days + 1),
  });
  const url = `${env.SUPABASE_URL}/rest/v1/user_daily_activity?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`user_daily_activity list failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload : [];
}

export async function upsertUserDailyActivity(env, data) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

  // First try to fetch existing
  const query = new URLSearchParams({
    select: 'id,sessions_completed,questions_answered,correct_answers,total_time_seconds,skills_practiced',
    user_id: `eq.${data.user_id}`,
    activity_date: `eq.${data.activity_date}`,
    limit: '1',
  });
  const fetchUrl = `${env.SUPABASE_URL}/rest/v1/user_daily_activity?${query.toString()}`;
  const fetchResponse = await fetch(fetchUrl, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!fetchResponse.ok) {
    const errorBody = await parseJsonResponse(fetchResponse);
    throw new Error(`user_daily_activity fetch failed: ${fetchResponse.status} ${JSON.stringify(errorBody)}`);
  }
  const existing = await parseJsonResponse(fetchResponse);
  const row = Array.isArray(existing) ? existing[0] || null : null;

  if (row) {
    const skills = Array.isArray(row.skills_practiced) ? [...row.skills_practiced] : [];
    if (data.skill_tag && !skills.includes(data.skill_tag)) {
      skills.push(data.skill_tag);
    }
    const patch = {
      sessions_completed: (row.sessions_completed || 0) + (data.sessions_delta || 0),
      questions_answered: (row.questions_answered || 0) + (data.questions_delta || 0),
      correct_answers: (row.correct_answers || 0) + (data.correct_delta || 0),
      total_time_seconds: (row.total_time_seconds || 0) + (data.time_delta || 0),
      skills_practiced: skills,
    };
    const updateQuery = new URLSearchParams({
      id: `eq.${row.id}`,
      select: 'id,sessions_completed,questions_answered,correct_answers,total_time_seconds,skills_practiced',
    });
    const updateUrl = `${env.SUPABASE_URL}/rest/v1/user_daily_activity?${updateQuery.toString()}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        ...serviceHeaders(env),
        Prefer: 'return=representation',
      },
      body: JSON.stringify(patch),
    });
    if (!updateResponse.ok) {
      const errorBody = await parseJsonResponse(updateResponse);
      throw new Error(`user_daily_activity update failed: ${updateResponse.status} ${JSON.stringify(errorBody)}`);
    }
    const result = await parseJsonResponse(updateResponse);
    return Array.isArray(result) ? result[0] || patch : patch;
  }

  const newRow = {
    user_id: data.user_id,
    activity_date: data.activity_date,
    sessions_completed: data.sessions_delta || 0,
    questions_answered: data.questions_delta || 0,
    correct_answers: data.correct_delta || 0,
    total_time_seconds: data.time_delta || 0,
    skills_practiced: data.skill_tag ? [data.skill_tag] : [],
  };
  const insertUrl = `${env.SUPABASE_URL}/rest/v1/user_daily_activity`;
  const insertResponse = await fetch(insertUrl, {
    method: 'POST',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(newRow),
  });
  if (!insertResponse.ok) {
    const errorBody = await parseJsonResponse(insertResponse);
    throw new Error(`user_daily_activity insert failed: ${insertResponse.status} ${JSON.stringify(errorBody)}`);
  }
  const result = await parseJsonResponse(insertResponse);
  return Array.isArray(result) ? result[0] || newRow : newRow;
}

export async function fetchUserXp(env, userId) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const query = new URLSearchParams({
    select: 'total_xp,level',
    user_id: `eq.${userId}`,
    limit: '1',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/user_xp?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`user_xp fetch failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : null;
}

export async function upsertUserXp(env, row) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const url = `${env.SUPABASE_URL}/rest/v1/user_xp?on_conflict=user_id`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`user_xp upsert failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : payload;
}

export async function listUserAchievements(env, userId) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const query = new URLSearchParams({
    select: 'achievement_id,unlocked_at,notified',
    user_id: `eq.${userId}`,
    order: 'unlocked_at.desc',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/user_achievements?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`user_achievements list failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload : [];
}

export async function insertUserAchievement(env, row) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const url = `${env.SUPABASE_URL}/rest/v1/user_achievements?on_conflict=user_id,achievement_id`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'resolution=ignore-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`user_achievements insert failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : payload;
}

export async function listAchievementDefinitions(env) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const query = new URLSearchParams({
    select: 'id,title_en,title_cn,description_en,description_cn,icon,tier,category,criteria,xp_reward,is_secret,is_active,sort_order',
    is_active: 'eq.true',
    order: 'sort_order.asc',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/achievement_definitions?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`achievement_definitions list failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload : [];
}

export async function fetchProfile(env, userId) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const query = new URLSearchParams({
    select: 'id,display_name,preferred_lang,target_board,weekly_report_enabled',
    id: `eq.${userId}`,
    limit: '1',
  });
  const url = `${env.SUPABASE_URL}/rest/v1/profiles?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: serviceHeaders(env),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`profiles fetch failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : null;
}

export async function upsertProfile(env, userId, fields) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const row = { id: userId, ...fields };
  const url = `${env.SUPABASE_URL}/rest/v1/profiles?on_conflict=id`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...serviceHeaders(env),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`profiles upsert failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  return Array.isArray(payload) ? payload[0] || null : payload;
}

export async function createSignedStorageUrl(env, assetKey, ttlSeconds = 600) {
  ensureEnv(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const normalized = String(assetKey || '').trim().replace(/^\/+/, '');
  const slashIndex = normalized.indexOf('/');
  if (slashIndex <= 0 || slashIndex >= normalized.length - 1) {
    throw new Error('asset_key must follow "bucket/path/to/file.ext"');
  }
  const bucket = normalized.slice(0, slashIndex);
  const objectPath = normalized.slice(slashIndex + 1);
  const encodedPath = objectPath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');

  const url = `${env.SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodedPath}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: serviceHeaders(env),
    body: JSON.stringify({ expiresIn: Number(ttlSeconds) || 600 }),
  });
  if (!response.ok) {
    const errorBody = await parseJsonResponse(response);
    throw new Error(`storage signed url failed: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const payload = await parseJsonResponse(response);
  const signedPath = payload?.signedURL || payload?.signedUrl || '';
  if (!signedPath) {
    throw new Error('storage signed url missing signedURL');
  }
  const absolute = signedPath.startsWith('http')
    ? signedPath
    : `${env.SUPABASE_URL}/storage/v1${signedPath}`;
  return {
    url: absolute,
    expiresIn: Number(ttlSeconds) || 600,
  };
}
