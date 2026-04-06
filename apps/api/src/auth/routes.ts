import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import {
  authMeta,
  errorResponse,
  ErrorCode,
  magicLinkRequestSchema,
  successResponse,
  verifyTokenSchema,
} from "@openng/shared";
import type { AppVariables } from "../core/request-logger.middleware.js";
import { recordRequestError } from "../core/request-error.js";
import {
  MAGIC_LINK_SUCCESS_MESSAGE,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from "./constants.js";
import { sessionAuth } from "./middleware.js";
import * as authService from "./services/auth.service.js";

export const authRouter = new Hono<{ Variables: AppVariables }>();

authRouter.post("/magic-link", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid request body"), 400);
  }
  const parsed = magicLinkRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid request body"), 400);
  }
  try {
    await authService.requestMagicLink(parsed.data.email);
  } catch (err) {
    recordRequestError(c, err);
    return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
  }
  return c.json(successResponse({ message: MAGIC_LINK_SUCCESS_MESSAGE }, authMeta()));
});

authRouter.get("/verify", async (c) => {
  const q = c.req.query("token");
  const parsed = verifyTokenSchema.safeParse({ token: q ?? "" });
  if (!parsed.success) {
    return c.json(errorResponse(ErrorCode.UNAUTHORIZED, "Invalid or expired token"), 401);
  }
  const result = await authService.verifyMagicLink(parsed.data.token);
  if (!result) {
    return c.json(errorResponse(ErrorCode.UNAUTHORIZED, "Invalid or expired token"), 401);
  }
  setCookie(c, SESSION_COOKIE_NAME, result.sessionRaw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return c.json(successResponse({ user: result.user }, authMeta()));
});

authRouter.post("/logout", async (c) => {
  const raw = getCookie(c, SESSION_COOKIE_NAME);
  await authService.logoutBySessionRaw(raw);
  deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
  return c.json(successResponse({ message: "Logged out" }, authMeta()));
});

authRouter.get("/me", sessionAuth, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(errorResponse(ErrorCode.UNAUTHORIZED, "Authentication required"), 401);
  }
  return c.json(
    successResponse(
      {
        user: {
          id: String(user.id),
          email: user.email,
          email_verified_at: user.emailVerifiedAt?.toISOString() ?? null,
          created_at: user.createdAt.toISOString(),
        },
      },
      authMeta(),
    ),
  );
});
