import { readFileSync } from "fs";
import { resolve } from "path";
import { buildPostalCodeSeed, defaultSeedPath, writePostalCodeSeedJson } from "./build-seed.js";

export const scraperStepBuildSeedCli = {
  purpose: "CLI entry for deterministic seed generation from captured source snapshots",
  pipelineStep: "transformation",
  runOrder: 1,
};

type StateRef = { name: string; slug: string };
type LgaRef = { name: string; slug: string; state_slug: string };

function readJsonFile<T>(path: string): T {
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as T;
}

function parseArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx === -1) {
    return undefined;
  }
  return process.argv[idx + 1];
}

async function main(): Promise<void> {
  const nipostInput = parseArg("--nipost-input");
  const communityInput = parseArg("--community-input");
  const statesInput = parseArg("--states-input");
  const lgasInput = parseArg("--lgas-input");
  const out = parseArg("--out") ?? defaultSeedPath();

  if (!nipostInput || !communityInput || !statesInput || !lgasInput) {
    console.error(
      "Usage: pnpm --filter @openng/scrapers postal-codes:build-seed -- --nipost-input <json> --community-input <json> --states-input <json> --lgas-input <json> [--out <path>]",
    );
    process.exit(1);
  }

  const nipostHtmlByLga = readJsonFile<
    Array<{ stateName: string; lgaName: string; html: string; sourceUrl: string; sourceDate: string }>
  >(resolve(process.cwd(), nipostInput));
  const communityHtmlPages = readJsonFile<
    Array<{ html: string; sourceUrl: string; sourceDate: string }>
  >(resolve(process.cwd(), communityInput));
  const states = readJsonFile<StateRef[]>(resolve(process.cwd(), statesInput));
  const lgas = readJsonFile<LgaRef[]>(resolve(process.cwd(), lgasInput));

  const records = buildPostalCodeSeed({
    nipostHtmlByLga,
    communityHtmlPages,
    states,
    lgas,
  });
  writePostalCodeSeedJson(resolve(process.cwd(), out), records);

  const stateCoverage = new Set(records.map((row: { state_slug: string }) => row.state_slug));
  console.log(
    JSON.stringify(
      {
        resource: "postal-codes",
        records: records.length,
        states_covered: stateCoverage.size,
        output: resolve(process.cwd(), out),
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
