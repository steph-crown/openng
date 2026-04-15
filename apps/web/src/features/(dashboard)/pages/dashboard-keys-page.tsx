import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "../components/dashboard-shell";
import { ShellCard } from "../components/shell-card";
import { fetchAccountKeys } from "../api/account-api";
import { dummyUsageSummary } from "../data/dummy-usage";

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }
  return new Date(value).toLocaleString();
}

export function DashboardKeysPage() {
  const keysQuery = useQuery({
    queryKey: ["account-keys"],
    queryFn: fetchAccountKeys,
    staleTime: 1000 * 20,
  });

  return (
    <DashboardShell currentPath="/keys">
      <div className="grid gap-5">
        <header className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h1 className="text-[clamp(26px,3vw,34px)] font-medium tracking-[-0.02em]">API Keys</h1>
          <p className="mt-2 text-[15px] text-(--color-muted)">
            Keys are shown once at creation. If lost, regenerate and update your apps.
          </p>
        </header>

        <ShellCard
          title="Current keys"
          description="Prefix-only display for security. Full plaintext key is not retrievable."
        >
          {keysQuery.isLoading ? (
            <p className="text-sm text-(--color-muted)">Loading keys...</p>
          ) : keysQuery.isError ? (
            <div className="grid gap-2">
              <p className="text-sm text-(--color-muted)">
                Could not load keys in this environment. UI fallback is shown below.
              </p>
              <div className="rounded-xl border border-(--color-border) bg-(--color-bg) p-4">
                <p className="font-mono text-[13px]">ong_live_xK3*********************</p>
                <p className="mt-1 text-xs text-(--color-muted)">Tier: free</p>
              </div>
            </div>
          ) : keysQuery.data && keysQuery.data.length > 0 ? (
            <div className="grid gap-3">
              {keysQuery.data.map((key) => (
                <div
                  key={key.id}
                  className="grid gap-1 rounded-xl border border-(--color-border) bg-(--color-bg) p-4 text-sm"
                >
                  <p className="font-mono text-[13px]">{key.key_prefix}************************</p>
                  <p className="text-(--color-muted)">Tier: {key.tier}</p>
                  <p className="text-(--color-muted)">Created: {formatDate(key.created_at)}</p>
                  <p className="text-(--color-muted)">
                    Last used: {formatDate(key.last_used_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-2 text-sm">
              <p className="text-(--color-muted)">No API key found yet.</p>
              <button
                type="button"
                className="w-fit rounded-full border border-(--color-border) bg-(--color-bg) px-4 py-2 text-sm"
              >
                Generate key
              </button>
            </div>
          )}
        </ShellCard>

        <section className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
          <ShellCard title="Usage snapshot">
            <ul className="grid gap-1 text-sm text-(--color-muted)">
              <li>Today: {dummyUsageSummary.requestsToday.toLocaleString()} requests</li>
              <li>This month: {dummyUsageSummary.requestsThisMonth.toLocaleString()} requests</li>
              <li>Resets in: {dummyUsageSummary.resetIn}</li>
            </ul>
          </ShellCard>
          <ShellCard title="Security guidance">
            <ul className="grid list-disc gap-1 pl-4 text-sm text-(--color-muted)">
              <li>Never expose API keys in client-side code.</li>
              <li>Regenerate immediately if you suspect compromise.</li>
              <li>Use environment variables for deployment secrets.</li>
            </ul>
          </ShellCard>
        </section>
      </div>
    </DashboardShell>
  );
}
