import type { ErrorHandler } from "hono";
import { errorResponse, ErrorCode } from "@openng/shared";
import { logger } from "./logger";
import type { AppVariables } from "./request-logger.middleware";

export const errorHandler: ErrorHandler<{ Variables: AppVariables }> = (err, c) => {
  logger.error({ err }, "unhandled error");
  return c.json(
    errorResponse(ErrorCode.INTERNAL_ERROR, "An unexpected error occurred"),
    500,
  );
};
