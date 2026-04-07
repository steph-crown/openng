import type { ResourceConfig } from "./resource-config";

export type ParsedPagination = {
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
  offset: number;
};

const DEFAULT_PAGE = 1;
const ABSOLUTE_MAX_LIMIT = 500;

export function parsePagination(
  query: Record<string, string | undefined>,
  config: ResourceConfig,
): ParsedPagination {
  const pageRaw = query.page;
  const limitRaw = query.limit;
  const sortRaw = query.sort;
  const orderRaw = query.order;

  let page = DEFAULT_PAGE;
  if (pageRaw !== undefined) {
    const n = Number(pageRaw);
    if (Number.isFinite(n) && n >= 1) {
      page = Math.floor(n);
    }
  }

  let limit = Math.min(config.maxPageSize, 50);
  if (limitRaw !== undefined) {
    const n = Number(limitRaw);
    if (Number.isFinite(n) && n >= 1) {
      limit = Math.min(Math.floor(n), config.maxPageSize, ABSOLUTE_MAX_LIMIT);
    }
  } else {
    limit = Math.min(config.maxPageSize, 50);
  }

  const sort =
    sortRaw && config.selectColumns.includes(sortRaw) ? sortRaw : config.defaultSort;
  const order: "asc" | "desc" =
    orderRaw === "desc" || orderRaw === "asc" ? orderRaw : config.defaultSortOrder;

  const offset = (page - 1) * limit;

  return { page, limit, sort, order, offset };
}
