import { describe, expect, it } from "vitest";
import {
  legacyDashboardSignalApproval,
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
    ["historical signal outside the old public window", { observedAt: new Date("2026-06-01T00:00:00.000Z") }],
    ["unknown-source signal", { sourceId: "manual-import", sourceName: "Manual Import" }],
    ["source-run signal", { sourceRunId: "run-1" }],
    ["already hashed signal", { contentHash: "already-hashed" }],
    ["already reviewed signal", { reviewStatus: "REJECTED" as const }],
    ["sample signal", { metadata: { sample: true } }],
  ])("does not migrate a %s", (_label, overrides) => {
    expect(legacyDashboardSignalApproval(candidate(overrides), migrationStartedAt)).toBeNull();
  });
});
