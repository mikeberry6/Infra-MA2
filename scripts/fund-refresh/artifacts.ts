import { z } from "zod";
import { toCsv } from "../../src/lib/csv";
import type { FundRefreshCandidate, FundRefreshProposal, FundRefreshSnapshot } from "../../src/modules/funds/refresh-schema";
import { canonicalJson } from "./lib";

const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const sha256Value = z.string().regex(/^[a-f0-9]{64}$/);

export const fundRefreshCoverageArtifactSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("FUND_REFRESH_COVERAGE"),
  runId: z.string().trim().min(1),
  proposalHash: sha256Value,
  researchWindow: z.strictObject({ start: calendarDate, end: calendarDate }),
  managerCohort: z.union([z.literal("ALL"), z.number().int().min(0).max(3)]),
  knownManagerKeys: z.array(z.string().trim().min(1)),
  raisingFundIds: z.array(z.string().trim().min(1)),
  searchedManagerKeys: z.array(z.string().trim().min(1)),
  catchUpManagerCohorts: z.array(z.number().int().min(0).max(3)),
  priorSuccessfulCoverage: z.array(z.strictObject({
    runId: z.string().trim().min(1),
    researchWindowEnd: calendarDate,
    managerCohort: z.union([z.literal("ALL"), z.number().int().min(0).max(3)]),
    catchUpManagerCohorts: z.array(z.number().int().min(0).max(3)),
  })),
  discoveryInputs: z.array(z.string().trim().min(1)),
  sourceFailures: z.array(z.strictObject({
    scope: z.string().trim().min(1),
    url: z.string().url().nullable(),
    error: z.string().trim().min(1),
  })),
  unresolvedScope: z.array(z.string().trim().min(1)),
  outOfScopeUnknownManagers: z.array(z.string().trim().min(1)),
});

export const fundRefreshSourceHealthArtifactSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("FUND_REFRESH_SOURCE_HEALTH"),
  runId: z.string().trim().min(1),
  proposalHash: sha256Value,
  sources: z.array(z.strictObject({
    legacyId: z.string().trim().min(1),
    sourceId: z.string().trim().min(1),
    url: z.string().url(),
    evidenceLabel: z.string().trim().min(1),
    status: z.enum(["OPENED", "STALE", "FAILED", "BLOCKED"]),
    checkedAt: z.string().datetime({ offset: true }),
    httpStatus: z.number().int().min(100).max(599).nullable(),
    lastModifiedAt: z.string().datetime({ offset: true }).nullable(),
    error: z.string().trim().min(1).nullable(),
  })),
});

export const fundRefreshOwnershipArtifactSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("FUND_REFRESH_OWNERSHIP_IMPACT"),
  runId: z.string().trim().min(1),
  proposalHash: sha256Value,
  candidates: z.array(z.strictObject({
    legacyId: z.string().trim().min(1),
    matchedOwnershipPeriodCount: z.number().int().nonnegative(),
    matchedOwnershipVehicles: z.array(z.string().trim().min(1)),
    linkedOwnershipPeriodCount: z.number().int().nonnegative(),
    linkedCompanyIds: z.array(z.string().trim().min(1)),
    mutationProposed: z.literal(false),
    notes: z.string(),
  })),
});

function isSourceOnly(candidate: FundRefreshCandidate): boolean {
  return candidate.action === "VERIFY_NO_CHANGE" || (
    candidate.action === "UPDATE" &&
    candidate.changedFields.length > 0 &&
    candidate.changedFields.every((field) => field === "sourceUrls" || field === "strategyUrl")
  );
}

export function fundRefreshReviewPools(proposal: FundRefreshProposal): {
  mandatory: string[];
  lowerRisk: string[];
} {
  const mandatoryCandidates = proposal.candidates.filter((candidate) =>
    !isSourceOnly(candidate) ||
    candidate.confidence !== "HIGH" ||
    candidate.unresolvedQuestions.length > 0 ||
    candidate.action === "ARCHIVE_REVIEW",
  );
  const mandatorySet = new Set(mandatoryCandidates.map((candidate) => candidate.identity.legacyId));
  const lowerRisk = proposal.candidates
    .filter((candidate) => !mandatorySet.has(candidate.identity.legacyId))
    .map((candidate) => candidate.identity.legacyId)
    .sort();
  return {
    mandatory: [...mandatorySet].sort(),
    lowerRisk,
  };
}

