import styles from "./hero-section.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.badge}>the React.js docs framework you love.</p>
        <h1 className={styles.heading}>
          Build excellent documentations,
          <br />
          your <span>style</span>.
        </h1>
        <div className={styles.actions}>
          <a className={styles.primaryButton} href="/docs">
            Getting Started
          </a>
          <a
            className={styles.secondaryButton}
            href="https://codesandbox.io/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Open CodeSandbox
          </a>
        </div>
      </div>
      <div className={styles.previewWrapper}>
        <img
          className={styles.preview}
          src="/landing/hero-preview.0_lhp5mx970mh.jpeg"
          alt="Hero preview"
          loading="lazy"
        />
      </div>
    </section>
  );
}
