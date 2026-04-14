import { Button } from "@openng/ui/components/button";

import { buildApiUrl } from "../../../lib/api-base-url";
import { HeroApiPreview } from "./hero-api-preview";

export function HeroSection() {
  return (
    <section className="relative grid h-[calc(100svh-var(--nav-height)-80px)] min-h-[calc(100svh-var(--nav-height)-80px)] grid-rows-[auto_minmax(0,1fr)] gap-y-14 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] max-[740px]:h-[calc(100svh-var(--nav-height)-80px)] max-[740px]:min-h-[calc(100svh-var(--nav-height)-80px)] max-[500px]:gap-y-8 max-[500px]:border-0 max-[500px]:bg-transparent [@media(max-width:500px)_and_(min-height:741px)]:gap-y-[50px] [@media(max-width:500px)_and_(min-device-height:741px)]:gap-y-[50px]">
      <div className="max-w-[800px] px-[42px] pt-[42px] max-[1100px]:mx-auto max-[1100px]:flex max-[1100px]:max-w-full max-[1100px]:flex-col max-[1100px]:items-center max-[1100px]:text-center max-[740px]:px-4 max-[740px]:pb-3 max-[740px]:pt-6 max-[500px]:p-0">
        <h1 className="mb-[22px] mt-3 text-[clamp(50px,6vw,72px)] font-medium leading-[1] tracking-[-0.03em] max-[740px]:mb-[22px] max-[740px]:mt-5 max-[740px]:text-[56px] max-[500px]:mt-0 max-[500px]:text-[42px] max-[500px]:leading-[1.05]">
          Nigerian public data,
          <br className="block max-[500px]:hidden" /> finally in an{" "}
          <span className="text-[var(--color-brand)]">API</span>.
        </h1>
        <p className="mb-[18px] max-w-[580px] text-base leading-[1.58] text-[var(--color-muted)] max-[1100px]:max-w-[760px] max-[500px]:text-sm">
          OpenNG gives developers programmatic access to Nigerian public data
          across holidays, fuel prices, postal codes, schools, health facilities
          and more.
        </p>
        <div className="flex items-center gap-[14px] max-[740px]:flex-wrap max-[740px]:justify-center">
          <a href="https://docs.openng.dev">
            <Button
              size="md"
              type="button"
              className="transition-[filter,background] duration-[160ms] ease-[var(--ease-standard)] hover:brightness-105"
            >
              Get started
            </Button>
          </a>
          <a
            href={buildApiUrl("/v1/holidays?year=2026")}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button
              variant="secondary"
              size="md"
              type="button"
              className="transition-[filter,background] duration-[160ms] ease-[var(--ease-standard)] hover:brightness-105"
            >
              Try the API
            </Button>
          </a>
        </div>
      </div>

      <div className="flex h-full w-full min-h-0 min-w-0 items-stretch px-[42px] pb-3 max-[740px]:px-[10px] max-[740px]:pb-2 max-[500px]:p-0">
        <HeroApiPreview />
      </div>
    </section>
  );
}
