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
              {`# Get Nigerian fuel prices for Lagos, March 2026
curl "https://api.openng.dev/v1/fuel?state=Lagos&period=2026-03" \
  -H "Authorization: Bearer ong_live_your_key"

const fuel = await fetch("https://api.openng.dev/v1/fuel?state=Lagos&period=2026-03")
  .then((r) => r.json())

print("Lagos PMS price", fuel["data"][0]["pms_price"])`}
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
