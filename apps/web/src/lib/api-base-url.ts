const defaultApiBaseUrl = "https://api.openng.dev";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const apiBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
);

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}
