import { Link } from "react-router-dom";
import { Card } from "@devfellowship/components";
import type { Pack } from "@/types";
import { formatDate } from "@/lib/format";
import { packAuthors, roleCounts } from "@/lib/packs";
import { maintainerHref } from "@/lib/maintainer";
import { AuthorAvatar } from "./AuthorAvatar";

/** The pack at a glance: who made it, who wrote its members, what it holds. */
export function PackSummaryPanel({ pack }: { pack: Pack }) {
  const { author, contributors } = packAuthors(pack);
  const counts = roleCounts(pack);

  return (
    <Card className="p-[18px]" data-testid="pack-summary">
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">About this pack</h2>

      <div className="flex items-center gap-[10px]" data-testid="pack-author">
        <AuthorAvatar handle={author} size={32} linked />
        <div className="min-w-0">
          <div className="text-[11px] text-[hsl(212_10%_52%)]">Created by</div>
          <Link
            to={maintainerHref(author)}
            className="block truncate text-[14px] font-semibold text-foreground hover:text-[hsl(33_82%_66%)] hover:underline"
          >
            {author}
          </Link>
        </div>
      </div>

      {contributors.length > 0 && (
        <div className="mt-[14px]" data-testid="pack-contributors">
          <div className="mb-[6px] text-[11px] text-[hsl(212_10%_52%)]">
            {contributors.length === 1 ? "1 skill author" : `${contributors.length} skill authors`}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-[6px]">
            {contributors.map((c) => (
              <span key={c} className="flex items-center gap-[6px] text-[12.5px] text-[hsl(212_13%_70%)]">
                <AuthorAvatar handle={c} size={18} linked />
                <Link to={maintainerHref(c)} className="hover:text-[hsl(33_82%_66%)] hover:underline">
                  {c}
                </Link>
              </span>
            ))}
          </div>
        </div>
      )}

      <dl className="m-0 mt-[14px] grid grid-cols-[auto_1fr] gap-x-4 gap-y-[5px] border-t border-[hsl(215_15%_14%)] pt-3 text-[12.5px]">
        <dt className="text-[hsl(212_10%_52%)]">Skills</dt>
        <dd className="m-0 text-[hsl(212_13%_76%)]">
          {pack.members.length}
          <span className="text-[hsl(212_10%_52%)]">
            {" "}
            ({counts.map((r) => `${r.count} ${r.role}`).join(" · ")})
          </span>
        </dd>
        <dt className="text-[hsl(212_10%_52%)]">Updated</dt>
        <dd className="m-0 text-[hsl(212_13%_76%)]">{formatDate(pack.updatedAt)}</dd>
      </dl>
    </Card>
  );
}
