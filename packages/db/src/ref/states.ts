import { pgSchema, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";

export const refSchema = pgSchema("ref");

export const states = refSchema.table("states", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  capital: text("capital").notNull(),
  slug: text("slug").unique().notNull(),
  code: text("code").unique().notNull(),
  isoCode: text("iso_code").unique().notNull(),
  geoZone: text("geo_zone").notNull(),
  latitude: numeric("latitude", { precision: 9, scale: 6 }),
  longitude: numeric("longitude", { precision: 9, scale: 6 }),
  areaSqKm: integer("area_sq_km"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
