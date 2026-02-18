export function jsonResponse(body, status = 200, extraHeaders = {}) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...extraHeaders,
  };
  return new Response(JSON.stringify(body), { status, headers });
}

export function redirectResponse(url, status = 302) {
  return new Response(null, {
    status,
    headers: {
      location: url,
      'cache-control': 'no-store',
    },
  });
}

export function getBearerToken(request) {
  const raw = request.headers.get('authorization') || '';
  if (!raw.toLowerCase().startsWith('bearer ')) {
    return '';
  }
  return raw.slice(7).trim();
}
