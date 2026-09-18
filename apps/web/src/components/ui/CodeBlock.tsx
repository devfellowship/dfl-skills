import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from "@devfellowship/components";

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Copy command"
              onClick={() => {
                void copyText(command);
                toast.success(copyMessage);
              }}
              className="shrink-0"
            >
              <Copy className="h-[13px] w-[13px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
