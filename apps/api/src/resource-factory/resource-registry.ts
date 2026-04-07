import type { ResourceConfig } from "./resource-config";

const resources: ResourceConfig[] = [];

export function registerResource(config: ResourceConfig): void {
  resources.push(config);
}

export function listRegisteredResources(): readonly ResourceConfig[] {
  return resources;
}
