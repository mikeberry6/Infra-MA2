import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  fundRefreshProposalSchema,
  type FundRefreshCandidate,
  type FundRefreshEvidence,
  type FundRefreshProposal,
  type FundRefreshSnapshot,
} from "../../src/modules/funds/refresh-schema";
import {
  expectedOwnershipArtifact,
  renderFundRefreshFieldDiffCsv,
  renderFundRefreshProReviewPacket,
} from "../fund-refresh/artifacts";
import {
  REPO_ROOT,
  canonicalManagerKey,
  loadFundEvidenceManifest,
  loadFundManifestAtCommit,
  manifestRecordToSnapshot,
  parseCliArgs,
  proposalHash,
  requiredString,
} from "../fund-refresh/lib";

interface TrustedAudit {
  generatedAt: string;
  database: {
    fingerprint: string;
    foundations: unknown;
    snapshots: FundRefreshSnapshot[];
    ownership: {
      fingerprint: string;
      total: number;
      rows: Array<{
        vehicleName: string | null;
        fundId: string | null;
        companyId: string;
        fund: { legacyId: string; fundName: string } | null;
      }>;
    };
  };
}

interface TrustedSummary {
  auditedCommit: string;
  generatedAt: string;
  liveFunds: number;
  liveDatabaseFingerprint: string;
  liveFundFingerprint: string;
  ownershipFingerprint: string;
  ownershipRows: number;
  manifestOnly: number;
  liveOnly: number;
  driftedFunds: number;
}

function readJson<T>(input: string): T {
  return JSON.parse(readFileSync(path.resolve(REPO_ROOT, input), "utf8")) as T;
}

function writeJson(filePath: string, value: unknown): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function git(...args: string[]): string {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
  }).trim();
}

function ownershipImpact(
  snapshot: FundRefreshSnapshot,
  audit: TrustedAudit,
): FundRefreshCandidate["ownershipLinkImpact"] {
  const exactRows = audit.database.ownership.rows.filter(
    (row) => row.vehicleName === snapshot.fundName,
  );
  const linkedRows = audit.database.ownership.rows.filter(
    (row) => row.fund?.legacyId === snapshot.legacyId,
  );
  return {
    matchedOwnershipPeriodCount: exactRows.length,
    matchedOwnershipVehicles: [
      ...new Set(
        exactRows.flatMap((row) => (row.vehicleName ? [row.vehicleName] : [])),
      ),
    ].sort(),
    linkedOwnershipPeriodCount: linkedRows.length,
    linkedCompanyIds: [
      ...new Set(linkedRows.map((row) => row.companyId)),
    ].sort(),
    mutationProposed: false,
    notes:
      "Verification-only candidate; no OwnershipPeriod, portfolio-company, or ownership vehicle mutation is proposed.",
  };
}

function evidenceKey(
  legacyId: string,
  evidence: Pick<FundRefreshEvidence, "sourceId" | "url" | "evidenceLabel">,
): string {
  return [
    legacyId,
    evidence.sourceId,
    evidence.url,
    evidence.evidenceLabel,
  ].join("\u0000");
}

