import { createContext } from "react";

export interface AuthState {
  /**
   * The DFL access token IS the identity here — a Supabase session is an
   * optional upgrade that only adds refresh. Callers pass it explicitly into
   * the API layer so a fetch can never race ahead of an effect that would
   * install it.
   */
  token: string | null;
  email: string | null;
  /** True until the initial session lookup settles, so the nav doesn't flash. */
  loading: boolean;
  configured: boolean;
  /** Leaves the page: there is no password form here, DFL is the only issuer. */
  signInWithDfl: (next: string) => void;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
