import { describe, expect, it } from "vitest";
import { mergeQueryParamValues } from "../../src/resource-factory/filters";

describe("mergeQueryParamValues", () => {
  it("splits comma-separated values and dedupes", () => {
    const req = {
      queries: () => ({ year: ["2024,2025"] }),
    };
    expect(mergeQueryParamValues(req)).toEqual({ year: ["2024", "2025"] });
  });

  it("merges repeated keys with comma lists", () => {
    const req = {
      queries: () => ({ category: ["national", "religious"] }),
    };
    expect(mergeQueryParamValues(req)).toEqual({ category: ["national", "religious"] });
  });
});
