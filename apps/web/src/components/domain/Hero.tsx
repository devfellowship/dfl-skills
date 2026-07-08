import { CodeBlock } from "@/components/ui/CodeBlock";

export function Hero({ count }: { count: number }) {
  return (
    <section className="animate-fadeUp pb-10 pt-[54px]">
      <div className="mb-5 inline-flex items-center gap-[7px] rounded-full border border-[hsl(33_90%_55%/.22)] bg-[hsl(33_90%_55%/.1)] px-[11px] py-[5px]">
        <span className="h-[6px] w-[6px] rounded-full bg-primary shadow-[0_0_8px_hsl(33_90%_55%)]" />
        <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[hsl(33_85%_64%)]">
          DevFellowship Registry
        </span>
      </div>
      <h1 className="m-0 mb-4 max-w-[680px] font-heading text-[34px] font-bold uppercase leading-[.98] tracking-[.005em] sm:text-[54px]">
        The DevFellowship
        <br className="hidden sm:block" /> agent skills registry
      </h1>
      <p className="m-0 mb-[26px] max-w-[600px] text-[16.5px] leading-[1.6] text-[hsl(212_12%_64%)]">
        Discover and install agent skills, MCP servers and connections — straight into Claude Code,
        Cursor, Codex and the rest of your toolkit.
      </p>
      <div className="flex max-w-[560px] flex-wrap items-center gap-4">
        <CodeBlock
          command="npx skills add devfellowship/skills"
          className="min-w-[320px] flex-1 rounded-[11px] px-[15px] py-[13px]"
        />
        <div>
          <div className="font-heading text-[26px] font-bold leading-none text-foreground">
            {count}
          </div>
          <div className="mt-[3px] text-[11px] uppercase tracking-[.05em] text-[hsl(212_10%_52%)]">
            Skills
          </div>
        </div>
      </div>
    </section>
  );
}
