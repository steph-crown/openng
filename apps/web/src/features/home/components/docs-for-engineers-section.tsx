import styles from "./docs-for-engineers-section.module.css";

export function DocsForEngineersSection() {
  return (
    <section className={styles.section}>
      <h2>Docs For Engineers.</h2>
      <article className={styles.story}>
        <img
          className={styles.image}
          src="/landing/story.0_30w0aa7c1kw.png"
          alt=""
          loading="lazy"
        />
        <div className={styles.overlayCard}>
          <h3>Fumadocs Story</h3>
          <p>
            Built for UI component libraries — bring an interactive playground to
            showcase your components vividly.
          </p>
          <a href="/docs">Explore</a>
          <div className={styles.callout}>This is a Callout</div>
        </div>
      </article>
    </section>
  );
}
