import { frameworkPackages } from "../data/framework-packages";

import styles from "./framework-cards-grid.module.css";

export function FrameworkCardsGrid() {
  return (
    <section className={styles.grid}>
      <article className={styles.card}>
        <h3>Works with everything.</h3>
        <p>
          OpenNG is HTTP. No SDK required. Works with Postman, Insomnia, Node.js,
          Python, Go, Rust, React, Vue, Excel, and Google Sheets.
        </p>
        <div className={styles.badges}>
          <span>JS</span>
          <span>Py</span>
          <span>Go</span>
          <span>CSV</span>
        </div>
      </article>
      <article className={styles.card}>
        <h3>The data you&apos;ve been collecting manually.</h3>
        <p>
          OpenNG covers the data domains Nigerian developers need most. New
          resources ship continuously.
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
        <h3>Built for what Nigerians are building.</h3>
        <p>
          Fintech, proptech, edtech, logistics, civic tech, and healthcare teams
          can build on the same trusted public data foundation.
        </p>
        <code>Use cases: reminders, pricing, address validation, facility lookup</code>
      </article>
      <article className={styles.mediaCard}>
        <img src="/landing/bg-2.0ghkt8u4me4hk.png" alt="" loading="lazy" />
      </article>
    </section>
  );
}
