import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "./core/logger.js";
import { requestLogger } from "./middleware/request-logger.js";
import type { AppVariables } from "./middleware/request-logger.js";

const app = new Hono<{ Variables: AppVariables }>();

app.use("*", requestLogger);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

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
