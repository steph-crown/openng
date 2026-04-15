import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { cx } from "../../../lib/cx";
import {
  type DashboardShellLinkItem,
  isActivePath,
} from "./dashboard-shell-nav";

type DashboardNavigationGroupProps = {
  title: string;
  items: DashboardShellLinkItem[];
  currentPath: string;
  onNavigate: () => void;
};

export function DashboardNavigationGroup({
  title,
  items,
  currentPath,
  onNavigate,
}: DashboardNavigationGroupProps) {
  return (
    <section className="grid gap-1">
      <p className="px-2 text-[12px] font-medium tracking-normal text-(--color-sidebar-section-label)">
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
              "relative flex items-center justify-between gap-2 rounded-[0.5rem] p-2 text-start text-[14px] transition-colors duration-160 ease-(--ease-standard)",
              active
                ? "bg-(--color-sidebar-active-bg) font-medium text-(--color-sidebar-active-fg)"
                : "text-(--color-muted) hover:bg-(--color-sidebar-hover) hover:text-(--color-fg)",
            )}
          >
            <span className="inline-flex items-center gap-2">
              <span
                className={cx(
                  "h-4 w-4",
                  active && "text-(--color-sidebar-active-fg)",
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </span>
            {item.external ? (
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            ) : null}
          </a>
        );
      })}
    </section>
  );
}
