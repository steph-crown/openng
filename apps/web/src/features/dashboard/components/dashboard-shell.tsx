import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  BeakerIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  HomeModernIcon,
  KeyIcon,
  MapPinIcon,
  RectangleStackIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { OpenNavLogo } from "@openng/ui/components/open-nav-logo";
import { ThemeToggle } from "../../home/components/theme-toggle";
import { resourceCatalog } from "../data/resource-catalog";

type DashboardShellProps = {
  currentPath: string;
  children: ReactNode;
  rightRail?: ReactNode;
  rightRailVisible?: boolean;
};

type LinkItem = {
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isActivePath(currentPath: string, href: string) {
  if (href === "/dashboard") {
    return currentPath === "/dashboard";
  }
  if (href === "/explore") {
    return currentPath === "/explore";
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function GithubButton() {
  return (
    <a
      href="https://github.com/stephcrown/openng"
      rel="noreferrer noopener"
      target="_blank"
      className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] transition-[color,background] duration-[160ms] ease-[var(--ease-standard)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-fg)]"
      aria-label="GitHub"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-[17px] w-[17px]"
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    </a>
  );
}

function NavigationGroup({
  title,
  items,
  currentPath,
  onNavigate,
}: {
  title: string;
  items: LinkItem[];
  currentPath: string;
  onNavigate: () => void;
}) {
  return (
    <section className="grid gap-1">
      <p className="px-2 text-[12px] font-medium tracking-normal text-[var(--color-sidebar-section-label)]">
        {title}
      </p>
      {items.map((item) => {
        const active = isActivePath(currentPath, item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer noopener" : undefined}
            className={cx(
              "relative flex items-center justify-between gap-2 rounded-lg p-2 text-start text-[14px] transition-colors duration-[160ms] ease-[var(--ease-standard)]",
              active
                ? "bg-[var(--color-sidebar-active-bg)] font-medium text-[var(--color-brand)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-fg)]",
            )}
          >
            <span className="inline-flex items-center gap-2">
              <span className={cx("h-4 w-4", active && "text-[var(--color-brand)]")}>{item.icon}</span>
              {item.label}
            </span>
            {item.external ? <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" /> : null}
          </a>
        );
      })}
    </section>
  );
}

function DataExplorerNav({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="grid gap-1">
      <button
        type="button"
        className="inline-flex items-center justify-between rounded-lg p-2 text-[14px] text-[var(--color-muted)] transition-colors duration-[160ms] ease-[var(--ease-standard)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-fg)]"
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="inline-flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4" />
          Data Explorer
        </span>
        <ChevronDownIcon
          className={cx(
            "h-4 w-4 transition-transform duration-[160ms] ease-[var(--ease-standard)]",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded ? (
        <div className="ml-4 grid gap-1">
          <a
            href="/explore"
            onClick={onNavigate}
            className={cx(
              "inline-flex items-center gap-2 rounded-lg p-2 text-[14px] transition-colors duration-[160ms] ease-[var(--ease-standard)]",
              isActivePath(currentPath, "/explore")
                ? "bg-[var(--color-sidebar-active-bg)] font-medium text-[var(--color-brand)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-fg)]",
            )}
          >
            <RectangleStackIcon className="h-4 w-4" />
            All resources
          </a>
          {resourceCatalog.map((resource) => {
            const href = `/explore/${resource.id}`;
            const icon =
              resource.id === "holidays" ? (
                <CalendarDaysIcon className="h-4 w-4" />
              ) : resource.id === "fuel" ? (
                <BeakerIcon className="h-4 w-4" />
              ) : (
                <MapPinIcon className="h-4 w-4" />
              );

            return (
              <a
                href={href}
                onClick={onNavigate}
                key={resource.id}
                className={cx(
                  "inline-flex items-center justify-between rounded-lg p-2 text-[14px] transition-colors duration-[160ms] ease-[var(--ease-standard)]",
                  isActivePath(currentPath, href)
                    ? "bg-[var(--color-sidebar-active-bg)] font-medium text-[var(--color-brand)]"
                    : resource.status === "soon"
                      ? "text-[var(--color-muted)] opacity-70 hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-fg)]"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-fg)]",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {icon}
                  {resource.name}
                </span>
                {resource.status === "live" ? (
                  <span className="text-[11px] text-[var(--color-brand)]">Live</span>
                ) : (
                  <span className="text-[11px]">Soon</span>
                )}
              </a>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export function DashboardShell({
  children,
  currentPath,
  rightRail,
  rightRailVisible = true,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const developerItems = useMemo<LinkItem[]>(
    () => [
      {
        href: "/dashboard/keys",
        label: "API Keys",
        icon: <KeyIcon className="h-4 w-4" />,
      },
      {
        href: "/dashboard/usage",
        label: "Usage",
        icon: <ChartBarIcon className="h-4 w-4" />,
      },
    ],
    [],
  );

  const linkItems = useMemo<LinkItem[]>(
    () => [
      {
        href: "https://docs.openng.dev",
        label: "Documentation",
        icon: <BookOpenIcon className="h-4 w-4" />,
        external: true,
      },
      {
        href: "/contribute",
        label: "Contribute",
        icon: <ArrowTopRightOnSquareIcon className="h-4 w-4" />,
      },
    ],
    [],
  );

  const accountItems = useMemo<LinkItem[]>(
    () => [
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: <Cog6ToothIcon className="h-4 w-4" />,
      },
      {
        href: "/",
        label: "Home",
        icon: <HomeModernIcon className="h-4 w-4" />,
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
      <NavigationGroup
        title="Main"
        items={[
          {
            href: "/dashboard",
            label: "Overview",
            icon: <HomeIcon className="h-4 w-4" />,
          },
        ]}
        currentPath={currentPath}
        onNavigate={closeMobileNav}
      />
      <DataExplorerNav currentPath={currentPath} onNavigate={closeMobileNav} />
      <NavigationGroup
        title="Developer"
        items={developerItems}
        currentPath={currentPath}
        onNavigate={closeMobileNav}
      />
      <NavigationGroup
        title="Links"
        items={linkItems}
        currentPath={currentPath}
        onNavigate={closeMobileNav}
      />
      <NavigationGroup
        title="Account"
        items={accountItems}
        currentPath={currentPath}
        onNavigate={closeMobileNav}
      />
      <div className="mt-auto grid gap-3 border-t border-[var(--color-border)] pt-3">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <GithubButton />
        </div>
      </div>
    </div>
  );

  const hasRightRail = Boolean(rightRail);

  return (
    <div className="h-[100svh] w-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-fg)]">
      <div
        className={cx(
          "grid h-full w-full grid-cols-1",
          hasRightRail
            ? "lg:grid-cols-[286px_minmax(0,1fr)] xl:grid-cols-[286px_minmax(0,1fr)_320px]"
            : "lg:grid-cols-[286px_minmax(0,1fr)]",
        )}
      >
        <aside className="hidden h-full min-h-0 border-r border-[var(--color-border)] bg-[var(--color-sidebar-bg)] p-4 lg:block">
          <div className="h-full overflow-y-auto">{navContent}</div>
        </aside>
        <main className="h-full min-h-0 overflow-y-auto">
          <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
            <header className="mb-4 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:hidden">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg)]"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <OpenNavLogo as="span" />
              <GithubButton />
            </header>
            {children}
          </div>
        </main>
        {hasRightRail ? (
          <aside
            className={cx(
              "hidden h-full min-h-0 border-l border-[var(--color-border)] bg-[var(--color-bg)] xl:block",
              !rightRailVisible && "xl:hidden",
            )}
          >
            <div className="h-full overflow-y-auto p-4">{rightRail}</div>
          </aside>
        ) : null}
      </div>
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 bg-black/45 lg:hidden">
          <aside className="h-full w-[86%] max-w-[320px] border-r border-[var(--color-border)] bg-[var(--color-sidebar-bg)] p-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg)]"
                onClick={closeMobileNav}
                aria-label="Close navigation"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
