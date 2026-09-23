import { Link } from "react-router-dom";
import { Card } from "@devfellowship/components";
import type { Pack } from "@/types";
import { isValidSlug, isValidSource } from "@/lib/identifiers";
import { memberAuthor } from "@/lib/packs";
import { formatDayMonthYear } from "@/lib/format";
import { AuthorAvatar } from "./AuthorAvatar";
import { PackRoleBadge } from "./PackRoleBadge";
import { GRID_COLS } from "@/consts/pack-member-table";

interface PackMemberTableProps {
  pack: Pack;
}

/**
 * The members in MANIFEST order, root first — never alphabetical, because a
 * pack is a reading order. A member the catalogue does not carry stays a row
 * and says so: a link to it would be a dead page, and the gap is exactly what
 * this table exists to show.
 */
export function PackMemberTable({ pack }: PackMemberTableProps) {
  return (
    <Card className="@container overflow-hidden p-0">
      <div
        className={`hidden gap-4 border-b border-[hsl(215_15%_14%)] px-[18px] py-[10px] text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground @min-[740px]:grid ${GRID_COLS}`}
      >
        <span>Skill</span>
        <span>Author</span>
        <span>Description</span>
        <span className="whitespace-nowrap">Updated at</span>
      </div>
      <ol className="m-0 list-none p-0" aria-label={`${pack.members.length} skills in ${pack.name}`}>
        {pack.members.map((m) => {
          const published = m.status === "in_catalogue";
          const linkable = published && isValidSource(m.source) && isValidSlug(m.slug);
          const author = memberAuthor(m);
          return (
            <li
              key={`${m.source}/${m.slug}`}
              data-testid="pack-member"
              data-slug={m.slug}
              data-status={m.status}
              className={`grid grid-cols-1 gap-2 border-b border-[hsl(215_15%_14%)] px-[18px] py-[14px] last:border-b-0 @min-[740px]:items-start @min-[740px]:gap-4 ${GRID_COLS}`}
            >
              <div className="flex min-w-0 items-center justify-between gap-2 @min-[740px]:flex-col @min-[740px]:items-start @min-[740px]:justify-start @min-[740px]:gap-[6px]">
                {linkable ? (
                  <Link
                    to={`/s/${m.source}/${m.slug}`}
                    className="break-all font-mono text-[14px] font-semibold text-foreground hover:text-[hsl(33_82%_66%)] focus-visible:underline"
                  >
                    {m.slug}
                  </Link>
                ) : (
                  <span className="break-all font-mono text-[14px] font-semibold text-[hsl(212_11%_58%)]">
                    {m.slug}
                  </span>
                )}
                <PackRoleBadge role={m.role} />
              </div>
              <div data-testid="pack-member-author" className="flex min-w-0 items-center gap-[6px] text-[12.5px] text-[hsl(212_12%_64%)]">
                {author ? (
                  <>
                    <AuthorAvatar handle={author} />
                    <span className="truncate">{author}</span>
                  </>
                ) : (
                  <span className="text-[hsl(212_9%_40%)]">—</span>
                )}
              </div>
              <p data-testid="pack-member-description" className="clamp2 m-0 min-w-0 break-words text-[13px] leading-[1.5] text-[hsl(212_12%_64%)]">
                {m.description || (published ? "" : "Named by the pack, but not in the catalogue yet.")}
              </p>
              <div className="text-[12.5px] text-[hsl(212_12%_64%)] @min-[740px]:whitespace-nowrap">
                <span className="text-[hsl(212_9%_40%)] @min-[740px]:hidden">Updated at </span>
                <time
                  data-testid="pack-member-updated"
                  data-filled={m.updatedAt ? "true" : "false"}
                  dateTime={m.updatedAt ?? undefined}
                  className={m.updatedAt ? undefined : "text-[hsl(212_9%_40%)]"}
                >
                  {formatDayMonthYear(m.updatedAt)}
                </time>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
