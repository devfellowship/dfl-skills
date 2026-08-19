import { useLocation } from "react-router-dom";
import { Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AccountMenu } from "./AccountMenu";

export function AuthMenu() {
  const { email, loading, configured, signInWithDfl, signOut } = useAuth();
  const location = useLocation();

  // Login is a deployment feature, not a promise. Without the Supabase env this
  // deployment simply has no internal tier, and offering a button that cannot
  // work is worse than offering none.
  if (!configured || loading) return null;

  if (email) {
    return <AccountMenu email={email} onSignOut={() => void signOut()} />;
  }

  return (
    <button
      type="button"
      onClick={() => signInWithDfl(`${location.pathname}${location.search}`)}
      className="flex items-center gap-[9px] rounded-lg bg-primary px-[15px] py-2 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-[hsl(33_92%_60%)]"
    >
      <Zap className="h-[15px] w-[15px]" />
      Sign in with DFL
    </button>
  );
}
