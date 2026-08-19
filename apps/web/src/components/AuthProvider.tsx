import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { authConfigured, supabase } from "@/lib/supabase";
import { startDflSignIn } from "@/lib/dfl-federation";
import { adoptSharedSession, clearSharedSession } from "@/lib/shared-session";
import { AuthContext, type AuthState } from "@/hooks/authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(authConfigured);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!supabase) return;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      // Being signed in to any other DFL app is enough: the shared cookie turns
      // that into a session here, with no redirect and no click.
      const restored = data.session ?? (await adoptSharedSession());
      if (!mounted.current) return;
      setSession(restored);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (mounted.current) setSession(next);
    });

    return () => {
      mounted.current = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      token: session?.access_token ?? null,
      email: session?.user.email ?? null,
      loading,
      configured: authConfigured,
      signInWithDfl: startDflSignIn,
      signOut: async () => {
        // Without dropping the shared cookie the next load would adopt it right
        // back, and signing out would look broken.
        clearSharedSession();
        await supabase?.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
