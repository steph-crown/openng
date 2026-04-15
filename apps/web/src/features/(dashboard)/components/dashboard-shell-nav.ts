import type { ReactNode } from "react";

export type DashboardShellLinkItem = {
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
};

export function isActivePath(currentPath: string, href: string) {
  if (href === "/overview") {
    return currentPath === "/overview" || currentPath === "/overview/";
  }
  if (href === "/explore") {
    return currentPath === "/explore" || currentPath === "/explore/";
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}
