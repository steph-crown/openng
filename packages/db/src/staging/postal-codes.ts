import {
  pgSchema,
  bigserial,
  text,
  timestamp,
  boolean,
  integer,
  date,
  uuid,
  index,
} from "drizzle-orm/pg-core";

const staging = pgSchema("staging");

export const stagingPostalCodes = staging.table(
  "postal_codes",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    state: text("state").notNull(),
    stateSlug: text("state_slug").notNull(),
    lga: text("lga").notNull(),
    lgaSlug: text("lga_slug"),
    areaName: text("area_name").notNull(),
    postOfficeName: text("post_office_name"),
    postalCode: text("postal_code").notNull(),
    regionDigit: integer("region_digit").notNull(),
    isVerified: boolean("is_verified").notNull().default(false),
    confidence: text("confidence").notNull(),
    sourceKind: text("source_kind").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceDate: date("source_date", { mode: "string" }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
    isValid: boolean("is_valid"),
    validationNote: text("validation_note"),
    flagged: boolean("flagged"),
    flaggedReason: text("flagged_reason"),
    migratedAt: timestamp("migrated_at", { withTimezone: true }),
    importBatchId: uuid("import_batch_id").notNull(),
  },
  (table) => [
    index("idx_staging_postal_codes_import_batch_id").on(table.importBatchId),
    index("idx_staging_postal_codes_state_slug").on(table.stateSlug),
    index("idx_staging_postal_codes_lga_slug").on(table.lgaSlug),
    index("idx_staging_postal_codes_postal_code").on(table.postalCode),
  ],
);
