import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import type { PostalCodeRecord } from "./types.js";
import { mergePostalCodeSources } from "./merge.js";
import { scrapeCommunityHtml } from "./scrape-community.js";
import { scrapeNipostHtml } from "./scrape-nipost.js";

export const scraperStepBuildSeed = {
  purpose: "Build consolidated seed rows from prepared NIPOST and community HTML inputs",
  pipelineStep: "transformation",
  runOrder: 1,
};

type BuildSeedInput = {
  nipostHtmlByLga: Array<{
    stateName: string;
    lgaName: string;
    html: string;
    sourceUrl: string;
    sourceDate: string;
  }>;
  communityHtmlPages: Array<{
    html: string;
    sourceUrl: string;
    sourceDate: string;
  }>;
  states: Array<{ name: string; slug: string }>;
  lgas: Array<{ name: string; slug: string; state_slug: string }>;
};

export function buildPostalCodeSeed(input: BuildSeedInput): PostalCodeRecord[] {
  const nipostRows = input.nipostHtmlByLga.flatMap((item) =>
    scrapeNipostHtml({
      html: item.html,
      sourceUrl: item.sourceUrl,
      sourceDate: item.sourceDate,
      stateName: item.stateName,
      lgaName: item.lgaName,
    }),
  );

  const communityRows = input.communityHtmlPages.flatMap((item) =>
    scrapeCommunityHtml({
      html: item.html,
      sourceUrl: item.sourceUrl,
      sourceDate: item.sourceDate,
    }),
  );

  return mergePostalCodeSources({
    nipostRows,
    communityRows,
    stateRefs: input.states,
    lgaRefs: input.lgas,
  });
}

export function writePostalCodeSeedJson(
  outputPath: string,
  records: PostalCodeRecord[],
): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(records, null, 2));
}

export function defaultSeedPath(): string {
  return resolve(process.cwd(), "data/seeds/postal-codes/seed-rows.json");
}
