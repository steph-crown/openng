import {
  pgTable,
  bigserial,
  integer,
  text,
  date,
  timestamp,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { states } from "../ref/states";
import { lgas } from "../ref/lgas";

export const postalCodes = pgTable(
  "postal_codes",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    stateId: integer("state_id")
      .notNull()
      .references(() => states.id),
    stateSlug: text("state_slug").notNull(),
    lgaId: integer("lga_id").references(() => lgas.id),
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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    uniqueIndex("uq_postal_codes_state_lga_area_code").on(
      table.stateId,
      table.lgaId,
      table.areaName,
      table.postalCode,
    ),
    index("idx_postal_codes_state_id").on(table.stateId),
    index("idx_postal_codes_state_slug").on(table.stateSlug),
    index("idx_postal_codes_state_lga").on(table.stateId, table.lgaId),
    index("idx_postal_codes_state_lga_slug").on(table.stateSlug, table.lgaSlug),
    index("idx_postal_codes_postal_code").on(table.postalCode),
    index("idx_postal_codes_area_name").on(table.areaName),
    index("idx_postal_codes_state_area_name").on(table.stateSlug, table.areaName),
  ],
);
