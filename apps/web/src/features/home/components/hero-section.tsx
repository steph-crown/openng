import styles from "./hero-section.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.badge}>Open source · Free to use · MIT licensed</p>
        <h1 className={styles.heading}>
          Nigerian public data,
          <br />
          finally in an <span>API</span>.
        </h1>
        <p className={styles.subtext}>
          OpenNG gives developers programmatic access to Nigerian public data
          across holidays, fuel prices, postal codes, schools, health facilities
          and more. No PDFs. No scraping. Just clean JSON.
        </p>
        <div className={styles.actions}>
          <a className={styles.primaryButton} href="https://docs.openng.dev">
            Get started
          </a>
          <a
            className={styles.secondaryButton}
            href="https://api.openng.dev/v1/holidays?year=2026"
            target="_blank"
            rel="noreferrer noopener"
          >
            Try the API
          </a>
        </div>
      </div>
      <div className={styles.previewWrapper}>
        <pre className={styles.terminalPreview}>
          <code>
            {`$ curl "https://api.openng.dev/v1/holidays?year=2026"
{
  "success": true,
  "data": [
    { "name": "New Year's Day", "date": "2026-01-01" },
    { "name": "Eid el-Fitr", "date": "2026-03-19" }
  ],
  "meta": { "total": 13, "page": 1, "last_updated": "2026-03-20T00:00:00Z" }
}`}
          </code>
        </pre>
      </div>
    </section>
  );
}
