import { pgSchema, bigserial, bigint, text, smallint, timestamp } from "drizzle-orm/pg-core";
import { apiKeys } from "../public/api-keys";

export const analyticsSchema = pgSchema("analytics");

export const usageEvents = analyticsSchema.table("usage_events", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  apiKeyId: bigint("api_key_id", { mode: "bigint" }).references(() => apiKeys.id),
  resource: text("resource").notNull(),
  version: text("version").notNull(),
  status: smallint("status").notNull(),
  durationMs: smallint("duration_ms").notNull(),
  country: text("country"),
  ts: timestamp("ts", { withTimezone: true }).notNull().defaultNow(),
});
