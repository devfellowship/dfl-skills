import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { Tooltip } from "./Tooltip";

interface CodeBlockProps {
  command: string;
  className?: string;
  size?: "sm" | "md";
  copyMessage?: string;
}

async function copyText(text: string): Promise<void> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  } catch {
    /* clipboard unavailable */
  }
}

export function CodeBlock({
  command,
  className,
  size = "md",
  copyMessage = "Copied install command",
}: CodeBlockProps) {
  const textSize = size === "md" ? "text-sm" : "text-[12.5px]";
  return (
    <div
      className={cn(
        "flex items-center gap-[10px] rounded-[9px] border border-border bg-[hsl(215_26%_8.5%)] px-[14px] py-3",
        className,
      )}
    >
      <span className={cn("font-mono text-[hsl(212_9%_46%)]", textSize)}>$</span>
      <code className={cn("flex-1 overflow-auto whitespace-nowrap font-mono text-[hsl(208_30%_84%)] lo-scroll", textSize)}>
        {command}
      </code>
      <Tooltip label="Copy">
        <button
          type="button"
          onClick={() => {
            void copyText(command);
            toast.success(copyMessage);
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border border-[hsl(215_15%_20%)] bg-secondary text-muted-foreground transition-colors hover:border-[hsl(33_90%_55%/.4)] hover:text-[hsl(33_90%_60%)]"
        >
          <Copy className="h-[13px] w-[13px]" />
        </button>
      </Tooltip>
    </div>
  );
}
