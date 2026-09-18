import { Route, Routes } from "react-router-dom";
import { SearchProvider } from "@/hooks/useSearchState";
import { AuthProvider } from "@/components/AuthProvider";
import { SonnerToaster } from "@devfellowship/components";
import { AppShell } from "@/components/domain/AppShell";
import { ScrollToTop } from "@/components/ScrollToTop";
import { HomePage } from "@/pages/HomePage";
import { SkillDetailPage } from "@/pages/SkillDetailPage";
import { PackDetailPage } from "@/pages/PackDetailPage";
import { DocsPage } from "@/pages/DocsPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { DFL_CALLBACK_PATH } from "@/lib/dfl-federation";

export function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <ScrollToTop />
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/s/:owner/:repo/:slug" element={<SkillDetailPage />} />
            {/* A pack is its own entity (plan ADR-6). It must stay above the
                catch-all, which renders the HOME page for any unknown path. */}
            <Route path="/p/:owner/:repo/:pack" element={<PackDetailPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path={DFL_CALLBACK_PATH} element={<AuthCallbackPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </AppShell>
        <SonnerToaster position="bottom-right" richColors />
      </SearchProvider>
    </AuthProvider>
  );
}
