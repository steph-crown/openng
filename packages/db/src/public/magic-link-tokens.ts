import { pgTable, bigserial, bigint, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const magicLinkTokens = pgTable(
  "magic_link_tokens",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    userId: bigint("user_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").unique().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_magic_link_tokens_token_hash").on(table.tokenHash),
    index("idx_magic_link_tokens_expires_at").on(table.expiresAt),
  ],
);
