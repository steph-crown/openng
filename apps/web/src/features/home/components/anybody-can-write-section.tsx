import styles from "./anybody-can-write-section.module.css";

export function AnybodyCanWriteSection() {
  return (
    <section className={styles.section}>
      <h2>Any language. Any tool. Any environment.</h2>
      <p>
        OpenNG is HTTP. If your language can make a network request, it can use
        OpenNG.
      </p>
      <div className={styles.content}>
        <article className={styles.codeBlock}>
          <pre>
            <code>
              <span className={styles.line}>
                <span className={styles.tokenComment}>
                  # Get Nigerian fuel prices for Lagos, March 2026
                </span>
              </span>
              <span className={styles.line}>
                <span className={styles.tokenCommand}>curl</span>{" "}
                <span className={styles.tokenString}>
                  &quot;https://api.openng.dev/v1/fuel?state=Lagos&amp;period=2026-03&quot;
                </span>{" "}
                \
              </span>
              <span className={styles.line}>
                {"  "}-H{" "}
                <span className={styles.tokenString}>
                  &quot;Authorization: Bearer ong_live_your_key&quot;
                </span>
              </span>
              <span className={styles.line}></span>
              <span className={styles.line}>
                <span className={styles.tokenKeyword}>const</span> fuel{" "}
                <span className={styles.tokenKeyword}>=</span>{" "}
                <span className={styles.tokenKeyword}>await</span> fetch(
              </span>
              <span className={styles.line}>
                {"  "}
                <span className={styles.tokenString}>
                  &quot;https://api.openng.dev/v1/fuel?state=Lagos&amp;period=2026-03&quot;
                </span>
                )
              </span>
              <span className={styles.line}>
                {"  "}.then((r) <span className={styles.tokenKeyword}>=&gt;</span>{" "}
                r.json())
              </span>
              <span className={styles.line}></span>
              <span className={styles.line}>
                print(
                <span className={styles.tokenString}>&quot;Lagos PMS price&quot;</span>,
                fuel[<span className={styles.tokenString}>&quot;data&quot;</span>][
                <span className={styles.tokenNumber}>0</span>][
                <span className={styles.tokenString}>&quot;pms_price&quot;</span>])
              </span>
            </code>
          </pre>
        </article>
        <article className={styles.textBlock}>
          <h3>Every data point, traceable.</h3>
          <p>
            The API keeps provenance and freshness first so product teams can
            trust what they ship.
          </p>
          <ul>
            <li>source_url on every record to the original publication</li>
            <li>source_date and last_updated for freshness tracking</li>
            <li>is_confirmed for variable or tentative dates</li>
            <li>Validated staging pipeline before production release</li>
            <li>Pagination and standard filters on list endpoints</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
