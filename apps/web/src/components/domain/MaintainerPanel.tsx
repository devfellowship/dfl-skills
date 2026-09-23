import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@devfellowship/components";
import { CORE_HANDLE, maintainerApprovalLine, maintainerHref, maintainerLabel } from "@/lib/maintainer";
import { safeHref } from "@/lib/safeHref";
import { AuthorAvatar } from "./AuthorAvatar";

interface MaintainerPanelProps {
  /** The `author:` GitHub handle, or `null` for core (no author, or `devfellowship`). */
  owner: string | null;
  kind: "skill" | "pack";
  proposeUrl: string | null;
}

/** Who has to approve a change here, and where to open the PR that proposes one. */
export function MaintainerPanel({ owner, kind, proposeUrl }: MaintainerPanelProps) {
  const handle = owner ?? CORE_HANDLE;
  const href = safeHref(proposeUrl);

  return (
    <Card className="flex flex-col gap-[10px] p-[18px]">
      <h2 className="text-[11px] font-bold uppercase tracking-[.07em] text-muted-foreground">Maintainer</h2>
      <Link
        to={maintainerHref(handle)}
        className="flex items-center gap-[10px] text-foreground hover:text-[hsl(33_82%_66%)]"
      >
        <AuthorAvatar handle={handle} size={28} />
        <span className="text-[14px] font-semibold">{maintainerLabel(handle)}</span>
      </Link>
      <p className="m-0 text-[13px] leading-[1.5] text-[hsl(212_12%_64%)]">
        {maintainerApprovalLine(handle, kind)}
      </p>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[13px] font-semibold text-[hsl(33_82%_62%)] hover:underline"
        >
          Propose a change
          <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
    </Card>
  );
}
