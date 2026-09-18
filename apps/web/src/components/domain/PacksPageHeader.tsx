import { Layers } from "lucide-react";
import { CodeBlock } from "@/components/ui/CodeBlock";

interface PacksPageHeaderProps {
  count: number;
  loading: boolean;
}

export function PacksPageHeader({ count, loading }: PacksPageHeaderProps) {
  return (
    <section className="mb-10 animate-fadeUp">
      <div className="mb-4 inline-flex items-center gap-[7px] rounded-full border border-[hsl(33_90%_55%/.22)] bg-[hsl(33_90%_55%/.1)] px-[11px] py-[5px]">
        <Layers className="h-[12px] w-[12px] text-[hsl(33_85%_64%)]" />
        <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[hsl(33_85%_64%)]">
          {loading ? "Packs" : `${count} ${count === 1 ? "pack" : "packs"}`}
        </span>
      </div>
      <h1 className="m-0 mb-3 max-w-[680px] font-heading text-[34px] font-bold uppercase leading-[.98] tracking-[.005em] sm:text-[48px]">
        Skill packs
      </h1>
      <p className="m-0 mb-6 max-w-[600px] text-[16px] leading-[1.6] text-[hsl(212_12%_64%)]">
        A pack is a root skill and the skills it routes to, installed together. Its members are
        ordinary skills — each one also lives on its own in the catalogue.
      </p>
      <CodeBlock
        command="claude plugin marketplace add devfellowship/skills"
        className="max-w-[560px] rounded-[11px] px-[15px] py-[13px]"
      />
    </section>
  );
}
