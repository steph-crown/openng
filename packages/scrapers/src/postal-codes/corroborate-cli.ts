import { runNipostCorroboration } from "./corroborate-nipost.js";

export const scraperStepCorroborateCli = {
  purpose: "CLI entry for applying NIPOST corroboration to existing seed rows",
  pipelineStep: "verification",
  runOrder: 2,
};

function parseArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx === -1) {
    return undefined;
  }
  return process.argv[idx + 1];
}

async function main(): Promise<void> {
  const seedPath = parseArg("--seed");
  const nipostPath = parseArg("--nipost");
  const result = runNipostCorroboration({
    seedPath,
    nipostPath,
  });
  console.log(
    JSON.stringify(
      {
        resource: "postal-codes",
        step: "nipost-corroboration",
        ...result,
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
