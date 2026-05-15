import { describe, expect, it } from "vitest";
import { formatDate, parseDateInput } from "./format";

describe("date formatting", () => {
  it("parses date-only inputs at UTC noon", () => {
    expect(parseDateInput("2026-05-15")?.toISOString()).toBe("2026-05-15T12:00:00.000Z");
  });

  it("formats dates using the UTC calendar day", () => {
    expect(formatDate("2026-05-15T00:00:00.000Z")).toBe("May 15, 2026");
  });
});
