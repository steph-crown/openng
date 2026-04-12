import { frameworkPackages } from "../data/framework-packages";

import styles from "./framework-cards-grid.module.css";

export function FrameworkCardsGrid() {
  return (
    <section className={styles.grid}>
      <article className={styles.card}>
        <h3>Framework Agnostic</h3>
        <p>
          Official support for Next.js, Tanstack Start, React Router, Waku —
          portable to any React.js framework.
        </p>
        <div className={styles.badges}>
          <span>N</span>
          <span>R</span>
          <span>T</span>
          <span>W</span>
        </div>
      </article>
      <article className={styles.card}>
        <h3>A truly composable framework.</h3>
        <p>
          Separated as Content → Core → UI, offering the high composability that
          engineers love.
        </p>
        <ul className={styles.packageList}>
          {frameworkPackages.map((item) => (
            <li key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      </article>
      <article className={styles.card}>
        <h3>Adopts your content.</h3>
        <p>
          Designed to integrate with any content source, Fumadocs works on MDX,
          content collections, and your own CMS.
        </p>
        <code>
          import &#123; loader &#125; from &apos;fumadocs-core/source&apos;;
        </code>
      </article>
      <article className={styles.mediaCard}>
        <img src="/landing/bg-2.0ghkt8u4me4hk.png" alt="" loading="lazy" />
      </article>
    </section>
  );
}
