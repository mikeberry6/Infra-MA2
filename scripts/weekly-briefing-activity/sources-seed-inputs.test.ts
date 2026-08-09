import { describe, expect, it } from "vitest";
import { RECOVERED_CITATIONS } from "./sources-citation-recovery";
import { loadSeedSnapshot } from "./sources-seed";

describe("weekly briefing seed input extraction", () => {
  it("freezes the 403 candidate records through August 7", () => {
    const first = loadSeedSnapshot({ repoRoot: process.cwd(), cutoff: "2026-08-07" });
    const second = loadSeedSnapshot({ repoRoot: process.cwd(), cutoff: "2026-08-07" });

    expect(first.recordCount).toBe(403);
    expect(first.recordsHash).toMatch(/^[a-f0-9]{64}$/);
    expect(second.recordsHash).toBe(first.recordsHash);
    expect(first.sourceFiles.map((file) => file.relativePath)).toEqual([
      "prisma/seed-data/deals.ts",
      "prisma/seed-data/weekly-briefing-deals.ts",
    ]);
  });

  it("accounts for every uncited row with recovered evidence", () => {
    const snapshot = loadSeedSnapshot({ repoRoot: process.cwd(), cutoff: "2026-08-07" });
    const recoveredIds = new Set(RECOVERED_CITATIONS.map((citation) => citation.legacyId));

    expect(snapshot.missingCitationLegacyIds).toHaveLength(16);
    expect(snapshot.missingCitationLegacyIds.every((legacyId) => recoveredIds.has(legacyId))).toBe(true);
    expect(RECOVERED_CITATIONS.find((citation) => citation.legacyId === "INF-2026-086")?.url)
      .toContain("masdar.ae/en/news/newsroom/exus-renewables");
  });
});
