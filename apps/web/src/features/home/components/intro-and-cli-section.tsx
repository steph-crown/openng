import styles from "./intro-and-cli-section.module.css";

export function IntroAndCliSection() {
  return (
    <section className={styles.section}>
      <p className={styles.intro}>
        Fumadocs is a <span>React.js</span> documentation framework for{" "}
        <span>Developers</span>, beautifully designed by <span>Fuma Nama</span>.
        Bringing powerful features for your docs workflows, with high
        customizability to fit your preferences, works seamlessly with any
        React.js framework, CMS — anything.
      </p>
      <article className={styles.cliCard}>
        <img
          className={styles.background}
          src="/landing/cli.01~llc0rzg3d8.png"
          alt=""
          loading="lazy"
        />
        <div className={styles.panel}>
          <div className={styles.panelTop}>
            <h3>TRY IT OUT</h3>
            <code>pnpm create fumadocs-app</code>
          </div>
          <div className={styles.terminal}>
            <p>pnpm create fumadocs-app</p>
            <p>◇ Project name</p>
            <p>│ my-app</p>
            <p>◆ Choose a framework</p>
            <p>│ ○ Next.js</p>
            <p>│ ○ Tanstack Start</p>
            <p>└ ○ React Router</p>
          </div>
        </div>
      </article>
    </section>
  );
}
