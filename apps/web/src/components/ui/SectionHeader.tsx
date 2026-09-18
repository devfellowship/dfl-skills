import type { ReactNode } from "react";

interface SectionHeaderProps {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  /** Rendered on the right: a count, a link, a control row. */
  aside?: ReactNode;
  id?: string;
}

export function SectionHeader({ icon, eyebrow, title, description, aside, id }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-[6px] flex items-center gap-[7px] text-[11px] font-bold uppercase tracking-[.08em] text-[hsl(33_85%_64%)]">
            {icon}
            {eyebrow}
          </div>
        )}
        <h2 id={id} className="m-0 font-heading text-[26px] font-bold uppercase leading-none tracking-[.01em] text-foreground sm:text-[30px]">
          {title}
        </h2>
        {description && (
          <p className="m-0 mt-2 max-w-[560px] text-[14px] leading-[1.55] text-[hsl(212_12%_64%)]">{description}</p>
        )}
      </div>
      {aside && <div className="flex shrink-0 items-center gap-3">{aside}</div>}
    </div>
  );
}
