import { Hono } from "hono";
import { accountRouter } from "./account/routes";
import { authRouter } from "./auth/routes";
import { healthRouter } from "./health/router";
import { errorHandler } from "./http/error-handler";
import { corsMiddleware } from "./middleware/cors";
import { requestLogger } from "./middleware/request-logger";
import type { AppVariables } from "./types/context";
import { createRegistryListRouter } from "./registry/list-router";
import { v1Router } from "./v1/index";

export function createApp() {
  const app = new Hono<{ Variables: AppVariables }>();
  app.onError(errorHandler);
  app.use("*", requestLogger);
  app.use("*", corsMiddleware);
  app.route("/health", healthRouter);
  app.route("/meta", createRegistryListRouter());
  app.route("/auth", authRouter);
  app.route("/account", accountRouter);
  app.route("/v1", v1Router);
  app.get("/", (c) => {
    return c.text("Hello Hono!");
  });
  return app;
}
