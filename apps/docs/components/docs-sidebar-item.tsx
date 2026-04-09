"use client";

import type { Item } from "fumadocs-core/page-tree";
import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BookOpenCheck,
  Braces,
  FileCode,
  Gauge,
  History,
  Sparkles,
} from "lucide-react";

const overviewIcons: Record<string, LucideIcon> = {
  BookOpen,
  Sparkles,
  Gauge,
  Braces,
  BookOpenCheck,
  FileCode,
  History,
};

const overviewUrls = new Set([
  "/getting-started",
  "/",
  "/rate-limits",
  "/api-formats",
  "/how-to-read-docs",
  "/api-conventions",
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
      className="relative flex flex-row items-center gap-2 rounded-lg p-2 text-[14px] text-start text-fd-muted-foreground transition-colors wrap-anywhere hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary"
    >
      {icon}
      {item.name}
    </Link>
  );
}
