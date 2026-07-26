import { describe, expect, it } from "vitest";
import { ADMIN_PAGE_SIZE, adminPagination } from "@/lib/admin-pagination";

describe("adminPagination", () => {
  it("uses a fixed 25-row first page", () => {
    expect(adminPagination(undefined, 60)).toEqual({
      page: 1,
      totalPages: 3,
      skip: 0,
      take: ADMIN_PAGE_SIZE,
    });
  });

  it("accepts URL-addressable pages and clamps past the final page", () => {
    expect(adminPagination("2", 60)).toEqual({
      page: 2,
      totalPages: 3,
      skip: 25,
      take: 25,
    });
    expect(adminPagination("999", 60)).toEqual({
      page: 3,
      totalPages: 3,
      skip: 50,
      take: 25,
    });
  });

  it("falls back safely for invalid pages and empty collections", () => {
    expect(adminPagination("-2", 0)).toEqual({
      page: 1,
      totalPages: 1,
      skip: 0,
      take: 25,
    });
    expect(adminPagination("private query", Number.NaN).page).toBe(1);
  });
});
