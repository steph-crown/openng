import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { DashboardShell } from "../components/dashboard-shell";
import { ShellCard } from "../components/shell-card";
import { fetchResourceMeta } from "../api/explorer-api";
import { resourceCatalog } from "../data/resource-catalog";

function timeAgoLabel(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function ExploreHomePage() {
  const [search, setSearch] = useState("");
  const holidaysMetaQuery = useQuery({
    queryKey: ["resource-meta", "holidays", "explore-home"],
    queryFn: () => fetchResourceMeta("holidays"),
    staleTime: 1000 * 60 * 5,
  });

  const filteredResources = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return resourceCatalog;
    }
    return resourceCatalog.filter((resource) => {
      return (
        resource.name.toLowerCase().includes(term) ||
        resource.description.toLowerCase().includes(term)
      );
    });
  }, [search]);

  const recentlyVisited = [
    { resourceId: "holidays", name: "Public Holidays", minutesAgo: 13 },
    { resourceId: "fuel", name: "Fuel Prices", minutesAgo: 84 },
  ];

  return (
    <DashboardShell currentPath="/explore">
      <div className="grid gap-5">
        <header className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h1 className="text-[clamp(26px,3vw,34px)] font-medium tracking-[-0.02em]">
            Data Explorer
          </h1>
          <p className="mt-2 text-[15px] text-(--color-muted)">
            Browse and filter Nigerian public data without writing code.
          </p>
          <div className="mt-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resources..."
              className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 text-sm outline-none focus:border-(--color-brand)"
            />
          </div>
        </header>

        {recentlyVisited.length > 0 ? (
          <ShellCard title="Recently visited">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentlyVisited.map((item) => (
                <a
                  key={item.resourceId}
                  href={`/${item.resourceId}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm"
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-(--color-muted)">
                    {timeAgoLabel(item.minutesAgo)}
                  </span>
                </a>
              ))}
            </div>
          </ShellCard>
        ) : null}

        <section className="grid grid-cols-3 gap-4 max-[1200px]:grid-cols-2 max-[760px]:grid-cols-1">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              className="grid gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4"
            >
              <div className="flex items-center justify-between">
                <strong className="text-base">{resource.name}</strong>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    resource.status === "live"
                      ? "bg-(--color-sidebar-active-bg) text-(--color-sidebar-active-fg)"
                      : "bg-(--color-surface-strong) text-(--color-muted)"
                  }`}
                >
                  {resource.status === "live" ? "Live" : "Coming soon"}
                </span>
              </div>
              <p className="text-sm text-(--color-muted)">{resource.description}</p>
              <p className="text-xs text-(--color-muted)">
                {resource.status === "live" && holidaysMetaQuery.data
                  ? `${holidaysMetaQuery.data.fields.length} fields · updates ${resource.updateFrequency.toLowerCase()}`
                  : `Updates ${resource.updateFrequency.toLowerCase()}`}
              </p>
              <div className="mt-auto">
                <a
                  href={`/${resource.id}`}
                  className={`inline-flex items-center gap-1 text-sm ${
                    resource.status === "live"
                      ? "text-(--color-brand)"
                      : "cursor-not-allowed text-(--color-muted)"
                  }`}
                >
                  {resource.status === "live" ? "Explore" : "Coming soon"}
                  {resource.status === "live" ? (
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  ) : null}
                </a>
              </div>
            </article>
          ))}
        </section>

        {filteredResources.length === 0 ? (
          <ShellCard title="No resources found">
            <p className="text-sm text-(--color-muted)">
              No resources match &quot;{search}&quot;. Try another term or request a resource.
            </p>
            <a
              href="https://github.com/stephcrown/openng/issues"
              className="mt-2 inline-flex items-center gap-1 text-sm text-(--color-brand)"
            >
              Request a resource
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            </a>
          </ShellCard>
        ) : null}
      </div>
    </DashboardShell>
  );
}
