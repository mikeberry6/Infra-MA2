import { RECOVERED_CITATIONS } from "./sources-citation-recovery";
import { loadArchiveIssues } from "./sources-archive";
import { captureGitHistory } from "./sources-git";
import { sha256Canonical } from "./sources-normalize";
import { captureConfiguredProductionSnapshot } from "./sources-production";
import { loadSeedSnapshot } from "./sources-seed";
import type { ProductionSnapshot, WeeklyActivityInputSnapshot } from "./sources-types";

const RELEVANT_NON_ISSUE_PATHS = [
  "prisma/seed-data/deals.ts",
  "prisma/seed-data/weekly-briefing-deals.ts",
  "audits/deal-portco-flowthrough-2026-05-05.md",
] as const;

export async function captureWeeklyActivityInputs(input: {
  repoRoot: string;
  cutoff: string;
  production?: ProductionSnapshot;
  connectionString?: string;
}): Promise<WeeklyActivityInputSnapshot> {
  const issues = loadArchiveIssues({ repoRoot: input.repoRoot, cutoff: input.cutoff });
  const seed = loadSeedSnapshot({ repoRoot: input.repoRoot, cutoff: input.cutoff });
  const production = input.production ?? await captureConfiguredProductionSnapshot({
    cutoff: input.cutoff,
    connectionString: input.connectionString,
  });
  const gitHistory = captureGitHistory({
    repoRoot: input.repoRoot,
    relativePaths: [
      ...issues.map((issue) => issue.file.relativePath),
      ...RELEVANT_NON_ISSUE_PATHS,
    ],
  });
  const recoveredCitations = [...RECOVERED_CITATIONS].sort((left, right) =>
    left.legacyId.localeCompare(right.legacyId));
  const withoutHash = {
    schemaVersion: 1 as const,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_INPUT_SNAPSHOT" as const,
    cutoff: input.cutoff,
    issues,
    recoveredCitations,
    seed,
    production,
    gitHistory,
  };

  return {
    ...withoutHash,
    snapshotHash: sha256Canonical(withoutHash),
  };
}

export function verifyWeeklyActivityInputHash(snapshot: WeeklyActivityInputSnapshot): boolean {
  const { snapshotHash, ...withoutHash } = snapshot;
  return snapshotHash === sha256Canonical(withoutHash);
}
