import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export interface AuthState {
  session: Session | null;
  /**
   * Derived from the session on every render, never stored. Callers pass it
   * explicitly into the API layer so a fetch can never race ahead of an effect
   * that would have installed it.
   */
  token: string | null;
  email: string | null;
  /** True until the initial session lookup settles, so the nav doesn't flash. */
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
