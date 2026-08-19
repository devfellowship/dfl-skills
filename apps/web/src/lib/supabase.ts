import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The dfl-iam Supabase project. The registry API verifies a session issued HERE
 * (`middleware/scope.ts` checks `iss` against `${SUPABASE_URL}/auth/v1`), so
 * pointing this at any other project silently produces tokens the API rejects.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;

/**
 * The anon key is designed to be public — it grants nothing on its own; RLS and
 * `iam.is_member()` are what actually decide access. It is the ONLY Supabase key
 * that may ever appear in this bundle.
 */
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * 🚨 Session storage is `sessionStorage`, not the Supabase default of
 * `localStorage`. This page renders markdown authored in other repositories, so
 * the DFL session token — the same one that opens every other DFL app — is
 * worth keeping out of any store that outlives the tab. The CSP and the
 * sanitized MarkdownView are the primary defences; this bounds the damage if
 * they ever fail. The cost is re-authenticating in a new tab, which is cheap.
 */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: window.sessionStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

/**
 * The site is fully usable logged-out (public skills), so a missing env is a
 * degraded feature and not a crash. Logged-out is also the fail-closed side.
 */
export const authConfigured: boolean = supabase !== null;
