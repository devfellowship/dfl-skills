import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

interface SignInDialogProps {
  onClose: () => void;
}

export function SignInDialog({ onClose }: SignInDialogProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in with your DevFellowship account"
        className="w-full max-w-[380px] rounded-[13px] border border-[hsl(215_15%_18%)] bg-[hsl(215_21%_9.5%)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between">
          <h2 className="m-0 font-heading text-[17px] font-bold uppercase tracking-[.02em] text-foreground">
            Sign in
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded p-1 text-[hsl(212_10%_54%)] transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="m-0 mb-5 text-[13px] leading-[1.6] text-[hsl(212_11%_58%)]">
          Use your DevFellowship account. Signing in unlocks the internal registry and lets you copy
          a skill straight into your own agent.
        </p>

        <form onSubmit={submit}>
          <Input
            type="email"
            autoComplete="username"
            placeholder="you@devfellowship.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-[10px]"
          />
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-4"
          />

          {error && (
            <p className="m-0 mb-4 text-[12.5px] leading-[1.5] text-[hsl(0_70%_66%)]">{error}</p>
          )}

          <Button type="submit" loading={busy} className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
