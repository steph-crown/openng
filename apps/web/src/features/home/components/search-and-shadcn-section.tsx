import { buildApiUrl } from "../../../lib/api-base-url";
import styles from "./search-and-shadcn-section.module.css";

export function SearchAndShadcnSection() {
  const holidaysMetaUrl = buildApiUrl("/v1/holidays/meta");

  return (
    <section className={styles.grid}>
      <article className={styles.card}>
        <h3>Machine-readable by design.</h3>
        <p>
          Every resource exposes a `/meta` endpoint describing fields, filters,
          freshness, source, and version.
        </p>
        <a href={holidaysMetaUrl}>Try /meta</a>
        <div className={styles.searchMock}>
          <p>curl {holidaysMetaUrl}</p>
          <ul>
            <li>resource: holidays</li>
            <li>record_count: 91</li>
            <li>filters: year, type, is_confirmed</li>
          </ul>
        </div>
      </article>
      <article className={styles.cardImage}>
        <div className={styles.cardCopy}>
          <h3>Open source. Fork it. Own it.</h3>
          <p>
            OpenNG is MIT licensed. API server, data pipeline, schema, and seed
            data all live in one public monorepo.
          </p>
          <a href="https://github.com/stephcrown/openng">View on GitHub</a>
        </div>
        <img src="/landing/shadcn.0wdg9wvt5u2ue.png" alt="" loading="lazy" />
      </article>
    </section>
  );
}
