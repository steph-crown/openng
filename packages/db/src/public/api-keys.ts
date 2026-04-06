import { pgTable, bigserial, bigint, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const apiKeys = pgTable(
  "api_keys",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    userId: bigint("user_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id),
    keyHash: text("key_hash").unique().notNull(),
    keyPrefix: text("key_prefix").notNull(),
    name: text("name"),
    tier: text("tier").notNull().default("free"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_api_keys_key_hash").on(table.keyHash),
    index("idx_api_keys_user_id").on(table.userId),
  ],
);
