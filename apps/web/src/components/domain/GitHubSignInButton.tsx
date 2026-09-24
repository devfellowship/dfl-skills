import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Github, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@devfellowship/components";
import { useAuth } from "@/hooks/useAuth";
import { GitHubLinkError } from "@/lib/github-auth";

interface GitHubSignInButtonProps {
  /** "Continue with GitHub" signs in and signs up; "Connect GitHub" links an existing account. */
  label?: string;
  /** Shorter label under the `lg` breakpoint, for the top bar. */
  compactLabel?: string;
  size?: "sm" | "default";
}

/** The only way into this site: GitHub, which also supplies the profile. */
export function GitHubSignInButton({
  label = "Continue with GitHub",
  compactLabel,
  size = "default",
}: GitHubSignInButtonProps) {
  const { signInWithGitHub } = useAuth();
  const location = useLocation();
  const [leaving, setLeaving] = useState(false);

  const onClick = () => {
    setLeaving(true);
    signInWithGitHub(`${location.pathname}${location.search}`).catch((err: unknown) => {
      setLeaving(false);
      toast.error(
        err instanceof GitHubLinkError
          ? "Couldn't connect GitHub to this account. Sign out, then continue with GitHub."
          : "Couldn't reach GitHub. Try again in a moment.",
      );
    });
  };

  return (
    <Button size={size} onClick={onClick} disabled={leaving} className="whitespace-nowrap">
      {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
      {compactLabel ? (
        <>
          <span className="hidden lg:inline">{label}</span>
          <span className="lg:hidden">{compactLabel}</span>
        </>
      ) : (
        label
      )}
    </Button>
  );
}
