import { useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Github, Layers, Library, Zap } from "lucide-react";
import {
  AppNavbar,
  AppSidebar,
  Button,
  SidebarTrigger,
  UserMenu,
  type NavGroup,
} from "@devfellowship/components";
import { useAuth } from "@/hooks/useAuth";

const REPO_URL = "https://github.com/devfellowship/dfl-skills";

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Registry",
    items: [
      { title: "Catalog", url: "/", icon: Library, exact: true },
      { title: "Packs", url: "/packs", icon: Layers, exact: true },
      { title: "Documentation", url: "/docs", icon: BookOpen, exact: true },
    ],
  },
];

/** A pack page belongs to Packs; a skill page (and anything else) to the catalog. */
function activeUrlFor(pathname: string): string {
  if (pathname === "/docs") return "/docs";
  if (pathname === "/packs" || pathname.startsWith("/p/")) return "/packs";
  return "/";
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
  const { email, loading, configured, signInWithDfl, signOut } = useAuth();
  const activeUrl = useMemo(() => activeUrlFor(location.pathname), [location.pathname]);

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
      activeUrl={activeUrl}
      onNavigate={navigate}
      logo={<Zap className="h-4 w-4 fill-current text-[var(--s-ink-inverse)]" />}
    >
      <AppNavbar
        theme="dark"
        leftSlot={<SidebarTrigger aria-label="Toggle navigation" />}
        endSlot={
          <>
            <Button asChild variant="outline" size="sm">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
            {email ? (
              <UserMenu
                name={accountName(email)}
                email={email}
                showName={false}
                onSignOut={() => void signOut()}
              />
            ) : (
              signInAction
            )}
          </>
        }
      />

      <div className="min-h-0 flex-1 overflow-x-hidden">{children}</div>
    </AppSidebar>
  );
}
