import styles from "./anybody-can-write-section.module.css";

export function AnybodyCanWriteSection() {
  return (
    <section className={styles.section}>
      <h2>Anybody can write.</h2>
      <p>
        Native support for Markdown &amp; MDX, offering intuitive, convenient and
        extensive syntax for non-dev writers, developers, and AI agents.
      </p>
      <div className={styles.content}>
        <article className={styles.codeBlock}>
          <pre>
            <code>
              ---{"\n"}title: Hello World{"\n"}---{"\n"}
              {"\n"}## Overview{"\n"}
              {"\n"}I love **Fumadocs**!{"\n"}
              {"\n"}```ts tab=&quot;Tab 1&quot;{"\n"}console.log(&quot;Hello World&quot;)
              {"\n"}```{"\n"}
            </code>
          </pre>
        </article>
        <article className={styles.textBlock}>
          <h3>The familiar syntax.</h3>
          <p>
            It is just Markdown, with additional features seamlessly composing
            into the syntax.
          </p>
          <ul>
            <li>Markdown features, including images</li>
            <li>Syntax highlighting (Powered by Shiki)</li>
            <li>Codeblock Groups</li>
            <li>Callouts</li>
            <li>Custom Heading Anchors</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
