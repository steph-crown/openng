import { readFileSync } from "fs";
import { resolve } from "path";
import * as cheerio from "cheerio";
import { normalizeSlug } from "./normalize.js";
import type { PostalCodeRecord } from "./types.js";

export const scraperStepAcquireShowpostcodes = {
  purpose: "Fetch and parse ShowPostcodes state pages into normalized postal records",
  pipelineStep: "acquisition",
  runOrder: 1,
};

type StateSeed = {
  name: string;
  slug: string;
  code: string;
};

type LgaSeed = {
  name: string;
  slug: string;
  state_code: string;
};

const SITE = "https://showpostcodes.com.ng";

function resolveRepoPath(pathFromRepoRoot: string): string {
  const fromCurrent = resolve(process.cwd(), pathFromRepoRoot);
  if (fromCurrent.includes("/packages/scrapers/")) {
    return resolve(process.cwd(), "../..", pathFromRepoRoot);
  }
  return fromCurrent;
}

function toAbsolute(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function normalizeStateSlugFromName(name: string): string {
  if (name.toLowerCase().includes("abuja")) {
    return "federal-capital-territory";
  }
  return normalizeSlug(name.replace(/\bstate\b/gi, "").trim());
}

function matchStateFromUrl(url: string, states: StateSeed[]): StateSeed | null {
  const lower = url.toLowerCase();
  for (const state of states) {
    if (lower.includes(`${state.slug}-state`)) {
      return state;
    }
  }
  if (lower.includes("abuja-postal-codes")) {
    return states.find((state) => state.slug === "federal-capital-territory") ?? null;
  }
  return null;
}

function parsePostalCodeRowsFromTable(
  html: string,
  state: StateSeed,
  lgasByStateCode: Map<string, LgaSeed[]>,
  sourceUrl: string,
): PostalCodeRecord[] {
  const $ = cheerio.load(html);
  const stateLgas = lgasByStateCode.get(state.code) ?? [];
  const records: PostalCodeRecord[] = [];

  $("table").each((_, table) => {
    $(table)
      .find("tr")
      .each((__, tr) => {
        const cells = $(tr)
          .find("th,td")
          .map((___, td) => $(td).text().trim())
          .get();

        if (cells.length < 2) {
          return;
        }

        const left = cells[0] ?? "";
        const right = cells[1] ?? "";
        if (!left || !right) {
          return;
        }

        const postalCodeMatch = right.match(/\b(\d{6})\b/);
        if (!postalCodeMatch) {
          return;
        }
        const postalCode = postalCodeMatch[1] ?? "";
        if (!postalCode) {
          return;
        }

        const areaName = left.replace(/\s+/g, " ").trim();
        if (!areaName || /postal code|zip code|lga\/area|area/i.test(areaName)) {
          return;
        }

        const areaSlug = normalizeSlug(areaName);
        const matchedLga =
          stateLgas.find((lga) => lga.slug === areaSlug) ??
          stateLgas.find((lga) => areaSlug.includes(lga.slug) || lga.slug.includes(areaSlug)) ??
          null;

        records.push({
          state: state.name,
          state_slug: state.slug,
          lga: matchedLga?.name ?? areaName,
          lga_slug: matchedLga?.slug ?? null,
          area_name: areaName,
          post_office_name: null,
          postal_code: postalCode,
          region_digit: Number.parseInt(postalCode[0] ?? "0", 10),
          is_verified: false,
          confidence: "fallback",
          source_kind: "community",
          source_url: sourceUrl,
          source_date: new Date().toISOString().slice(0, 10),
          notes: "Scraped from showpostcodes community directory",
        });
      });
  });

  return records;
}

function dedupe(records: PostalCodeRecord[]): PostalCodeRecord[] {
  const map = new Map<string, PostalCodeRecord>();
  for (const record of records) {
    const key = [
      record.state_slug,
      record.lga_slug ?? "",
      record.area_name.toLowerCase(),
      record.postal_code,
    ].join("|");
    if (!map.has(key)) {
      map.set(key, record);
    }
  }
  return [...map.values()];
}

export async function acquireFromShowpostcodes(): Promise<PostalCodeRecord[]> {
  const states = JSON.parse(
    readFileSync(resolveRepoPath("data/seeds/states/states.json"), "utf8"),
  ) as StateSeed[];
  const lgas = JSON.parse(
    readFileSync(resolveRepoPath("data/seeds/lgas/lgas.json"), "utf8"),
  ) as LgaSeed[];
  const lgasByStateCode = new Map<string, LgaSeed[]>();
  for (const lga of lgas) {
    const arr = lgasByStateCode.get(lga.state_code) ?? [];
    arr.push(lga);
    lgasByStateCode.set(lga.state_code, arr);
  }

  const homeRes = await fetch(SITE);
  if (!homeRes.ok) {
    throw new Error(`Failed to fetch homepage: ${homeRes.status}`);
  }
  const homeHtml = await homeRes.text();
  const $ = cheerio.load(homeHtml);
  const links = new Set<string>();
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href");
    if (!href) {
      return;
    }
    const full = toAbsolute(href);
    if (!full.startsWith(SITE)) {
      return;
    }
    if (!/postal-code|postal-codes/i.test(full)) {
      return;
    }
    links.add(full.replace(/\/+$/, "/"));
  });

  const stateLinks = [...links].filter((link) => matchStateFromUrl(link, states) !== null);
  const allRows: PostalCodeRecord[] = [];

  for (const link of stateLinks) {
    const state = matchStateFromUrl(link, states);
    if (!state) {
      continue;
    }
    const res = await fetch(link);
    if (!res.ok) {
      continue;
    }
    const html = await res.text();
    const rows = parsePostalCodeRowsFromTable(html, state, lgasByStateCode, link);
    allRows.push(...rows);
  }

  const rowsByState = new Map<string, number>();
  for (const row of allRows) {
    rowsByState.set(row.state_slug, (rowsByState.get(row.state_slug) ?? 0) + 1);
  }

  const primaryRows: PostalCodeRecord[] = [];
  $("table tr").each((_, tr) => {
    const cells = $(tr)
      .find("th,td")
      .map((__, td) => $(td).text().trim())
      .get()
      .filter(Boolean);
    if (cells.length < 2) {
      return;
    }
    const stateCell = cells.find((value) => /[a-z]/i.test(value));
    const codeCell = cells.find((value) => /\b\d{6}\b/.test(value));
    if (!stateCell || !codeCell) {
      return;
    }
    const stateSlug = normalizeStateSlugFromName(stateCell);
    const state = states.find((item) => item.slug === stateSlug);
    if (!state) {
      return;
    }
    if ((rowsByState.get(state.slug) ?? 0) > 0) {
      return;
    }
    const postalCode = (codeCell.match(/\b\d{6}\b/)?.[0] ?? "").trim();
    if (!postalCode) {
      return;
    }
    primaryRows.push({
      state: state.name,
      state_slug: state.slug,
      lga: `${state.name} (primary)`,
      lga_slug: null,
      area_name: `${state.name} Primary Sorting Area`,
      post_office_name: null,
      postal_code: postalCode,
      region_digit: Number.parseInt(postalCode[0] ?? "0", 10),
      is_verified: false,
      confidence: "fallback",
      source_kind: "community",
      source_url: SITE,
      source_date: new Date().toISOString().slice(0, 10),
      notes: "Fallback state-level primary code from showpostcodes summary table",
    });
  });

  allRows.push(...primaryRows);

  const filtered = dedupe(allRows).filter((row) => /^\d{6}$/.test(row.postal_code));
  filtered.sort((a, b) => {
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

  return filtered;
}
