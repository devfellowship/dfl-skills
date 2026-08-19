import { useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SignInDialog } from "./SignInDialog";

const BUTTON_CLASS =
  "flex items-center gap-2 rounded-lg border border-[hsl(215_15%_19%)] px-[13px] py-2 text-[13px] font-medium text-foreground/85 transition-colors hover:border-[hsl(215_15%_28%)] hover:bg-[hsl(215_18%_13%)]";

export function AuthMenu() {
  const { email, loading, configured, signOut } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Login is a deployment feature, not a promise. Without the Supabase env this
  // deployment simply has no internal tier, and offering a button that cannot
  // work is worse than offering none.
  if (!configured || loading) return null;

  if (email) {
    return (
      <button type="button" onClick={() => void signOut()} className={BUTTON_CLASS} title={email}>
        <LogOut className="h-[15px] w-[15px]" />
        <span className="max-w-[140px] truncate">{email}</span>
      </button>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setDialogOpen(true)} className={BUTTON_CLASS}>
        <LogIn className="h-[15px] w-[15px]" />
        Sign in
      </button>
      {dialogOpen && <SignInDialog onClose={() => setDialogOpen(false)} />}
    </>
  );
}
