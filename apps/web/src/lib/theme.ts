export const themeStorageKey = "openng-theme";

export type ThemeMode = "light" | "dark";

export function resolveInitialTheme(): ThemeMode {
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

export function applyTheme(nextTheme: ThemeMode): void {
  const rootElement = document.documentElement;
  rootElement.classList.toggle("dark", nextTheme === "dark");
  rootElement.style.colorScheme = nextTheme;
}
