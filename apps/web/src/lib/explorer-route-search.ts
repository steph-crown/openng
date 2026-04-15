export type ExplorerRouteSearch = {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
  q?: string;
  year?: string;
  category?: string;
  schedule_kind?: string;
  is_confirmed?: string;
  date_from?: string;
  date_to?: string;
};

function toOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toOptionalNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

export function parseExplorerRouteSearch(search: unknown): ExplorerRouteSearch {
  const raw =
    search && typeof search === "object" && !Array.isArray(search)
      ? (search as Record<string, unknown>)
      : {};
  return {
    page: Math.max(1, Math.floor(toOptionalNumber(raw.page, 1))),
    limit: Math.max(
      1,
      Math.min(50, Math.floor(toOptionalNumber(raw.limit, 25))),
    ),
    sort: toOptionalString(raw.sort),
    order:
      raw.order === "desc"
        ? "desc"
        : raw.order === "asc"
          ? "asc"
          : undefined,
    q: toOptionalString(raw.q),
    year: toOptionalString(raw.year),
    category: toOptionalString(raw.category),
    schedule_kind: toOptionalString(raw.schedule_kind),
    is_confirmed: toOptionalString(raw.is_confirmed),
    date_from: toOptionalString(raw.date_from),
    date_to: toOptionalString(raw.date_to),
  };
}
