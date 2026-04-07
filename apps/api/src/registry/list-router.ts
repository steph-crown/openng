import { Hono } from "hono";
import type { AppVariables } from "../types/context";
import { buildRegistryResponse } from "./build-registry-response";

export function createRegistryListRouter() {
  const router = new Hono<{ Variables: AppVariables }>();
  router.get("/", (c) => {
    return c.json(buildRegistryResponse());
  });
  return router;
}
