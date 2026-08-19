import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { authConfigured, supabase } from "@/lib/supabase";
import { setAccessToken } from "@/lib/api";
import { AuthContext, type AuthState } from "@/hooks/authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(authConfigured);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted.current) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (mounted.current) setSession(next);
    });

    return () => {
      mounted.current = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // The session is the single source of truth; the API layer's copy of the token
  // is derived from it here and nowhere else, so signing out cannot leave a
  // stale token behind in a code path somebody forgot about.
  useEffect(() => {
    setAccessToken(session?.access_token ?? null);
  }, [session]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      email: session?.user.email ?? null,
      loading,
      configured: authConfigured,
      signIn: async (email, password) => {
        if (!supabase) return { error: "Login is not configured on this deployment." };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        await supabase?.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
