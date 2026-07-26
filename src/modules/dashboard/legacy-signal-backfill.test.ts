import { describe, expect, it } from "vitest";
import {
  legacyDashboardSignalApproval,
  selectLegacyDashboardSignalApprovals,
  type LegacyDashboardSignalCandidate,
} from "@/modules/dashboard/legacy-signal-backfill";

const migrationStartedAt = new Date("2026-07-22T19:00:00.000Z");

function candidate(overrides: Partial<LegacyDashboardSignalCandidate> = {}): LegacyDashboardSignalCandidate {
  return {
    id: "legacy-1",
    section: "policy-regulatory",
    title: "Legacy public signal",
    summary: "This signal was public before the review workflow existed.",
    direction: "needs_review",
    severity: 1,
    sourceId: "federal-register",
    sourceName: "Federal Register",
    sourceUrl: "https://www.federalregister.gov/example",
    sourceRunId: null,
    observedAt: new Date("2026-07-21T12:00:00.000Z"),
    reviewStatus: "PENDING",
    reviewedAt: null,
    reviewedById: null,
    contentHash: "",
    reviewedContentHash: null,
    metadata: null,
    createdAt: new Date("2026-07-21T12:00:00.000Z"),
    updatedAt: new Date("2026-07-21T12:00:00.000Z"),
    ...overrides,
  };
}

describe("legacy dashboard signal approval backfill", () => {
  it("binds a pre-migration public signal to a SHA-256 reviewed-content hash", () => {
    expect(legacyDashboardSignalApproval(candidate(), migrationStartedAt)).toEqual({
      id: "legacy-1",
      contentHash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });

  it.each([
    ["new signal", { createdAt: new Date("2026-07-22T19:00:00.001Z") }],
    ["stale signal outside the old public window", { updatedAt: new Date("2026-06-01T00:00:00.000Z") }],
    ["unknown-source signal", { sourceId: "manual-import", sourceName: "Manual Import" }],
    ["source-run signal", { sourceRunId: "run-1" }],
    ["already hashed signal", { contentHash: "already-hashed" }],
    ["already reviewed signal", { reviewStatus: "REJECTED" as const }],
    ["sample signal", { metadata: { sample: true } }],
  ])("does not migrate a %s", (_label, overrides) => {
    expect(legacyDashboardSignalApproval(candidate(overrides), migrationStartedAt)).toBeNull();
  });

  it("uses updatedAt for the rolling public window and observedAt only for ordering", () => {
    expect(legacyDashboardSignalApproval(candidate({
      observedAt: new Date("2020-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-07-22T18:00:00.000Z"),
    }), migrationStartedAt)).not.toBeNull();
    expect(legacyDashboardSignalApproval(candidate({
      observedAt: new Date("2026-07-22T18:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    }), migrationStartedAt)).toBeNull();
  });

  it("applies the public-page limit after eligibility so newer ineligible rows cannot starve a valid signal", () => {
    const ineligible = Array.from({ length: 250 }, (_, index) => candidate({
      id: `sample-${String(index).padStart(3, "0")}`,
      observedAt: new Date(`2026-07-22T18:${String(index % 60).padStart(2, "0")}:00.000Z`),
      metadata: { sample: true },
    }));
    const eligible = candidate({
      id: "eligible-older",
      observedAt: new Date("2026-07-20T12:00:00.000Z"),
    });

    expect(selectLegacyDashboardSignalApprovals(
      [...ineligible, eligible],
      migrationStartedAt,
      1,
    )).toEqual([expect.objectContaining({ id: "eligible-older" })]);
  });

  it("selects the deterministic newest eligible rows with id as the tie-breaker", () => {
    const selected = selectLegacyDashboardSignalApprovals([
      candidate({ id: "a", observedAt: new Date("2026-07-21T12:00:00.000Z") }),
      candidate({ id: "c", observedAt: new Date("2026-07-21T12:00:00.000Z") }),
      candidate({ id: "b", observedAt: new Date("2026-07-21T12:00:00.000Z") }),
      candidate({ id: "newest", observedAt: new Date("2026-07-22T12:00:00.000Z") }),
    ], migrationStartedAt, 3);

    expect(selected.map((item) => item.id)).toEqual(["newest", "c", "b"]);
  });

  it("rejects invalid limits", () => {
    expect(() => selectLegacyDashboardSignalApprovals([], migrationStartedAt, -1))
      .toThrow("non-negative integer");
  });
});
