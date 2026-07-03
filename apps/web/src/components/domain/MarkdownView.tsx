import { useMemo } from "react";
import { markdownToHtml } from "@/lib/markdown";

interface MarkdownViewProps {
  source: string;
}

export function MarkdownView({ source }: MarkdownViewProps) {
  const html = useMemo(() => markdownToHtml(source), [source]);
  return (
    <div
      className="md animate-fadeUp"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
