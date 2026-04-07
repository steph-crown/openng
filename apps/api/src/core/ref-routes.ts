import { Hono } from "hono";
import { and, asc, count, eq, ilike } from "drizzle-orm";
import { db, lgas, states } from "@openng/db";
import { errorResponse, ErrorCode, successResponse } from "@openng/shared";
import { combinedAuth } from "../auth/middleware";
import { recordRequestError } from "./request-error";
import type { AppVariables } from "./request-logger.middleware";

export const refRouter = new Hono<{ Variables: AppVariables }>();

refRouter.use("*", combinedAuth);

function mapState(row: {
  id: number;
  name: string;
  capital: string;
  slug: string;
  code: string;
  isoCode: string;
  geoZone: string;
  latitude: string | null;
  longitude: string | null;
  areaSqKm: number | null;
}) {
  return {
    id: row.id,
    name: row.name,
    capital: row.capital,
    slug: row.slug,
    code: row.code,
    iso_code: row.isoCode,
    geo_zone: row.geoZone,
    latitude: row.latitude,
    longitude: row.longitude,
    area_sq_km: row.areaSqKm,
  };
}

refRouter.get("/states", async (c) => {
  try {
    const geoZone = c.req.query("geo_zone");
    const base = db
      .select({
        id: states.id,
        name: states.name,
        capital: states.capital,
        slug: states.slug,
        code: states.code,
        isoCode: states.isoCode,
        geoZone: states.geoZone,
        latitude: states.latitude,
        longitude: states.longitude,
        areaSqKm: states.areaSqKm,
      })
      .from(states);
    const rows = geoZone
      ? await base.where(eq(states.geoZone, geoZone)).orderBy(asc(states.name))
      : await base.orderBy(asc(states.name));
    const data = rows.map(mapState);
    const now = new Date().toISOString();
    return c.json(
      successResponse(data, {
        total: data.length,
        page: 1,
        limit: data.length,
        pages: 1,
        resource: "ref.states",
        last_updated: now,
        source_url: "https://openng.dev",
        update_frequency: "static",
      }),
    );
  } catch (err) {
    recordRequestError(c, err);
    return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
  }
});

refRouter.get("/states/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const [row] = await db.select().from(states).where(eq(states.slug, slug)).limit(1);
    if (!row) {
      return c.json(errorResponse(ErrorCode.NOT_FOUND, "State not found"), 404);
    }
    const [cnt] = await db
      .select({ n: count() })
      .from(lgas)
      .where(eq(lgas.stateId, row.id));
    const data = {
      ...mapState(row),
      lga_count: Number(cnt?.n ?? 0),
    };
    const now = new Date().toISOString();
    return c.json(
      successResponse(data, {
        total: 1,
        page: 1,
        limit: 1,
        pages: 1,
        resource: "ref.states",
        last_updated: now,
        source_url: "https://openng.dev",
        update_frequency: "static",
      }),
    );
  } catch (err) {
    recordRequestError(c, err);
    return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
  }
});

refRouter.get("/states/:slug/lgas", async (c) => {
  try {
    const slug = c.req.param("slug");
    const [st] = await db.select().from(states).where(eq(states.slug, slug)).limit(1);
    if (!st) {
      return c.json(errorResponse(ErrorCode.NOT_FOUND, "State not found"), 404);
    }
    const rows = await db
      .select({
        id: lgas.id,
        name: lgas.name,
        slug: lgas.slug,
        headquarters: lgas.headquarters,
      })
      .from(lgas)
      .where(eq(lgas.stateId, st.id))
      .orderBy(asc(lgas.name));
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      headquarters: r.headquarters,
    }));
    const now = new Date().toISOString();
    return c.json(
      successResponse(data, {
        total: data.length,
        page: 1,
        limit: data.length,
        pages: 1,
        resource: "ref.lgas",
        last_updated: now,
        source_url: "https://openng.dev",
        update_frequency: "static",
      }),
    );
  } catch (err) {
    recordRequestError(c, err);
    return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
  }
});

refRouter.get("/lgas", async (c) => {
  try {
    const stateSlug = c.req.query("state");
    if (!stateSlug || stateSlug === "") {
      return c.json(
        errorResponse(ErrorCode.INVALID_FILTER, "Query parameter state is required"),
        400,
      );
    }
    const nameQ = c.req.query("name");
    const [st] = await db.select().from(states).where(eq(states.slug, stateSlug)).limit(1);
    if (!st) {
      return c.json(errorResponse(ErrorCode.NOT_FOUND, "State not found"), 404);
    }
    const conditions = [eq(lgas.stateId, st.id)];
    if (nameQ && nameQ !== "") {
      conditions.push(ilike(lgas.name, `%${nameQ}%`));
    }
    const rows = await db
      .select({
        id: lgas.id,
        name: lgas.name,
        slug: lgas.slug,
        headquarters: lgas.headquarters,
        stateName: states.name,
        stateSlug: states.slug,
      })
      .from(lgas)
      .innerJoin(states, eq(lgas.stateId, states.id))
      .where(and(...conditions))
      .orderBy(asc(lgas.name));
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      headquarters: r.headquarters,
      state_name: r.stateName,
      state_slug: r.stateSlug,
    }));
    const now = new Date().toISOString();
    return c.json(
      successResponse(data, {
        total: data.length,
        page: 1,
        limit: data.length,
        pages: 1,
        resource: "ref.lgas",
        last_updated: now,
        source_url: "https://openng.dev",
        update_frequency: "static",
      }),
    );
  } catch (err) {
    recordRequestError(c, err);
    return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
  }
});
