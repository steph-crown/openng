import { useQuery } from "@tanstack/react-query";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { DashboardShell } from "../components/dashboard-shell";
import { ShellCard } from "../components/shell-card";
import { fetchResourceMeta } from "../api/explorer-api";
import { dummyUsageSummary } from "../data/dummy-usage";
import { getLiveResources, resourceCatalog } from "../data/resource-catalog";

function usagePercent(used: number, total: number) {
  if (total === 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((used / total) * 100)));
}

export function DashboardOverviewPage() {
  const holidaysMetaQuery = useQuery({
    queryKey: ["resource-meta", "holidays", "overview"],
    queryFn: () => fetchResourceMeta("holidays"),
    staleTime: 1000 * 60 * 5,
  });

  const usedToday = dummyUsageSummary.dailyLimit - dummyUsageSummary.remainingToday;
  const progress = usagePercent(usedToday, dummyUsageSummary.dailyLimit);
  const liveResources = getLiveResources();

  return (
    <DashboardShell currentPath="/dashboard">
      <div className="grid gap-5">
        <header className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h1 className="text-[clamp(26px,3vw,36px)] font-medium tracking-[-0.02em]">Good day</h1>
          <p className="mt-2 text-[15px] text-[var(--color-muted)]">
            Track your API usage, manage your keys, and explore available resources.
          </p>
        </header>

        <section className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[620px]:grid-cols-1">
          <ShellCard title="Requests today">
            <p className="text-2xl font-semibold">{dummyUsageSummary.requestsToday.toLocaleString()}</p>
          </ShellCard>
          <ShellCard title="Requests this month">
            <p className="text-2xl font-semibold">
              {dummyUsageSummary.requestsThisMonth.toLocaleString()}
            </p>
          </ShellCard>
          <ShellCard title="Requests remaining">
            <p className="text-2xl font-semibold">
              {dummyUsageSummary.remainingToday.toLocaleString()}
            </p>
            <div className="mt-3 h-2 rounded-full bg-[var(--color-surface-strong)]">
              <div
                className="h-2 rounded-full bg-[var(--color-brand)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </ShellCard>
          <ShellCard title="Resets in">
            <p className="text-2xl font-semibold">{dummyUsageSummary.resetIn}</p>
          </ShellCard>
        </section>

        <ShellCard
          title="Available resources"
          description="Live resources and upcoming datasets for the explorer."
        >
          <div className="grid grid-cols-2 gap-3 max-[900px]:grid-cols-1">
            {resourceCatalog.map((resource) => (
              <a
                key={resource.id}
                href={`/explore/${resource.id}`}
                className="grid gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition-colors duration-[160ms] ease-[var(--ease-standard)] hover:border-[var(--color-brand)]"
              >
                <div className="flex items-center justify-between">
                  <strong>{resource.name}</strong>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      resource.status === "live"
                        ? "bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-fg)]"
                        : "bg-[var(--color-surface-strong)] text-[var(--color-muted)]"
                    }`}
                  >
                    {resource.status === "live" ? "Live" : "Soon"}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted)]">{resource.description}</p>
              </a>
            ))}
          </div>
        </ShellCard>

        <section className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
          <ShellCard title="API key status">
            <div className="grid gap-1 text-sm">
              <p className="font-mono text-[13px]">ong_live_xK3*********************</p>
              <p className="text-[var(--color-muted)]">Created: April 1, 2026</p>
              <a
                href="/dashboard/keys"
                className="mt-2 inline-flex items-center gap-1 text-sm text-[var(--color-brand)]"
              >
                Manage key
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </ShellCard>
          <ShellCard title="Quick links">
            <div className="grid gap-2 text-sm">
              <a href="/dashboard/keys" className="text-[var(--color-brand)]">
                Go to API keys
              </a>
              <a href="/explore" className="text-[var(--color-brand)]">
                Open explorer
              </a>
              <a
                href="https://docs.openng.dev"
                className="inline-flex items-center gap-1 text-[var(--color-brand)]"
              >
                View docs
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </ShellCard>
        </section>

        <ShellCard title="Live resource snapshot">
          <div className="text-sm text-[var(--color-muted)]">
            {holidaysMetaQuery.isLoading
              ? "Loading latest metadata..."
              : holidaysMetaQuery.data
                ? `Holidays: sorted by ${holidaysMetaQuery.data.default_sort} (${holidaysMetaQuery.data.default_sort_order}), updates ${holidaysMetaQuery.data.update_frequency.toLowerCase()}.`
                : "Metadata unavailable right now."}
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {liveResources.length} live resource currently visible in explorer.
          </p>
        </ShellCard>
      </div>
    </DashboardShell>
  );
}
