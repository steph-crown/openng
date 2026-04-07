import type { ErrorHandler } from "hono";
import { errorResponse, ErrorCode } from "@openng/shared";
import { logger } from "../observability/logger";
import type { AppVariables } from "../types/context";

export const errorHandler: ErrorHandler<{ Variables: AppVariables }> = (err, c) => {
  logger.error({ err }, "unhandled error");
  return c.json(
    errorResponse(ErrorCode.INTERNAL_ERROR, "An unexpected error occurred"),
    500,
  );
};
