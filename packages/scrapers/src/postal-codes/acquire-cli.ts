import { resolve } from "path";
import { acquireFromShowpostcodes } from "./acquire-showpostcodes.js";
import { writePostalCodeSeedJson } from "./build-seed.js";

export const scraperStepAcquireCli = {
  purpose: "Run live community acquisition and write canonical seed rows",
  pipelineStep: "acquisition",
  runOrder: 1,
};

function parseArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx === -1) {
    return undefined;
  }
  return process.argv[idx + 1];
}

async function main(): Promise<void> {
  const out = parseArg("--out") ?? "data/seeds/postal-codes/seed-rows.json";
  const rows = await acquireFromShowpostcodes();
  const outPath = process.cwd().includes("/packages/scrapers")
    ? resolve(process.cwd(), "../..", out)
    : resolve(process.cwd(), out);
  writePostalCodeSeedJson(outPath, rows);
  const stateCoverage = new Set(rows.map((row) => row.state_slug));
  console.log(
    JSON.stringify(
      {
        resource: "postal-codes",
        source: "showpostcodes",
        rows: rows.length,
        states_covered: stateCoverage.size,
        output: outPath,
      },
      null,
      2,
    ),
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
