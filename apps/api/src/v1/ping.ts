import { Hono } from "hono";
import { authMeta, successResponse } from "@openng/shared";
import { apiKeyAuth } from "../middleware/auth-context";
import type { AppVariables } from "../types/context";

export const v1PingRouter = new Hono<{ Variables: AppVariables }>();

v1PingRouter.use("*", apiKeyAuth);

v1PingRouter.get("/ping", (c) => {
  const user = c.get("user")!;
  const apiKeyId = c.get("apiKeyId");
  const tier = c.get("tier");
  return c.json(
    successResponse(
      {
        message: "pong",
        user_id: String(user.id),
        tier,
        api_key_id: apiKeyId !== undefined ? String(apiKeyId) : null,
      },
      authMeta(),
    ),
  );
});
