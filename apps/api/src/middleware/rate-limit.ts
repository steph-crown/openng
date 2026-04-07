import type { MiddlewareHandler } from "hono";
import { errorResponse, ErrorCode, magicLinkRequestSchema } from "@openng/shared";
import { recordRequestError } from "../http/request-error";
import type { AppVariables } from "../types/context";
import { hashToken } from "../utils/crypto";
import {
  consumeSingleWindow,
  consumeTierLimits,
  TIER_LIMITS,
} from "../infrastructure/rate-limiter";
import { getRedis } from "../infrastructure/redis";

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  const xff = c.req.header("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const real = c.req.header("x-real-ip");
  if (real) {
    return real.trim();
  }
  return "unknown";
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

function applyTierHeaders(
  c: {
    header: (name: string, value: string) => void;
  },
  dailyLimit: number,
  dayRemaining: number,
  dayResetAt: number,
): void {
  c.header("X-RateLimit-Limit", String(dailyLimit));
  c.header("X-RateLimit-Remaining", String(Math.max(0, dayRemaining)));
  c.header("X-RateLimit-Reset", String(Math.floor(dayResetAt)));
}

export const anonymousRateLimitMiddleware: MiddlewareHandler<{
  Variables: AppVariables;
}> = async (c, next) => {
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }
  const redis = getRedis();
  if (!redis) {
    await next();
    return;
  }
  const limits = TIER_LIMITS.anonymous;
  const keyBase = `a:${getClientIp(c)}`;
  const t = nowSec();
  try {
    const result = await consumeTierLimits(redis, keyBase, limits, t);
    if (!result.allowed) {
      c.header("Retry-After", String(result.retryAfterSec));
      applyTierHeaders(c, limits.perDay, 0, result.resetAt);
      return c.json(
        errorResponse(ErrorCode.RATE_LIMIT_EXCEEDED, "Too many requests"),
        429,
      );
    }
    applyTierHeaders(c, limits.perDay, result.dayRemaining, result.dayResetAt);
    await next();
  } catch (err) {
    recordRequestError(c, err);
    await next();
  }
};

function resolveTier(c: { get: (key: "tier" | "user") => unknown }): string {
  const tier = c.get("tier") as string | undefined;
  if (tier !== undefined && tier !== "") {
    return tier;
  }
  if (c.get("user")) {
    return "free";
  }
  return "anonymous";
}

function standardIdentityKey(c: {
  get: (key: "user" | "apiKeyId") => unknown;
  req: { header: (name: string) => string | undefined };
}): string {
  const apiKeyId = c.get("apiKeyId") as bigint | undefined;
  if (apiKeyId !== undefined) {
    return `k:${apiKeyId}`;
  }
  const user = c.get("user") as { id: bigint } | undefined;
  if (user) {
    return `u:${user.id}`;
  }
  return `a:${getClientIp(c)}`;
}

export const standardRateLimitMiddleware: MiddlewareHandler<{
  Variables: AppVariables;
}> = async (c, next) => {
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }
  const redis = getRedis();
  if (!redis) {
    await next();
    return;
  }
  const tier = resolveTier(c);
  if (tier === "enterprise") {
    c.header("X-RateLimit-Limit", "unlimited");
    c.header("X-RateLimit-Remaining", "unlimited");
    c.header("X-RateLimit-Reset", "0");
    await next();
    return;
  }
  const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.anonymous;
  const keyBase = standardIdentityKey(c);
  const t = nowSec();
  try {
    const result = await consumeTierLimits(redis, keyBase, limits, t);
    if (!result.allowed) {
      c.header("Retry-After", String(result.retryAfterSec));
      applyTierHeaders(c, limits.perDay, 0, result.resetAt);
      return c.json(
        errorResponse(ErrorCode.RATE_LIMIT_EXCEEDED, "Too many requests"),
        429,
      );
    }
    applyTierHeaders(c, limits.perDay, result.dayRemaining, result.dayResetAt);
    await next();
  } catch (err) {
    recordRequestError(c, err);
    await next();
  }
};

const MAGIC_LINK_HOUR_SEC = 3600;
const MAGIC_LINK_PER_EMAIL = 5;
const VERIFY_PER_IP_HOUR = 10;

export const parseMagicLinkBodyMiddleware: MiddlewareHandler<{
  Variables: AppVariables;
}> = async (c, next) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid request body"), 400);
  }
  const parsed = magicLinkRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid request body"), 400);
  }
  c.set("magicLinkBody", parsed.data);
  await next();
};

export const magicLinkEmailRateLimitMiddleware: MiddlewareHandler<{
  Variables: AppVariables;
}> = async (c, next) => {
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }
  const redis = getRedis();
  const parsed = c.get("magicLinkBody");
  if (!parsed) {
    return c.json(errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid request body"), 400);
  }
  if (!redis) {
    await next();
    return;
  }
  const normalized = parsed.email.toLowerCase().trim();
  const keyBase = `ml:${hashToken(normalized)}`;
  const t = nowSec();
  try {
    const result = await consumeSingleWindow(
      redis,
      keyBase,
      MAGIC_LINK_HOUR_SEC,
      MAGIC_LINK_PER_EMAIL,
      t,
    );
    c.header("X-RateLimit-Limit", String(MAGIC_LINK_PER_EMAIL));
    if (!result.allowed) {
      c.header("Retry-After", String(result.retryAfterSec));
      c.header("X-RateLimit-Remaining", "0");
      c.header(
        "X-RateLimit-Reset",
        String(Math.floor(t + result.retryAfterSec)),
      );
      return c.json(
        errorResponse(ErrorCode.RATE_LIMIT_EXCEEDED, "Too many requests"),
        429,
      );
    }
    c.header("X-RateLimit-Remaining", String(result.remaining));
    c.header("X-RateLimit-Reset", String(Math.floor(result.resetAt)));
    await next();
  } catch (err) {
    recordRequestError(c, err);
    await next();
  }
};

export const authVerifyIpRateLimitMiddleware: MiddlewareHandler<{
  Variables: AppVariables;
}> = async (c, next) => {
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }
  const redis = getRedis();
  if (!redis) {
    await next();
    return;
  }
  const keyBase = `vf:${getClientIp(c)}`;
  const t = nowSec();
  try {
    const result = await consumeSingleWindow(
      redis,
      keyBase,
      MAGIC_LINK_HOUR_SEC,
      VERIFY_PER_IP_HOUR,
      t,
    );
    c.header("X-RateLimit-Limit", String(VERIFY_PER_IP_HOUR));
    if (!result.allowed) {
      c.header("Retry-After", String(result.retryAfterSec));
      c.header("X-RateLimit-Remaining", "0");
      c.header(
        "X-RateLimit-Reset",
        String(Math.floor(t + result.retryAfterSec)),
      );
      return c.json(
        errorResponse(ErrorCode.RATE_LIMIT_EXCEEDED, "Too many requests"),
        429,
      );
    }
    c.header("X-RateLimit-Remaining", String(result.remaining));
    c.header("X-RateLimit-Reset", String(Math.floor(result.resetAt)));
    await next();
  } catch (err) {
    recordRequestError(c, err);
    await next();
  }
};
