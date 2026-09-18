import { Button } from "@devfellowship/components";

interface CoreToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  count: number;
}

export function CoreToggle({ value, onChange, count }: CoreToggleProps) {
  return (
    <Button
      type="button"
      aria-pressed={value}
      onClick={() => onChange(!value)}
      variant={value ? "default" : "outline"}
      size="sm"
      rounded="pill"
    >
      Core ({count})
    </Button>
  );
}
