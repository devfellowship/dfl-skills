import { File, Folder } from "lucide-react";
import type { SkillFile } from "@/data/types";
import { buildTree } from "@/lib/fileTree";

interface FileTreeProps {
  files: SkillFile[];
}

export function FileTree({ files }: FileTreeProps) {
  const rows = buildTree(files);

  return (
    <div className="animate-fadeUp overflow-hidden rounded-[11px] border border-border bg-[hsl(215_21%_10%)]">
      <div className="flex items-center gap-2 border-b border-[hsl(215_15%_15%)] px-[15px] py-[11px] text-xs font-semibold text-[hsl(212_11%_58%)]">
        <Folder className="h-[14px] w-[14px]" />
        {files.length} files
      </div>
      {rows.map((row, i) => (
        <div
          key={`${row.name}-${i}`}
          style={{ paddingLeft: `${15 + row.depth * 18}px` }}
          className="flex items-center gap-2 border-b border-[hsl(215_15%_13%)] py-2 pr-[15px] font-mono text-[12.5px]"
        >
          {row.isFile ? (
            <File className="h-[14px] w-[14px] text-[hsl(212_10%_52%)]" />
          ) : (
            <Folder className="h-[14px] w-[14px] text-[hsl(33_80%_58%)]" />
          )}
          <span className={row.isFile ? "text-[hsl(208_28%_80%)]" : "text-[hsl(33_80%_60%)]"}>
            {row.name}
          </span>
          {row.isFile && (
            <span className="ml-auto font-sans text-[11px] text-[hsl(212_9%_44%)]">
              {row.size}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
