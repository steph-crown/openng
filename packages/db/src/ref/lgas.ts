import { serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { refSchema } from "./states";
import { states } from "./states";

export const lgas = refSchema.table(
  "lgas",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    headquarters: text("headquarters"),
    stateId: integer("state_id")
      .notNull()
      .references(() => states.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique("uq_lgas_slug_state").on(table.slug, table.stateId)],
);