function main(): void {
  const args = parseCliArgs(process.argv.slice(2));
  const baseCommit = requiredString(args, "base-commit").toLowerCase();
  const runId = requiredString(args, "run-id");
  const sourceProposalPath = requiredString(args, "source-proposal");
  const sourceHealthPath = requiredString(args, "source-health");
  const sourceCoveragePath = requiredString(args, "source-coverage");
  const trustedAuditPath = requiredString(args, "trusted-audit");
  const trustedSummaryPath = requiredString(args, "trusted-summary");
  const outputDirectory = path.resolve(
    REPO_ROOT,
    requiredString(args, "output-directory"),
  );

  if (git("rev-parse", "HEAD") !== baseCommit) {
    throw new Error("--base-commit must equal the checked-out HEAD");
  }
  const sourceProposal = fundRefreshProposalSchema.parse(
    readJson<unknown>(sourceProposalPath),
  );
  const sourceHealth = readJson<{
    sources: Array<
      Record<string, unknown> & {
        legacyId: string;
        sourceId: string;
        url: string;
        evidenceLabel: string;
      }
    >;
  }>(sourceHealthPath);
  const sourceCoverage = readJson<Record<string, unknown>>(sourceCoveragePath);
  const audit = readJson<TrustedAudit>(trustedAuditPath);
  const trustedSummary = readJson<TrustedSummary>(trustedSummaryPath);
  if (trustedSummary.auditedCommit !== baseCommit) {
    throw new Error("Trusted summary is not bound to --base-commit");
  }
  if (
    trustedSummary.liveDatabaseFingerprint !== audit.database.fingerprint ||
    trustedSummary.ownershipFingerprint !== audit.database.ownership.fingerprint
  ) {
    throw new Error("Trusted audit and summary fingerprints differ");
  }

  const baseManifest = loadFundManifestAtCommit(baseCommit);
  const evidenceManifest = loadFundEvidenceManifest();
  const desiredById = new Map(
    baseManifest.funds.map((fund) => [fund.id, manifestRecordToSnapshot(fund)]),
  );
  const liveById = new Map(
    audit.database.snapshots.map((snapshot) => [snapshot.legacyId, snapshot]),
  );

  const creates = sourceProposal.candidates
    .filter((candidate) => candidate.action === "CREATE")
    .map((candidate) => {
      const after = desiredById.get(candidate.identity.legacyId);
      if (!after || liveById.has(candidate.identity.legacyId)) {
        throw new Error(
          `${candidate.identity.legacyId}: CREATE is absent from desired state or already live`,
        );
      }
      return {
        ...candidate,
        identity: {
          legacyId: after.legacyId,
          managerName: after.managerName,
          fundName: after.fundName,
        },
        after,
      } satisfies FundRefreshCandidate;
    });
  if (creates.length !== 15) {
    throw new Error(
      `Expected 15 lineage CREATE candidates, found ${creates.length}`,
    );
  }

  const verifications = sourceProposal.candidates
    .filter((candidate) => candidate.action === "VERIFY_NO_CHANGE")
    .map((candidate) => {
      const live = liveById.get(candidate.identity.legacyId);
      if (!live) {
        throw new Error(
          `${candidate.identity.legacyId}: verification fund is not live`,
        );
      }
      return {
        ...candidate,
        identity: {
          legacyId: live.legacyId,
          managerName: live.managerName,
          fundName: live.fundName,
        },
        before: live,
        after: live,
        changedFields: [],
        ownershipLinkImpact: ownershipImpact(live, audit),
      } satisfies FundRefreshCandidate;
    });
  if (verifications.length !== 40) {
    throw new Error(
      `Expected 40 raising-fund verifications, found ${verifications.length}`,
    );
  }

  const candidates = [...creates, ...verifications].sort((left, right) =>
    left.identity.legacyId.localeCompare(right.identity.legacyId),
  );
  const knownManagerKeys = [
    ...new Set(
      baseManifest.funds.map((fund) => canonicalManagerKey(fund.managerName)),
    ),
  ].sort();
  const raisingFundIds = baseManifest.funds
    .filter((fund) => fund.status === "Raising")
    .map((fund) => fund.id)
    .sort();
  const evidenceFunds = new Set(
    evidenceManifest.records.map((record) => record.legacyId),
  ).size;
  const unresolvedCandidates = candidates.filter(
    (candidate) =>
      candidate.unresolvedQuestions.length > 0 ||
      candidate.confidence !== "HIGH" ||
      candidate.action === "ARCHIVE_REVIEW",
  ).length;
  const artifactRoot = path
    .relative(REPO_ROOT, outputDirectory)
    .split(path.sep)
    .join("/");
  const draft = {
    schemaVersion: 1 as const,
    runId,
    generatedAt: audit.generatedAt,
    researchWindow: sourceProposal.researchWindow,
    baseCommit,
    liveDatabaseFingerprint: audit.database.fingerprint,
    coverage: {
      manifestFunds: baseManifest.funds.length,
      liveFunds: audit.database.snapshots.length,
      evidenceFunds,
      knownManagers: knownManagerKeys.length,
      raisingFunds: raisingFundIds.length,
      searchedManagers: knownManagerKeys.length,
      sourceFailures: 0,
      candidates: candidates.length,
      unresolvedCandidates,
      managerCohort: "ALL" as const,
      knownManagerKeys,
      raisingFundIds,
      searchedManagerKeys: knownManagerKeys,
    },
    modelConfiguration: sourceProposal.modelConfiguration,
    artifacts: {
      fieldDiffCsv: `${artifactRoot}/field-diff.csv`,
      coverageReport: `${artifactRoot}/coverage.json`,
      sourceHealthReport: `${artifactRoot}/source-health.json`,
      ownershipImpactReport: `${artifactRoot}/ownership-impact.json`,
      proReviewPacket: `${artifactRoot}/pro-review.md`,
    },
    candidates,
  };
  const proposal = fundRefreshProposalSchema.parse({
    ...draft,
    proposalHash: proposalHash(draft as FundRefreshProposal),
  });

  const reviewedEvidenceKeys = new Set(
    candidates.flatMap((candidate) =>
      candidate.evidence.map((evidence) =>
        evidenceKey(candidate.identity.legacyId, evidence),
      ),
    ),
  );
  const healthByKey = new Map(
    sourceHealth.sources.map((source) => [
      evidenceKey(source.legacyId, source),
      source,
    ]),
  );
  const healthSources = [...reviewedEvidenceKeys]
    .map((key) => {
      const health = healthByKey.get(key);
      if (!health)
        throw new Error(`Source health is missing reviewed evidence ${key}`);
      return health;
    })
    .sort(
      (left, right) =>
        left.legacyId.localeCompare(right.legacyId) ||
        left.url.localeCompare(right.url) ||
        left.evidenceLabel.localeCompare(right.evidenceLabel),
    );

  mkdirSync(outputDirectory, { recursive: true });
  writeJson(path.join(outputDirectory, "proposal.json"), proposal);
  writeFileSync(
    path.join(outputDirectory, "field-diff.csv"),
    renderFundRefreshFieldDiffCsv(proposal),
  );
  writeFileSync(
    path.join(outputDirectory, "pro-review.md"),
    renderFundRefreshProReviewPacket(proposal),
  );
  writeJson(path.join(outputDirectory, "coverage.json"), {
    ...sourceCoverage,
    runId,
    proposalHash: proposal.proposalHash,
    researchWindow: proposal.researchWindow,
    managerCohort: proposal.coverage.managerCohort,
    knownManagerKeys,
    raisingFundIds,
    searchedManagerKeys: knownManagerKeys,
    priorSuccessfulCoverage: [],
    catchUpManagerCohorts: [],
    sourceFailures: [],
  });
  writeJson(path.join(outputDirectory, "source-health.json"), {
    schemaVersion: 1,
    artifactType: "FUND_REFRESH_SOURCE_HEALTH",
    runId,
    proposalHash: proposal.proposalHash,
    sources: healthSources,
  });
  writeJson(path.join(outputDirectory, "ownership-impact.json"), {
    schemaVersion: 1,
    artifactType: "FUND_REFRESH_OWNERSHIP_IMPACT",
    runId,
    proposalHash: proposal.proposalHash,
    candidates: expectedOwnershipArtifact(proposal),
  });
  writeJson(path.join(outputDirectory, "trusted-live-audit-summary.json"), {
    schemaVersion: 1,
    artifactType: "FUND_REFRESH_TRUSTED_LIVE_AUDIT_SUMMARY",
    ...trustedSummary,
    foundations: audit.database.foundations,
  });
  writeFileSync(
    path.join(outputDirectory, "README.md"),
    [
      "# Reviewed lineage-fund production proposal (live-bound verification)",
      "",
      `- Proposal hash: ${proposal.proposalHash}`,
      `- Base commit: ${baseCommit}`,
      `- Trusted live funds: ${audit.database.snapshots.length}`,
      `- Creates: ${creates.length}`,
      `- Raising-fund live-state verifications: ${verifications.length}`,
      `- Ownership rows fingerprinted: ${audit.database.ownership.total}`,
      "- Existing fund names, manager assignments, strategy badges, and ownership links are not mutated.",
      "- Every CREATE candidate remains in the mandatory GPT-5.6 Pro review pool.",
      "",
    ].join("\n"),
  );

  process.stdout.write(
    `${JSON.stringify(
      {
        runId,
        proposalHash: proposal.proposalHash,
        candidates: candidates.length,
        creates: creates.length,
        verifications: verifications.length,
      },
      null,
      2,
    )}\n`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
