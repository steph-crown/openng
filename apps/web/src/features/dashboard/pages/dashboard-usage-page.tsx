import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardShell } from "../components/dashboard-shell";
import { ShellCard } from "../components/shell-card";
import {
  dummyRequestLogs,
  dummyUsageByResource,
  dummyUsagePoints,
  dummyUsageSummary,
} from "../data/dummy-usage";

const periods = ["today", "last-7-days", "last-30-days", "this-month"] as const;

type Period = (typeof periods)[number];

function statusColor(status: number) {
  if (status >= 500) {
    return "text-red-500";
  }
  if (status >= 400) {
    return "text-amber-500";
  }
  return "text-emerald-500";
}

export function DashboardUsagePage() {
  const [period, setPeriod] = useState<Period>("last-7-days");

  const periodLabel = useMemo(() => {
    if (period === "today") {
      return "Today";
    }
    if (period === "last-30-days") {
      return "Last 30 days";
    }
    if (period === "this-month") {
      return "This month";
    }
    return "Last 7 days";
  }, [period]);

  return (
    <DashboardShell currentPath="/dashboard/usage">
      <div className="grid gap-5">
        <header className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h1 className="text-[clamp(26px,3vw,34px)] font-medium tracking-[-0.02em]">Usage</h1>
          <p className="mt-2 text-[15px] text-(--color-muted)">
            Dummy analytics data for UI phase. Real endpoint integration comes next.
          </p>
          <div className="mt-4 inline-flex flex-wrap gap-2">
            {periods.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  item === period
                    ? "bg-(--color-brand) text-(--color-brand-foreground)"
                    : "border border-(--color-border) bg-(--color-bg) text-(--color-muted)"
                }`}
              >
                {item.replaceAll("-", " ")}
              </button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[620px]:grid-cols-1">
          <ShellCard title="Total requests">
            <p className="text-2xl font-semibold">
              {dummyUsageSummary.requestsThisMonth.toLocaleString()}
            </p>
          </ShellCard>
          <ShellCard title="Avg / day">
            <p className="text-2xl font-semibold">689</p>
          </ShellCard>
          <ShellCard title="Peak day">
            <p className="text-2xl font-semibold">Fri · 778</p>
          </ShellCard>
          <ShellCard title="Resources accessed">
            <p className="text-2xl font-semibold">{dummyUsageByResource.length}</p>
          </ShellCard>
        </section>

        <section className="grid grid-cols-2 gap-4 max-[1000px]:grid-cols-1">
          <ShellCard title={`Request volume (${periodLabel})`}>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyUsagePoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted)" />
                  <YAxis stroke="var(--color-muted)" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="var(--color-brand)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ShellCard>
          <ShellCard title="Requests by resource">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dummyUsageByResource}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="resource" stroke="var(--color-muted)" />
                  <YAxis stroke="var(--color-muted)" />
                  <Tooltip />
                  <Bar dataKey="requests" fill="var(--color-brand)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ShellCard>
        </section>

        <ShellCard title="Request timeline">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-(--color-muted)">
                  <th className="px-2 py-1 font-medium">Timestamp</th>
                  <th className="px-2 py-1 font-medium">Resource</th>
                  <th className="px-2 py-1 font-medium">Status</th>
                  <th className="px-2 py-1 font-medium">Response time</th>
                  <th className="px-2 py-1 font-medium">Cached</th>
                </tr>
              </thead>
              <tbody>
                {dummyRequestLogs.map((row) => (
                  <tr key={row.id} className="rounded-lg bg-(--color-bg)">
                    <td className="px-2 py-2">{new Date(row.timestamp).toLocaleString()}</td>
                    <td className="px-2 py-2">{row.resource}</td>
                    <td className={`px-2 py-2 font-medium ${statusColor(row.status)}`}>
                      {row.status}
                    </td>
                    <td className="px-2 py-2">{row.responseTimeMs}ms</td>
                    <td className="px-2 py-2">{row.cached ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ShellCard>
      </div>
    </DashboardShell>
  );
}
