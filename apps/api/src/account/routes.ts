import { Hono } from "hono";
import {
  accountKeysMeta,
  errorResponse,
  ErrorCode,
  successResponse,
  updateKeySchema,
} from "@openng/shared";
import { sessionAuth } from "../auth/middleware.js";
import type { AppVariables } from "../core/request-logger.middleware.js";
import { recordRequestError } from "../core/request-error.js";
import * as apiKeyService from "./services/api-key.service.js";

function parseNumericIdParam(s: string | undefined): bigint | null {
  if (!s || !/^\d+$/.test(s)) {
    return null;
  }
  return BigInt(s);
}

export const accountRouter = new Hono<{ Variables: AppVariables }>();

accountRouter.use("*", sessionAuth);

accountRouter.post("/keys", async (c) => {
  const user = c.get("user")!;
  try {
    const result = await apiKeyService.createApiKeyForUser(user.id);
    if (!result.ok) {
      return c.json(
        errorResponse(
          ErrorCode.CONFLICT,
          "An API key already exists. Revoke it before creating a new one.",
        ),
        409,
      );
    }
    return c.json(
      successResponse(
        {
          key: result.rawKey,
          prefix: result.keyPrefix,
          name: result.row.name,
          tier: result.row.tier,
        },
        accountKeysMeta(),
      ),
    );
  } catch (err) {
    recordRequestError(c, err);
    return c.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"),
      500,
    );
  }
});

accountRouter.get("/keys", async (c) => {
  const user = c.get("user")!;
  try {
    const rows = await apiKeyService.listApiKeysForUser(user.id);
    const keys = rows.map((row) => ({
      id: String(row.id),
      key_prefix: row.keyPrefix,
      name: row.name,
      tier: row.tier,
      created_at: row.createdAt.toISOString(),
      last_used_at: row.lastUsedAt?.toISOString() ?? null,
      revoked_at: row.revokedAt?.toISOString() ?? null,
    }));
    return c.json(successResponse({ keys }, accountKeysMeta()));
  } catch (err) {
    recordRequestError(c, err);
    return c.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"),
      500,
    );
  }
});

accountRouter.delete("/keys/:id", async (c) => {
  const user = c.get("user")!;
  const keyId = parseNumericIdParam(c.req.param("id"));
  if (keyId === null) {
    return c.json(errorResponse(ErrorCode.NOT_FOUND, "Key not found"), 404);
  }
  try {
    const result = await apiKeyService.revokeApiKeyForUser(user.id, keyId);
    if (!result.ok) {
      return c.json(errorResponse(ErrorCode.NOT_FOUND, "Key not found"), 404);
    }
    return c.json(
      successResponse({ message: "Key revoked" }, accountKeysMeta()),
    );
  } catch (err) {
    recordRequestError(c, err);
    return c.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"),
      500,
    );
  }
});

accountRouter.patch("/keys/:id", async (c) => {
  const user = c.get("user")!;
  const keyId = parseNumericIdParam(c.req.param("id"));
  if (keyId === null) {
    return c.json(errorResponse(ErrorCode.NOT_FOUND, "Key not found"), 404);
  }
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(
      errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid request body"),
      400,
    );
  }
  const parsed = updateKeySchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid request body"),
      400,
    );
  }
  try {
    const result = await apiKeyService.updateApiKeyNameForUser(
      user.id,
      keyId,
      parsed.data.name,
    );
    if (!result.ok) {
      return c.json(errorResponse(ErrorCode.NOT_FOUND, "Key not found"), 404);
    }
    const row = result.row;
    return c.json(
      successResponse(
        {
          id: String(row.id),
          key_prefix: row.keyPrefix,
          name: row.name,
          tier: row.tier,
          created_at: row.createdAt.toISOString(),
          last_used_at: row.lastUsedAt?.toISOString() ?? null,
          revoked_at: row.revokedAt?.toISOString() ?? null,
        },
        accountKeysMeta(),
      ),
    );
  } catch (err) {
    recordRequestError(c, err);
    return c.json(
      errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"),
      500,
    );
  }
});
