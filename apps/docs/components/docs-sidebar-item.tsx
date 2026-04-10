"use client";

import type { Item } from "fumadocs-core/page-tree";
import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Braces,
  CircleAlert,
  FileCode,
  Gauge,
  History,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

const overviewIcons: Record<string, LucideIcon> = {
  Sparkles,
  BookOpen,
  LockKeyhole,
  Gauge,
  Braces,
  FileCode,
  CircleAlert,
  History,
};

const overviewUrls = new Set([
  "/",
  "/getting-started",
  "/authentication",
  "/rate-limits",
  "/response-format",
  "/api-conventions",
  "/errors",
  "/changelog",
]);

function resolveIcon(item: Item) {
  if (!overviewUrls.has(item.url)) return null;
  if (typeof item.icon !== "string") return null;

  const Icon = overviewIcons[item.icon];
  if (!Icon) return null;

  return <Icon className="size-4 shrink-0" />;
}

export function DocsSidebarItem({ item }: { item: Item }) {
  const pathname = usePathname();
  const active = pathname === item.url;
  const icon = resolveIcon(item);

  return (
    <Link
      data-active={active}
      href={item.url}
      className="relative flex flex-row items-center gap-2 rounded-lg p-2 text-[14px] text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:text-fd-foreground data-[active=true]:font-medium"
    >
      {icon}
      {item.name}
    </Link>
  );
}
