import { describe, expect, it } from "vitest";
import {
  nextDashboardSyncAt,
  nextNewsScanAt,
} from "@/modules/operations/pipeline-schedules";

describe("pipeline schedules", () => {
  it("uses the same-day 07:30 Eastern dashboard window when it is still ahead", () => {
    expect(nextDashboardSyncAt(new Date("2026-07-22T10:00:00.000Z")).toISOString())
      .toBe("2026-07-22T11:30:00.000Z");
  });

  it("skips weekends and applies the spring DST offset", () => {
    expect(nextDashboardSyncAt(new Date("2026-03-06T13:00:00.000Z")).toISOString())
      .toBe("2026-03-09T11:30:00.000Z");
  });

  it("skips weekends and applies the fall DST offset", () => {
    expect(nextDashboardSyncAt(new Date("2026-10-30T12:00:00.000Z")).toISOString())
      .toBe("2026-11-02T12:30:00.000Z");
  });

  it("moves to the next weekday when the dashboard window has started", () => {
    expect(nextDashboardSyncAt(new Date("2026-07-22T11:30:00.000Z")).toISOString())
      .toBe("2026-07-23T11:30:00.000Z");
  });

  it("keeps Friday's successful dashboard window current through the weekend", () => {
    const fridaySuccess = new Date("2026-07-24T11:35:00.000Z");
    const nextExpected = nextDashboardSyncAt(fridaySuccess);

    expect(nextExpected.toISOString()).toBe("2026-07-27T11:30:00.000Z");
    expect(nextExpected.getTime()).toBeGreaterThan(new Date("2026-07-26T23:59:59.999Z").getTime());
  });

  it("makes Friday's successful dashboard window overdue at Monday's scheduled boundary", () => {
    const nextExpected = nextDashboardSyncAt(new Date("2026-07-24T11:35:00.000Z"));

    expect(nextExpected.getTime()).toBeLessThanOrEqual(new Date("2026-07-27T11:30:00.000Z").getTime());
  });

  it("uses the fixed daily 23:30 UTC news schedule", () => {
    expect(nextNewsScanAt(new Date("2026-07-22T12:00:00.000Z")).toISOString())
      .toBe("2026-07-22T23:30:00.000Z");
    expect(nextNewsScanAt(new Date("2026-07-22T23:30:00.000Z")).toISOString())
      .toBe("2026-07-23T23:30:00.000Z");
  });
});
