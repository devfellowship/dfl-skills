import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const COOKIE = "dfl-shared-session";

/**
 * 🚨 This module READS the shared cookie and never writes it. dfl-learn and
 * dfl-iam publish a year-long refresh token there, readable by any script on
 * *.devfellowship.com. This app deliberately keeps its own session in
 * `sessionStorage` (see supabase.ts); writing the cookie back would undo that
 * and widen an exposure it did not create.
 */
function readSharedCookie(): { access_token: string; refresh_token: string } | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  if (!match?.[1]) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as Record<string, unknown>;
    const access = parsed.access_token;
    const refresh = parsed.refresh_token;
    if (typeof access !== "string" || typeof refresh !== "string") return null;
    return { access_token: access, refresh_token: refresh };
  } catch {
    return null;
  }
}

function cookieDomain(): string {
  return window.location.hostname.endsWith("devfellowship.com") ? "; Domain=.devfellowship.com" : "";
}

export function clearSharedSession(): void {
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0${cookieDomain()}`;
}

export function sharedAccessToken(): string | null {
  return readSharedCookie()?.access_token ?? null;
}

/**
 * Upgrades the shared cookie into a real Supabase session, which is what buys
 * automatic token refresh.
 *
 * 🚨 Failure here is NOT "signed out". `setSession` calls `/auth/v1/user`, which
 * 403s once the refresh token in the cookie has been revoked — while the access
 * token stored beside it is still signed, unexpired, and still accepted by the
 * registry. Treating that 403 as a failed sign-in is what dropped a valid member
 * back onto the public catalogue; the caller falls back to the raw token.
 */
export async function adoptSharedSession(): Promise<Session | null> {
  const shared = readSharedCookie();
  if (!shared || !supabase) return null;

  const { data, error } = await supabase.auth.setSession(shared);
  if (error || !data.session) return null;
  return data.session;
}
