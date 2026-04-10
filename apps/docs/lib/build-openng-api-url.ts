export function buildOpenngApiUrl(
  base: string,
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const pathname = normalized.split("?")[0] ?? normalized;
  const allowed =
    pathname === "/health" ||
    pathname === "/meta" ||
    pathname.startsWith("/v1/");
  if (!allowed) {
    throw new Error(`buildOpenngApiUrl: disallowed path ${path}`);
  }
  const u = new URL(pathname, base.endsWith("/") ? base : `${base}/`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      u.searchParams.set(k, String(v));
    }
  }
  return u.toString();
}
