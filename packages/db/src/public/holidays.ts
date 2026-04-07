import {
  pgTable,
  bigserial,
  text,
  timestamp,
  boolean,
  integer,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const holidays = pgTable(
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
  },
  (table) => [
    uniqueIndex("uq_holidays_name_date").on(table.name, table.date),
    index("idx_holidays_year").on(table.year),
    index("idx_holidays_date").on(table.date),
    index("idx_holidays_category").on(table.category),
    index("idx_holidays_schedule_kind").on(table.scheduleKind),
    index("idx_holidays_is_confirmed").on(table.isConfirmed),
  ],
);
