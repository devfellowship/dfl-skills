import { Link, useLocation, useNavigate } from "react-router-dom";
import { Github, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { useSearchState } from "@/hooks/useSearchState";
import { SearchBar } from "./SearchBar";

const REPO_URL = "https://github.com/devfellowship/skills";

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-[7px] px-3 py-2 text-[13.5px] font-medium transition-colors",
        active ? "text-foreground" : "text-[hsl(212_11%_60%)] hover:text-foreground/80",
      )}
    >
      {label}
    </Link>
  );
}

export function TopNav() {
  const { query, setQuery } = useSearchState();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onSearch = (value: string): void => {
    setQuery(value);
    if (pathname !== "/") navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 flex h-[60px] items-center gap-[18px] border-b border-[hsl(215_15%_15%)] bg-[hsl(216_28%_7%/.82)] px-6 backdrop-blur-[14px]">
      <Link to="/" className="flex items-center gap-[10px]">
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-primary shadow-[0_2px_10px_hsl(33_90%_55%/.35)]">
          <Zap className="h-4 w-4 fill-black text-black" strokeWidth={2.4} />
        </span>
        <span className="font-heading text-[22px] font-bold uppercase leading-none tracking-[.04em] text-foreground">
          DFL Skills
        </span>
      </Link>

      <SearchBar value={query} onChange={onSearch} />

      <div className="ml-auto flex items-center gap-1">
        <NavLink to="/" label="Browse" active={pathname === "/"} />
        <NavLink to="/docs" label="Docs" active={pathname === "/docs"} />
      </div>

      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg border border-[hsl(215_15%_19%)] px-[13px] py-2 text-[13px] font-medium text-foreground/85 transition-colors hover:border-[hsl(215_15%_28%)] hover:bg-[hsl(215_18%_13%)]"
      >
        <Github className="h-[15px] w-[15px]" />
        GitHub
      </a>
    </nav>
  );
}
