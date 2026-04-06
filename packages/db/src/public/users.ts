import { pgTable, bigserial, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    email: text("email").unique().notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [index("idx_users_email").on(table.email)],
);
