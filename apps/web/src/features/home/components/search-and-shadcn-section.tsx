import styles from "./search-and-shadcn-section.module.css";

export function SearchAndShadcnSection() {
  return (
    <section className={styles.grid}>
      <article className={styles.card}>
        <h3>Enhance your search experience.</h3>
        <p>
          Integrate with Orama Search and Algolia Search in your docs easily.
        </p>
        <a href="/docs">Learn More</a>
        <div className={styles.searchMock}>
          <p>Search...</p>
          <ul>
            <li>Getting Started</li>
            <li>Components</li>
            <li>MDX Content</li>
          </ul>
        </div>
      </article>
      <article className={styles.cardImage}>
        <div className={styles.cardCopy}>
          <h3>The shadcn/ui for docs</h3>
          <p>
            Fumadocs CLI creates interactive components for your docs, offering a
            rich experience to your users.
          </p>
          <a href="/docs/cli">Commands</a>
        </div>
        <img src="/landing/shadcn.0wdg9wvt5u2ue.png" alt="" loading="lazy" />
      </article>
    </section>
  );
}
