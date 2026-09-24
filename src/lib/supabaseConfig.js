function decodeJwtPayload(key) {
  const payload = key.split('.')[1];
  if (!payload) return null;

  try {
    const normalized = payload.replaceAll('-', '+').replaceAll('_', '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(globalThis.atob(padded));
  } catch {
    return null;
  }
}

export function validatePublicSupabaseConfig(urlValue, keyValue) {
  if (!urlValue || !keyValue) {
    throw new Error('Missing Supabase configuration. Add the project URL and a public key to .env.');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(urlValue);
  } catch {
    throw new Error('The configured Supabase URL is invalid.');
  }

  const localDevelopmentHost = ['localhost', '127.0.0.1'].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== 'https:' && !(parsedUrl.protocol === 'http:' && localDevelopmentHost)) {
    throw new Error('Supabase must use HTTPS outside local development.');
  }

  const key = keyValue.trim();
  const jwtPayload = decodeJwtPayload(key);
  if (key.startsWith('sb_secret_') || jwtPayload?.role === 'service_role') {
    throw new Error('A secret or service-role Supabase key cannot be used in browser code.');
  }

  return { url: parsedUrl.toString().replace(/\/$/, ''), key };
}
