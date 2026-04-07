import { Hono } from "hono";
import { errorResponse, ErrorCode, successResponse } from "@openng/shared";
import { combinedAuth } from "../../middleware/auth-context";
import { recordRequestError } from "../../http/request-error";
import type { AppVariables } from "../../types/context";
import * as refService from "./ref.service";
import {
  parseRefLgasQuery,
  parseRefSlugParam,
  parseRefStatesQuery,
} from "./schemas";

export const refRouter = new Hono<{ Variables: AppVariables }>();

refRouter.use("*", combinedAuth);

refRouter.get("/states", async (c) => {
  try {
    const parsed = parseRefStatesQuery(c.req.query());
    if (!parsed.success) {
      return c.json(errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid query parameters"), 400);
    }
    const { data, meta } = await refService.listStates(parsed.data.geo_zone);
    return c.json(successResponse(data, meta));
  } catch (err) {
    recordRequestError(c, err);
    return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
  }
});

refRouter.get("/states/:slug", async (c) => {
  try {
    const parsed = parseRefSlugParam({ slug: c.req.param("slug") });
    if (!parsed.success) {
      return c.json(errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid path"), 400);
    }
    const result = await refService.getStateBySlug(parsed.data.slug);
    if (!result) {
      return c.json(errorResponse(ErrorCode.NOT_FOUND, "State not found"), 404);
    }
    return c.json(successResponse(result.data, result.meta));
  } catch (err) {
    recordRequestError(c, err);
    return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
  }
});

refRouter.get("/states/:slug/lgas", async (c) => {
  try {
    const parsed = parseRefSlugParam({ slug: c.req.param("slug") });
    if (!parsed.success) {
      return c.json(errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid path"), 400);
    }
    const result = await refService.listLgasForStateSlug(parsed.data.slug);
    if (!result) {
      return c.json(errorResponse(ErrorCode.NOT_FOUND, "State not found"), 404);
    }
    return c.json(successResponse(result.data, result.meta));
  } catch (err) {
    recordRequestError(c, err);
    return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
  }
});

refRouter.get("/lgas", async (c) => {
  try {
    const parsed = parseRefLgasQuery(c.req.query());
    if (!parsed.success) {
      return c.json(errorResponse(ErrorCode.VALIDATION_ERROR, "Invalid query parameters"), 400);
    }
    const result = await refService.listLgasWithStateFilter(
      parsed.data.state,
      parsed.data.name,
    );
    if (!result) {
      return c.json(errorResponse(ErrorCode.NOT_FOUND, "State not found"), 404);
    }
    return c.json(successResponse(result.data, result.meta));
  } catch (err) {
    recordRequestError(c, err);
    return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
  }
});
