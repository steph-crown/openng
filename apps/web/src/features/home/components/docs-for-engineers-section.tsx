import { Button } from "@openng/ui/components/button";

export function DocsForEngineersSection() {
  return (
    <section className="mt-20">
      <h2 className="mb-[22px] text-center text-[clamp(38px,4.2vw,58px)] leading-[1.05] tracking-[-0.02em] text-[var(--color-brand)]">
        Browse without code.
      </h2>
      <article className="relative min-h-[560px] overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/landing/story.0_30w0aa7c1kw.png"
          alt=""
          loading="lazy"
        />
        <div className="relative mx-auto my-[22px] grid w-[min(460px,calc(100%-30px))] gap-2.5 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-overlay)] p-[18px] backdrop-blur-[6px]">
          <h3 className="text-[33px] tracking-[-0.02em]">Data Explorer</h3>
          <p className="leading-[1.5] text-[var(--color-muted)]">
            Browse, filter, and export OpenNG resources with zero code. Generated
            filters stay in sync with API metadata.
          </p>
          <a href="/explore" className="justify-self-start">
            <Button type="button">Explore</Button>
          </a>
          <div className="mt-1 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
            View API call for current filters
          </div>
        </div>
      </article>
    </section>
  );
}
