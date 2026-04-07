import type { PgTable } from "drizzle-orm/pg-core";

export type UpdateFrequency =
  | "static"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface FieldConfig {
  name: string;
  type: string;
  unit?: string;
  format?: string;
}

export interface FilterConfig {
  param: string;
  column: string;
  type: "exact" | "ilike" | "range_gte" | "range_lte" | "in";
}

export interface IndexConfig {
  columns: string[];
  type: "btree" | "hash";
  unique?: boolean;
}

export interface ResourceConfig {
  name: string;
  table: PgTable;
  description: string;
  version: string;
  updateFrequency: UpdateFrequency;
  source: string;
  sourceUrl: string;
  defaultSort: string;
  defaultSortOrder: "asc" | "desc";
  maxPageSize: number;
  filters: FilterConfig[];
  selectColumns: string[];
  fields: FieldConfig[];
  indexes: IndexConfig[];
  docsUrl: string;
}
