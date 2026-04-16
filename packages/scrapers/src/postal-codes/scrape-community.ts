import * as cheerio from "cheerio";
import type { SourceRow } from "./types.js";
import { normalizeSlug } from "./normalize.js";

export const scraperStepScrapeCommunity = {
  purpose: "Parse community-source HTML tables into normalized source rows",
  pipelineStep: "acquisition",
  runOrder: 1,
};

type ScrapeCommunityInput = {
  html: string;
  sourceUrl: string;
  sourceDate: string;
  fallbackStateName?: string;
  fallbackLgaName?: string;
};

export function scrapeCommunityHtml(input: ScrapeCommunityInput): SourceRow[] {
  const $ = cheerio.load(input.html);
  const rows: SourceRow[] = [];
  $("table tbody tr").each((_, tr) => {
    const cells = $(tr)
      .find("td")
      .map((__, td) => $(td).text().trim())
      .get();
    if (cells.length < 3) {
      return;
    }
    const stateName = cells[0] || input.fallbackStateName;
    const lgaName = cells[1] || input.fallbackLgaName;
    const areaName = cells[2] ?? "";
    const postalCode = (cells[3] ?? "").replace(/\D/g, "");
    const postOfficeName = cells[4] ?? null;
    if (!stateName || !areaName || postalCode.length !== 6) {
      return;
    }
    rows.push({
      state_slug: normalizeSlug(stateName),
      lga_slug: lgaName ? normalizeSlug(lgaName) : null,
      area_name: areaName,
      post_office_name: postOfficeName,
      postal_code: postalCode,
      source_url: input.sourceUrl,
      source_date: input.sourceDate,
      source_kind: "community",
    });
  });
  return rows;
}
