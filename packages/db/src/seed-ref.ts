import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { states } from "./ref/states";
import { lgas } from "./ref/lgas";

interface StateSeed {
  name: string;
  capital: string;
  slug: string;
  code: string;
  iso_code: string;
  geo_zone: string;
  latitude: number;
  longitude: number;
  area_sq_km: number;
}

interface LgaSeed {
  name: string;
  slug: string;
  headquarters: string | null;
  state_code: string;
}

function findRepoRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(resolve(dir, "pnpm-workspace.yaml"))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error("Could not find repo root");
    dir = parent;
  }
  return dir;
}

const repoRoot = findRepoRoot();

const statesData: StateSeed[] = JSON.parse(
  readFileSync(resolve(repoRoot, "data/seeds/states/states.json"), "utf-8"),
);
const lgasData: LgaSeed[] = JSON.parse(
  readFileSync(resolve(repoRoot, "data/seeds/lgas/lgas.json"), "utf-8"),
);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log("Seeding reference data...");

  console.log(`Inserting ${statesData.length} states...`);
  for (const state of statesData) {
    await db
      .insert(states)
      .values({
        name: state.name,
        capital: state.capital,
        slug: state.slug,
        code: state.code,
        isoCode: state.iso_code,
        geoZone: state.geo_zone,
        latitude: String(state.latitude),
        longitude: String(state.longitude),
        areaSqKm: state.area_sq_km,
      })
      .onConflictDoNothing();
  }
  console.log("States seeded.");

  const allStates = await db.select({ id: states.id, code: states.code }).from(states);
  const stateCodeToId = new Map(allStates.map((s) => [s.code, s.id]));

  console.log(`Inserting ${lgasData.length} LGAs...`);
  const batchSize = 100;
  for (let i = 0; i < lgasData.length; i += batchSize) {
    const batch = lgasData.slice(i, i + batchSize);
    const values = batch
      .map((lga) => {
        const stateId = stateCodeToId.get(lga.state_code);
        if (!stateId) {
          console.warn(`Unknown state code: ${lga.state_code} for LGA: ${lga.name}`);
          return null;
        }
        return {
          name: lga.name,
          slug: lga.slug,
          headquarters: lga.headquarters,
          stateId: stateId,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    if (values.length > 0) {
      await db.insert(lgas).values(values).onConflictDoNothing();
    }
  }
  console.log("LGAs seeded.");

  console.log("Reference data seeding complete.");
  await client.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
