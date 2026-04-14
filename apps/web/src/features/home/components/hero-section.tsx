import { buildApiUrl } from "../../../lib/api-base-url";
import { HeroApiPreview } from "./hero-api-preview";
import styles from "./hero-section.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.heading}>
          Nigerian public data,
          <br className={styles.headingBreak} />
          finally in an <span>API</span>.
        </h1>
        <p className={styles.subtext}>
          OpenNG gives developers programmatic access to Nigerian public data
          across holidays, fuel prices, postal codes, schools, health facilities
          and more.
        </p>
        <div className={styles.actions}>
          <a className={styles.primaryButton} href="https://docs.openng.dev">
            Get started
          </a>
          <a
            className={styles.secondaryButton}
            href={buildApiUrl("/v1/holidays?year=2026")}
            target="_blank"
            rel="noreferrer noopener"
          >
            Try the API
          </a>
        </div>
      </div>

      <div className={styles.previewWrapper}>
        <HeroApiPreview />
      </div>
    </section>
  );
}
