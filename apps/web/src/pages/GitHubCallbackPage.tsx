import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Github, Loader2 } from "lucide-react";
import { Button } from "@devfellowship/components";
import { useAuth } from "@/hooks/useAuth";
import { clearSignInNext, exchangeSignInCode, GITHUB_CALLBACK_PATH, readSignInNext } from "@/lib/github-auth";

export function GitHubCallbackPage() {
  const navigate = useNavigate();
  const { signInWithGitHub } = useAuth();
  const [next] = useState(readSignInNext);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    const run = { live: true };
    void exchangeSignInCode(window.location.search).then((error) => {
      // The code is spent either way. Drop it before it reaches history.
      window.history.replaceState(null, "", GITHUB_CALLBACK_PATH);
      if (!run.live) return;
      if (error) {
        setFailure(error);
        return;
      }
      clearSignInNext();
      navigate(next, { replace: true });
    });
    return () => {
      run.live = false;
    };
  }, [navigate, next]);

  if (failure) {
    return (
      <main className="mx-auto flex max-w-[440px] flex-col items-center gap-4 px-6 py-24 text-center">
        <AlertCircle className="h-7 w-7 text-[var(--s-danger-fg)]" />
        <h1 className="font-heading text-[22px] uppercase">Sign-in didn't complete</h1>
        <p className="text-[13.5px] leading-[1.6] text-muted-foreground">{failure}</p>
        <Button
          type="button"
          onClick={() => void signInWithGitHub(next)}
        >
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
