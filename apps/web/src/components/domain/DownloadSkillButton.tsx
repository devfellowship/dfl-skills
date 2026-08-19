import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadSkillFile } from "@/lib/download";

interface DownloadSkillButtonProps {
  slug: string;
  /** The verbatim SKILL.md, or null while it is unavailable. */
  markdown: string | null;
}

export function DownloadSkillButton({ slug, markdown }: DownloadSkillButtonProps) {
  return (
    <Button
      variant="secondary"
      onClick={() => downloadSkillFile(slug, markdown)}
      disabled={!markdown}
      icon={<Download className="h-[15px] w-[15px]" strokeWidth={2.2} />}
      className="w-full"
    >
      Download SKILL.md
    </Button>
  );
}
