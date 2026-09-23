import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export function BackToRegistryLink() {
  return (
    <Link
      to="/"
      className="mb-2 inline-flex items-center gap-[7px] py-2 text-[13px] font-medium text-[hsl(212_11%_58%)] transition-colors hover:text-foreground/80"
    >
      <ChevronLeft className="h-[15px] w-[15px]" />
      Back to registry
    </Link>
  );
}
