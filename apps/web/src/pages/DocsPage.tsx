import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { CodeBlock } from "@/components/ui/CodeBlock";

const REPO_URL = "https://github.com/devfellowship/skills";

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="m-0 mb-[14px] font-heading text-[22px] font-semibold uppercase tracking-[.02em] text-foreground">
      {children}
    </h2>
  );
}

const InlineCode = ({ children }: { children: string }) => (
  <code className="rounded-[5px] bg-[hsl(215_15%_15%)] px-[6px] py-0.5 font-mono text-[13px] text-[hsl(33_82%_66%)]">
    {children}
  </code>
);

export function DocsPage() {
  return (
    <main className="mx-auto max-w-[820px] animate-fadeUp px-6 pb-[90px] pt-12">
      <div className="mb-[18px] inline-flex items-center gap-[7px] rounded-full border border-[hsl(33_90%_55%/.22)] bg-[hsl(33_90%_55%/.1)] px-[11px] py-[5px]">
        <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[hsl(33_85%_64%)]">
          Documentation
        </span>
      </div>
      <h1 className="m-0 mb-[14px] font-heading text-[46px] font-bold uppercase leading-none">
        Get started with DFL Skills
      </h1>
      <p className="m-0 mb-9 max-w-[600px] text-base text-[hsl(212_12%_64%)]">
        DFL Skills is fully compatible with the stock <InlineCode>skills</InlineCode> CLI — just point
        it at the DevFellowship registry.
      </p>

      <SectionTitle>Install a skill</SectionTitle>
      <div className="mb-[34px] flex flex-col gap-2">
        <CodeBlock command="npx skills add devfellowship/dfl-code-style" size="sm" copyMessage="Copied" />
        <CodeBlock command={'npx skills find "review my PR"'} size="sm" copyMessage="Copied" />
        <CodeBlock command="npx skills update --all" size="sm" copyMessage="Copied" />
      </div>

      <SectionTitle>Point the CLI at DFL</SectionTitle>
      <p className="m-0 mb-[14px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        Set the search base so the stock CLI resolves against the DevFellowship registry instead of
        the public one:
      </p>
      <CodeBlock
        command="export SEARCH_API_BASE=https://skills.devfellowship.com"
        size="sm"
        copyMessage="Copied"
        className="mb-[34px]"
      />

      <SectionTitle>Publish a skill</SectionTitle>
      <p className="m-0 mb-[18px] text-[15px] leading-[1.7] text-[hsl(212_13%_68%)]">
        Open a pull request adding <InlineCode>skills/&lt;name&gt;/SKILL.md</InlineCode> to{" "}
        <InlineCode>devfellowship/skills</InlineCode>. Once merged, the registry indexes it and it
        appears here.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13.5px] font-bold text-primary-foreground transition-colors hover:bg-[hsl(33_92%_60%)]"
        >
          <Plus className="h-[15px] w-[15px]" strokeWidth={2.2} />
          Open a PR
        </a>
        <Link
          to="/ds"
          className="inline-flex h-[38px] items-center justify-center rounded-lg border border-[hsl(215_15%_19%)] px-4 text-[13.5px] font-semibold text-foreground/85 transition-colors hover:border-[hsl(215_15%_28%)] hover:bg-[hsl(215_18%_13%)]"
        >
          View design system →
        </Link>
      </div>
    </main>
  );
}
