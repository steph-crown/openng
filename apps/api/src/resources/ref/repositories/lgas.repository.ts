import { and, asc, count, eq, ilike } from "drizzle-orm";
import { lgas, states } from "@openng/db";
import type { DbExecutor } from "../../../db/client";

export async function countLgasByStateId(client: DbExecutor, stateId: number): Promise<number> {
  const [r] = await client
    .select({ n: count() })
    .from(lgas)
    .where(eq(lgas.stateId, stateId));
  return Number(r?.n ?? 0);
}

export async function listLgasByStateId(client: DbExecutor, stateId: number) {
  return client
    .select({
      id: lgas.id,
      name: lgas.name,
      slug: lgas.slug,
      headquarters: lgas.headquarters,
    })
    .from(lgas)
    .where(eq(lgas.stateId, stateId))
    .orderBy(asc(lgas.name));
}

export async function listLgasWithStateForState(
  client: DbExecutor,
  stateId: number,
  nameIlike: string | undefined,
) {
  const conditions = [eq(lgas.stateId, stateId)];
  if (nameIlike !== undefined && nameIlike !== "") {
    conditions.push(ilike(lgas.name, `%${nameIlike}%`));
  }
  return client
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
}
