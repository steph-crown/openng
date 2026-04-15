import { useState } from "react";
import { DashboardShell } from "../components/dashboard-shell";
import { ShellCard } from "../components/shell-card";

export function DashboardSettingsPage() {
  const [themePreference, setThemePreference] = useState("system");
  const [pageSize, setPageSize] = useState("25");

  return (
    <DashboardShell currentPath="/settings">
      <div className="grid gap-5">
        <header className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h1 className="text-[clamp(26px,3vw,34px)] font-medium tracking-[-0.02em]">Settings</h1>
          <p className="mt-2 text-[15px] text-(--color-muted)">
            Preferences are currently local-only for UI phase.
          </p>
        </header>

        <ShellCard title="Profile">
          <div className="grid gap-2 text-sm">
            <p className="text-(--color-muted)">Email</p>
            <p>you@example.com</p>
            <p className="mt-2 text-(--color-muted)">Account created</p>
            <p>April 01, 2026</p>
          </div>
        </ShellCard>

        <ShellCard title="Preferences">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-(--color-muted)" htmlFor="theme-select">
                Theme
              </label>
              <select
                id="theme-select"
                value={themePreference}
                onChange={(event) => setThemePreference(event.target.value)}
                className="h-11 rounded-xl border border-(--color-border) bg-(--color-bg) px-3 text-sm"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-(--color-muted)" htmlFor="page-size-select">
                Default explorer page size
              </label>
              <select
                id="page-size-select"
                value={pageSize}
                onChange={(event) => setPageSize(event.target.value)}
                className="h-11 rounded-xl border border-(--color-border) bg-(--color-bg) px-3 text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <button
              type="button"
              className="w-fit rounded-full bg-(--color-brand) px-5 py-3 text-[15px] font-[500] text-(--color-brand-foreground)"
            >
              Save preferences
            </button>
          </div>
        </ShellCard>

        <ShellCard title="Danger zone">
          <div className="rounded-xl border border-red-400/40 bg-red-500/5 p-4">
            <p className="text-sm text-(--color-muted)">
              Deleting your account invalidates all keys and removes dashboard history.
            </p>
            <button
              type="button"
              className="mt-3 rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-500"
            >
              Delete account
            </button>
          </div>
        </ShellCard>
      </div>
    </DashboardShell>
  );
}
