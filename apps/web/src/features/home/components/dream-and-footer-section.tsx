import styles from "./dream-and-footer-section.module.css";

export function DreamAndFooterSection() {
  return (
    <section className={styles.section}>
      <h2>A Framework of Dream.</h2>
      <div className={styles.grid}>
        <article className={styles.card}>
          <h3>Made Possible by You.</h3>
          <p>Fumadocs is 100% powered by passion and open source community.</p>
          <div className={styles.actions}>
            <button type="button">Sponsors</button>
            <button type="button">Contributors</button>
          </div>
          <div className={styles.avatars}>
            {Array.from({ length: 16 }).map((_, index) => (
              <span key={index}>{index + 1}</span>
            ))}
          </div>
          <small>Some of our best contributors.</small>
        </article>
        <article className={styles.mediaCard}>
          <img src="/landing/bg-2.0ghkt8u4me4hk.png" alt="" loading="lazy" />
        </article>
      </div>
      <article className={styles.footerCard}>
        <ul>
          <li>Battery guaranteed. Actively maintained, open for contributions.</li>
          <li>Fully open-source. Open source, available on GitHub.</li>
          <li>Within seconds. Initialize a new project instantly with CLI.</li>
        </ul>
        <div className={styles.footerActions}>
          <a href="/docs">Read docs</a>
          <a href="https://github.com/fuma-nama/fumadocs">Open GitHub</a>
        </div>
      </article>
    </section>
  );
}
