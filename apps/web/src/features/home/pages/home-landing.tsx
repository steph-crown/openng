import { AnybodyCanWriteSection } from "../components/anybody-can-write-section";
import { DocsForEngineersSection } from "../components/docs-for-engineers-section";
import { DreamAndFooterSection } from "../components/dream-and-footer-section";
import { FrameworkCardsGrid } from "../components/framework-cards-grid";
import { HeroSection } from "../components/hero-section";
import { LandingNav } from "../components/landing-nav";
import { SearchAndShadcnSection } from "../components/search-and-shadcn-section";
import { TestimonialsAndCustomizeGrid } from "../components/testimonials-and-customize-grid";

export function HomeLanding() {
  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-fg)">
      <LandingNav />
      <main className="mx-auto w-full max-w-(--layout-width) px-5 pb-14 pt-10 max-[1024px]:px-4 max-[640px]:px-3 max-[640px]:pb-10">
        <HeroSection />
        <TestimonialsAndCustomizeGrid />
        <AnybodyCanWriteSection />
        <DocsForEngineersSection />
        <FrameworkCardsGrid />
        <SearchAndShadcnSection />
        <DreamAndFooterSection />
      </main>
    </div>
  );
}
