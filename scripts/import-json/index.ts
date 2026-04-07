import "dotenv/config";
import { resolve } from "path";
import { parseResourceAndFile } from "../lib/cli-args";
import { importHolidaysFromJson } from "./holidays";

const importers: Record<string, (filePath: string) => Promise<void>> = {
  holidays: importHolidaysFromJson,
};

async function main() {
  const { resource, file } = parseResourceAndFile(process.argv.slice(2));
  if (!resource || !file) {
    console.error(
      "Usage: pnpm import-json -- --resource holidays --file <path.json>",
    );
    process.exit(1);
  }
  const handler = importers[resource];
  if (!handler) {
    console.error(`Unsupported resource: ${resource}`);
    process.exit(1);
  }
  const abs = resolve(process.cwd(), file);
  await handler(abs);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
