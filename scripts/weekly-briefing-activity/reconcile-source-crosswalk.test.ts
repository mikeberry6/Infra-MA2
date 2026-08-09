import { describe, expect, it } from "vitest";
import { loadArchiveIssues } from "./sources-archive";
import { loadSeedSnapshot } from "./sources-seed";
import { buildArchiveSeedCrosswalk, buildSeedProductionCrosswalk } from "./reconcile-crosswalk";

describe("archive-to-seed source reconciliation", () => {
  it("maps all appearances and collapses only the repeated transaction appearances", () => {
    const issues = loadArchiveIssues({ repoRoot: process.cwd(), cutoff: "2026-08-07" });
    const seed = loadSeedSnapshot({ repoRoot: process.cwd(), cutoff: "2026-08-07" });
    const result = buildArchiveSeedCrosswalk({ issues, seed: seed.records });

    expect(result.appearanceCount).toBe(335);
    expect(result.mappedAppearanceCount).toBe(335);
    expect(result.uniqueMappedSeedCount).toBe(333);
    expect(result.unmatchedAppearanceIds).toEqual([]);
    expect(result.seedOnlyLegacyIds).toHaveLength(70);
    expect(result.duplicateAppearanceGroups).toEqual([
      expect.objectContaining({
        seedLegacyId: "INF-2026-107",
        appearanceIds: ["EMAIL-2026-02-28-008", "EMAIL-2026-03-07-008"],
      }),
      expect.objectContaining({
        seedLegacyId: "INF-2026-197",
        appearanceIds: ["EMAIL-2026-04-25-009", "EMAIL-2026-05-02-010"],
      }),
    ]);
  });

  it("keeps fuzzy matches as suggestions rather than automatic links", () => {
    const seed = loadSeedSnapshot({ repoRoot: process.cwd(), cutoff: "2026-08-07" });
    const issues = loadArchiveIssues({ repoRoot: process.cwd(), cutoff: "2026-08-07" });
    const synthetic = structuredClone(issues[0]);
    synthetic.cards = [{
      ...synthetic.cards[0],
      appearanceId: "EMAIL-SYNTHETIC-001",
      target: "Completely New Target Name",
      sourceUrl: null,
      sourceUrlOrigin: "MISSING",
      recoveredCitationLegacyId: null,
    }];

    const row = buildArchiveSeedCrosswalk({ issues: [synthetic], seed: seed.records }).rows[0];
    expect(row.method).toBe("UNMATCHED");
    expect(row.seedLegacyId).toBeNull();
    expect(row.reviewRequired).toBe(true);
  });

  it("does not reuse an authoritative production identity for a later same-target seed row", () => {
    const original = loadSeedSnapshot({ repoRoot: process.cwd(), cutoff: "2026-08-07" }).records[0];
    const later = { ...original, legacyId: "SYNTHETIC-LATER", announcementDate: "2026-08-01T08:00:00.000Z" };
    const production = {
      ...original,
      databaseId: "database-1",
      citationUrls: original.sourceUrl ? [original.sourceUrl] : [],
    };

    expect(buildSeedProductionCrosswalk({ seed: [original, later], production: [production] })).toEqual([
      { seedLegacyId: original.legacyId, productionLegacyId: original.legacyId, method: "LEGACY_ID", reviewRequired: false },
      { seedLegacyId: "SYNTHETIC-LATER", productionLegacyId: null, method: "UNMATCHED", reviewRequired: true },
    ]);
  });
});
