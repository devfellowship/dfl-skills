import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { authConfigured, supabase } from "@/lib/supabase";
import { startGitHubSignIn } from "@/lib/github-auth";
import { githubProfileOf } from "@/lib/github-identity";
import { clearDflToken, readDflToken, storeDflToken } from "@/lib/dfl-token";
import { adoptSharedSession, clearSharedSession, sharedAccessToken } from "@/lib/shared-session";
import { AuthContext, type AuthState } from "@/hooks/authContext";
import { fetchScope } from "@/lib/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [scope, setScope] = useState<string | null>(null);
  const [loading, setLoading] = useState(authConfigured);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    void (async () => {
      const stored = readDflToken();
      const session = (await supabase?.auth.getSession())?.data.session ?? (await adoptSharedSession());
      // Being signed in to any other DFL app is enough. The cookie's access
      // token is the last resort: it still opens the registry even when the
      // refresh token beside it has been revoked.
      const next = session?.access_token ?? stored ?? sharedAccessToken();
      if (next) storeDflToken(next);
      const usable = readDflToken();
      // A bare token carries no identities; ask Auth who it belongs to. A
      // failure leaves the profile empty, never the token unusable.
      const owner = session?.user ?? (usable ? ((await supabase?.auth.getUser(usable))?.data.user ?? null) : null);
      if (!mounted.current) return;
      setToken(usable);
      setUser(usable ? owner : null);
      setLoading(false);
    })();

    const sub = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!mounted.current || !session) return;
      storeDflToken(session.access_token);
      setToken(session.access_token);
      setUser(session.user);
    });

    return () => {
      mounted.current = false;
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setScope(null);
    if (!token) return;
    const controller = new AbortController();
    fetchScope(controller.signal, token)
      .then(setScope)
      .catch(() => {
        // Unknown membership renders no notice, which is the quiet side.
      });
    return () => controller.abort();
  }, [token]);

  const signOut = useCallback(async () => {
    // Without dropping the shared cookie the next load would adopt it right
    // back, and signing out would look broken.
    clearSharedSession();
    clearDflToken();
    setToken(null);
    setUser(null);
    setScope(null);
    await supabase?.auth.signOut();
  }, []);

  const value = useMemo<AuthState>(() => {
    const profile = token ? githubProfileOf(user) : null;
    // Only a user Auth actually returned can prove there is no GitHub identity.
    // A revoked session yields no user at all, and that is a sign-in, not a link.
    const needsGitHub = Boolean(token && user) && !profile;
    return {
      token,
      profile,
      needsGitHub,
      member: token && scope ? scope !== "public" : null,
      loading,
      configured: authConfigured,
      signInWithGitHub: (next: string) => startGitHubSignIn(next, { link: needsGitHub }),
      signOut,
    };
  }, [token, user, scope, loading, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
