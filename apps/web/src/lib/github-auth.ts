import { safeNext } from "./github-identity";
import { supabase } from "./supabase";

/**
 * 🚨 This path must be on the redirect allow-list of the shared DFL auth
 * project. Off the list, GoTrue silently sends the browser to its site URL
 * (learn) instead, and the code is useless there without this tab's verifier.
 * Check: `GET /auth/v1/verify?token=x&type=recovery&redirect_to=<this URL>`
 * redirects back to this URL only when it is allowed.
 */
export const GITHUB_CALLBACK_PATH = "/auth/github/callback";

const NEXT_KEY = "dfl-skills-sign-in-next";

/** Linking GitHub to the current account failed; nothing was switched. */
export class GitHubLinkError extends Error {}

/**
 * Leaves the page for GitHub. The same button signs in and signs up: a GitHub
 * account DFL has not seen becomes a DFL account, and one whose verified email
 * matches an existing DFL account is joined to it. `next` is kept in this tab's
 * storage rather than in the redirect URL, which must match the allow-list.
 *
 * With `link`, GitHub is attached to the account already signed in. It never
 * falls back to a plain sign-in: that would switch to whichever account owns
 * the GitHub email — a different, non-member one when the emails differ.
 */
export async function startGitHubSignIn(next: string, opts: { link?: boolean } = {}): Promise<void> {
  if (!supabase) return;
  window.sessionStorage.setItem(NEXT_KEY, safeNext(next));
  const options = {
    redirectTo: `${window.location.origin}${GITHUB_CALLBACK_PATH}`,
    scopes: "read:user user:email",
  };
  if (opts.link) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new GitHubLinkError("No session to link GitHub to.");
    const { error } = await supabase.auth.linkIdentity({ provider: "github", options });
    if (error) throw new GitHubLinkError(error.message);
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({ provider: "github", options });
  if (error) throw error;
}

/** Where to go after the callback. */
export function readSignInNext(): string {
  return safeNext(window.sessionStorage.getItem(NEXT_KEY));
}

export function clearSignInNext(): void {
  window.sessionStorage.removeItem(NEXT_KEY);
}

/**
 * A code is single-use, and StrictMode runs effects twice. Keeping one exchange
 * per code makes the second run await the first instead of spending the code
 * again and reporting a failure that did not happen. Resolves to an error
 * message, or `null` once the session is in place.
 */
const exchanges = new Map<string, Promise<string | null>>();

export function exchangeSignInCode(search: string): Promise<string | null> {
  const params = new URLSearchParams(search);
  const code = params.get("code");
  // GitHub's own error text is not shown: the query string is attacker-writable,
  // and this page would lend it the site's voice.
  if (!code || !supabase) {
    return Promise.resolve(
      params.has("error") ? "GitHub didn't approve the sign-in." : "GitHub did not send a sign-in code back.",
    );
  }
  const client = supabase;
  const pending =
    exchanges.get(code) ??
    client.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => (error ? "The sign-in code expired or was already used." : null));
  exchanges.set(code, pending);
  return pending;
}
