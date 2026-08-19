import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className="pr-[38px]" {...props} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-0 top-0 flex h-[38px] w-[38px] items-center justify-center text-[hsl(212_10%_50%)] transition-colors hover:text-foreground"
      >
        <Icon className="h-[15px] w-[15px]" />
      </button>
    </div>
  );
}
