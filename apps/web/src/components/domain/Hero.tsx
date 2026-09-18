import type { ReactNode } from "react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { HeroStat } from "./HeroStat";

interface HeroProps {
  skills: number;
  packs: number;
  /** The right column on a wide screen (the pack showcase); stacks below the copy under 1024px. */
  aside?: ReactNode;
}

/**
 * Skills and packs are counted apart: a pack is not a skill, and adding it to
 * the skill number would over-report the catalogue.
 */
export function Hero({ skills, packs, aside }: HeroProps) {
  return (
    <section
      className={`animate-fadeUp pb-8 pt-10 lg:pt-12 ${
        aside ? "grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] lg:items-center lg:gap-x-12 xl:grid-cols-[minmax(0,1fr)_minmax(400px,460px)]" : ""
      }`}
    >
      <div className="min-w-0">
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
          Discover and install agent skills, MCP servers and connections — straight into Claude
          Code, Cursor, Codex and the rest of your toolkit.
        </p>
        <div className="flex max-w-[560px] flex-wrap items-center gap-4">
          <CodeBlock
            command="npx skills add devfellowship/skills"
            className="min-w-[320px] flex-1 rounded-[11px] px-[15px] py-[13px]"
          />
          <HeroStat value={skills} label={skills === 1 ? "Skill" : "Skills"} testId="hero-skill-count" />
          {packs > 0 && (
            <HeroStat value={packs} label={packs === 1 ? "Pack" : "Packs"} testId="hero-pack-count" />
          )}
        </div>
      </div>
      {aside && <div className="min-w-0">{aside}</div>}
    </section>
  );
}
