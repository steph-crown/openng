import { and, eq, getTableColumns, gte, ilike, inArray, lte, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { FilterConfig } from "./resource-config";

export function buildFilters(
  query: Record<string, string | undefined>,
  filterConfigs: FilterConfig[],
  table: PgTable,
): SQL | undefined {
  const cols = getTableColumns(table);
  const parts: SQL[] = [];

  if ("isActive" in cols) {
    const ac = cols.isActive;
    if (ac) {
      parts.push(eq(ac, true));
    }
  }

  for (const fc of filterConfigs) {
    const col = cols[fc.column as keyof typeof cols];
    if (!col) {
      continue;
    }
    const raw = query[fc.param];
    if (raw === undefined || raw === "") {
      continue;
    }

    switch (fc.type) {
      case "exact":
        parts.push(eq(col, raw));
        break;
      case "ilike":
        parts.push(ilike(col, `%${raw}%`));
        break;
      case "range_gte":
        parts.push(gte(col, raw));
        break;
      case "range_lte":
        parts.push(lte(col, raw));
        break;
      case "in": {
        const values = raw
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        if (values.length > 0) {
          parts.push(inArray(col, values));
        }
        break;
      }
      default:
        break;
    }
  }

  if (parts.length === 0) {
    return undefined;
  }
  return and(...parts);
}
