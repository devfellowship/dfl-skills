import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[hsl(215_15%_18%)] bg-[hsl(215_21%_9.5%)] px-5 py-[70px] text-center">
      <div className="mb-4 flex h-[54px] w-[54px] items-center justify-center rounded-[13px] border border-[hsl(215_15%_18%)] bg-secondary text-[hsl(212_10%_52%)]">
        {icon}
      </div>
      <div className="font-heading text-[22px] font-semibold uppercase tracking-[.01em] text-foreground">
        {title}
      </div>
      <p className="mt-2 max-w-[340px] text-sm text-[hsl(212_11%_58%)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
