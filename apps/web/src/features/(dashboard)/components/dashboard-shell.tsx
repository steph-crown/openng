import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  HomeModernIcon,
  KeyIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowTopRightOnSquareIcon as ArrowTopRightOnSquareIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  HomeIcon as HomeIconSolid,
  HomeModernIcon as HomeModernIconSolid,
  KeyIcon as KeyIconSolid,
} from "@heroicons/react/24/solid";
import { OpenNavLogo } from "@openng/ui/components/open-nav-logo";
import { ThemeToggle } from "../../home/components/theme-toggle";
import { cx } from "../../../lib/cx";
import { DashboardDataExplorerNav } from "./dashboard-data-explorer-nav";
import { DashboardGithubButton } from "./dashboard-github-button";
import { DashboardNavigationGroup } from "./dashboard-navigation-group";
import type { DashboardShellLinkItem } from "./dashboard-shell-nav";

type DashboardShellProps = {
  currentPath: string;
  children: ReactNode;
};

export function DashboardShell({ children, currentPath }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const developerItems = useMemo<DashboardShellLinkItem[]>(
    () => [
      {
        href: "/keys",
        label: "API Keys",
        icon: <KeyIcon className="h-4 w-4" />,
        iconActive: <KeyIconSolid className="h-4 w-4" />,
      },
      {
        href: "/usage",
        label: "Usage",
        icon: <ChartBarIcon className="h-4 w-4" />,
        iconActive: <ChartBarIconSolid className="h-4 w-4" />,
      },
    ],
    [],
  );

  const linkItems = useMemo<DashboardShellLinkItem[]>(
    () => [
      {
        href: "https://docs.openng.dev",
        label: "Documentation",
        icon: <BookOpenIcon className="h-4 w-4" />,
        iconActive: <BookOpenIconSolid className="h-4 w-4" />,
        external: true,
      },
      {
        href: "/contribute",
        label: "Contribute",
        icon: <ArrowTopRightOnSquareIcon className="h-4 w-4" />,
        iconActive: <ArrowTopRightOnSquareIconSolid className="h-4 w-4" />,
      },
    ],
    [],
  );

  const accountItems = useMemo<DashboardShellLinkItem[]>(
    () => [
      {
        href: "/settings",
        label: "Settings",
        icon: <Cog6ToothIcon className="h-4 w-4" />,
        iconActive: <Cog6ToothIconSolid className="h-4 w-4" />,
      },
      {
        href: "/",
        label: "Home",
        icon: <HomeModernIcon className="h-4 w-4" />,
        iconActive: <HomeModernIconSolid className="h-4 w-4" />,
      },
    ],
    [],
  );

  const closeMobileNav = () => setMobileNavOpen(false);

  const navContent = (
    <div className="flex h-full flex-col gap-4">
      <a href="/" onClick={closeMobileNav} className="px-2">
        <OpenNavLogo />
      </a>
      <DashboardNavigationGroup
        title="Main"
        items={[
          {
            href: "/overview",
            label: "Overview",
            icon: <HomeIcon className="h-4 w-4" />,
            iconActive: <HomeIconSolid className="h-4 w-4" />,
          },
        ]}
        currentPath={currentPath}
        onNavigate={closeMobileNav}
      />
      <DashboardDataExplorerNav
        currentPath={currentPath}
        onNavigate={closeMobileNav}
      />
      <DashboardNavigationGroup
        title="Developer"
        items={developerItems}
        currentPath={currentPath}
        onNavigate={closeMobileNav}
      />
      <DashboardNavigationGroup
        title="Links"
        items={linkItems}
        currentPath={currentPath}
        onNavigate={closeMobileNav}
      />
      <DashboardNavigationGroup
        title="Account"
        items={accountItems}
        currentPath={currentPath}
        onNavigate={closeMobileNav}
      />
      <div className="mt-auto grid gap-3 border-t border-(--color-border) pt-3">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <DashboardGithubButton />
        </div>
      </div>
    </div>
  );

  const desktopGridTemplate =
    "lg:[grid-template-columns:286px_minmax(0,1fr)_minmax(0,min(4rem,7vw))]";

  const desktopShellMaxWidth =
    "lg:mx-auto lg:max-w-[min(100vw,calc(var(--layout-width)+286px+min(4rem,7vw)))]";

  return (
    <div className="h-svh w-screen overflow-hidden bg-(--color-bg) text-(--color-fg)">
      <div
        className={cx(
          "grid h-full w-full max-w-full grid-cols-1",
          desktopShellMaxWidth,
          desktopGridTemplate,
        )}
      >
        <aside className="hidden h-full min-h-0 border-r border-(--color-border) bg-(--color-sidebar-bg) p-4 lg:block">
          <div className="dashboard-sidebar-scroll h-full overflow-y-auto">{navContent}</div>
        </aside>
        <main className="h-full min-h-0 overflow-y-auto bg-(--color-bg)">
          <div className="px-3 py-3 sm:px-4 sm:py-4 lg:mx-auto lg:w-full lg:max-w-(--layout-width) lg:px-8 lg:py-5">
            <header className="mb-4 flex items-center justify-between rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 lg:hidden">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg) text-(--color-fg)"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <OpenNavLogo as="span" />
              <DashboardGithubButton />
            </header>
            {children}
          </div>
        </main>
        <div aria-hidden className="hidden min-h-0 bg-(--color-bg) lg:block" />
      </div>
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 bg-black/45 lg:hidden">
          <aside className="dashboard-sidebar-scroll flex h-full w-[86%] max-w-[320px] flex-col overflow-y-auto border-r border-(--color-border) bg-(--color-sidebar-bg) p-4">
            <div className="mb-3 shrink-0 flex justify-end">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg) text-(--color-fg)"
                onClick={closeMobileNav}
                aria-label="Close navigation"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="dashboard-sidebar-scroll min-h-0 flex-1 overflow-y-auto">
              {navContent}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
