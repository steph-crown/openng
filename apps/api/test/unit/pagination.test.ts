import { describe, expect, it } from "vitest";
import { parsePagination } from "../../src/resource-factory/pagination";
import { holidaysConfig } from "../../src/resources/holidays/config";

describe("parsePagination", () => {
  it("uses default sort from config when sort is missing", () => {
    const p = parsePagination({}, holidaysConfig);
    expect(p.sort).toBe("date");
    expect(p.order).toBe("asc");
    expect(p.page).toBe(1);
    expect(p.limit).toBe(50);
  });

  it("respects explicit sort when column is in selectColumns", () => {
    const p = parsePagination({ sort: "year", order: "desc" }, holidaysConfig);
    expect(p.sort).toBe("year");
    expect(p.order).toBe("desc");
  });

  it("caps limit at maxPageSize", () => {
    const p = parsePagination({ limit: "9999" }, holidaysConfig);
    expect(p.limit).toBe(100);
  });
});
