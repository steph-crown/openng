import crypto from "node:crypto";
import type { MiddlewareHandler } from "hono";
import { logger } from "../observability/logger";
import { responseBytes } from "../observability/response-bytes";
import { WideEvent } from "../observability/wide-event";
import type { AppVariables } from "../types/context";

export const requestLogger: MiddlewareHandler<{ Variables: AppVariables }> = async (c, next) => {
  const requestId = c.req.header("x-request-id") ?? crypto.randomUUID();
  const event = new WideEvent();

  c.set("event", event);
  c.set("requestId", requestId);

  event.setMany({
    request_id: requestId,
    method: c.req.method,
    path: c.req.path,
    query: c.req.query() ? JSON.stringify(c.req.query()) : undefined,
    user_agent: c.req.header("user-agent") ?? null,
    ip: c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  });

  event.startTimer("duration");

  c.header("x-request-id", requestId);

  try {
    await next();
  } catch (err) {
    event.addError(err);
    throw err;
  } finally {
    event.stopTimer("duration");
    event.set("status", c.res.status);
    event.set("response_size", await responseBytes(c.res));
    event.emit(logger);
  }
};
