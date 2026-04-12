import { testimonials } from "../data/testimonials";

import styles from "./testimonials-and-customize-grid.module.css";

export function TestimonialsAndCustomizeGrid() {
  return (
    <section className={styles.grid}>
      <article className={styles.cardLarge}>
        <h3>A framework people love.</h3>
        <p>
          Loved by teams and developers from startups like Unkey, Vercel, Orama
          — evolving everyday to be your favourite docs framework.
        </p>
        <a href="/showcase">Showcase</a>
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
            Docs
          </button>
          <button type="button">Notebook</button>
          <button type="button">OpenAPI</button>
        </div>
      </article>
      <article className={styles.cardLarge}>
        <h3>Minimal aesthetics, Maximum customizability.</h3>
        <p>
          Fumadocs offer well-designed themes, with a headless mode to plug your
          own UI.
        </p>
        <code>pnpm dlx @fumadocs/cli customise</code>
      </article>
    </section>
  );
}
