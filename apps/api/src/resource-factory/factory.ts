import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  max,
  type SQL,
} from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@openng/db";
import { errorResponse, ErrorCode, successResponse } from "@openng/shared";
import { recordRequestError } from "../http/request-error";
import type { AppVariables } from "../types/context";
import { asDynamicSelect, selectedColumnsForResource } from "./dynamic-select";
import { buildFilters, mergeQueryParamValues } from "./filters";
import { serializeForJson } from "./json";
import { parsePagination } from "./pagination";
import { registerResource } from "./resource-registry";
import type { ResourceConfig } from "./resource-config";

type Executor = typeof db;

export type CreateResourceRouterOptions = {
  authMiddleware: MiddlewareHandler<{ Variables: AppVariables }>;
};

async function resolveLastUpdated(
  executor: Executor,
  table: PgTable,
  baseWhere: SQL | undefined,
): Promise<string> {
  const cols = getTableColumns(table);
  const updated = "updatedAt" in cols ? cols.updatedAt : undefined;
  if (!updated) {
    return new Date().toISOString();
  }
  const base = executor.select({ m: max(updated) }).from(table);
  const [row] = baseWhere ? await base.where(baseWhere) : await base;
  const v = row?.m;
  if (v instanceof Date) {
    return v.toISOString();
  }
  if (v) {
    return new Date(v as string | number).toISOString();
  }
  return new Date().toISOString();
}

function parsePositiveBigIntId(raw: string): bigint | null {
  if (!/^[1-9]\d*$/.test(raw)) {
    return null;
  }
  return BigInt(raw);
}

export function createResourceRouter(
  config: ResourceConfig,
  executor: Executor,
  options: CreateResourceRouterOptions,
) {
  registerResource(config);

  const router = new Hono<{ Variables: AppVariables }>();
  router.use("*", options.authMiddleware);

  router.get("/meta", async (c) => {
    try {
      const baseWhere = buildFilters({}, [], config.table);
      const last_updated = await resolveLastUpdated(executor, config.table, baseWhere);
      const data = {
        name: config.name,
        description: config.description,
        version: config.version,
        source_url: config.sourceUrl,
        update_frequency: config.updateFrequency,
        default_sort: config.defaultSort,
        default_sort_order: config.defaultSortOrder,
        max_page_size: config.maxPageSize,
        filters: config.filters,
        sortable_columns: config.selectColumns,
        fields: config.fields,
        indexes: config.indexes,
        docs_url: config.docsUrl,
      };
      return c.json(
        successResponse(data, {
          total: 0,
          page: 1,
          limit: 1,
          pages: 1,
          resource: config.name,
          last_updated,
          source_url: config.sourceUrl,
          update_frequency: config.updateFrequency,
        }),
      );
    } catch (err) {
      recordRequestError(c, err);
      return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
    }
  });

  router.get("/export", (c) => {
    return c.json(
      errorResponse(ErrorCode.NOT_IMPLEMENTED, "Export is not available yet"),
      501,
    );
  });

  router.get("/", async (c) => {
    try {
      const query = c.req.query();
      const pagination = parsePagination(query, config);
      const queryMulti = mergeQueryParamValues(c.req);
      const whereClause = buildFilters(queryMulti, config.filters, config.table);
      const cols = getTableColumns(config.table);
      const sortCol = cols[pagination.sort as keyof typeof cols];
      if (!sortCol) {
        return c.json(errorResponse(ErrorCode.INVALID_PARAM, "Invalid sort column"), 400);
      }
      const orderExpr =
        pagination.order === "asc" ? asc(sortCol) : desc(sortCol);
      const rawShape = selectedColumnsForResource(config.table, config.selectColumns);
      const selectShape = asDynamicSelect(rawShape);

      const countBase = executor.select({ n: count() }).from(config.table);
      const [countRow] = whereClause
        ? await countBase.where(whereClause)
        : await countBase;
      const total = Number(countRow?.n ?? 0);

      const listBase = executor.select(selectShape).from(config.table);
      const listFiltered = whereClause ? listBase.where(whereClause) : listBase;
      const rows = await listFiltered
        .orderBy(orderExpr)
        .limit(pagination.limit)
        .offset(pagination.offset);

      const pages = total === 0 ? 0 : Math.ceil(total / pagination.limit);
      const last_updated = await resolveLastUpdated(executor, config.table, whereClause);

      const data = rows.map((row) => serializeForJson(row));
      return c.json(
        successResponse(data, {
          total,
          page: pagination.page,
          limit: pagination.limit,
          pages,
          resource: config.name,
          last_updated,
          source_url: config.sourceUrl,
          update_frequency: config.updateFrequency,
        }),
      );
    } catch (err) {
      recordRequestError(c, err);
      return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
    }
  });

  router.get("/:id", async (c) => {
    try {
      const rawId = c.req.param("id");
      const id = parsePositiveBigIntId(rawId);
      if (id === null) {
        return c.json(errorResponse(ErrorCode.INVALID_PARAM, "Invalid id"), 400);
      }
      const cols = getTableColumns(config.table);
      const idCol = cols.id;
      if (!idCol) {
        return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Resource misconfigured"), 500);
      }
      const filters: SQL[] = [eq(idCol, id)];
      if ("isActive" in cols && cols.isActive) {
        filters.push(eq(cols.isActive, true));
      }
      const whereClause = filters.length === 1 ? filters[0]! : and(...filters);
      const rawShape = selectedColumnsForResource(config.table, config.selectColumns);
      const selectShape = asDynamicSelect(rawShape);
      const detailBase = executor
        .select(selectShape)
        .from(config.table)
        .where(whereClause)
        .limit(1);
      const [row] = await detailBase;
      if (!row) {
        return c.json(errorResponse(ErrorCode.NOT_FOUND, "Not found"), 404);
      }
      const last_updated = await resolveLastUpdated(executor, config.table, whereClause);
      return c.json(
        successResponse(serializeForJson(row), {
          total: 1,
          page: 1,
          limit: 1,
          pages: 1,
          resource: config.name,
          last_updated,
          source_url: config.sourceUrl,
          update_frequency: config.updateFrequency,
        }),
      );
    } catch (err) {
      recordRequestError(c, err);
      return c.json(errorResponse(ErrorCode.INTERNAL_ERROR, "Something went wrong"), 500);
    }
  });

  return router;
}
