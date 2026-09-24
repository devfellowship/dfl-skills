import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Github, Loader2 } from "lucide-react";
import { Button } from "@devfellowship/components";
import { useAuth } from "@/hooks/useAuth";
import { SIGN_IN_CALLBACK_PATH } from "@/lib/github-auth";
import { safeNext } from "@/lib/github-identity";
import { storeDflToken } from "@/lib/dfl-token";

export function SignInCallbackPage() {
  const navigate = useNavigate();
  const { token, loading, signInWithGitHub } = useAuth();
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
    window.history.replaceState(null, "", SIGN_IN_CALLBACK_PATH);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (token) navigate(next, { replace: true });
    else setFailed(true);
  }, [token, loading, navigate, next]);

  if (failed) {
    return (
      <main className="mx-auto flex max-w-[420px] flex-col items-center gap-4 px-6 py-24 text-center">
        <AlertCircle className="h-7 w-7 text-[var(--s-danger-fg)]" />
        <h1 className="font-heading text-[22px] uppercase">Sign-in didn't complete</h1>
        <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
          GitHub sent you back without a session this site could use. Trying again usually settles
          it.
        </p>
        <Button type="button" onClick={() => void signInWithGitHub(next)}>
          <Github className="h-4 w-4" />
          Try again with GitHub
        </Button>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center gap-3 px-6 py-24 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-[13.5px] text-muted-foreground">Signing you in with GitHub…</p>
    </main>
  );
}
