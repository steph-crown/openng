import styles from "./dream-and-footer-section.module.css";

export function DreamAndFooterSection() {
  return (
    <section className={styles.section}>
      <h2>Built in public.</h2>
      <div className={styles.grid}>
        <article className={styles.card}>
          <h3>Contributors make OpenNG better.</h3>
          <p>
            Data corrections, new resources, bug fixes, and docs improvements are
            all welcome.
          </p>
          <div className={styles.actions}>
            <a href="/contribute">Contribute data</a>
            <a href="https://github.com/stephcrown/openng">GitHub</a>
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
          <li>Open API for Nigerian public data.</li>
          <li>MIT licensed and built by Steph Crown.</li>
          <li>Documentation, API reference, and contribution guides are public.</li>
        </ul>
        <div className={styles.footerActions}>
          <a href="https://docs.openng.dev">Documentation</a>
          <a href="https://github.com/stephcrown/openng">Open GitHub</a>
        </div>
      </article>
    </section>
  );
}
