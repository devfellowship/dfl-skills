import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { authConfigured, supabase } from "@/lib/supabase";
import { startDflSignIn } from "@/lib/dfl-federation";
import { clearDflToken, emailOf, readDflToken, storeDflToken } from "@/lib/dfl-token";
import { adoptSharedSession, clearSharedSession, sharedAccessToken } from "@/lib/shared-session";
import { AuthContext, type AuthState } from "@/hooks/authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
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
      if (!mounted.current) return;
      if (next) storeDflToken(next);
      setToken(readDflToken());
      setLoading(false);
    })();

    const sub = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!mounted.current || !session) return;
      storeDflToken(session.access_token);
      setToken(session.access_token);
    });

    return () => {
      mounted.current = false;
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    // Without dropping the shared cookie the next load would adopt it right
    // back, and signing out would look broken.
    clearSharedSession();
    clearDflToken();
    setToken(null);
    await supabase?.auth.signOut();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      email: token ? emailOf(token) : null,
      loading,
      configured: authConfigured,
      signInWithDfl: startDflSignIn,
      signOut,
    }),
    [token, loading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
