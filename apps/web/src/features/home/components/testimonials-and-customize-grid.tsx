import { useState } from "react";

import { socialProofPosts } from "../data/testimonials";

import styles from "./testimonials-and-customize-grid.module.css";

type Surface = {
  id: string;
  label: string;
  imageSrc: string;
  imageAlt: string;
};

const surfaces: [Surface, ...Surface[]] = [
  {
    id: "explorer",
    label: "Explorer",
    imageSrc: "/landing/hero-preview.0_lhp5mx970mh.jpeg",
    imageAlt: "OpenNG Explorer interface",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    imageSrc: "/landing/story.0_30w0aa7c1kw.png",
    imageAlt: "OpenNG Dashboard interface",
  },
  {
    id: "docs",
    label: "Docs",
    imageSrc: "/landing/docs-image.png",
    imageAlt: "OpenNG Docs interface",
  },
];

export function TestimonialsAndCustomizeGrid() {
  const defaultSurface = surfaces[0];
  const [activeSurfaceId, setActiveSurfaceId] = useState(defaultSurface.id);
  const activeSurface = surfaces.find((item) => item.id === activeSurfaceId) ?? defaultSurface;
  const marqueePosts = [...socialProofPosts, ...socialProofPosts];

  return (
    <section className={styles.grid}>
      <article className={styles.painpointCard}>
        <h3>A tool Nigerian developers have been waiting for.</h3>
        <p>
          Public records are spread across PDFs, spreadsheets, and broken portals.
          Teams still spend hours collecting and cleaning data before they can ship
          products.
        </p>
        <p>
          The demand has been loud for years: one dependable way to access Nigerian
          public data without manual copy-paste workflows.
        </p>
        <a href="/explore">Start with Explorer</a>
      </article>
      <article className={styles.carouselCard}>
        <div className={styles.carouselViewport}>
          <div className={styles.carouselTrack}>
            {marqueePosts.map((item, index) => (
              <a
                className={styles.post}
                key={`${item.id}-${index}`}
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                <p>{item.text}</p>
                <div>
                  <strong>{item.author}</strong>
                  <span>
                    {item.handle} · {item.dateLabel}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </article>
      <article className={styles.surfaceCard}>
        <div className={styles.surfaceMedia}>
          <img src={activeSurface.imageSrc} alt={activeSurface.imageAlt} loading="lazy" />
        </div>
        <div className={styles.floatingTabs}>
          {surfaces.map((surface) => (
            <button
              className={surface.id === activeSurface.id ? styles.tabActive : undefined}
              key={surface.id}
              onClick={() => setActiveSurfaceId(surface.id)}
              type="button"
            >
              {surface.label}
            </button>
          ))}
        </div>
      </article>
      <article className={styles.surfaceTextCard}>
        <h3>APIs plus product surfaces your team can use immediately.</h3>
        <p>
          OpenNG is not only an API endpoint directory. Explorer lets anyone browse
          data visually, Dashboard handles keys and usage, and Docs give engineers
          integration-ready references.
        </p>
        <p>
          This means policy teams, analysts, and developers can all work from the
          same source of truth without waiting for custom data wrangling.
        </p>
        <a href="/docs">Read the docs</a>
      </article>
    </section>
  );
}
