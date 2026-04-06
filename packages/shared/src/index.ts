export type { ApiSuccessResponse, ApiErrorResponse, ApiResponse } from "./types/api-response";
export type { PaginationMeta } from "./types/pagination";
export { ErrorCode } from "./types/error-codes";

export { successResponse, errorResponse, authMeta, accountKeysMeta } from "./helpers/response";

export { paginationSchema } from "./schemas/pagination";
export type { PaginationParams } from "./schemas/pagination";
export {
  magicLinkRequestSchema,
  registerSchema,
  loginSchema,
  verifyTokenSchema,
  updateKeySchema,
} from "./schemas/auth";
