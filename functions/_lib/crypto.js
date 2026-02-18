function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sha256Hex(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(String(input || ''));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(digest));
}

export async function hmacSha256Hex(secret, payload) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(payload);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return bytesToHex(new Uint8Array(signature));
}

export function constantTimeEqualHex(a, b) {
  const left = String(a || '').trim().toLowerCase();
  const right = String(b || '').trim().toLowerCase();
  if (!left || !right || left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

export function getPayhipSignatureHeader(request) {
  const candidates = [
    'x-payhip-signature',
    'x-payhip-hmac-sha256',
    'x-payhip-hmac',
    'x-signature',
  ];
  for (const key of candidates) {
    const value = request.headers.get(key);
    if (value && String(value).trim()) {
      return String(value).trim();
    }
  }
  return '';
}
