import { createContext } from "react";
import type { GitHubProfile } from "@/types";

export interface AuthState {
  /**
   * The DFL access token IS the identity here — a Supabase session is an
   * optional upgrade that only adds refresh. Callers pass it explicitly into
   * the API layer so a fetch can never race ahead of an effect that would
   * install it.
   */
  token: string | null;
  /**
   * The one profile this site knows: the GitHub identity on the DFL account.
   * `null` while signed out, and while signed in through another DFL app with
   * an account that has no GitHub identity yet (see `needsGitHub`).
   */
  profile: GitHubProfile | null;
  /** Signed in, and Auth confirmed the account has no GitHub identity. The UI asks to link one. */
  needsGitHub: boolean;
  /**
   * Whether the registry treats this account as a DFL member (internal tier).
   * `null` until known, and while signed out.
   */
  member: boolean | null;
  /** True until the initial session lookup settles, so the nav doesn't flash. */
  loading: boolean;
  configured: boolean;
  /**
   * Leaves the page for GitHub. Signs in and signs up; there is no password
   * form here. While `needsGitHub`, it links GitHub to the current account.
   */
  signInWithGitHub: (next: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
