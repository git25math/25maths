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
