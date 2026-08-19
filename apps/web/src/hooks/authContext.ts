import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export interface AuthState {
  session: Session | null;
  email: string | null;
  /** True until the initial session lookup settles, so the nav doesn't flash. */
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
