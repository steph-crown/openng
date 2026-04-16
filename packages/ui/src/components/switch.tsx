import * as SwitchPrimitive from "@radix-ui/react-switch";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

export type SwitchProps = SwitchPrimitive.SwitchProps;

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent outline-none transition-colors focus-visible:ring-2 focus-visible:ring-(--color-brand)/40 focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg) disabled:cursor-not-allowed data-[state=checked]:bg-(--color-brand) data-[state=unchecked]:bg-(--color-surface-strong) disabled:data-[state=checked]:bg-(--color-brand) disabled:data-[state=unchecked]:bg-(--color-surface-strong) disabled:opacity-100",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-(--color-brand-foreground) shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5",
        )}
      />
    </SwitchPrimitive.Root>
  );
});
