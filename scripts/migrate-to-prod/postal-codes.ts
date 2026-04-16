import { db } from "@openng/db";
import { sql } from "drizzle-orm";

export async function migratePostalCodesBatch(batch: string): Promise<void> {
  const result = await db.execute(
    sql`SELECT * FROM staging.migrate_postal_codes(${batch}::uuid)`,
  );
  const rows = result as unknown as {
    rows_inserted: string;
    rows_marked_migrated: string;
  }[];
  const summary = rows[0];
  if (!summary) {
    console.log(
      JSON.stringify(
        { rows_inserted: 0, rows_marked_migrated: 0, batch },
        null,
        2,
      ),
    );
    return;
  }
  console.log(
    JSON.stringify(
      {
        resource: "postal-codes",
        batch,
        rows_inserted: summary.rows_inserted,
        rows_marked_migrated: summary.rows_marked_migrated,
      },
      null,
      2,
    ),
  );
}
