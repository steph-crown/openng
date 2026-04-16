import { db } from "@openng/db";
import { sql } from "drizzle-orm";

export async function validatePostalCodesBatch(batch: string): Promise<void> {
  const result = await db.execute(
    sql`SELECT * FROM staging.validate_postal_codes(${batch}::uuid)`,
  );
  const rows = result as unknown as {
    valid_count: string;
    invalid_count: string;
    states_present_count: string;
    missing_states_count: string;
  }[];
  const summary = rows[0];
  if (!summary) {
    console.log(
      JSON.stringify(
        {
          valid_count: 0,
          invalid_count: 0,
          states_present_count: 0,
          missing_states_count: 0,
          batch,
        },
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
        valid_count: summary.valid_count,
        invalid_count: summary.invalid_count,
        states_present_count: summary.states_present_count,
        missing_states_count: summary.missing_states_count,
      },
      null,
      2,
    ),
  );
}
