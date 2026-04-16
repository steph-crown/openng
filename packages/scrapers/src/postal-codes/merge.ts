import type { Confidence, PostalCodeRecord, SourceRow } from "./types.js";
import { normalizeAreaKey } from "./normalize.js";

export const scraperStepMergeSources = {
  purpose: "Reconcile NIPOST and community rows into canonical records keyed by state/LGA/area/postal code",
  pipelineStep: "transformation",
  runOrder: 1,
};

type LgaRef = {
  name: string;
  slug: string;
  state_slug: string;
};

type StateRef = {
  name: string;
  slug: string;
};

type MergeInput = {
  nipostRows: SourceRow[];
  communityRows: SourceRow[];
  stateRefs: StateRef[];
  lgaRefs: LgaRef[];
};

function confidenceFor(matchNipost: boolean, matchCommunity: boolean): Confidence {
  if (matchNipost && matchCommunity) {
    return "authoritative";
  }
  if (matchNipost) {
    return "authoritative";
  }
  if (matchCommunity) {
    return "fallback";
  }
  return "fallback";
}

export function mergePostalCodeSources(input: MergeInput): PostalCodeRecord[] {
  const stateBySlug = new Map(input.stateRefs.map((state) => [state.slug, state]));
  const lgaBySlug = new Map(
    input.lgaRefs.map((lga) => [`${lga.state_slug}:${lga.slug}`, lga]),
  );
  const byKey = new Map<string, { nipost?: SourceRow; community?: SourceRow }>();

  for (const row of input.nipostRows) {
    const key = [
      row.state_slug,
      row.lga_slug ?? "",
      normalizeAreaKey(row.area_name),
      row.postal_code,
    ].join("|");
    byKey.set(key, { ...(byKey.get(key) ?? {}), nipost: row });
  }

  for (const row of input.communityRows) {
    const key = [
      row.state_slug,
      row.lga_slug ?? "",
      normalizeAreaKey(row.area_name),
      row.postal_code,
    ].join("|");
    byKey.set(key, { ...(byKey.get(key) ?? {}), community: row });
  }

  const records: PostalCodeRecord[] = [];
  for (const [key, value] of byKey.entries()) {
    const base = value.nipost ?? value.community;
    if (!base) {
      continue;
    }
    const [stateSlugRaw, lgaSlugRaw] = key.split("|");
    const stateSlug = stateSlugRaw ?? "";
    const lgaSlug = lgaSlugRaw ?? "";
    const state = stateBySlug.get(stateSlug);
    const lga = lgaBySlug.get(`${stateSlug}:${lgaSlug}`);
    const matchNipost = Boolean(value.nipost);
    const matchCommunity = Boolean(value.community);
    const confidence = confidenceFor(matchNipost, matchCommunity);
    records.push({
      state: state?.name ?? stateSlug,
      state_slug: stateSlug,
      lga: lga?.name ?? (lgaSlug || "unknown"),
      lga_slug: lgaSlug || null,
      area_name: base.area_name,
      post_office_name: base.post_office_name,
      postal_code: base.postal_code,
      region_digit: parseInt(base.postal_code[0] ?? "0", 10),
      is_verified: matchNipost && matchCommunity,
      confidence,
      source_kind: matchNipost ? "nipost" : "community",
      source_url: base.source_url,
      source_date: base.source_date,
      notes: matchNipost && !matchCommunity ? "missing community corroboration" : null,
    });
  }

  records.sort((a, b) => {
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

  return records;
}
