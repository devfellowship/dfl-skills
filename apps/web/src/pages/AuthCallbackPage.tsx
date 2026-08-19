import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DFL_CALLBACK_PATH, safeNext, startDflSignIn } from "@/lib/dfl-federation";
import { storeDflToken } from "@/lib/dfl-token";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { token, loading } = useAuth();
  // Read during render, not in an effect: the effect below erases the fragment,
  // and under StrictMode a second effect pass would then find nothing left. The
  // token is banked here so the provider's own boot effect — which runs after
  // this render — already finds it.
  const [next] = useState(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const handoff = fragment.get("dfl_token");
    if (handoff) storeDflToken(handoff);
    return safeNext(fragment.get("next"));
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // The handoff carries a token in the fragment. Drop it before it can reach
    // history, a bookmark or a screenshot.
    window.history.replaceState(null, "", DFL_CALLBACK_PATH);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (token) navigate(next, { replace: true });
    else setFailed(true);
  }, [token, loading, navigate, next]);

  if (failed) {
    return (
      <main className="mx-auto flex max-w-[420px] flex-col items-center gap-4 px-6 py-24 text-center">
        <AlertCircle className="h-7 w-7 text-[hsl(var(--danger))]" />
        <h1 className="font-heading text-[22px] uppercase">Sign-in didn't complete</h1>
        <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
          DevFellowship sent you back without a session this app could use. Trying again usually
          settles it.
        </p>
        <button
          type="button"
          onClick={() => startDflSignIn("/")}
          className="rounded-lg bg-primary px-[15px] py-2 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-[hsl(33_92%_60%)]"
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center gap-3 px-6 py-24 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-[13.5px] text-muted-foreground">Signing you in with DevFellowship…</p>
    </main>
  );
}
