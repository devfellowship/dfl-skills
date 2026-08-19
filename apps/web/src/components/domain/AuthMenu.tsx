import { useState } from "react";
import { LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AccountMenu } from "./AccountMenu";
import { SignInDialog } from "./SignInDialog";

export function AuthMenu() {
  const { email, loading, configured, signOut } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Login is a deployment feature, not a promise. Without the Supabase env this
  // deployment simply has no internal tier, and offering a button that cannot
  // work is worse than offering none.
  if (!configured || loading) return null;

  if (email) {
    return <AccountMenu email={email} onSignOut={() => void signOut()} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary px-[14px] py-2 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-[hsl(33_92%_60%)]"
      >
        <LogIn className="h-[15px] w-[15px]" />
        Sign in
      </button>
      {dialogOpen && <SignInDialog onClose={() => setDialogOpen(false)} />}
    </>
  );
}
