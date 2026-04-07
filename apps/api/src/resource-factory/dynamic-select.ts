import { getTableColumns } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export function selectedColumnsForResource(table: PgTable, names: string[]): Record<string, unknown> {
  const cols = getTableColumns(table);
  const out: Record<string, unknown> = {};
  for (const name of names) {
    const col = cols[name as keyof typeof cols];
    if (col) {
      out[name] = col;
    }
  }
  return out;
}

export function asDynamicSelect(fields: Record<string, unknown>) {
  return fields as never;
}