export function renderFundRefreshFieldDiffCsv(proposal: FundRefreshProposal): string {
  const rows = proposal.candidates.flatMap((candidate) => {
    const fields = candidate.changedFields.length > 0 ? candidate.changedFields : ["(verification)"];
    return fields.map((field) => ({
      runId: proposal.runId,
      proposalHash: proposal.proposalHash,
      action: candidate.action,
      legacyId: candidate.identity.legacyId,
      managerName: candidate.identity.managerName,
      fundName: candidate.identity.fundName,
      field,
      before: JSON.stringify(candidate.before?.[field as keyof FundRefreshSnapshot] ?? null),
      after: JSON.stringify(candidate.after?.[field as keyof FundRefreshSnapshot] ?? null),
      confidence: candidate.confidence,
      evidenceUrls: candidate.evidence
        .filter((evidence) => field === "(verification)" || evidence.supportedFields.includes(field))
        .map((evidence) => evidence.url)
        .join("; "),
    }));
  });
  return toCsv(rows, [
    "runId", "proposalHash", "action", "legacyId", "managerName", "fundName", "field", "before", "after", "confidence", "evidenceUrls",
  ]);
}

function renderIdList(values: string[]): string {
  return values.length > 0 ? values.map((value) => `- ${value}`).join("\n") : "- None";
}

export function renderFundRefreshProReviewPacket(proposal: FundRefreshProposal): string {
  const pools = fundRefreshReviewPools(proposal);
  const candidateSections = proposal.candidates
    .map((candidate) => {
      const evidence = candidate.evidence.map((item) =>
        `  - ${item.sourceTier}/${item.scope}: ${item.url} — ${item.evidenceLabel} [${item.supportedFields.join(", ")}]`,
      ).join("\n");
      return [
        `### ${candidate.identity.legacyId} — ${candidate.action}`,
        `- Manager / fund: ${candidate.identity.managerName} / ${candidate.identity.fundName}`,
        `- Changed fields: ${candidate.changedFields.length > 0 ? candidate.changedFields.join(", ") : "verification only"}`,
        `- Confidence: ${candidate.confidence}`,
        `- Unresolved: ${candidate.unresolvedQuestions.length > 0 ? candidate.unresolvedQuestions.join(" | ") : "None"}`,
        `- Exact-name ownership matches: ${candidate.ownershipLinkImpact.matchedOwnershipPeriodCount} (${candidate.ownershipLinkImpact.matchedOwnershipVehicles.join(", ") || "none"})`,
        `- Fund-linked ownership rows / affected companies: ${candidate.ownershipLinkImpact.linkedOwnershipPeriodCount} / ${candidate.ownershipLinkImpact.linkedCompanyIds.join(", ") || "none"}`,
        "- Evidence:",
        evidence || "  - None",
      ].join("\n");
    }).join("\n\n");

  return [
    "# GPT-5.6 Pro fund-refresh review packet",
    "",
    `- Run ID: ${proposal.runId}`,
    `- Proposal hash: ${proposal.proposalHash}`,
    `- Base commit: ${proposal.baseCommit}`,
    `- Research window: ${proposal.researchWindow.start} through ${proposal.researchWindow.end}`,
    `- Live database fingerprint: ${proposal.liveDatabaseFingerprint}`,
    "",
    "## Mandatory review pool",
    "",
    renderIdList(pools.mandatory),
    "",
    "## Lower-risk sample-eligible pool",
    "",
    renderIdList(pools.lowerRisk),
    "",
    `At review time, sort SHA-256(\`<current PR head SHA>:<legacyId>\`) for this pool and review the first ceiling(10%) (${Math.ceil(pools.lowerRisk.length * 0.1)} candidate(s)). The final PR head is intentionally not embedded in this pre-commit artifact.`,
    "",
    "## Candidate details",
    "",
    candidateSections || "No candidates selected for detailed Pro review.",
    "",
    "Verdict must be tied to the current PR head SHA and this exact proposal path/hash. Any new commit invalidates it.",
    "",
  ].join("\n");
}

export function expectedOwnershipArtifact(proposal: FundRefreshProposal) {
  return proposal.candidates.map((candidate) => ({
    legacyId: candidate.identity.legacyId,
    matchedOwnershipPeriodCount: candidate.ownershipLinkImpact.matchedOwnershipPeriodCount,
    matchedOwnershipVehicles: [...candidate.ownershipLinkImpact.matchedOwnershipVehicles],
    linkedOwnershipPeriodCount: candidate.ownershipLinkImpact.linkedOwnershipPeriodCount,
    linkedCompanyIds: [...candidate.ownershipLinkImpact.linkedCompanyIds],
    mutationProposed: false as const,
    notes: candidate.ownershipLinkImpact.notes,
  }));
}

export function artifactValuesEqual(left: unknown, right: unknown): boolean {
  return canonicalJson(left) === canonicalJson(right);
}
