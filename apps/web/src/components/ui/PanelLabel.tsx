export function PanelLabel({ children }: { children: string }) {
  return (
    <div className="mb-[9px] text-[11px] font-bold uppercase tracking-[.07em] text-[hsl(212_10%_54%)]">
      {children}
    </div>
  );
}
