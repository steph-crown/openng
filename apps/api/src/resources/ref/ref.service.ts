import type { PaginationMeta } from "@openng/shared";
import { db } from "../../db/client";
import * as lgasRepo from "./repositories/lgas.repository";
import * as statesRepo from "./repositories/states.repository";

function refMeta(resource: string, total: number, limit: number): PaginationMeta {
  const now = new Date().toISOString();
  return {
    total,
    page: 1,
    limit,
    pages: 1,
    resource,
    last_updated: now,
    source_url: "https://openng.dev",
    update_frequency: "static",
  };
}

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

export async function listStates(geoZone: string | undefined) {
  const rows = await statesRepo.listStatesOrdered(db, geoZone);
  const data = rows.map(mapState);
  return {
    data,
    meta: refMeta("ref.states", data.length, data.length),
  };
}

export async function getStateBySlug(slug: string) {
  const row = await statesRepo.findStateBySlug(db, slug);
  if (!row) {
    return null;
  }
  const lgaCount = await lgasRepo.countLgasByStateId(db, row.id);
  const data = {
    ...mapState(row),
    lga_count: lgaCount,
  };
  return {
    data,
    meta: refMeta("ref.states", 1, 1),
  };
}

export async function listLgasForStateSlug(stateSlug: string) {
  const st = await statesRepo.findStateBySlug(db, stateSlug);
  if (!st) {
    return null;
  }
  const rows = await lgasRepo.listLgasByStateId(db, st.id);
  const data = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    headquarters: r.headquarters,
  }));
  return {
    data,
    meta: refMeta("ref.lgas", data.length, data.length),
  };
}

export async function listLgasWithStateFilter(stateSlug: string, nameQuery: string | undefined) {
  const st = await statesRepo.findStateBySlug(db, stateSlug);
  if (!st) {
    return null;
  }
  const rows = await lgasRepo.listLgasWithStateForState(db, st.id, nameQuery);
  const data = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    headquarters: r.headquarters,
    state_name: r.stateName,
    state_slug: r.stateSlug,
  }));
  return {
    data,
    meta: refMeta("ref.lgas", data.length, data.length),
  };
}
