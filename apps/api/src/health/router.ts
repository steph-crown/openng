import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "@openng/db";
import { pingRedis } from "../infrastructure/redis";
import { anonymousRateLimitMiddleware } from "../middleware/rate-limit";
import type { AppVariables } from "../types/context";

const startTime = Date.now();

export const healthRouter = new Hono<{ Variables: AppVariables }>();

healthRouter.use("*", anonymousRateLimitMiddleware);

healthRouter.get("/", async (c) => {
  let dbStatus: "ok" | "error" = "error";
  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = "ok";
  } catch {
    dbStatus = "error";
  }

  const redisUrl = process.env.REDIS_URL;
  let cacheStatus: "ok" | "error" | "skipped" = "skipped";
  if (redisUrl) {
    const ok = await pingRedis();
    cacheStatus = ok ? "ok" : "error";
  }

  const allOk =
    dbStatus === "ok" && (cacheStatus === "ok" || cacheStatus === "skipped");
  const degraded = !allOk;

  const body = {
    status: degraded ? ("degraded" as const) : ("ok" as const),
    version: process.env.npm_package_version ?? "0.0.0",
    db: dbStatus,
    cache: cacheStatus,
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
  };

  return c.json(body, degraded ? 503 : 200);
});
