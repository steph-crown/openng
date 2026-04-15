import { Button } from "@openng/ui/components/button";

import { buildApiUrl } from "../../../lib/api-base-url";

export function SearchAndShadcnSection() {
  const holidaysMetaUrl = buildApiUrl("/v1/holidays/meta");

  return (
    <section className="mt-5 grid grid-cols-2 gap-5 max-[1000px]:grid-cols-1">
      <article className="grid content-start gap-[14px] overflow-hidden rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-6">
        <h3 className="text-[clamp(30px,2.5vw,38px)] tracking-[-0.02em]">
          Machine-readable by design.
        </h3>
        <p className="leading-[1.55] text-(--color-muted)">
          Every resource exposes a `/meta` endpoint describing fields, filters,
          freshness, source, and version.
        </p>
        <a href={holidaysMetaUrl} className="justify-self-start">
          <Button type="button">Try /meta</Button>
        </a>
        <div className="rounded-[10px] border border-(--color-border) p-2.5">
          <p className="m-0 border-b border-(--color-border) pb-2 text-(--color-muted)">
            curl {holidaysMetaUrl}
          </p>
          <ul className="m-0 grid list-none gap-2.5 px-0 pb-0 pt-2.5">
            <li className="rounded-[7px] border border-(--color-border) px-2.5 py-2">
              resource: holidays
            </li>
            <li className="rounded-[7px] border border-(--color-border) px-2.5 py-2">
              record_count: 91
            </li>
            <li className="rounded-[7px] border border-(--color-border) px-2.5 py-2">
              filters: year, type, is_confirmed
            </li>
          </ul>
        </div>
      </article>
      <article className="grid grid-rows-[auto_1fr] overflow-hidden rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface)">
        <div className="grid gap-[14px] p-6">
          <h3 className="text-[clamp(30px,2.5vw,38px)] tracking-[-0.02em]">
            Open source. Fork it. Own it.
          </h3>
          <p className="leading-[1.55] text-(--color-muted)">
            OpenNG is MIT licensed. API server, data pipeline, schema, and seed
            data all live in one public monorepo.
          </p>
          <a href="https://github.com/stephcrown/openng" className="justify-self-start">
            <Button type="button">View on GitHub</Button>
          </a>
        </div>
        <img
          src="/landing/shadcn.0wdg9wvt5u2ue.png"
          alt=""
          loading="lazy"
          className="block h-full w-full object-cover"
        />
      </article>
    </section>
  );
}
