interface AuthorFilterProps {
  value: string | null;
  onChange: (author: string | null) => void;
  authors: string[];
}

export function AuthorFilter({ value, onChange, authors }: AuthorFilterProps) {
  return (
    <select
      aria-label="Filter by author"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-[34px] rounded-lg border border-border bg-[hsl(215_18%_11%)] px-3 text-[12.5px] font-semibold text-[hsl(212_12%_66%)] transition-colors hover:border-[hsl(215_15%_28%)] focus:border-primary focus:outline-none"
    >
      <option value="">All authors</option>
      {authors.map((a) => (
        <option key={a} value={a}>
          {a}
        </option>
      ))}
    </select>
  );
}
