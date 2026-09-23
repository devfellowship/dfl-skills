import type { PackAuthors } from "@/types";
import { AUTHOR_STACK_LIMIT } from "@/consts/pack-home";
import { AuthorAvatar } from "./AuthorAvatar";

interface PackAuthorStackProps {
  authors: PackAuthors;
  size?: number;
}

/** Overlapping avatars: the pack author first, then every other member author. */
export function PackAuthorStack({ authors, size = 22 }: PackAuthorStackProps) {
  const handles = [authors.author, ...authors.contributors.filter((c) => c !== authors.author)];
  const shown = handles.slice(0, AUTHOR_STACK_LIMIT);
  const more = handles.length - shown.length;

  return (
    <div className="flex items-center" data-testid="pack-author-stack" title={handles.join(", ")}>
      {shown.map((h, i) => (
        <AuthorAvatar
          key={h}
          handle={h}
          size={size}
          linked
          className={`ring-2 ring-[var(--color-card)] ${i > 0 ? "-ml-[7px]" : ""}`}
        />
      ))}
      {more > 0 && (
        <span
          style={{ width: size, height: size }}
          className="-ml-[7px] flex items-center justify-center rounded-full border border-[hsl(215_15%_22%)] bg-[hsl(215_18%_14%)] text-[9px] font-bold text-[hsl(212_13%_74%)] ring-2 ring-[var(--color-card)]"
        >
          +{more}
        </span>
      )}
    </div>
  );
}
