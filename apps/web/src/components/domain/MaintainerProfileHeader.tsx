import { ExternalLink, Mail } from "lucide-react";
import type { GitHubProfile } from "@/types";
import { githubAvatarUrl } from "@/lib/format";
import { CORE_HANDLE } from "@/lib/maintainer";

interface MaintainerProfileHeaderProps {
  handle: string;
  label: string;
  core: boolean;
  /** The signed-in visitor's own GitHub profile, when this page is theirs. */
  self: GitHubProfile | null;
  counts: { packs: number; skills: number } | null;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Photo, name and handle, all from GitHub. The email shows only to its owner. */
export function MaintainerProfileHeader({ handle, label, core, self, counts }: MaintainerProfileHeaderProps) {
  const avatar = self?.avatarUrl ?? githubAvatarUrl(core ? CORE_HANDLE : handle);
  const name = self?.name ?? label;

  return (
    <header className="mb-9 flex flex-wrap items-center gap-5">
      <img
        src={avatar}
        alt=""
        className="h-[72px] w-[72px] rounded-full border border-[hsl(215_15%_18%)] bg-[hsl(215_18%_12%)] shadow-[0_0_0_4px_hsl(33_90%_55%/.08)]"
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="m-0 truncate font-heading text-[28px] font-bold leading-tight text-foreground">{name}</h1>
          {self && (
            <span className="rounded-full border border-[hsl(33_90%_55%/.3)] bg-[hsl(33_90%_55%/.1)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[.06em] text-[hsl(33_85%_64%)]">
              You
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <a
            href={`https://github.com/${encodeURIComponent(core ? CORE_HANDLE : handle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-[hsl(33_82%_62%)] hover:underline"
          >
            @{core ? CORE_HANDLE : handle}
            <ExternalLink className="h-3 w-3" />
          </a>
          {self?.email && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {self.email}
            </span>
          )}
          {counts && (
            <span className="text-muted-foreground">
              {plural(counts.packs, "pack")} · {plural(counts.skills, "skill")}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
