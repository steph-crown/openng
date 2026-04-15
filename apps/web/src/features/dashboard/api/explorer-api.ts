import { buildApiUrl } from "../../../lib/api-base-url";
import { getResourceById } from "../data/resource-catalog";

export type ResourceMeta = {
  name: string;
  description: string;
  source_url: string;
  update_frequency: string;
  default_sort: string;
  default_sort_order: "asc" | "desc";
  filters: Array<{
    param: string;
    type: "exact" | "ilike" | "range_gte" | "range_lte" | "in";
    coerce?: "boolean" | "integer";
  }>;
  sortable_columns: string[];
  fields: Array<{
    name: string;
    type: string;
    format?: string;
  }>;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    resource: string;
    last_updated: string;
    source_url: string;
    update_frequency?: string;
  };
};

export type ListQuery = {
  resourceId: string;
  params: Record<string, string | number | undefined>;
};

export async function fetchResourceMeta(resourceId: string): Promise<ResourceMeta | null> {
  const resource = getResourceById(resourceId);
  if (!resource || resource.status !== "live") {
    return null;
  }
  const response = await fetch(buildApiUrl(`/v1/${resourceId}/meta`), {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch resource metadata");
  }
  const json = (await response.json()) as ApiEnvelope<ResourceMeta>;
  return json.data;
}

export async function fetchResourceList(query: ListQuery) {
  const resource = getResourceById(query.resourceId);
  if (!resource || resource.status !== "live") {
    return null;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query.params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const path = `/v1/${query.resourceId}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(buildApiUrl(path), {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch resource records");
  }
  const json = (await response.json()) as ApiEnvelope<Array<Record<string, unknown>>>;
  return json;
}
