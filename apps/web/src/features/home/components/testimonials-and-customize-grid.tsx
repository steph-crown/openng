import { testimonials } from "../data/testimonials";

import styles from "./testimonials-and-customize-grid.module.css";

export function TestimonialsAndCustomizeGrid() {
  return (
    <section className={styles.grid}>
      <article className={styles.cardLarge}>
        <h3>One platform. Multiple surfaces.</h3>
        <p>
          Browse and filter resources in Explorer, manage API keys and usage in
          Dashboard, and integrate from complete docs with examples.
        </p>
        <a href="/explore">Open Explorer</a>
      </article>
      <article className={styles.testimonialsCard}>
        {testimonials.map((item) => (
          <div className={styles.quote} key={item.author}>
            <p>{item.quote}</p>
            <div>
              <strong>{item.author}</strong>
              <span>{item.role}</span>
            </div>
          </div>
        ))}
      </article>
      <article className={styles.imageCard}>
        <img src="/landing/banner.0ktv71..ooo1j.png" alt="" loading="lazy" />
        <div className={styles.tabBar}>
          <button className={styles.tabActive} type="button">
            Explorer
          </button>
          <button type="button">Dashboard</button>
          <button type="button">Docs</button>
        </div>
      </article>
      <article className={styles.cardLarge}>
        <h3>Clean, consistent, predictable.</h3>
        <p>
          Every endpoint returns the same envelope with predictable fields, and
          errors are just as clean.
        </p>
        <code className={styles.snippet}>
          <span className={styles.tokenPunctuation}>{"{"}</span>{" "}
          <span className={styles.tokenKey}>&quot;success&quot;</span>
          <span className={styles.tokenPunctuation}>:</span>{" "}
          <span className={styles.tokenBoolean}>true</span>
          <span className={styles.tokenPunctuation}>,</span>{" "}
          <span className={styles.tokenKey}>&quot;data&quot;</span>
          <span className={styles.tokenPunctuation}>:</span> [
          <span className={styles.tokenPunctuation}>...</span>]
          <span className={styles.tokenPunctuation}>,</span>{" "}
          <span className={styles.tokenKey}>&quot;meta&quot;</span>
          <span className={styles.tokenPunctuation}>:</span>{" "}
          <span className={styles.tokenPunctuation}>{"{"}</span>{" "}
          <span className={styles.tokenKey}>&quot;total&quot;</span>
          <span className={styles.tokenPunctuation}>:</span>{" "}
          <span className={styles.tokenNumber}>432</span>{" "}
          <span className={styles.tokenPunctuation}>{"}"}</span>{" "}
          <span className={styles.tokenPunctuation}>{"}"}</span>
        </code>
      </article>
    </section>
  );
}
