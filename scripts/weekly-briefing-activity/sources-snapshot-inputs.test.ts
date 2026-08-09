import { describe, expect, it } from "vitest";
import { sha256Canonical } from "./sources-normalize";
import { captureWeeklyActivityInputs, verifyWeeklyActivityInputHash } from "./sources-snapshot";
import type { ProductionSnapshot } from "./sources-types";

describe("weekly activity input snapshot", () => {
  it("binds archive, seed, production status, citation recoveries, and Git history into one hash", async () => {
    const production: ProductionSnapshot = {
      status: "NOT_CONFIGURED",
      cutoff: "2026-08-07",
      queryContract: "PUBLISHED_DEALS_THROUGH_CUTOFF_READ_ONLY",
      recordCount: 0,
      recordsHash: sha256Canonical([]),
      records: [],
      reason: "Test fixture",
    };
    const snapshot = await captureWeeklyActivityInputs({
      repoRoot: process.cwd(),
      cutoff: "2026-08-07",
      production,
    });

    expect(snapshot.issues).toHaveLength(25);
    expect(snapshot.seed.recordCount).toBe(403);
    expect(snapshot.recoveredCitations).toHaveLength(16);
    expect(snapshot.gitHistory.paths).toHaveLength(28);
    expect(snapshot.gitHistory.paths.find((entry) => entry.relativePath === "public/email-format/2026-07-03.html")
      ?.entries.map((entry) => entry.commit)).toContain("a3d6860b50e2fdddb805962c5d2e7a2b9f346b94");
    expect(verifyWeeklyActivityInputHash(snapshot)).toBe(true);
    expect(verifyWeeklyActivityInputHash({ ...snapshot, cutoff: "2026-08-08" })).toBe(false);
  }, 15_000);
});
