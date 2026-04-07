import { db } from "@openng/db";
import { sql } from "drizzle-orm";

export async function validateHolidaysBatch(batch: string): Promise<void> {
  const result = await db.execute(
    sql`SELECT * FROM staging.validate_holidays(${batch}::uuid)`,
  );
  const rows = result as unknown as { valid_count: string; invalid_count: string }[];
  const summary = rows[0];
  if (!summary) {
    console.log(JSON.stringify({ valid_count: 0, invalid_count: 0, batch }, null, 2));
    return;
  }
  console.log(
    JSON.stringify(
      {
        resource: "holidays",
        batch,
        valid_count: summary.valid_count,
        invalid_count: summary.invalid_count,
      },
      null,
      2,
    ),
  );
}
