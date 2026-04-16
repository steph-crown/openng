import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import {
  apiDetailSuccessSchema,
  apiErrorSchema,
  apiListSuccessSchema,
  apiMetaSuccessSchema,
} from "../helpers/envelope";

describe("/v1/postal-codes", () => {
  const app = createApp();
  let requestCounter = 1;

  async function request(url: string): Promise<Response> {
    const ip = `10.1.0.${requestCounter++}`;
    return await app.request(url, {
      method: "GET",
      headers: { "x-forwarded-for": ip },
    });
  }

  it("lists postal codes with standard success envelope", async () => {
    const res = await request("http://test/v1/postal-codes?limit=10");
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiListSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.meta.resource).toBe("postal-codes");
      expect(parsed.data.data.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("filters by state only", async () => {
    const res = await request("http://test/v1/postal-codes?state=lagos");
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiListSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      for (const row of parsed.data.data) {
        expect((row as { stateSlug?: string }).stateSlug).toBe("lagos");
      }
    }
  });

  it("filters by lga only", async () => {
    const res = await request("http://test/v1/postal-codes?lga=ikeja");
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiListSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      for (const row of parsed.data.data) {
        expect((row as { lgaSlug?: string }).lgaSlug).toBe("ikeja");
      }
    }
  });

  it("filters by area only", async () => {
    const res = await request("http://test/v1/postal-codes?area=Ala");
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiListSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("filters by postal_code", async () => {
    const res = await request("http://test/v1/postal-codes?postal_code=100271");
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiListSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data).toHaveLength(1);
      expect((parsed.data.data[0] as { postalCode?: string }).postalCode).toBe("100271");
    }
  });

  it("returns meta for resource", async () => {
    const res = await request("http://test/v1/postal-codes/meta");
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiMetaSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.data.name).toBe("postal-codes");
    }
  });

  it("returns 404 for unknown id", async () => {
    const res = await request("http://test/v1/postal-codes/999999999999999999");
    expect(res.status).toBe(404);
    const json: unknown = await res.json();
    const parsed = apiErrorSchema.safeParse(json);
    expect(parsed.success).toBe(true);
  });

  it("returns a single row by id", async () => {
    const listRes = await request("http://test/v1/postal-codes?limit=1&state=lagos");
    const listJson: unknown = await listRes.json();
    const listParsed = apiListSuccessSchema.safeParse(listJson);
    expect(listParsed.success).toBe(true);
    if (!listParsed.success) {
      return;
    }
    const first = listParsed.data.data[0] as { id?: string };
    expect(first.id).toBeDefined();
    const res = await request(`http://test/v1/postal-codes/${first.id}`);
    expect(res.status).toBe(200);
    const json: unknown = await res.json();
    const parsed = apiDetailSuccessSchema.safeParse(json);
    expect(parsed.success).toBe(true);
  });
});
