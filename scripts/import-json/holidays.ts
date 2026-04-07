import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { db, stagingHolidays } from "@openng/db";
import { z } from "zod";

const rowSchema = z.object({
  name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  day_of_week: z.string().min(1),
  category: z.enum(["national", "religious", "observance"]),
  schedule_kind: z.enum([
    "fixed",
    "moveable_christian",
    "moveable_islamic",
    "declared_special",
  ]),
  year: z.number().int(),
  is_confirmed: z.boolean(),
  observance_note: z.string().nullable(),
  source_url: z.string().min(1),
  source_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const fileSchema = z.array(rowSchema);

export async function importHolidaysFromJson(filePath: string): Promise<void> {
  const raw = readFileSync(filePath, "utf8");
  let json: unknown;
  try {
    json = JSON.parse(raw) as unknown;
  } catch {
    console.error("Invalid JSON");
    process.exit(1);
  }
  let data: z.infer<typeof fileSchema>;
  try {
    data = fileSchema.parse(json);
  } catch (err) {
    console.error(err);
    process.exit(1);
    throw err;
  }

  const importBatchId = randomUUID();
  const rows = data.map((r) => ({
    name: r.name,
    date: r.date,
    dayOfWeek: r.day_of_week,
    category: r.category,
    scheduleKind: r.schedule_kind,
    year: r.year,
    isConfirmed: r.is_confirmed,
    observanceNote: r.observance_note,
    sourceUrl: r.source_url,
    sourceDate: r.source_date,
    importBatchId,
  }));

  await db.insert(stagingHolidays).values(rows);

  console.log(
    JSON.stringify(
      {
        resource: "holidays",
        import_batch_id: importBatchId,
        rows_inserted: rows.length,
        file: filePath,
      },
      null,
      2,
    ),
  );
}
