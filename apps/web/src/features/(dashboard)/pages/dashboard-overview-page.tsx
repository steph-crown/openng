import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { DashboardShell } from "../components/dashboard-shell";
import { fetchResourceMeta } from "../api/explorer-api";
import { dummyUsageSummary } from "../data/dummy-usage";
import { getLiveResources, resourceCatalog } from "../data/resource-catalog";
import type { ResourceCatalogItem } from "../types";
import { cx } from "../../../lib/cx";

const overviewStatStripClass =
  "grid grid-cols-1 gap-px overflow-hidden rounded-none border-y  border-(--color-border) bg-(--color-border) sm:grid-cols-2 xl:grid-cols-4";

const overviewStatCellClass = "bg-(--color-surface) px-5 py-8";

const overviewStatLabelClass = "text-xs font-medium text-(--color-muted)";

const overviewStatValueClass =
  "mt-2 text-[32px] font-semibold tracking-[-0.09em] text-(--color-fg) tabular-nums";

const overviewResourceTileBaseClass =
  "flex min-h-[240px] flex-col justify-between gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-8 text-left transition-colors duration-[160ms] ease-(--ease-standard)";

const overviewQuickLinkClass =
  "text-(--color-fg) underline decoration-(--color-border) underline-offset-4 hover:decoration-(--color-fg)";

type OverviewStatItem = { id: string; label: string; value: string };

function buildOverviewStats(): OverviewStatItem[] {
  return [
    {
      id: "requests-today",
      label: "Requests today",
      value: dummyUsageSummary.requestsToday.toLocaleString(),
    },
    {
      id: "requests-month",
      label: "Requests this month",
      value: dummyUsageSummary.requestsThisMonth.toLocaleString(),
    },
    {
      id: "remaining-today",
      label: "Remaining today",
      value: dummyUsageSummary.remainingToday.toLocaleString(),
    },
    {
      id: "resets-in",
      label: "Resets in",
      value: dummyUsageSummary.resetIn,
    },
  ];
}

function OverviewStatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className={overviewStatCellClass}>
      <p className={overviewStatLabelClass}>{label}</p>
      <p className={overviewStatValueClass}>{value}</p>
    </div>
  );
}

function OverviewResourceTile({ resource }: { resource: ResourceCatalogItem }) {
  const isLive = resource.status === "live";
  const meta = `${isLive ? "Live" : "Soon"} · ${resource.updateFrequency}`;

  const inner = (
    <>
      <div className="grid gap-1">
        <p className="text-[15px] font-medium leading-snug text-(--color-fg)">{resource.name}</p>
        <p className="text-xs text-(--color-muted)">{meta}</p>
      </div>
      <p className="text-sm leading-relaxed text-(--color-muted)">{resource.description}</p>
      <div className="mt-auto flex items-center gap-1.5 pt-1">
        {isLive ? (
          <>
            <span className="text-sm font-medium text-(--color-fg)">Try in explorer</span>
            <ArrowRightIcon className="h-4 w-4 shrink-0 text-(--color-muted)" aria-hidden />
          </>
        ) : (
          <span className="text-sm font-medium text-(--color-muted)">Coming soon</span>
        )}
      </div>
    </>
  );

  const tileClass = cx(
    overviewResourceTileBaseClass,
    isLive &&
      "hover:border-(--color-brand) focus-visible:border-(--color-brand) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand)/25",
    !isLive && "opacity-90",
  );

  if (isLive) {
    return (
      <Link
        to="/$resourceId"
        params={{ resourceId: resource.id }}
        search={{ page: 1, limit: 25 }}
        className={tileClass}
      >
        {inner}
      </Link>
    );
  }

  return <div className={cx(tileClass, "cursor-default")}>{inner}</div>;
}

const overviewQuickLinks: { href: string; label: string; external?: boolean }[] = [
  { href: "/keys", label: "Keys" },
  { href: "/explore", label: "Explorer" },
  { href: "https://docs.openng.dev", label: "Docs", external: true },
];

export function DashboardOverviewPage() {
  const holidaysMetaQuery = useQuery({
    queryKey: ["resource-meta", "holidays", "overview"],
    queryFn: () => fetchResourceMeta("holidays"),
    staleTime: 1000 * 60 * 5,
  });

  const liveResources = getLiveResources();
  const stats = buildOverviewStats();

  const snapshotLine = holidaysMetaQuery.isLoading
    ? "Loading catalog snapshot…"
    : holidaysMetaQuery.data
      ? `Holidays default sort ${holidaysMetaQuery.data.default_sort} (${holidaysMetaQuery.data.default_sort_order}), ${holidaysMetaQuery.data.update_frequency.toLowerCase()} updates.`
      : "Catalog metadata unavailable right now.";

  void snapshotLine;
  void liveResources;

  return (
    <DashboardShell currentPath="/overview">
      <div className="grid gap-10 pb-2">
        <header className="grid max-w-2xl gap-2">
          <h1 className="text-[clamp(26px,3vw,34px)] font-medium tracking-[-0.02em] text-(--color-fg)">
            Overview
          </h1>
          <p className="text-[15px] leading-relaxed text-(--color-muted)">
            Track API usage, manage keys, and open datasets in the explorer.
          </p>
        </header>

        <section className={overviewStatStripClass} aria-label="Usage summary">
          {stats.map((stat) => (
            <OverviewStatCell key={stat.id} label={stat.label} value={stat.value} />
          ))}
        </section>

        <section className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-medium tracking-[-0.01em] text-(--color-fg)">
              Available resources
            </h2>
            <a
              href="/explore"
              className="text-sm text-(--color-muted) underline decoration-(--color-border) underline-offset-4 transition-colors hover:text-(--color-fg)"
            >
              View all in explorer
            </a>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resourceCatalog.map((resource) => (
              <li key={resource.id}>
                <OverviewResourceTile resource={resource} />
              </li>
            ))}
          </ul>
        </section>

        <footer className="grid gap-5 border-t border-(--color-border) pt-8">
          <div className="grid gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-(--color-muted)">
              API key
            </p>
            <p className="font-mono text-sm text-(--color-fg)">
              ong_live_xK3•••••••••••••••••••
            </p>
            <p className="text-xs text-(--color-muted)">
              Created April 1, 2026
            </p>
            <a
              href="/keys"
              className="w-fit text-sm text-(--color-brand) underline decoration-transparent underline-offset-4 transition-colors hover:decoration-(--color-brand)"
            >
              Manage in keys
            </a>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Quick links">
            {overviewQuickLinks.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx(overviewQuickLinkClass, "inline-flex items-center gap-1")}
                >
                  {item.label}
                  <ArrowTopRightOnSquareIcon
                    className="h-3.5 w-3.5 shrink-0 text-(--color-muted)"
                    aria-hidden
                  />
                </a>
              ) : (
                <a key={item.href} href={item.href} className={overviewQuickLinkClass}>
                  {item.label}
                </a>
              ),
            )}
          </nav>

          {/* <p className="max-w-3xl text-sm leading-relaxed text-(--color-muted)">
            <span className="text-(--color-fg)">Snapshot.</span> {snapshotLine}{" "}
            {liveResources.length} live resource{liveResources.length === 1 ? "" : "s"} in the catalog.
          </p> */}
        </footer>
      </div>
    </DashboardShell>
  );
}
