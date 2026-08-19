export const DFL_CALLBACK_PATH = "/auth/dfl/callback";

/**
 * The DFL federation handoff. It renders behind learn's own auth gate, so an
 * unauthenticated visitor signs in there and comes back; an authenticated one
 * bounces straight through. Learn's return-url allowlist already accepts every
 * *.devfellowship.com origin, so this app needs nothing on that side.
 */
const FEDERATE_URL = "https://learn.devfellowship.com/auth/federate";

/**
 * Only same-site paths survive, so the handoff can't be aimed at another site.
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

export function startDflSignIn(next: string): void {
  const url = new URL(FEDERATE_URL);
  url.searchParams.set("return", `${window.location.origin}${DFL_CALLBACK_PATH}`);
  url.searchParams.set("next", safeNext(next));
  window.location.assign(url.toString());
}
