interface AuthorFilterProps {
  value: string | null;
  onChange: (author: string | null) => void;
  authors: string[];
}

export function AuthorFilter({ value, onChange, authors }: AuthorFilterProps) {
  return (
    <Select value={value ?? "all"} onValueChange={(next) => onChange(next === "all" ? null : next)}>
      <SelectTrigger className="h-[34px] min-w-[150px]" aria-label="Filter by author">
        <SelectValue placeholder="All authors" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All authors</SelectItem>
        {authors.map((author) => (
          <SelectItem key={author} value={author}>
            {author}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@devfellowship/components";
