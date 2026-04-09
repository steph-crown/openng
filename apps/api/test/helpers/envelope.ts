import { z } from "zod";

const paginationMetaSchema = z
  .object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    pages: z.number(),
    resource: z.string(),
    last_updated: z.string(),
    source_url: z.string(),
  })
  .passthrough();

export const apiListSuccessSchema = z.object({
  success: z.literal(true),
  data: z.array(z.unknown()),
  meta: paginationMetaSchema,
});

export const apiDetailSuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  meta: paginationMetaSchema,
});

export const apiMetaSuccessSchema = z.object({
  success: z.literal(true),
  data: z.record(z.unknown()),
  meta: paginationMetaSchema,
});

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    docs: z.string(),
  }),
});

export const healthBodySchema = z.object({
  status: z.enum(["ok", "degraded"]),
  version: z.string(),
  db: z.enum(["ok", "error"]),
  cache: z.enum(["ok", "error", "skipped"]),
  uptime_seconds: z.number(),
});
