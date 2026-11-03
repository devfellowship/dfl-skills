import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@devfellowship/components";
import { PACK_SORTS, PACK_SORT_LABEL, type PackSort } from "@/lib/pack-sort";

interface PackSortControlsProps {
  sort: PackSort;
  onSortChange: (sort: PackSort) => void;
  author: string | null;
  onAuthorChange: (author: string | null) => void;
  authors: string[];
}

/** Sort and author filter of the /packs page. The state lives in the URL, so a view is a link. */
export function PackSortControls({ sort, onSortChange, author, onAuthorChange, authors }: PackSortControlsProps) {
  return (
    <div data-testid="pack-controls" className="mb-5 flex flex-wrap items-center gap-2">
      <Select value={sort} onValueChange={(next) => onSortChange(next as PackSort)}>
        <SelectTrigger data-testid="pack-sort" className="h-[34px] min-w-[170px]" aria-label="Sort packs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PACK_SORTS.map((value) => (
            <SelectItem key={value} value={value}>
              Sort: {PACK_SORT_LABEL[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {authors.length > 1 && (
        <Select value={author ?? "all"} onValueChange={(next) => onAuthorChange(next === "all" ? null : next)}>
          <SelectTrigger data-testid="pack-author-filter" className="h-[34px] min-w-[150px]" aria-label="Filter packs by author">
            <SelectValue placeholder="All authors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All authors</SelectItem>
            {authors.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
