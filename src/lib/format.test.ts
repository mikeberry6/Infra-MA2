import { describe, expect, it } from "vitest";
import { formatDate, formatScheduledDateTime, parseDateInput } from "./format";

describe("date formatting", () => {
  it("parses date-only inputs at UTC noon", () => {
    expect(parseDateInput("2026-05-15")?.toISOString()).toBe("2026-05-15T12:00:00.000Z");
  });

  it("formats dates using the UTC calendar day", () => {
    expect(formatDate("2026-05-15T00:00:00.000Z")).toBe("May 15, 2026");
  });

  it("labels scheduled instants in their documented time zone", () => {
    expect(formatScheduledDateTime("2026-07-23T11:30:00.000Z", "America/New_York"))
      .toBe("Jul 23, 2026, 7:30 AM EDT");
    expect(formatScheduledDateTime("2026-07-22T23:30:00.000Z", "UTC"))
      .toBe("Jul 22, 2026, 11:30 PM UTC");
  });
});
