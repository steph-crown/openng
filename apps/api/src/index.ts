import "dotenv/config";
import { serve } from "@hono/node-server";
import { startAuthCleanupJob } from "./auth/cleanup";
import { createApp } from "./app";
import { logger } from "./observability/logger";

const app = createApp();

startAuthCleanupJob();

const port = Number(process.env.PORT) || 3000;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info({ port: info.port }, "server started");
  },
);
