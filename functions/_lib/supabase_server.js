function ensureEnv(env, keys) {
  const missing = keys.filter((key) => !env[key] || !String(env[key]).trim());
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

function serviceHeaders(env) {
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
