import { execFileSync } from "node:child_process";
import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Redis from "ioredis";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

config({ path: resolve(__dirname, "../.env.test") });

const defaultDatabaseUrl =
  "postgresql://openng:openng_dev@127.0.0.1:5434/openng_test";
const defaultRedisUrl = "redis://127.0.0.1:6380/15";

function assertSafeTestDatabaseUrl(url: string): void {
  if (url.includes("/openng_dev") || url.endsWith("openng_dev")) {
    throw new Error(
      "Refusing to run API tests against openng_dev. Set DATABASE_URL_TEST to a dedicated test database (e.g. openng_test).",
    );
  }
}

export default async function globalSetup(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL ?? defaultDatabaseUrl;
  const redisUrl = process.env.REDIS_URL_TEST ?? process.env.REDIS_URL ?? defaultRedisUrl;

  assertSafeTestDatabaseUrl(dbUrl);

  const repoRoot = resolve(__dirname, "../../..");

  execFileSync(
    "pnpm",
    ["exec", "drizzle-kit", "migrate"],
    {
      cwd: resolve(repoRoot, "packages/db"),
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: "inherit",
    },
  );

  execFileSync(
    "pnpm",
    ["exec", "tsx", "test/seed-test-db.ts"],
    {
      cwd: resolve(__dirname, ".."),
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: "inherit",
    },
  );

  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: false });
  try {
    await redis.flushdb();
  } finally {
    redis.disconnect();
  }
}
