import type { ReactNode } from "react";

export function ShellCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 ${className ?? ""}`}
    >
      <div className="mb-4 grid gap-1">
        <h2 className="text-lg font-medium tracking-[-0.01em]">{title}</h2>
        {description ? <p className="text-sm text-[var(--color-muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
