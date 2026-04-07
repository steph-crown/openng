import { Hono } from "hono";
import { successResponse } from "@openng/shared";
import { listRegisteredResources } from "./resource-registry";
import type { AppVariables } from "./request-logger.middleware";

function buildRegistryResponse() {
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

export const globalMetaRouter = new Hono<{ Variables: AppVariables }>();

globalMetaRouter.get("/", (c) => {
  return c.json(buildRegistryResponse());
});

export const v1DiscoveryRouter = new Hono<{ Variables: AppVariables }>();

v1DiscoveryRouter.get("/", (c) => {
  return c.json(buildRegistryResponse());
});
