import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { errorResponse, ErrorCode } from "@openng/shared";
import type { AppVariables } from "../core/request-logger.middleware.js";
import { SESSION_COOKIE_NAME } from "./constants.js";
import { loadSessionUserFromCookieRaw } from "./services/session.service.js";

export const sessionAuth: MiddlewareHandler<{ Variables: AppVariables }> = async (c, next) => {
  const raw = getCookie(c, SESSION_COOKIE_NAME);
  if (!raw) {
    return c.json(errorResponse(ErrorCode.UNAUTHORIZED, "Authentication required"), 401);
  }
  const user = await loadSessionUserFromCookieRaw(raw);
  if (!user) {
    return c.json(errorResponse(ErrorCode.UNAUTHORIZED, "Invalid or expired session"), 401);
  }
  c.set("user", user);
  await next();
};
