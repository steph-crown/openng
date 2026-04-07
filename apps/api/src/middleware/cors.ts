import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";

const openReadPaths = (path: string, method: string) => {
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    return false;
  }
  if (path.startsWith("/v1/") || path === "/v1") {
    return true;
  }
  if (path === "/health" || path === "/meta") {
    return true;
  }
  return false;
};

export const corsMiddleware: MiddlewareHandler = async (c, next) => {
  const path = c.req.path;
  const method = c.req.method;
  const appUrl = process.env.APP_URL ?? "http://localhost:3001";

  if (openReadPaths(path, method)) {
    c.header("Vary", "Origin");
    return cors({
      origin: "*",
      allowMethods: ["GET", "HEAD", "OPTIONS"],
      exposeHeaders: [
        "x-request-id",
        "x-ratelimit-limit",
        "x-ratelimit-remaining",
        "x-ratelimit-reset",
        "retry-after",
      ],
    })(c, next);
  }

  if (path.startsWith("/auth/") || path.startsWith("/account/")) {
    c.header("Vary", "Origin");
    return cors({
      origin: appUrl,
      credentials: true,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      exposeHeaders: [
        "x-request-id",
        "x-ratelimit-limit",
        "x-ratelimit-remaining",
        "x-ratelimit-reset",
        "retry-after",
      ],
    })(c, next);
  }

  return cors({
    origin: appUrl,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    exposeHeaders: [
      "x-request-id",
      "x-ratelimit-limit",
      "x-ratelimit-remaining",
      "x-ratelimit-reset",
      "retry-after",
    ],
  })(c, next);
};
