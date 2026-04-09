import { config } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

config({ path: resolve(__dirname, ".env.test") });

const defaultDatabaseUrl =
  "postgresql://openng:openng_dev@127.0.0.1:5434/openng_test";
const defaultRedisUrl = "redis://127.0.0.1:6380/15";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    pool: "forks",
    testTimeout: 30_000,
    hookTimeout: 120_000,
    globalSetup: ["./test/global-setup.ts"],
    include: ["test/**/*.test.ts"],
    env: {
      DATABASE_URL: process.env.DATABASE_URL_TEST ?? defaultDatabaseUrl,
      REDIS_URL: process.env.REDIS_URL_TEST ?? defaultRedisUrl,
      NODE_ENV: "test",
      LOG_LEVEL: "error",
    },
  },
});
