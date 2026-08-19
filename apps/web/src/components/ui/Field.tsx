import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-[7px] block text-[11px] font-bold uppercase tracking-[.07em] text-[hsl(212_10%_54%)]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
