import { useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Github, Library, Palette, Zap } from "lucide-react";
import {
  AppNavbar,
  AppSidebar,
  Button,
  SidebarTrigger,
  type BreadcrumbEntry,
  type NavGroup,
} from "@devfellowship/components";
import { useAuth } from "@/hooks/useAuth";
import { useSearchState } from "@/hooks/useSearchState";
import { DFL_CALLBACK_PATH } from "@/lib/dfl-federation";
import { SearchBar } from "./SearchBar";

const REPO_URL = "https://github.com/devfellowship/dfl-skills";

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Registry",
    items: [
      { title: "Catalog", url: "/", icon: Library, exact: true },
      { title: "Documentation", url: "/docs", icon: BookOpen, exact: true },
      { title: "Design system", url: "/ds", icon: Palette, exact: true },
    ],
  },
];

function routeChrome(pathname: string): {
  activeUrl: string;
  breadcrumbs: BreadcrumbEntry[];
} {
  if (pathname === "/docs") {
    return {
      activeUrl: "/docs",
      breadcrumbs: [{ label: "Catalog", href: "/" }, { label: "Documentation" }],
    };
  }

  if (pathname === "/ds") {
    return {
      activeUrl: "/ds",
      breadcrumbs: [{ label: "Catalog", href: "/" }, { label: "Design system" }],
    };
  }

  if (pathname === DFL_CALLBACK_PATH) {
    return {
      activeUrl: "/",
      breadcrumbs: [{ label: "Catalog", href: "/" }, { label: "Sign in" }],
    };
  }

  if (pathname.startsWith("/s/")) {
    const slug = pathname.split("/").filter(Boolean).at(-1) ?? "Skill";
    return {
      activeUrl: "/",
      breadcrumbs: [
        { label: "Catalog", href: "/" },
        { label: decodeURIComponent(slug) },
      ],
    };
  }

  return { activeUrl: "/", breadcrumbs: [{ label: "Catalog" }] };
}

function accountName(email: string): string {
  const localPart = email.split("@")[0] ?? email;
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, setQuery } = useSearchState();
  const { email, loading, configured, signInWithDfl, signOut } = useAuth();
  const chrome = useMemo(() => routeChrome(location.pathname), [location.pathname]);

  const onSearch = (value: string): void => {
    setQuery(value);
    if (location.pathname !== "/") navigate("/");
  };

  const userInfo = email ? { name: accountName(email), email } : undefined;
  const signInAction = configured && !loading && !email ? (
    <Button
      size="sm"
      onClick={() => signInWithDfl(`${location.pathname}${location.search}`)}
      className="whitespace-nowrap"
    >
      <Zap className="h-4 w-4" />
      <span className="hidden lg:inline">Sign in with DFL</span>
      <span className="lg:hidden">Sign in</span>
    </Button>
  ) : null;

  return (
    <AppSidebar
      navGroups={NAV_GROUPS}
      userInfo={userInfo}
      appName="DFL Skills"
      appLabel="Agent registry"
      activeUrl={chrome.activeUrl}
      onNavigate={navigate}
      logo={<Zap className="h-4 w-4 fill-current text-[var(--s-ink-inverse)]" />}
    >
      <AppNavbar
        breadcrumbs={chrome.breadcrumbs}
        userInfo={userInfo}
        theme="dark"
        onSignOut={email ? () => void signOut() : undefined}
        leftSlot={<SidebarTrigger aria-label="Toggle navigation" />}
        actions={
          <>
            <SearchBar
              value={query}
              onChange={onSearch}
              className="hidden w-[min(32vw,420px)] md:block"
            />
            <Button asChild variant="outline" size="sm" className="hidden xl:inline-flex">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
            {signInAction}
          </>
        }
      />

      <div className="flex items-center gap-2 border-b border-[var(--s-border-subtle)] bg-[var(--s-surface-panel)] px-4 py-3 md:hidden">
        <SearchBar value={query} onChange={onSearch} className="max-w-none" />
        <Button asChild variant="ghost" size="icon-sm">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="Open GitHub repository">
            <Github className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-x-hidden">{children}</div>
    </AppSidebar>
  );
}
