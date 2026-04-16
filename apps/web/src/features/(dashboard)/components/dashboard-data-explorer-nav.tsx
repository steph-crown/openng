import { useState } from "react";
import {
  BeakerIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronDownIcon,
  MapPinIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import {
  BeakerIcon as BeakerIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  MapPinIcon as MapPinIconSolid,
  RectangleStackIcon as RectangleStackIconSolid,
} from "@heroicons/react/24/solid";

import { cx } from "../../../lib/cx";
import { resourceCatalog } from "../data/resource-catalog";
import { isActivePath } from "./dashboard-shell-nav";

type DashboardDataExplorerNavProps = {
  currentPath: string;
  onNavigate: () => void;
};

export function DashboardDataExplorerNav({
  currentPath,
  onNavigate,
}: DashboardDataExplorerNavProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="grid gap-1">
      <button
        type="button"
        className="inline-flex items-center justify-between rounded-md p-2 text-[14px] text-(--color-muted) transition-colors duration-[160ms] ease-(--ease-standard) hover:bg-(--color-sidebar-hover) hover:text-(--color-fg)"
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="inline-flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4" />
          Data Explorer
        </span>
        <ChevronDownIcon
          className={cx(
            "h-4 w-4 transition-transform duration-[160ms] ease-(--ease-standard)",
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
              "inline-flex items-center gap-2 rounded-md p-2 text-[14px] transition-colors duration-[160ms] ease-(--ease-standard)",
              isActivePath(currentPath, "/explore")
                ? "bg-(--color-sidebar-active-bg) font-medium text-(--color-fg)"
                : "text-(--color-muted) hover:bg-(--color-sidebar-hover) hover:text-(--color-fg)",
            )}
          >
            <span
              className={cx(
                "inline-flex h-4 w-4 shrink-0 items-center justify-center",
                isActivePath(currentPath, "/explore") && "text-(--color-brand)",
              )}
            >
              {isActivePath(currentPath, "/explore") ? (
                <RectangleStackIconSolid className="h-4 w-4" />
              ) : (
                <RectangleStackIcon className="h-4 w-4" />
              )}
            </span>
            All resources
          </a>
          {resourceCatalog.map((resource) => {
            const href = `/${resource.id}`;
            const active = isActivePath(currentPath, href);
            const iconOutline =
              resource.id === "holidays" ? (
                <CalendarDaysIcon className="h-4 w-4" />
              ) : resource.id === "fuel" ? (
                <BeakerIcon className="h-4 w-4" />
              ) : (
                <MapPinIcon className="h-4 w-4" />
              );
            const iconSolid =
              resource.id === "holidays" ? (
                <CalendarDaysIconSolid className="h-4 w-4" />
              ) : resource.id === "fuel" ? (
                <BeakerIconSolid className="h-4 w-4" />
              ) : (
                <MapPinIconSolid className="h-4 w-4" />
              );

            return (
              <a
                href={href}
                onClick={onNavigate}
                key={resource.id}
                className={cx(
                  "inline-flex items-center gap-2 rounded-md p-2 text-[14px] transition-colors duration-160 ease-(--ease-standard)",
                  active
                    ? "bg-(--color-sidebar-active-bg) font-medium text-(--color-fg)"
                    : resource.status === "soon"
                      ? "text-(--color-muted) opacity-70 hover:bg-(--color-sidebar-hover) hover:text-(--color-fg)"
                      : "text-(--color-muted) hover:bg-(--color-sidebar-hover) hover:text-(--color-fg)",
                )}
              >
                <span
                  className={cx(
                    "inline-flex h-4 w-4 shrink-0 items-center justify-center",
                    active && "text-(--color-brand)",
                  )}
                >
                  {active ? iconSolid : iconOutline}
                </span>
                {resource.name}
              </a>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
