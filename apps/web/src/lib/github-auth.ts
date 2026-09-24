import { federateUrl } from "./github-identity";
import { supabase } from "./supabase";

export { SIGN_IN_CALLBACK_PATH } from "./github-identity";

/**
 * Leaves the page for GitHub. The same button signs in and signs up: a GitHub
 * account DFL has not seen becomes a DFL account, and one whose verified email
 * matches an existing DFL account is joined to it.
 */
export async function startGitHubSignIn(next: string, opts: { link?: boolean } = {}): Promise<void> {
  if (!supabase) return;
  const options = { redirectTo: federateUrl(window.location.origin, next), scopes: "read:user user:email" };
  // Signed in without GitHub: attach GitHub to THIS account. A plain sign-in
  // would switch to whichever account owns the GitHub email — a different,
  // non-member one when the emails differ. Linking needs a live session and
  // manual linking enabled on the project; without either, fall back to the
  // sign-in, which still joins accounts whose verified emails match.
  if (opts.link) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { error } = await supabase.auth.linkIdentity({ provider: "github", options });
      if (!error) return;
    }
  }
  const { error } = await supabase.auth.signInWithOAuth({ provider: "github", options });
  if (error) throw error;
}
