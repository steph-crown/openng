import { useEffect, useState } from "react";

import {
  applyTheme,
  resolveInitialTheme,
  themeStorageKey,
  type ThemeMode,
} from "../../../lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const nextTheme = resolveInitialTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
  };

  return (
    <button
      type="button"
      className="inline-flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-muted) transition-[border-color,color,background] duration-[160ms] ease-(--ease-standard) hover:bg-(--color-surface-strong) hover:text-(--color-fg)"
      aria-label="Toggle Theme"
      onClick={toggleTheme}
    >
      <span className="text-sm leading-none">{theme === "dark" ? "☾" : "☼"}</span>
    </button>
  );
}
