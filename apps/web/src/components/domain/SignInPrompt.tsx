import { useAuth } from "@/hooks/useAuth";
import { GitHubSignInButton } from "./GitHubSignInButton";

/** The GitHub sign-in button, shown only to a signed-out visitor who could sign in. */
export function SignInPrompt({ size }: { size?: "sm" | "default" }) {
  const { token, loading, configured } = useAuth();
  if (!configured || loading || token) return null;
  return <GitHubSignInButton size={size} />;
}
