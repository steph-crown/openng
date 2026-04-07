import { and, eq, getTableColumns, gte, ilike, inArray, lte, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { FilterConfig } from "./resource-config";

export function mergeQueryParamValues(req: {
  queries(): Record<string, string[]>;
}): Record<string, string[]> {
  const raw = req.queries();
  const result: Record<string, string[]> = {};
  for (const [k, vals] of Object.entries(raw)) {
    const expanded = vals.flatMap((v) =>
      v.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
    );
    if (expanded.length > 0) {
      result[k] = [...new Set(expanded)];
    }
  }
  return result;
}

function valuesForParam(
  queryMulti: Record<string, string[]>,
  param: string,
): string[] {
  return queryMulti[param] ?? [];
}

export function buildFilters(
  queryMulti: Record<string, string[]>,
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
    const vals = valuesForParam(queryMulti, fc.param);
    if (vals.length === 0) {
      continue;
    }

    switch (fc.type) {
      case "exact": {
        const raw = vals[0];
        if (raw === undefined || raw === "") {
          break;
        }
        if (fc.coerce === "boolean") {
          const lower = raw.toLowerCase();
          if (lower !== "true" && lower !== "false") {
            break;
          }
          parts.push(eq(col, lower === "true"));
          break;
        }
        parts.push(eq(col, raw));
        break;
      }
      case "ilike": {
        const raw = vals[0];
        if (raw === undefined || raw === "") {
          break;
        }
        parts.push(ilike(col, `%${raw}%`));
        break;
      }
      case "range_gte": {
        const raw = vals[0];
        if (raw === undefined || raw === "") {
          break;
        }
        parts.push(gte(col, raw));
        break;
      }
      case "range_lte": {
        const raw = vals[0];
        if (raw === undefined || raw === "") {
          break;
        }
        parts.push(lte(col, raw));
        break;
      }
      case "in": {
        if (fc.coerce === "integer") {
          const nums = vals
            .map((v) => parseInt(v, 10))
            .filter((n) => !Number.isNaN(n));
          if (nums.length === 0) {
            break;
          }
          parts.push(inArray(col, nums));
          break;
        }
        parts.push(inArray(col, vals));
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
