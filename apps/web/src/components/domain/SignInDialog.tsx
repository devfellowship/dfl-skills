import { useState, type FormEvent } from "react";
import { AlertCircle, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";

export function SignInDialog({ onClose }: { onClose: () => void }) {
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
    <Modal label="Sign in with your DevFellowship account" onClose={onClose}>
      <div className="px-7 pb-7 pt-8">
        <span className="mb-[18px] flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary shadow-[0_2px_14px_hsl(33_90%_55%/.4)]">
          <Zap className="h-[18px] w-[18px] fill-black text-black" strokeWidth={2.4} />
        </span>

        <h2 className="m-0 font-heading text-[26px] font-bold uppercase leading-none tracking-[.02em] text-foreground">
          Sign in to DFL Skills
        </h2>
        <p className="m-0 mb-6 mt-[10px] text-[13px] leading-[1.6] text-[hsl(212_11%_58%)]">
          Use your DevFellowship account to unlock the internal registry and copy a skill straight
          into your own agent.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-[14px]">
          <Field label="Email" htmlFor="signin-email">
            <Input
              id="signin-email"
              type="email"
              autoComplete="username"
              autoFocus
              placeholder="you@devfellowship.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Password" htmlFor="signin-password">
            <PasswordInput
              id="signin-password"
              autoComplete="current-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-[9px] rounded-lg border border-[hsl(0_70%_50%/.32)] bg-[hsl(0_70%_50%/.12)] px-3 py-[10px] text-[12.5px] leading-[1.5] text-[hsl(0_80%_74%)]"
            >
              <AlertCircle className="mt-px h-[15px] w-[15px] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" loading={busy} className="mt-1 w-full">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>

      <div className="flex items-center gap-2 border-t border-[hsl(215_15%_16%)] bg-[hsl(215_20%_8.5%)] px-7 py-[13px] text-[12px] text-[hsl(212_10%_50%)]">
        <Lock className="h-[13px] w-[13px] shrink-0" />
        Internal skills stay visible only to DevFellowship members.
      </div>
    </Modal>
  );
}
