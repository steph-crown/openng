import { buildApiUrl } from "../../../lib/api-base-url";
import styles from "./intro-and-cli-section.module.css";

export function IntroAndCliSection() {
  const holidaysListUrl = buildApiUrl("/v1/holidays?year=2026");
  const holidaysBaseUrl = buildApiUrl("/v1/holidays");

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
            <p>
              <span className={styles.tokenCommand}>curl</span>{" "}
              <span className={styles.tokenString}>{`"${holidaysListUrl}"`}</span>
            </p>
            <p></p>
            <p>
              <span className={styles.tokenKeyword}>const</span> res{" "}
              <span className={styles.tokenKeyword}>=</span>{" "}
              <span className={styles.tokenKeyword}>await</span> fetch(
              <span className={styles.tokenString}>{`"${holidaysListUrl}"`}</span>
              )
            </p>
            <p>
              <span className={styles.tokenKeyword}>const</span>{" "}
              {"{ data, meta }"} <span className={styles.tokenKeyword}>=</span>{" "}
              <span className={styles.tokenKeyword}>await</span> res.json()
            </p>
            <p></p>
            <p>
              <span className={styles.tokenKeyword}>import</span> requests
            </p>
            <p>
              requests.get(
              <span className={styles.tokenString}>{`"${holidaysBaseUrl}"`}</span>
              , params={"{"} <span className={styles.tokenString}>&apos;year&apos;</span>:{" "}
              <span className={styles.tokenNumber}>2026</span> {"}"})
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
