import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadArchiveIssues } from "./sources-archive";
import { loadSeedSnapshot } from "./sources-seed";
import { buildArchiveSeedCrosswalk } from "./reconcile-crosswalk";
import { buildUniverseVarianceReport } from "./reconcile-variance";

describe("truth-first YTD variance report", () => {
  it("reports candidate deltas against both controls without forcing either total", () => {
    const issues = loadArchiveIssues({ repoRoot: process.cwd(), cutoff: "2026-08-07" });
    const seed = loadSeedSnapshot({ repoRoot: process.cwd(), cutoff: "2026-08-07" });
    const reconciliation = buildArchiveSeedCrosswalk({ issues, seed: seed.records });
    const frozenArchive = JSON.parse(readFileSync(join(
      process.cwd(),
      "audits/weekly-briefing-activity/2026-08-07/inputs/archive.json",
    ), "utf8")) as {
      issues: Array<{
        issueDate: string;
        ytdSectorControls: Parameters<typeof buildUniverseVarianceReport>[0]["publishedSectorControls"];
        ytdRegionControls: Parameters<typeof buildUniverseVarianceReport>[0]["publishedRegionControls"];
      }>;
    };
    const published = frozenArchive.issues.find(
      (issue) => issue.issueDate === "2026-08-07",
    );
    expect(published).toBeDefined();
    const report = buildUniverseVarianceReport({
      seed: seed.records,
      reconciliation,
      publishedSectorControls: published!.ytdSectorControls,
      publishedRegionControls: published!.ytdRegionControls,
    });

    expect(report.candidateTotal).toBe(403);
    expect(report.controls).toEqual([
      { name: "PUBLISHED_2026_08_07", total: 393, candidateDelta: 10 },
      { name: "CORRECTED_CARRY_FORWARD_HYPOTHESIS", total: 398, candidateDelta: 5 },
    ]);
    expect(Object.fromEntries(report.sectorRows.map((row) => [row.label, row.delta]))).toEqual({
      "Power & ET": 4,
      Utilities: 2,
      Digital: 1,
      Midstream: 0,
      Transportation: 3,
      "Social Infra": 0,
    });
  });

  it("surfaces all known geography parser corrections before totals freeze", () => {
    const issues = loadArchiveIssues({ repoRoot: process.cwd(), cutoff: "2026-08-07" });
    const seed = loadSeedSnapshot({ repoRoot: process.cwd(), cutoff: "2026-08-07" });
    const report = buildUniverseVarianceReport({
      seed: seed.records,
      reconciliation: buildArchiveSeedCrosswalk({ issues, seed: seed.records }),
      publishedSectorControls: issues.at(-1)!.ytdSectorControls,
      publishedRegionControls: issues.at(-1)!.ytdRegionControls,
    });

    expect(report.geographyCorrectionCandidates).toHaveLength(8);
    expect(report.geographyCorrectionCandidates).toEqual(expect.arrayContaining([
      expect.objectContaining({ legacyId: "WB-2026-08-07-005", expectedRegion: "Europe" }),
      expect.objectContaining({ legacyId: "WB-2026-08-07-006", expectedRegion: "Asia-Pacific" }),
      expect.objectContaining({ legacyId: "INF-2026-189", expectedRegion: "North America" }),
      expect.objectContaining({ legacyId: "WB-2026-07-31-016", expectedRegion: "Middle East & Africa" }),
    ]));
  });
});
