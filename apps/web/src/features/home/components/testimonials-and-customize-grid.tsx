import { useState } from "react";
import { Button } from "@openng/ui/components/button";

import { socialProofPosts } from "../data/testimonials";

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
    <section className="mt-[72px] grid grid-cols-2 gap-5 max-[1100px]:mt-[52px] max-[1100px]:grid-cols-1 max-[700px]:gap-[14px]">
      <article className="grid min-h-[300px] min-w-0 content-start gap-[18px] rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-[26px] max-[700px]:min-h-0 max-[700px]:p-[18px]">
        <h3 className="text-[clamp(24px,2.4vw,40px)] font-medium tracking-[-0.02em]">
          A tool Nigerian developers have been waiting for.
        </h3>
        <p className="text-[15px] leading-[1.55] text-(--color-muted)">
          Public records are spread across PDFs, spreadsheets, and broken portals.
          Teams still spend hours collecting and cleaning data before they can ship
          products.
        </p>
        <p className="text-[15px] leading-[1.55] text-(--color-muted)">
          The demand has been loud for years: one dependable way to access Nigerian
          public data without manual copy-paste workflows.
        </p>
        <a href="/explore" className="justify-self-start">
          <Button type="button">Start with Explorer</Button>
        </a>
      </article>
      <article className="group min-h-[300px] min-w-0 overflow-hidden rounded-(--radius-xl) border border-(--color-border) bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-brand)_84%,transparent),color-mix(in_oklab,var(--color-bg)_30%,transparent))] p-3">
        <div className="h-full overflow-hidden">
          <div className="flex w-max gap-3 animate-[posts-marquee_75s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {marqueePosts.map((item, index) => (
              <a
                className="grid min-h-[240px] w-[280px] content-between gap-5 rounded-xl border border-[color-mix(in_oklab,var(--color-border)_70%,transparent)] bg-[color-mix(in_oklab,var(--color-bg)_72%,transparent)] p-[14px] max-[1200px]:min-h-[220px] max-[1200px]:w-[250px] max-[1100px]:w-[min(78vw,300px)] max-[700px]:w-[min(84vw,280px)]"
                key={`${item.id}-${index}`}
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                <p className="text-sm leading-[1.45] text-(--color-fg)">{item.text}</p>
                <div className="grid gap-1">
                  <strong className="text-[13px]">{item.author}</strong>
                  <span className="text-xs text-(--color-muted)">
                    {item.handle} · {item.dateLabel}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </article>
      <article className="relative grid min-h-[300px] min-w-0 overflow-hidden rounded-(--radius-xl) border border-(--color-border) bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-brand)_84%,transparent),color-mix(in_oklab,var(--color-bg)_30%,transparent))] p-[14px] max-[700px]:p-[10px]">
        <div className="min-h-0 overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-border)_70%,transparent)] bg-[color-mix(in_oklab,var(--color-bg)_72%,transparent)] px-3 pb-[70px] pt-3 max-[700px]:px-[10px] max-[700px]:pb-16 max-[700px]:pt-[10px]">
          <img
            src={activeSurface.imageSrc}
            alt={activeSurface.imageAlt}
            loading="lazy"
            className="block h-full max-h-[320px] w-full rounded-[10px] object-cover object-top max-[700px]:max-h-[250px]"
          />
        </div>
        <div className="absolute bottom-5 left-1/2 inline-flex w-max max-w-[calc(100%-28px)] -translate-x-1/2 gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-border)_75%,transparent)] bg-[color-mix(in_oklab,var(--color-bg)_80%,transparent)] p-2 backdrop-blur-[8px] max-[700px]:bottom-[14px] max-[700px]:max-w-[calc(100%-20px)]">
          {surfaces.map((surface) => (
            <button
              className={
                surface.id === activeSurface.id
                  ? "whitespace-nowrap rounded-full border border-[color-mix(in_oklab,var(--color-brand)_70%,transparent)] bg-(--color-brand) px-3 py-[7px] text-xs text-(--color-brand-foreground) max-[700px]:px-2.5 max-[700px]:py-1.5 max-[700px]:text-[11px]"
                  : "whitespace-nowrap rounded-full border border-(--color-border) bg-transparent px-3 py-[7px] text-xs text-(--color-muted) max-[700px]:px-2.5 max-[700px]:py-1.5 max-[700px]:text-[11px]"
              }
              key={surface.id}
              onClick={() => setActiveSurfaceId(surface.id)}
              type="button"
            >
              {surface.label}
            </button>
          ))}
        </div>
      </article>
      <article className="grid min-h-[300px] min-w-0 content-start gap-[18px] rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-[26px] max-[700px]:min-h-0 max-[700px]:p-[18px]">
        <h3 className="text-[clamp(24px,2.4vw,40px)] font-medium tracking-[-0.02em]">
          APIs plus product surfaces your team can use immediately.
        </h3>
        <p className="text-[15px] leading-[1.55] text-(--color-muted)">
          OpenNG is not only an API endpoint directory. Explorer lets anyone browse
          data visually, Dashboard handles keys and usage, and Docs give engineers
          integration-ready references.
        </p>
        <p className="text-[15px] leading-[1.55] text-(--color-muted)">
          This means policy teams, analysts, and developers can all work from the
          same source of truth without waiting for custom data wrangling.
        </p>
        <a href="/docs" className="justify-self-start">
          <Button type="button">Read the docs</Button>
        </a>
      </article>
    </section>
  );
}
