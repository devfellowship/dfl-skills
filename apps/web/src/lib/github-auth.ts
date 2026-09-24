import { safeNext } from "./github-identity";
import { supabase } from "./supabase";

export const GITHUB_CALLBACK_PATH = "/auth/github/callback";

const NEXT_KEY = "dfl-skills-sign-in-next";

/**
 * Leaves the page for GitHub. The same button signs in and signs up: a GitHub
 * account DFL has not seen becomes a DFL account, and one whose verified email
 * matches an existing DFL account is linked to it. `next` is kept in this tab's
 * storage rather than in the redirect URL, which must match the auth
 * allow-list exactly.
 */
export async function startGitHubSignIn(next: string): Promise<void> {
  if (!supabase) return;
  window.sessionStorage.setItem(NEXT_KEY, safeNext(next));
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}${GITHUB_CALLBACK_PATH}`,
      scopes: "read:user user:email",
    },
  });
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
  if (!code || !supabase) {
    return Promise.resolve(params.get("error_description") ?? "GitHub did not send a sign-in code back.");
  }
  const client = supabase;
  const pending =
    exchanges.get(code) ??
    client.auth.exchangeCodeForSession(code).then(({ error }) => (error ? error.message : null));
  exchanges.set(code, pending);
  return pending;
}
