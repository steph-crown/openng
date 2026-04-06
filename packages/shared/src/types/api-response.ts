import type { PaginationMeta } from "./pagination";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    docs: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
