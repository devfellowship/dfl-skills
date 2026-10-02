import { useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Github, Layers, Library, LogOut, UserRound } from "lucide-react";
import {
  AppNavbar,
  AppSidebar,
  Button,
  SidebarTrigger,
  UserMenu,
  type NavGroup,
} from "@devfellowship/components";
import { useAuth } from "@/hooks/useAuth";
import { maintainerHref } from "@/lib/maintainer";
import { GitHubSignInButton } from "./GitHubSignInButton";

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

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, needsGitHub, loading, configured, signOut } = useAuth();
  const activeUrl = useMemo(() => activeUrlFor(location.pathname), [location.pathname]);

  const userInfo = profile
    ? { name: profile.name, email: profile.email ?? `@${profile.handle}`, avatarUrl: profile.avatarUrl ?? undefined }
    : undefined;

  const account = profile ? (
    <UserMenu
      name={profile.name}
      email={profile.email ?? `@${profile.handle}`}
      avatarUrl={profile.avatarUrl}
      colorSeed={profile.handle}
      showName={false}
      items={[
        { label: "Your profile", icon: <UserRound className="h-4 w-4" />, onSelect: () => navigate(maintainerHref(profile.handle)) },
        { label: "Sign out", icon: <LogOut className="h-4 w-4" />, destructive: true, separatorBefore: true, onSelect: () => void signOut() },
      ]}
    />
  ) : configured && !loading ? (
    <>
      <GitHubSignInButton
        size="sm"
        label={needsGitHub ? "Connect GitHub" : "Continue with GitHub"}
        compactLabel={needsGitHub ? "Connect" : "Sign in"}
      />
      {needsGitHub && (
        <Button variant="ghost" size="sm" onClick={() => void signOut()} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </>
  ) : null;

  return (
    <AppSidebar
      navGroups={NAV_GROUPS}
      userInfo={userInfo}
      appName="DFL Skills"
      activeUrl={activeUrl}
      onNavigate={navigate}
      logo="/favicon.svg"
    >
      <AppNavbar
        theme="dark"
        leftSlot={<SidebarTrigger aria-label="Toggle navigation" />}
        endSlot={
          <>
            <Button asChild variant="outline" size="sm">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="Source code on GitHub" title="Source code on GitHub">
                <Github className="h-4 w-4" />
              </a>
            </Button>
            {account}
          </>
        }
      />

      <div className="min-h-0 flex-1 overflow-x-hidden">{children}</div>
    </AppSidebar>
  );
}
