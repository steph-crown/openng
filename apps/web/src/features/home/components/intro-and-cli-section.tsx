import styles from "./intro-and-cli-section.module.css";

export function IntroAndCliSection() {
  return (
    <section className={styles.section}>
      <p className={styles.intro}>Try it now</p>
      <article className={styles.cliCard}>
        <img
          className={styles.background}
          src="/landing/cli.01~llc0rzg3d8.png"
          alt=""
          loading="lazy"
        />
        <div className={styles.panel}>
          <div className={styles.panelTop}>
            <h3>CURL</h3>
            <code>GET /v1/holidays?year=2026</code>
          </div>
          <div className={styles.terminal}>
            <p>{`curl "https://api.openng.dev/v1/holidays?year=2026"`}</p>
            <p></p>
            <p>
              {`const res = await fetch("https://api.openng.dev/v1/holidays?year=2026")`}
            </p>
            <p>const {"{ data, meta }"} = await res.json()</p>
            <p></p>
            <p>import requests</p>
            <p>
              {
                `requests.get("https://api.openng.dev/v1/holidays", params={ 'year': 2026 })`
              }
            </p>
          </div>
        </div>
      </article>
      <p className={styles.subheadline}>
        A tool Nigerian developers have been waiting for.
      </p>
    </section>
  );
}
