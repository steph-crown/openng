import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { normalizeAreaKey, normalizeSlug } from "./normalize.js";
import type { PostalCodeRecord } from "./types.js";

export const scraperStepCorroborateNipost = {
  purpose: "Merge authoritative NIPOST rows into seed, upgrading confidence and verification",
  pipelineStep: "verification",
  runOrder: 2,
};

type NipostRow = {
  state?: string;
  state_slug?: string;
  lga?: string;
  lga_slug?: string | null;
  area_name: string;
  post_office_name?: string | null;
  postal_code: string;
  source_url?: string;
  source_date?: string;
  notes?: string | null;
};

function resolveRepoPath(pathFromRoot: string): string {
  return process.cwd().includes("/packages/scrapers")
    ? resolve(process.cwd(), "../..", pathFromRoot)
    : resolve(process.cwd(), pathFromRoot);
}

function keyOf(row: {
  state_slug: string;
  lga_slug: string | null;
  area_name: string;
  postal_code: string;
}): string {
  return [
    row.state_slug,
    row.lga_slug ?? "",
    normalizeAreaKey(row.area_name),
    row.postal_code,
  ].join("|");
}

function toNipostRecord(row: NipostRow): PostalCodeRecord | null {
  const postalCode = (row.postal_code ?? "").trim();
  if (!/^\d{6}$/.test(postalCode)) {
    return null;
  }
  const stateSlug = (row.state_slug ?? normalizeSlug(row.state ?? "")).trim();
  if (!stateSlug) {
    return null;
  }
  const areaName = (row.area_name ?? "").trim();
  if (!areaName) {
    return null;
  }
  const lgaSlugRaw = row.lga_slug ?? normalizeSlug(row.lga ?? "");
  const lgaSlug = lgaSlugRaw ? lgaSlugRaw : null;

  return {
    state: row.state ?? stateSlug,
    state_slug: stateSlug,
    lga: row.lga ?? (lgaSlug ?? areaName),
    lga_slug: lgaSlug,
    area_name: areaName,
    post_office_name: row.post_office_name ?? null,
    postal_code: postalCode,
    region_digit: Number.parseInt(postalCode[0] ?? "0", 10),
    is_verified: false,
    confidence: "authoritative",
    source_kind: "nipost",
    source_url: row.source_url ?? "https://nipost.gov.ng/postcode-finder/",
    source_date: row.source_date ?? new Date().toISOString().slice(0, 10),
    notes: row.notes ?? "Imported from NIPOST corroboration file",
  };
}

export function corroborateWithNipost(
  seedRows: PostalCodeRecord[],
  nipostRows: NipostRow[],
): {
  merged: PostalCodeRecord[];
  upgraded: number;
  addedFromNipost: number;
} {
  const merged = [...seedRows];
  const index = new Map<string, number>();
  for (let i = 0; i < merged.length; i += 1) {
    index.set(keyOf(merged[i]!), i);
  }

  let upgraded = 0;
  let addedFromNipost = 0;

  for (const row of nipostRows) {
    const n = toNipostRecord(row);
    if (!n) {
      continue;
    }
    const key = keyOf(n);
    const existingIndex = index.get(key);
    if (existingIndex !== undefined) {
      const existing = merged[existingIndex]!;
      if (!existing.is_verified || existing.confidence !== "authoritative") {
        merged[existingIndex] = {
          ...existing,
          is_verified: true,
          confidence: "authoritative",
          source_kind: existing.source_kind === "nipost" ? "nipost" : existing.source_kind,
          notes: existing.notes ?? "Corroborated against NIPOST",
        };
        upgraded += 1;
      }
      continue;
    }

    merged.push({
      ...n,
      is_verified: false,
      confidence: "authoritative",
      source_kind: "nipost",
    });
    index.set(key, merged.length - 1);
    addedFromNipost += 1;
  }

  merged.sort((a, b) => {
    if (a.state_slug !== b.state_slug) {
      return a.state_slug.localeCompare(b.state_slug);
    }
    if ((a.lga_slug ?? "") !== (b.lga_slug ?? "")) {
      return (a.lga_slug ?? "").localeCompare(b.lga_slug ?? "");
    }
    if (a.area_name !== b.area_name) {
      return a.area_name.localeCompare(b.area_name);
    }
    return a.postal_code.localeCompare(b.postal_code);
  });

  return { merged, upgraded, addedFromNipost };
}

export function runNipostCorroboration(params?: {
  seedPath?: string;
  nipostPath?: string;
}): {
  totalRows: number;
  upgraded: number;
  addedFromNipost: number;
} {
  const seedPath = resolveRepoPath(params?.seedPath ?? "data/seeds/postal-codes/seed-rows.json");
  const nipostPath = resolveRepoPath(params?.nipostPath ?? "data/seeds/postal-codes/nipost-rows.json");

  const seedRows = JSON.parse(readFileSync(seedPath, "utf8")) as PostalCodeRecord[];
  const nipostRows = JSON.parse(readFileSync(nipostPath, "utf8")) as NipostRow[];

  const result = corroborateWithNipost(seedRows, nipostRows);
  writeFileSync(seedPath, JSON.stringify(result.merged, null, 2));

  return {
    totalRows: result.merged.length,
    upgraded: result.upgraded,
    addedFromNipost: result.addedFromNipost,
  };
}
