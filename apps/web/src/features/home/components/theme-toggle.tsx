import { useEffect, useState } from "react";

import styles from "./theme-toggle.module.css";

type ThemeMode = "light" | "dark";

const themeStorageKey = "openng-theme";

function resolveInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const persistedTheme = window.localStorage.getItem(themeStorageKey);
  if (persistedTheme === "light" || persistedTheme === "dark") {
    return persistedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(nextTheme: ThemeMode) {
  const rootElement = document.documentElement;
  rootElement.classList.toggle("dark", nextTheme === "dark");
  rootElement.style.colorScheme = nextTheme;
}

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
      className={styles.toggle}
      aria-label="Toggle Theme"
      onClick={toggleTheme}
    >
      <span className={styles.icon}>{theme === "dark" ? "☾" : "☼"}</span>
    </button>
  );
}
