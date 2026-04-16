import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-md border border-(--color-border) bg-(--color-surface-strong) px-2 py-0.5 text-xs font-medium text-(--color-fg)",
        className,
      )}
      {...props}
    />
  );
}
