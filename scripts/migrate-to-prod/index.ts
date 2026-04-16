import "dotenv/config";
import { z } from "zod";
import { parseResourceAndBatch } from "../lib/cli-args";
import { migrateHolidaysBatch } from "./holidays";
import { migratePostalCodesBatch } from "./postal-codes";

const migrators: Record<string, (batch: string) => Promise<void>> = {
  holidays: migrateHolidaysBatch,
  "postal-codes": migratePostalCodesBatch,
};

async function main() {
  const { resource, batch } = parseResourceAndBatch(process.argv.slice(2));
  if (!resource || !batch) {
    console.error(
      "Usage: pnpm migrate-to-prod -- --resource <resource> --batch <uuid>",
    );
    process.exit(1);
  }
  const parsed = z.string().uuid().safeParse(batch);
  if (!parsed.success) {
    console.error("Invalid batch id (expected UUID)");
    process.exit(1);
  }
  const handler = migrators[resource];
  if (!handler) {
    console.error(`Unsupported resource: ${resource}`);
    process.exit(1);
  }
  await handler(parsed.data);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
