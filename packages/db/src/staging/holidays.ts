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

export const stagingHolidays = staging.table(
  "holidays",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    name: text("name").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    dayOfWeek: text("day_of_week").notNull(),
    category: text("category").notNull(),
    scheduleKind: text("schedule_kind").notNull(),
    year: integer("year").notNull(),
    isConfirmed: boolean("is_confirmed").notNull().default(true),
    observanceNote: text("observance_note"),
    sourceUrl: text("source_url").notNull(),
    sourceDate: date("source_date", { mode: "string" }).notNull(),
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
    index("idx_staging_holidays_import_batch_id").on(table.importBatchId),
    index("idx_staging_holidays_batch_name_date").on(table.importBatchId, table.name, table.date),
  ],
);
