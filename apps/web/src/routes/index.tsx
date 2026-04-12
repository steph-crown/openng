import { Button } from "@openng/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import type { ComponentPropsWithoutRef } from "react";

import styles from "./index.module.css";

export const Route = createFileRoute("/")({
  component: Home,
});

type ThemeImgProps = Omit<
  ComponentPropsWithoutRef<"img">,
  "src" | "srcSet"
> & {
  srcLight: string;
  srcDark: string;
};

function ThemeImage(props: ThemeImgProps) {
  const { srcLight, srcDark, className, alt, ...rest } = props;

  return (
    <>
      <img
        {...rest}
        src={srcLight}
        className={`${className ?? ""} imgLight`.trim()}
        alt={alt}
      />
      <img
        {...rest}
        src={srcDark}
        className={`${className ?? ""} imgDark`.trim()}
        alt={alt}
      />
    </>
  );
}

function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ThemeImage
          className={styles.logo}
          srcLight="/turborepo-dark.svg"
          srcDark="/turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
        />
        <ol>
          <li>
            Get started by editing <code>apps/web/src/routes/index.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new/clone?demo-description=Learn+to+implement+a+monorepo+with+a+two+Next.js+sites+that+has+installed+three+local+packages.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4K8ZISWAzJ8X1504ca0zmC%2F0b21a1c6246add355e55816278ef54bc%2FBasic.png&demo-title=Monorepo+with+Turborepo&demo-url=https%3A%2F%2Fexamples-basic-web.vercel.sh%2F&from=templates&project-name=Monorepo+with+Turborepo&repository-name=monorepo-turborepo&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fturborepo%2Ftree%2Fmain%2Fexamples%2Fbasic&root-directory=apps%2Fdocs&skippable-integrations=1&teamSlug=vercel&utm_source=create-turbo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://turborepo.dev/docs?utm_source"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
        <Button appName="web" className={styles.secondary}>
          Open alert
        </Button>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/window.svg"
            alt=""
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://turborepo.dev?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/globe.svg"
            alt=""
            width={16}
            height={16}
          />
          Go to turborepo.dev →
        </a>
      </footer>
    </div>
  );
}
