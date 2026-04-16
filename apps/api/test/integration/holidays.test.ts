import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import {
  apiDetailSuccessSchema,
  apiErrorSchema,
  apiListSuccessSchema,
  apiMetaSuccessSchema,
} from "../helpers/envelope";

describe("/v1/holidays", () => {
  const app = createApp();
  let requestCounter = 1;

  async function request(url: string): Promise<Response> {
    const ip = `10.0.0.${requestCounter++}`;
    return await app.request(url, {
      method: "GET",
      headers: { "x-forwarded-for": ip },
    });
  }

  it("lists holidays with standard success envelope", async () => {
    const res = await request("http://test/v1/holidays?limit=10");
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiListSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data.length).toBeGreaterThanOrEqual(2);
      expect(parsed.data.meta.resource).toBe("holidays");
    }
  });

  it("filters by year", async () => {
    const res = await request("http://test/v1/holidays?year=2030&limit=20");
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiListSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      for (const row of parsed.data.data) {
        const r = row as { year?: number };
        expect(r.year).toBe(2030);
      }
    }
  });

  it("returns meta for resource", async () => {
    const res = await request("http://test/v1/holidays/meta");
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiMetaSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data.name).toBe("holidays");
      expect(Array.isArray(parsed.data.data.filters)).toBe(true);
    }
  });

  it("returns 400 for invalid id", async () => {
    const res = await request("http://test/v1/holidays/not-an-id");
    expect(res.status).toBe(400);
    const json: unknown = await res.json();
    const parsed = apiErrorSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.error.code).toBe("INVALID_PARAM");
    }
  });

  it("returns 404 for unknown id", async () => {
    const res = await request("http://test/v1/holidays/999999999999999999");
    expect(res.status).toBe(404);
    const json: unknown = await res.json();
    const parsed = apiErrorSchema.safeParse(json);
    expect(parsed.success).toBe(true);
  });

  it("returns a single row by id with detail envelope", async () => {
    const listRes = await request("http://test/v1/holidays?limit=1&year=2030");
    const listJson: unknown = await listRes.json();
    const listParsed = apiListSuccessSchema.safeParse(listJson);
    expect(listParsed.success).toBe(true);
    if (!listParsed.success) {
      return;
    }
    const first = listParsed.data.data[0] as { id?: string };
    expect(first.id).toBeDefined();
    const res = await request(`http://test/v1/holidays/${first.id}`);
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiDetailSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect((parsed.data.data as { name?: string }).name).toBeDefined();
    }
  });
});
