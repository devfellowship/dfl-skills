interface HeroStatProps {
  value: number;
  label: string;
  testId: string;
}

export function HeroStat({ value, label, testId }: HeroStatProps) {
  return (
    <div data-testid={testId}>
      <div className="font-heading text-[26px] font-bold leading-none text-foreground">{value}</div>
      <div className="mt-[3px] text-[11px] uppercase tracking-[.05em] text-[hsl(212_10%_52%)]">
        {label}
      </div>
    </div>
  );
}
