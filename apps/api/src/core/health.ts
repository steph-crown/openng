import { Hono } from "hono";
import { sql } from "drizzle-orm";
import Redis from "ioredis";
import { db } from "@openng/db";
import type { AppVariables } from "./request-logger.middleware";

const startTime = Date.now();

function getRedisPingMs(url: string): Promise<number | null> {
  const client = new Redis(url, { maxRetriesPerRequest: 1, connectTimeout: 2000, lazyConnect: true });
  const started = Date.now();
  return client
    .ping()
    .then(() => Date.now() - started)
    .catch(() => null)
    .finally(() => {
      client.disconnect();
    });
}

export const healthRouter = new Hono<{ Variables: AppVariables }>();

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
    const ok = (await getRedisPingMs(redisUrl)) !== null;
    cacheStatus = ok ? "ok" : "error";
  }

  const allOk = dbStatus === "ok" && (cacheStatus === "ok" || cacheStatus === "skipped");
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
