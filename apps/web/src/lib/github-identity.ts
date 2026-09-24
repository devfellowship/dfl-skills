import type { User } from "@supabase/supabase-js";
import type { GitHubProfile } from "@/types";

/**
 * Only same-site paths survive, so the round trip can't be aimed at another site.
 *
 * 🚨 `startsWith("/")` alone is not enough: browsers normalise a backslash to a
 * slash in the authority position, so `/\evil.example` and `\/evil.example`
 * navigate off-site while passing a naive prefix check.
 */
const SAME_SITE_PATH = /^\/(?![/\\])/;

export function safeNext(raw: string | null): string {
  if (!raw || !SAME_SITE_PATH.test(raw)) return "/";
  return raw;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * The GitHub identity linked to a DFL account, or `null` when the account has
 * none — an email-only account signed in elsewhere in DFL. The profile is only
 * ever read from that identity, never from what the account itself carries, so
 * a name or photo on this site is always the one on GitHub.
 */
export function githubProfileOf(user: Pick<User, "identities" | "email"> | null | undefined): GitHubProfile | null {
  const identity = user?.identities?.find((i) => i.provider === "github");
  const data = (identity?.identity_data ?? {}) as Record<string, unknown>;
  const handle = text(data.user_name) ?? text(data.preferred_username);
  if (!handle) return null;
  return {
    handle,
    name: text(data.full_name) ?? text(data.name) ?? handle,
    email: text(data.email) ?? text(user?.email),
    avatarUrl: text(data.avatar_url),
  };
}

export const SIGN_IN_CALLBACK_PATH = "/auth/dfl/callback";

/**
 * GitHub sends the browser back to learn, not here. The shared DFL auth
 * project only redirects to origins on its allow-list, and this site's origin
 * is not on it; learn's federation handoff is, and it already forwards a fresh
 * session to any *.devfellowship.com callback. So: GitHub → learn (which
 * adopts the session and shares it with every DFL app) → this site's callback.
 */
const FEDERATE_URL = "https://learn.devfellowship.com/auth/federate";

export function federateUrl(origin: string, next: string): string {
  const url = new URL(FEDERATE_URL);
  url.searchParams.set("return", `${origin}${SIGN_IN_CALLBACK_PATH}`);
  url.searchParams.set("next", safeNext(next));
  return url.toString();
}
