import { Route, Routes } from "react-router-dom";
import { SearchProvider } from "@/hooks/useSearchState";
import { AuthProvider } from "@/components/AuthProvider";
import { TopNav } from "@/components/domain/TopNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/Toaster";
import { HomePage } from "@/pages/HomePage";
import { SkillDetailPage } from "@/pages/SkillDetailPage";
import { DocsPage } from "@/pages/DocsPage";
import { DesignSystemPage } from "@/pages/DesignSystemPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { DFL_CALLBACK_PATH } from "@/lib/dfl-federation";

export function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <ScrollToTop />
        <TopNav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/s/:owner/:repo/:slug" element={<SkillDetailPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/ds" element={<DesignSystemPage />} />
          <Route path={DFL_CALLBACK_PATH} element={<AuthCallbackPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
        <Toaster />
      </SearchProvider>
    </AuthProvider>
  );
}
