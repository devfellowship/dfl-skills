import { Link } from "react-router-dom";
import { Card } from "@devfellowship/components";
import type { Pack } from "@/types";
import { isValidSlug, isValidSource } from "@/lib/identifiers";
import { memberAuthor } from "@/lib/packs";
import { AuthorAvatar } from "./AuthorAvatar";
import { PackRoleBadge } from "./PackRoleBadge";

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
    <Card className="overflow-hidden p-0">
      <div className="hidden grid-cols-[minmax(0,240px)_120px_88px_minmax(0,1fr)_104px] gap-4 border-b border-[hsl(215_15%_14%)] px-[18px] py-[10px] text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground md:grid">
        <span>Skill</span>
        <span>Author</span>
        <span>Role</span>
        <span>Description</span>
        <span className="text-right">Status</span>
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
              className="grid grid-cols-1 gap-2 border-b border-[hsl(215_15%_14%)] px-[18px] py-[14px] last:border-b-0 md:grid-cols-[minmax(0,240px)_120px_88px_minmax(0,1fr)_104px] md:items-start md:gap-4"
            >
              <div className="flex min-w-0 items-center justify-between gap-2 md:block">
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
                <span className="md:hidden">
                  <PackRoleBadge role={m.role} />
                </span>
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
              <div className="hidden md:block">
                <PackRoleBadge role={m.role} />
              </div>
              <p className="clamp2 m-0 text-[13px] leading-[1.5] text-[hsl(212_12%_64%)]">
                {m.description || (published ? "" : "Named by the pack, but not in the catalogue yet.")}
              </p>
              <div className="md:text-right">
                {published ? (
                  <span className="text-[12px] text-[hsl(212_10%_52%)]">in catalogue</span>
                ) : (
                  <span
                    data-testid="pack-member-unpublished"
                    className="rounded-md border border-[hsl(0_70%_55%/.35)] bg-[hsl(0_70%_55%/.12)] px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[.04em] text-[hsl(0_75%_70%)]"
                  >
                    not published
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
