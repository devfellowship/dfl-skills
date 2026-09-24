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
