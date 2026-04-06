import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { accountRouter } from "./account/routes.js";
import { startAuthCleanupJob } from "./auth/cleanup.js";
import { authRouter } from "./auth/routes.js";
import { logger } from "./core/logger.js";
import { requestLogger } from "./core/request-logger.middleware.js";
import type { AppVariables } from "./core/request-logger.middleware.js";

const app = new Hono<{ Variables: AppVariables }>();

app.use("*", requestLogger);

app.route("/auth", authRouter);
app.route("/account", accountRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

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
