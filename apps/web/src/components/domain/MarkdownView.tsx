import ReactMarkdown, { type Components } from "react-markdown";
import { safeHref } from "@/lib/safeHref";

const components: Components = {
  a({ href, children }) {
    return (
      <a href={safeHref(href)} target="_blank" rel="noopener noreferrer nofollow">
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    const safe = safeHref(typeof src === "string" ? src : undefined);
    return safe ? <img src={safe} alt={alt ?? ""} /> : null;
  },
};

interface MarkdownViewProps {
  source: string;
}

export function MarkdownView({ source }: MarkdownViewProps) {
  return (
    <div className="md animate-fadeUp">
      <ReactMarkdown urlTransform={safeHref} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
