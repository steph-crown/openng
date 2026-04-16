import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "brand" | "secondary";
type ButtonSize = "sm" | "md";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function resolveVariantClass(variant: ButtonVariant) {
  if (variant === "secondary") {
    return "border border-(--color-border) bg-(--color-button-secondary) text-(--color-fg)";
  }

  return "border border-transparent bg-(--color-brand) text-(--color-brand-foreground)";
}

function resolveSizeClass(size: ButtonSize) {
  if (size === "sm") {
    return "h-[34px] px-[14px] text-[13px] leading-none";
  }

  return "px-5 py-[0.6875rem] text-[15px] leading-[19px]";
}

type CommonProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & CommonProps;

export function Button({
  children,
  className,
  variant = "brand",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-[10px] font-[500]",
        resolveVariantClass(variant),
        resolveSizeClass(size),
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
