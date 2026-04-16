import * as cheerio from "cheerio";
import type { SourceRow } from "./types.js";
import { normalizeSlug } from "./normalize.js";

export const scraperStepScrapeNipost = {
  purpose: "Parse NIPOST finder HTML snapshots into normalized source rows",
  pipelineStep: "acquisition",
  runOrder: 1,
};

type ScrapeNipostInput = {
  html: string;
  sourceUrl: string;
  sourceDate: string;
  stateName: string;
  lgaName: string;
};

export function scrapeNipostHtml(input: ScrapeNipostInput): SourceRow[] {
  const $ = cheerio.load(input.html);
  const rows: SourceRow[] = [];
  $("table tbody tr").each((_, tr) => {
    const cells = $(tr)
      .find("td")
      .map((__, td) => $(td).text().trim())
      .get();
    if (cells.length < 2) {
      return;
    }
    const areaName = cells[0] ?? "";
    const postalCode = (cells[1] ?? "").replace(/\D/g, "");
    const postOfficeName = cells[2] ?? null;
    if (!areaName || postalCode.length !== 6) {
      return;
    }
    rows.push({
      state_slug: normalizeSlug(input.stateName),
      lga_slug: normalizeSlug(input.lgaName),
      area_name: areaName,
      post_office_name: postOfficeName,
      postal_code: postalCode,
      source_url: input.sourceUrl,
      source_date: input.sourceDate,
      source_kind: "nipost",
    });
  });
  return rows;
}
