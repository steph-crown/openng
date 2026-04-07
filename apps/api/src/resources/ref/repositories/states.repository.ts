import { asc, eq } from "drizzle-orm";
import { states } from "@openng/db";
import type { DbExecutor } from "../../../db/client";

const stateListProjection = {
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
};

export async function listStatesOrdered(
  client: DbExecutor,
  geoZone: string | undefined,
) {
  const base = client.select(stateListProjection).from(states);
  if (geoZone !== undefined && geoZone !== "") {
    return base.where(eq(states.geoZone, geoZone)).orderBy(asc(states.name));
  }
  return base.orderBy(asc(states.name));
}

export async function findStateBySlug(client: DbExecutor, slug: string) {
  const [row] = await client.select().from(states).where(eq(states.slug, slug)).limit(1);
  return row;
}
