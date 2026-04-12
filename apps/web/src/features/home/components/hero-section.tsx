import styles from "./hero-section.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.badge}>Open source · Free to use · MIT licensed</p>
        <h1 className={styles.heading}>
          Nigerian public data,
          <br />
          finally in an <span>API</span>.
        </h1>
        <p className={styles.subtext}>
          OpenNG gives developers programmatic access to Nigerian public data
          across holidays, fuel prices, postal codes, schools, health facilities
          and more. No PDFs. No scraping. Just clean JSON.
        </p>
        <div className={styles.actions}>
          <a className={styles.primaryButton} href="https://docs.openng.dev">
            Get started
          </a>
          <a
            className={styles.secondaryButton}
            href="https://api.openng.dev/v1/holidays?year=2026"
            target="_blank"
            rel="noreferrer noopener"
          >
            Try the API
          </a>
        </div>
      </div>
      <div className={styles.previewWrapper}>
        <pre className={styles.terminalPreview}>
          <code>
            <span className={styles.line}>
              <span className={styles.tokenPrompt}>$</span>{" "}
              <span className={styles.tokenCommand}>curl</span>{" "}
              <span className={styles.tokenString}>
                &quot;https://api.openng.dev/v1/holidays?year=2026&quot;
              </span>
            </span>
            <span className={styles.line}>{`{`}</span>
            <span className={styles.line}>
              {"  "}
              <span className={styles.tokenKey}>&quot;success&quot;</span>
              <span className={styles.tokenPunctuation}>:</span>{" "}
              <span className={styles.tokenBoolean}>true</span>
              <span className={styles.tokenPunctuation}>,</span>
            </span>
            <span className={styles.line}>
              {"  "}
              <span className={styles.tokenKey}>&quot;data&quot;</span>
              <span className={styles.tokenPunctuation}>:</span> [
            </span>
            <span className={styles.line}>
              {"    "}
              <span className={styles.tokenPunctuation}>{"{"}</span>{" "}
              <span className={styles.tokenKey}>&quot;name&quot;</span>
              <span className={styles.tokenPunctuation}>:</span>{" "}
              <span className={styles.tokenString}>
                &quot;New Year&apos;s Day&quot;
              </span>
              <span className={styles.tokenPunctuation}>,</span>{" "}
              <span className={styles.tokenKey}>&quot;date&quot;</span>
              <span className={styles.tokenPunctuation}>:</span>{" "}
              <span className={styles.tokenString}>&quot;2026-01-01&quot;</span>{" "}
              <span className={styles.tokenPunctuation}>{"}"}</span>
              <span className={styles.tokenPunctuation}>,</span>
            </span>
            <span className={styles.line}>
              {"    "}
              <span className={styles.tokenPunctuation}>{"{"}</span>{" "}
              <span className={styles.tokenKey}>&quot;name&quot;</span>
              <span className={styles.tokenPunctuation}>:</span>{" "}
              <span className={styles.tokenString}>&quot;Eid el-Fitr&quot;</span>
              <span className={styles.tokenPunctuation}>,</span>{" "}
              <span className={styles.tokenKey}>&quot;date&quot;</span>
              <span className={styles.tokenPunctuation}>:</span>{" "}
              <span className={styles.tokenString}>&quot;2026-03-19&quot;</span>{" "}
              <span className={styles.tokenPunctuation}>{"}"}</span>
            </span>
            <span className={styles.line}>{"  "}],</span>
            <span className={styles.line}>
              {"  "}
              <span className={styles.tokenKey}>&quot;meta&quot;</span>
              <span className={styles.tokenPunctuation}>:</span>{" "}
              <span className={styles.tokenPunctuation}>{"{"}</span>{" "}
              <span className={styles.tokenKey}>&quot;total&quot;</span>
              <span className={styles.tokenPunctuation}>:</span>{" "}
              <span className={styles.tokenNumber}>13</span>
              <span className={styles.tokenPunctuation}>,</span>{" "}
              <span className={styles.tokenKey}>&quot;page&quot;</span>
              <span className={styles.tokenPunctuation}>:</span>{" "}
              <span className={styles.tokenNumber}>1</span>
              <span className={styles.tokenPunctuation}>,</span>{" "}
              <span className={styles.tokenKey}>&quot;last_updated&quot;</span>
              <span className={styles.tokenPunctuation}>:</span>{" "}
              <span className={styles.tokenString}>
                &quot;2026-03-20T00:00:00Z&quot;
              </span>{" "}
              <span className={styles.tokenPunctuation}>{"}"}</span>
            </span>
            <span className={styles.line}>{`}`}</span>
          </code>
        </pre>
      </div>
    </section>
  );
}
