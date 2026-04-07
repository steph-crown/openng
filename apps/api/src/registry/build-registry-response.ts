import { successResponse } from "@openng/shared";
import { listRegisteredResources } from "../resource-factory/resource-registry";

export function buildRegistryResponse() {
  const resources = listRegisteredResources().map((r) => ({
    name: r.name,
    description: r.description,
    version: r.version,
    source_url: r.sourceUrl,
    update_frequency: r.updateFrequency,
  }));

  return successResponse(resources, {
    total: resources.length,
    page: 1,
    limit: Math.max(resources.length, 1),
    pages: 1,
    resource: "registry",
    last_updated: new Date().toISOString(),
    source_url: "https://openng.dev",
    update_frequency: "static",
  });
}
