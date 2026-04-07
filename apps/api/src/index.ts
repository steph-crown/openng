import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { accountRouter } from "./account/routes";
import { startAuthCleanupJob } from "./auth/cleanup";
import { authRouter } from "./auth/routes";
import { corsMiddleware } from "./core/cors";
import { errorHandler } from "./core/error-handler";
import { healthRouter } from "./core/health";
import { globalMetaRouter } from "./core/meta";
import { logger } from "./core/logger";
import { requestLogger } from "./core/request-logger.middleware";
import type { AppVariables } from "./core/request-logger.middleware";
import { v1Router } from "./v1/index";

const app = new Hono<{ Variables: AppVariables }>();

app.onError(errorHandler);
app.use("*", corsMiddleware);
app.use("*", requestLogger);

app.route("/health", healthRouter);
app.route("/meta", globalMetaRouter);

app.route("/auth", authRouter);
app.route("/account", accountRouter);
app.route("/v1", v1Router);

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
