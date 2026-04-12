import styles from "./docs-for-engineers-section.module.css";

export function DocsForEngineersSection() {
  return (
    <section className={styles.section}>
      <h2>Browse without code.</h2>
      <article className={styles.story}>
        <img
          className={styles.image}
          src="/landing/story.0_30w0aa7c1kw.png"
          alt=""
          loading="lazy"
        />
        <div className={styles.overlayCard}>
          <h3>Data Explorer</h3>
          <p>
            Browse, filter, and export OpenNG resources with zero code. Generated
            filters stay in sync with API metadata.
          </p>
          <a href="/explore">Explore</a>
          <div className={styles.callout}>View API call for current filters</div>
        </div>
      </article>
    </section>
  );
}
