import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
