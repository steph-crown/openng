import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { db, stagingPostalCodes } from "@openng/db";
import { z } from "zod";

const rowSchema = z.object({
  state: z.string().min(1),
  state_slug: z.string().min(1),
  lga: z.string().min(1),
  lga_slug: z.string().min(1).nullable().optional(),
  area_name: z.string().min(1),
  post_office_name: z.string().nullable().optional(),
  postal_code: z.string().regex(/^\d{6}$/),
  region_digit: z.number().int().min(0).max(9),
  is_verified: z.boolean().default(false),
  confidence: z.enum(["authoritative", "high", "fallback"]),
  source_kind: z.enum(["nipost", "community"]),
  source_url: z.string().url(),
  source_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().nullable().optional(),
});

const fileSchema = z.array(rowSchema);

export async function importPostalCodesFromJson(filePath: string): Promise<void> {
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
  const rows = data.map((row) => ({
    state: row.state,
    stateSlug: row.state_slug,
    lga: row.lga,
    lgaSlug: row.lga_slug ?? null,
    areaName: row.area_name,
    postOfficeName: row.post_office_name ?? null,
    postalCode: row.postal_code,
    regionDigit: row.region_digit,
    isVerified: row.is_verified,
    confidence: row.confidence,
    sourceKind: row.source_kind,
    sourceUrl: row.source_url,
    sourceDate: row.source_date,
    notes: row.notes ?? null,
    importBatchId,
  }));

  await db.insert(stagingPostalCodes).values(rows);

  const states = new Set(rows.map((row) => row.stateSlug));
  const lgas = new Set(rows.map((row) => row.lgaSlug).filter((value): value is string => Boolean(value)));

  console.log(
    JSON.stringify(
      {
        resource: "postal-codes",
        import_batch_id: importBatchId,
        rows_inserted: rows.length,
        states_covered: states.size,
        lgas_covered: lgas.size,
        file: filePath,
      },
      null,
      2,
    ),
  );
}
