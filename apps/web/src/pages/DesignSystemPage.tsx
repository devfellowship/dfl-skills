import { Badge, Button, Card } from "@devfellowship/components";

function GroupLabel({ children }: { children: string }) {
  return (
    <div className="mb-[14px] text-[11px] font-bold uppercase tracking-[.07em] text-[hsl(212_10%_54%)]">
      {children}
    </div>
  );
}

const Panel = ({ children }: { children: React.ReactNode }) => (
  <Card className="mb-9 flex flex-wrap items-center gap-3 p-6">
    {children}
  </Card>
);

const SURFACES: Array<{ label: string; className: string; dark?: boolean }> = [
  { label: "background", className: "bg-background border border-border text-muted-foreground" },
  { label: "card", className: "bg-card border border-border text-muted-foreground" },
  { label: "secondary", className: "bg-[hsl(215_15%_15%)] border border-[hsl(215_15%_20%)] text-muted-foreground" },
  { label: "primary", className: "bg-primary text-black font-bold", dark: true },
  { label: "ring", className: "bg-[hsl(270_90%_71%)] text-black font-bold", dark: true },
];

export function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-[980px] animate-fadeUp px-6 pb-[90px] pt-12">
      <h1 className="m-0 mb-[6px] font-heading text-[40px] font-bold uppercase leading-none">
        Design System
      </h1>
      <p className="m-0 mb-[38px] text-[15px] text-[hsl(212_12%_62%)]">
        DevFellowship primitives — GitHub-dark, cool blue, orange accent.
      </p>

      <GroupLabel>Buttons</GroupLabel>
      <Panel>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Danger</Button>
        <Button loading>Loading</Button>
      </Panel>

      <GroupLabel>Badges</GroupLabel>
      <Panel>
        <Badge variant="secondary">secondary</Badge>
        <Badge>brand</Badge>
        <Badge variant="success">success</Badge>
        <Badge variant="warning">warning</Badge>
        <Badge variant="danger">danger</Badge>
        <Badge variant="info">info</Badge>
        <Badge variant="outline">outline</Badge>
      </Panel>

      <GroupLabel>Surfaces &amp; tokens</GroupLabel>
      <div className="flex flex-wrap gap-3 rounded-[13px] border border-border bg-[hsl(215_21%_10.5%)] p-6">
        {SURFACES.map((s) => (
          <div
            key={s.label}
            className={`flex h-16 min-w-[120px] flex-1 items-end rounded-[9px] p-2 font-mono text-[11px] ${s.className}`}
          >
            {s.label}
          </div>
        ))}
      </div>
    </main>
  );
}
