import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { errorResponse, ErrorCode } from "@openng/shared";
import { recordRequestError } from "../http/request-error";
import type { AppVariables } from "../types/context";
import { API_KEY_PREFIX, SESSION_COOKIE_NAME } from "../utils/constants";
import { resolveApiKeyFromRaw } from "../auth/services/api-key-auth.service";
import { loadSessionUserFromCookieRaw } from "../auth/services/session.service";

function extractBearerToken(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }
  const m = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return m ? m[1]!.trim() : null;
}

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

export const apiKeyAuth: MiddlewareHandler<{ Variables: AppVariables }> = async (c, next) => {
  const token = extractBearerToken(c.req.header("Authorization"));
  if (!token || !token.startsWith(API_KEY_PREFIX)) {
    return c.json(errorResponse(ErrorCode.UNAUTHORIZED, "Invalid or missing API key"), 401);
  }
  try {
    const resolved = await resolveApiKeyFromRaw(token);
    if (!resolved) {
      return c.json(errorResponse(ErrorCode.UNAUTHORIZED, "Invalid or expired API key"), 401);
    }
    c.set("user", resolved.user);
    c.set("tier", resolved.tier);
    c.set("apiKeyId", resolved.apiKeyId);
    await next();
  } catch (err) {
    recordRequestError(c, err);
    return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
  }
};

export const combinedAuth: MiddlewareHandler<{ Variables: AppVariables }> = async (c, next) => {
  const raw = getCookie(c, SESSION_COOKIE_NAME);
  if (raw) {
    const user = await loadSessionUserFromCookieRaw(raw);
    if (user) {
      c.set("user", user);
      c.set("tier", "free");
      await next();
      return;
    }
  }
  const token = extractBearerToken(c.req.header("Authorization"));
  if (token && token.startsWith(API_KEY_PREFIX)) {
    try {
      const resolved = await resolveApiKeyFromRaw(token);
      if (resolved) {
        c.set("user", resolved.user);
        c.set("tier", resolved.tier);
        c.set("apiKeyId", resolved.apiKeyId);
        await next();
        return;
      }
      return c.json(errorResponse(ErrorCode.UNAUTHORIZED, "Invalid or expired API key"), 401);
    } catch (err) {
      recordRequestError(c, err);
      return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
    }
  }
  c.set("tier", "anonymous");
  await next();
};
