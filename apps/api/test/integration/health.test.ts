import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { healthBodySchema } from "../helpers/envelope";

describe("GET /health", () => {
  const app = createApp();

  it("returns JSON with db and cache fields", async () => {
    const res = await app.request("http://test/health", { method: "GET" });
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = healthBodySchema.safeParse(json);
    expect(parsed.success).toBe(true);
  });
});
