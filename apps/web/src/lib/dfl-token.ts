const STORAGE_KEY = "dfl-access-token";

/** Evaluated only when a caller omits the issuer, so tests never touch Vite env. */
export function dflIssuer(): string {
  return `${import.meta.env.VITE_SUPABASE_URL as string}/auth/v1`;
}

function decode(token: string): { iss?: string; exp?: number; email?: string } | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as { iss?: string; exp?: number; email?: string };
  } catch {
    return null;
  }
}

/**
 * 🚨 A usability check, never a security one. The registry API verifies the
 * signature server-side; nothing decoded here can grant anything. It exists so
 * the app never presents a member as signed in while holding a token the API
 * will reject, and so an expired token is dropped rather than retried forever.
 */
export function isUsableToken(
  token: string | null | undefined,
  issuer: string = dflIssuer(),
): token is string {
  if (!token) return false;
  const claims = decode(token);
  if (!claims?.exp || claims.exp * 1000 <= Date.now()) return false;
  return Boolean(issuer) && claims.iss === issuer;
}

export function emailOf(token: string): string | null {
  return decode(token)?.email ?? null;
}

export function storeDflToken(token: string, issuer: string = dflIssuer()): void {
  if (isUsableToken(token, issuer)) window.sessionStorage.setItem(STORAGE_KEY, token);
}

export function readDflToken(issuer: string = dflIssuer()): string | null {
  const token = window.sessionStorage.getItem(STORAGE_KEY);
  if (isUsableToken(token, issuer)) return token;
  clearDflToken();
  return null;
}

export function clearDflToken(): void {
  window.sessionStorage.removeItem(STORAGE_KEY);
}
