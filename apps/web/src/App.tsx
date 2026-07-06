import { Route, Routes } from "react-router-dom";
import { SearchProvider } from "@/hooks/useSearchState";
import { TopNav } from "@/components/domain/TopNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/Toaster";
import { HomePage } from "@/pages/HomePage";
import { SkillDetailPage } from "@/pages/SkillDetailPage";
import { DocsPage } from "@/pages/DocsPage";
import { DesignSystemPage } from "@/pages/DesignSystemPage";

export function App() {
  return (
    <SearchProvider>
      <ScrollToTop />
      <TopNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/s/:owner/:repo/:slug" element={<SkillDetailPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/ds" element={<DesignSystemPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Toaster />
    </SearchProvider>
  );
}
