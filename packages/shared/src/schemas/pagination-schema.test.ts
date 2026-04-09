import { describe, expect, it } from "vitest";
import { paginationSchema } from "./pagination";

describe("paginationSchema", () => {
  it("accepts valid params", () => {
    const r = paginationSchema.safeParse({ page: "2", limit: "10", order: "desc" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.order).toBe("desc");
    }
  });

  it("rejects limit above 100", () => {
    const r = paginationSchema.safeParse({ limit: "200" });
    expect(r.success).toBe(false);
  });
});
