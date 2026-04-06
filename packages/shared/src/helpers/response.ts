import type { ApiSuccessResponse, ApiErrorResponse } from "../types/api-response";
import type { PaginationMeta } from "../types/pagination";

export function authMeta(): PaginationMeta {
  return {
    total: 0,
    page: 1,
    limit: 1,
    pages: 1,
    resource: "auth",
    last_updated: new Date().toISOString(),
    source_url: "https://openng.dev",
    freshness: "static",
  };
}

export function accountKeysMeta(): PaginationMeta {
  return {
    total: 0,
    page: 1,
    limit: 1,
    pages: 1,
    resource: "account-keys",
    last_updated: new Date().toISOString(),
    source_url: "https://openng.dev",
    freshness: "static",
  };
}

export function successResponse<T>(data: T, meta: PaginationMeta): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

const DEFAULT_DOCS_BASE = "https://docs.openng.dev";

export function errorResponse(
  code: string,
  message: string,
  docs?: string,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      docs: docs ?? `${DEFAULT_DOCS_BASE}/errors#${code.toLowerCase().replace(/_/g, "-")}`,
    },
  };
}
