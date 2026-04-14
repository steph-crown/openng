import { Button } from "@openng/ui/components/button";

export function DreamAndFooterSection() {
  return (
    <section className="mt-[76px]">
      <h2 className="mb-5 text-center text-[clamp(38px,4.6vw,60px)] leading-[1.05] tracking-[-0.02em] text-[var(--color-brand)]">
        Built in public.
      </h2>
      <div className="grid grid-cols-2 gap-5 max-[1000px]:grid-cols-1">
        <article className="grid gap-[14px] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h3 className="text-[clamp(30px,2.8vw,40px)] tracking-[-0.02em]">
            Contributors make OpenNG better.
          </h3>
          <p className="text-[var(--color-muted)]">
            Data corrections, new resources, bug fixes, and docs improvements are
            all welcome.
          </p>
          <div className="inline-flex gap-2">
            <a href="/contribute">
              <Button type="button">
                Contribute data
              </Button>
            </a>
            <a href="https://github.com/stephcrown/openng">
              <Button variant="secondary" type="button">
                GitHub
              </Button>
            </a>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 16 }).map((_, index) => (
              <span
                key={index}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--color-brand)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-brand)_20%,var(--color-bg))] text-[11px]"
              >
                {index + 1}
              </span>
            ))}
          </div>
          <small className="text-[var(--color-muted)]">
            Some of our best contributors.
          </small>
        </article>
        <article className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <img
            src="/landing/bg-2.0ghkt8u4me4hk.png"
            alt=""
            loading="lazy"
            className="block h-full w-full object-cover"
          />
        </article>
      </div>
      <article className="mt-5 grid gap-[18px] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[22px]">
        <ul className="m-0 grid gap-3 pl-[18px]">
          <li>Open API for Nigerian public data.</li>
          <li>MIT licensed and built by Steph Crown.</li>
          <li>Documentation, API reference, and contribution guides are public.</li>
        </ul>
        <div className="inline-flex gap-2.5">
          <a href="https://docs.openng.dev">
            <Button type="button">Documentation</Button>
          </a>
          <a href="https://github.com/stephcrown/openng">
            <Button variant="secondary" type="button">
              Open GitHub
            </Button>
          </a>
        </div>
      </article>
    </section>
  );
}
