import { frameworkPackages } from "../data/framework-packages";

export function FrameworkCardsGrid() {
  return (
    <section className="mt-[22px] grid grid-cols-2 gap-5 max-[1000px]:grid-cols-1">
      <article className="grid min-h-[320px] content-start gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="text-[clamp(30px,2.5vw,38px)] tracking-[-0.02em]">
          Works with everything.
        </h3>
        <p className="leading-[1.55] text-[var(--color-muted)]">
          OpenNG is HTTP. No SDK required. Works with Postman, Insomnia, Node.js,
          Python, Go, Rust, React, Vue, Excel, and Google Sheets.
        </p>
        <div className="inline-flex items-center gap-1 self-end">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-[var(--color-brand-foreground)]">
            JS
          </span>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-[var(--color-brand-foreground)]">
            Py
          </span>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-[var(--color-brand-foreground)]">
            Go
          </span>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-[var(--color-brand-foreground)]">
            CSV
          </span>
        </div>
      </article>
      <article className="grid min-h-[320px] content-start gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="text-[clamp(30px,2.5vw,38px)] tracking-[-0.02em]">
          The data you&apos;ve been collecting manually.
        </h3>
        <p className="leading-[1.55] text-[var(--color-muted)]">
          OpenNG covers the data domains Nigerian developers need most. New
          resources ship continuously.
        </p>
        <ul className="m-0 list-none overflow-hidden rounded-[10px] border border-[var(--color-border)] p-0">
          {frameworkPackages.map((item) => (
            <li
              key={item.name}
              className="grid grid-cols-[1fr_1fr] gap-2.5 border-b border-[var(--color-border)] px-3 py-2.5 text-[13px] last:border-b-0 max-[720px]:grid-cols-1"
            >
              <strong>{item.name}</strong>
              <span className="text-[var(--color-muted)]">{item.description}</span>
            </li>
          ))}
        </ul>
      </article>
      <article className="grid min-h-[320px] content-start gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="text-[clamp(30px,2.5vw,38px)] tracking-[-0.02em]">
          Built for what Nigerians are building.
        </h3>
        <p className="leading-[1.55] text-[var(--color-muted)]">
          Fintech, proptech, edtech, logistics, civic tech, and healthcare teams
          can build on the same trusted public data foundation.
        </p>
        <code className="block rounded-[10px] border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface-strong)_80%,transparent)] px-3 py-2.5 font-[var(--font-mono)] text-[13px]">
          Use cases: reminders, pricing, address validation, facility lookup
        </code>
      </article>
      <article className="min-h-[320px] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <img
          src="/landing/bg-2.0ghkt8u4me4hk.png"
          alt=""
          loading="lazy"
          className="block h-full w-full object-cover"
        />
      </article>
    </section>
  );
}
