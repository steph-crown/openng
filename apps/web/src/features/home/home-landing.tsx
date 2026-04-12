import { AnybodyCanWriteSection } from "./components/anybody-can-write-section";
import { DocsForEngineersSection } from "./components/docs-for-engineers-section";
import { DreamAndFooterSection } from "./components/dream-and-footer-section";
import { FrameworkCardsGrid } from "./components/framework-cards-grid";
import { HeroSection } from "./components/hero-section";
import { IntroAndCliSection } from "./components/intro-and-cli-section";
import { LandingNav } from "./components/landing-nav";
import { SearchAndShadcnSection } from "./components/search-and-shadcn-section";
import { TestimonialsAndCustomizeGrid } from "./components/testimonials-and-customize-grid";

import styles from "./home-landing.module.css";

export function HomeLanding() {
  return (
    <div className={styles.page}>
      <LandingNav />
      <main className={styles.main}>
        <HeroSection />
        <IntroAndCliSection />
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
