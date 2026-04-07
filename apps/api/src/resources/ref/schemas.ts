import { z } from "zod";

const emptyToUndef = (s: string | undefined) => (s === "" ? undefined : s);

export const refStatesListQuerySchema = z.object({
  geo_zone: z.string().trim().max(128).optional(),
});

export const refSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(128),
});

export const refLgasListQuerySchema = z.object({
  state: z.string().trim().min(1).max(128),
  name: z.string().trim().max(200).optional(),
});

export function parseRefStatesQuery(q: Record<string, string | undefined>) {
  return refStatesListQuerySchema.safeParse({
    geo_zone: emptyToUndef(q.geo_zone),
  });
}

export function parseRefSlugParam(params: Record<string, string | undefined>) {
  return refSlugParamSchema.safeParse({
    slug: params.slug ?? "",
  });
}

export function parseRefLgasQuery(q: Record<string, string | undefined>) {
  return refLgasListQuerySchema.safeParse({
    state: q.state ?? "",
    name: emptyToUndef(q.name),
  });
}
