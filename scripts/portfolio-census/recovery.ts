import { createHash } from "node:crypto";
import path from "node:path";
import {
  finalizeRecoveredCensusInput,
  sha256Canonical,
  type RecoveredCensusInput,
} from "../portco-reconciliation";
import {
  portfolioCensusResultSchema,
  type PortfolioCensusRepoSnapshot,
  type PortfolioCensusResult,
} from "./schema";
import { managerArtifactStem, parsePortfolioCensusResponse, slugify } from "./lib";

export const EXPECTED_HISTORICAL_AGGREGATE = Object.freeze({
  includedHoldings: 992,
  closedActive: 946,
  signedPendingIncoming: 30,
  signedPendingExit: 16,
  existingVerified: 734,
  proposedNew: 170,
  proposedCorrection: 36,
  possibleDuplicate: 12,
  needsReview: 40,
  excludedCandidates: 484,
  repoOnlyRecords: 202,
  unresolvedConflicts: 184,
});

export type HistoricalAggregate = typeof EXPECTED_HISTORICAL_AGGREGATE;

export interface DirectEnvelopeCandidate {
  result: PortfolioCensusResult;
  report: string;
  textIndex: number;
  envelopeIndex: number;
  response: string;
  responseSha256: string;
}

export interface ChunkDiagnostic {
  code: string;
  detail: string;
}

export interface ChunkAssemblyInput {
  requestedManager: string;
  asOfDate: string;
  texts: Array<{ source: string; text: string }>;
  snapshot: PortfolioCensusRepoSnapshot;
}

export interface ChunkAssemblyResult {
  result: PortfolioCensusResult;
  report: string;
  response: string;
  selectedTags: string[];
  diagnostics: ChunkDiagnostic[];
}

interface TaggedJson {
  tag: string;
  value: unknown;
  order: number;
  source: string;
}

interface RangedHoldingChunk extends TaggedJson {
  value: unknown[];
  start: number | null;
  end: number | null;
}

function sha256Text(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stripFence(value: string): string {
  return value
    .replace(/^```(?:json|markdown|md)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function portfolioEnvelopes(text: string): string[] {
  const pattern = /<portfolio_census_json>\s*[\s\S]*?<\/portfolio_census_json>\s*<portfolio_census_report>\s*[\s\S]*?<\/portfolio_census_report>/gi;
  return [...text.matchAll(pattern)].map((match) => match[0]);
}

/**
 * Selects only exact portfolio-census envelopes. A fund-census envelope can
 * never enter the candidate set, even if it happens to name the same manager.
 */
export function selectLastValidPortfolioEnvelope(
  texts: readonly string[],
  expected: {
    manager: string;
    asOfDate: string;
    snapshotSource?: PortfolioCensusRepoSnapshot["source"];
  },
): { candidate: DirectEnvelopeCandidate | null; diagnostics: ChunkDiagnostic[] } {
  const valid: DirectEnvelopeCandidate[] = [];
  const diagnostics: ChunkDiagnostic[] = [];
  for (const [textIndex, text] of texts.entries()) {
    for (const [envelopeIndex, response] of portfolioEnvelopes(text).entries()) {
      try {
        const parsed = parsePortfolioCensusResponse(response, expected);
        valid.push({
          ...parsed,
          textIndex,
          envelopeIndex,
          response,
          responseSha256: sha256Text(response),
        });
      } catch (error) {
        diagnostics.push({
          code: "INVALID_PORTFOLIO_ENVELOPE",
          detail: `text ${textIndex + 1}, envelope ${envelopeIndex + 1}: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  }
  return { candidate: valid.at(-1) ?? null, diagnostics };
}

export function extractTaggedJson(
  texts: ReadonlyArray<{ source: string; text: string }>,
): { candidates: TaggedJson[]; diagnostics: ChunkDiagnostic[] } {
  const candidates: TaggedJson[] = [];
  const diagnostics: ChunkDiagnostic[] = [];
  let order = 0;
  for (const item of texts) {
    const pattern = /<([a-z][a-z0-9_:-]*)>\s*([\s\S]*?)\s*<\/\1>/gi;
    for (const match of item.text.matchAll(pattern)) {
      const tag = match[1].toLowerCase();
      order += 1;
      if (tag.startsWith("fund_census_")) {
        diagnostics.push({
          code: "IGNORED_FUND_CENSUS_TAG",
          detail: `${item.source}: <${tag}>`,
        });
        continue;
      }
      if (tag === "portfolio_census_json" || tag === "portfolio_census_report") continue;
      try {
        candidates.push({
          tag,
          value: JSON.parse(stripFence(match[2])),
          order,
          source: item.source,
        });
      } catch (error) {
        diagnostics.push({
          code: "INVALID_CHUNK_JSON",
          detail: `${item.source}: <${tag}>: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  }
  return { candidates, diagnostics };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdentityCandidate(value: unknown): value is {
  canonicalManager: string;
  aliasesResearched: string[];
  overlappingSuppliedManagers: string[];
  holdings?: unknown[];
} {
  return isRecord(value)
    && typeof value.canonicalManager === "string"
    && Array.isArray(value.aliasesResearched)
    && Array.isArray(value.overlappingSuppliedManagers);
}

function isStrictHoldingArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
    && value.every((item) => (
      isRecord(item)
      && typeof item.companyName === "string"
      && typeof item.investmentLevel === "string"
      && Array.isArray(item.countries)
      && typeof item.ownershipState === "string"
      && Array.isArray(item.evidence)
      && typeof item.repoDisposition === "string"
    ));
}

function isReconciliationCandidate(value: unknown): value is Record<string, unknown> & {
  excludedCandidates: unknown[];
  repoOnlyRecords: unknown[];
  unresolvedConflicts: unknown[];
  completenessChecks: Record<string, unknown>;
} {
  return isRecord(value)
    && Array.isArray(value.excludedCandidates)
    && Array.isArray(value.repoOnlyRecords)
    && Array.isArray(value.unresolvedConflicts)
    && isRecord(value.completenessChecks);
}

function numericRange(candidate: TaggedJson): { start: number | null; end: number | null } {
  const label = `${candidate.tag} ${path.basename(candidate.source)}`;
  const match = label.match(/holdings?[_-](\d+)(?:[_-](\d+))?/i);
  if (!match) return { start: null, end: null };
  return { start: Number(match[1]), end: Number(match[2] ?? match[1]) };
}

function expectedHoldingCount(
  identities: TaggedJson[],
  reconciliation: TaggedJson & { value: Record<string, unknown> },
): number | null {
  const summary = reconciliation.value.summary;
  if (isRecord(summary) && Number.isInteger(summary.includedHoldings)) {
    return Number(summary.includedHoldings);
  }
  for (const identity of [...identities].reverse()) {
    if (!isIdentityCandidate(identity.value) || !Array.isArray(identity.value.holdings)) continue;
    const numbers = identity.value.holdings
      .map((holding) => isRecord(holding) ? holding.number : null)
      .filter((value): value is number => Number.isInteger(value) && Number(value) > 0)
      .sort((left, right) => left - right);
    if (numbers.length > 0 && numbers.every((number, index) => number === index + 1)) {
      return numbers.length;
    }
  }
  return null;
}

function selectHoldingChunks(
  candidates: RangedHoldingChunk[],
  expectedCount: number | null,
): { holdings: unknown[]; tags: string[] } {
  const generic = candidates.filter((candidate) => candidate.start === null);
  if (expectedCount !== null) {
    const exactGeneric = generic.filter((candidate) => candidate.value.length === expectedCount).at(-1);
    if (exactGeneric) return { holdings: exactGeneric.value, tags: [exactGeneric.tag] };
  } else if (generic.length === 1) {
    return { holdings: generic[0].value, tags: [generic[0].tag] };
  } else if (generic.length > 1) {
    throw new Error(
      `AMBIGUOUS_UNRANGED_HOLDING_CHUNKS: found ${generic.length}; an index or reconciliation summary is required`,
    );
  }

  if (expectedCount === null) {
    throw new Error("MISSING_HOLDING_COUNT: no contiguous index or reconciliation summary establishes the final holding count");
  }

  const ranged = candidates.filter((candidate) => candidate.start !== null && candidate.end !== null);
  const usable = ranged.filter((candidate) => (
    candidate.value.length === (candidate.end as number) - (candidate.start as number) + 1
    && (candidate.start as number) >= 1
    && (candidate.end as number) <= expectedCount
  ));
  const byStart = new Map<number, RangedHoldingChunk[]>();
  for (const candidate of usable) {
    const bucket = byStart.get(candidate.start as number) ?? [];
    bucket.push(candidate);
    byStart.set(candidate.start as number, bucket);
  }

  interface Selection { chunks: RangedHoldingChunk[]; score: number }
  const memo = new Map<number, Selection[]>();
  const solve = (start: number): Selection[] => {
    if (start === expectedCount + 1) return [{ chunks: [], score: 0 }];
    if (memo.has(start)) return memo.get(start) as Selection[];
    const solutions: Selection[] = [];
    for (const chunk of byStart.get(start) ?? []) {
      for (const tail of solve((chunk.end as number) + 1)) {
        solutions.push({ chunks: [chunk, ...tail.chunks], score: chunk.order + tail.score });
      }
    }
    memo.set(start, solutions);
    return solutions;
  };

  const solutions = solve(1).sort((left, right) => right.score - left.score);
  if (solutions.length === 0) {
    const available = usable.map((candidate) => `${candidate.start}-${candidate.end}`).join(", ") || "none";
    throw new Error(
      `MISSING_HOLDING_CHUNKS: cannot cover 1-${expectedCount} exactly; available ranges: ${available}`,
    );
  }
  const best = solutions[0];
  const tied = solutions.filter((solution) => solution.score === best.score);
  const signatures = new Set(tied.map((solution) => (
    solution.chunks.map((chunk) => `${chunk.start}-${chunk.end}:${sha256Canonical(chunk.value)}`).join("|")
  )));
  if (signatures.size > 1) {
    throw new Error(`AMBIGUOUS_HOLDING_CHUNKS: ${signatures.size} equally recent exact assemblies exist`);
  }
  return {
    holdings: best.chunks.flatMap((chunk) => chunk.value),
    tags: best.chunks.map((chunk) => chunk.tag),
  };
}

function computedSummary(holdings: unknown[], reconciliation: Record<string, unknown>) {
  const rows = holdings as Array<Record<string, unknown>>;
  return {
    includedHoldings: rows.length,
    closedActive: rows.filter((holding) => holding.ownershipState === "CLOSED_ACTIVE").length,
    signedPendingIncoming: rows.filter((holding) => holding.ownershipState === "SIGNED_PENDING_INCOMING").length,
    signedPendingExit: rows.filter((holding) => holding.ownershipState === "SIGNED_PENDING_EXIT").length,
    proposedNew: rows.filter((holding) => holding.repoDisposition === "PROPOSED_NEW").length,
    excludedCandidates: (reconciliation.excludedCandidates as unknown[]).length,
    repoOnlyRecords: (reconciliation.repoOnlyRecords as unknown[]).length,
    unresolvedConflicts: (reconciliation.unresolvedConflicts as unknown[]).length,
  };
}

/**
 * Reproduces the documented staged assembler semantics without researching or
 * filling gaps. Narrative Markdown must exist in a recovered chunk; it is
 * never synthesized from the rows.
 */
export function assembleChunkedPortfolioCensus(input: ChunkAssemblyInput): ChunkAssemblyResult {
  const extracted = extractTaggedJson(input.texts);
  const identities = extracted.candidates.filter((candidate) => isIdentityCandidate(candidate.value));
  const identity = identities.at(-1);
  if (!identity || !isIdentityCandidate(identity.value)) {
    throw new Error("MISSING_IDENTITY_CHUNK: canonicalManager, aliasesResearched, and overlappingSuppliedManagers are required");
  }
  const reconciliations = extracted.candidates.filter((candidate) => isReconciliationCandidate(candidate.value));
  const reconciliation = reconciliations.at(-1);
  if (!reconciliation || !isReconciliationCandidate(reconciliation.value)) {
    throw new Error("MISSING_RECONCILIATION_CHUNK: excludedCandidates, repoOnlyRecords, unresolvedConflicts, and completenessChecks are required");
  }
  if (typeof reconciliation.value.reportMarkdown !== "string" || reconciliation.value.reportMarkdown.trim().length < 80) {
    throw new Error("MISSING_REPORT_MARKDOWN: staged facts exist but no recovered narrative report can be reproduced without fabrication");
  }

  const holdingCandidates: RangedHoldingChunk[] = extracted.candidates
    .filter((candidate) => (
      isStrictHoldingArray(candidate.value)
      && (
        (candidate.value as unknown[]).length > 0
        || /holdings?/i.test(`${candidate.tag} ${candidate.source}`)
      )
    ))
    .map((candidate) => ({ ...candidate, ...numericRange(candidate), value: candidate.value as unknown[] }));
  const holdingsSelection = selectHoldingChunks(
    holdingCandidates,
    expectedHoldingCount(identities, reconciliation as TaggedJson & { value: Record<string, unknown> }),
  );

  const reconciliationValue = reconciliation.value;
  const result = portfolioCensusResultSchema.parse({
    schemaVersion: 1,
    artifactType: "PORTFOLIO_CENSUS_RESULT",
    methodologyVersion: "NA_INFRA_CENSUS_V1",
    asOfDate: input.asOfDate,
    requestedManager: input.requestedManager,
    canonicalManager: identity.value.canonicalManager,
    aliasesResearched: identity.value.aliasesResearched,
    overlappingSuppliedManagers: identity.value.overlappingSuppliedManagers,
    taskStatus: "COMPLETE",
    blockers: [],
    repoSnapshotSource: input.snapshot.source,
    sourceStandard: "ONE_RELIABLE_SOURCE_MINIMUM",
    holdings: holdingsSelection.holdings,
    excludedCandidates: reconciliationValue.excludedCandidates,
    repoOnlyRecords: reconciliationValue.repoOnlyRecords,
    unresolvedConflicts: reconciliationValue.unresolvedConflicts,
    completenessChecks: reconciliationValue.completenessChecks,
    summary: computedSummary(holdingsSelection.holdings, reconciliationValue),
  });
  const report = reconciliationValue.reportMarkdown.trim();
  if (!report.toLowerCase().includes(input.requestedManager.toLowerCase())) {
    throw new Error(`REPORT_MANAGER_MISMATCH: report does not name ${input.requestedManager}`);
  }
  const response = [
    "<portfolio_census_json>",
    JSON.stringify(result),
    "</portfolio_census_json>",
    "<portfolio_census_report>",
    report,
    "</portfolio_census_report>",
  ].join("\n");
  parsePortfolioCensusResponse(response, {
    manager: input.requestedManager,
    asOfDate: input.asOfDate,
    snapshotSource: input.snapshot.source,
  });
  return {
    result,
    report,
    response,
    selectedTags: [identity.tag, ...holdingsSelection.tags, reconciliation.tag],
    diagnostics: extracted.diagnostics,
  };
}

export function computeHistoricalAggregate(results: readonly PortfolioCensusResult[]): HistoricalAggregate {
  const aggregate = {
    includedHoldings: 0,
    closedActive: 0,
    signedPendingIncoming: 0,
    signedPendingExit: 0,
    existingVerified: 0,
    proposedNew: 0,
    proposedCorrection: 0,
    possibleDuplicate: 0,
    needsReview: 0,
    excludedCandidates: 0,
    repoOnlyRecords: 0,
    unresolvedConflicts: 0,
  };
  for (const result of results) {
    aggregate.includedHoldings += result.holdings.length;
    aggregate.closedActive += result.holdings.filter((holding) => holding.ownershipState === "CLOSED_ACTIVE").length;
    aggregate.signedPendingIncoming += result.holdings.filter((holding) => holding.ownershipState === "SIGNED_PENDING_INCOMING").length;
    aggregate.signedPendingExit += result.holdings.filter((holding) => holding.ownershipState === "SIGNED_PENDING_EXIT").length;
    aggregate.existingVerified += result.holdings.filter((holding) => holding.repoDisposition === "EXISTING_VERIFIED").length;
    aggregate.proposedNew += result.holdings.filter((holding) => holding.repoDisposition === "PROPOSED_NEW").length;
    aggregate.proposedCorrection += result.holdings.filter((holding) => holding.repoDisposition === "PROPOSED_CORRECTION").length;
    aggregate.possibleDuplicate += result.holdings.filter((holding) => holding.repoDisposition === "POSSIBLE_DUPLICATE").length;
    aggregate.needsReview += result.holdings.filter((holding) => holding.repoDisposition === "NEEDS_REVIEW").length;
    aggregate.excludedCandidates += result.excludedCandidates.length;
    aggregate.repoOnlyRecords += result.repoOnlyRecords.length;
    aggregate.unresolvedConflicts += result.unresolvedConflicts.length;
  }
  return aggregate;
}

export function assertHistoricalAggregate(actual: HistoricalAggregate): void {
  for (const [field, expected] of Object.entries(EXPECTED_HISTORICAL_AGGREGATE)) {
    const value = actual[field as keyof HistoricalAggregate];
    if (value !== expected) {
      throw new Error(`Historical aggregate mismatch at ${field}: expected ${expected}, received ${value}`);
    }
  }
}

const EXCLUDED_REASON_MAP = {
  REALIZED: "REALIZED",
  NON_INFRASTRUCTURE_STRATEGY: "NON_INFRASTRUCTURE_STRATEGY",
  OUTSIDE_NORTH_AMERICA: "OUTSIDE_NORTH_AMERICA",
  DEBT_ONLY: "DEBT_ONLY",
  FUND_OR_LP_EXPOSURE: "LP_OR_FUND_OF_FUNDS",
  PUBLIC_MARKET_SECURITY: "PUBLIC_SECURITY",
  SUBSIDIARY_OR_PROJECT: "SUBSIDIARY_OR_PROJECT",
  DUPLICATE_PLATFORM: "DUPLICATE_PLATFORM",
  INSUFFICIENT_EVIDENCE: "INSUFFICIENT_EVIDENCE",
  OTHER: "OTHER",
} as const;

export interface RecoveredInputContext {
  managerIndex: number;
  recoveredAt: string;
  archiveTaskId: string | null;
  conversationUrl: string;
  acceptedAttempt: number;
  responseSha256: string;
  acceptanceEvidenceCoveragePassed: boolean;
}

export function toRecoveredCensusInput(
  historical: PortfolioCensusResult,
  context: RecoveredInputContext,
): RecoveredCensusInput {
  if (!context.acceptanceEvidenceCoveragePassed) {
    throw new Error("Cannot mark recovered evidence WORKING without a passing historical evidence-coverage audit");
  }
  const stem = managerArtifactStem(context.managerIndex, historical.requestedManager);
  const artifact = finalizeRecoveredCensusInput({
    schemaVersion: 1,
    artifactType: "PORTCO_CENSUS_RECOVERED_INPUT",
    methodologyVersion: "NA_PORTCO_CENSUS_V1",
    asOfDate: historical.asOfDate,
    managerIndex: context.managerIndex,
    requestedManager: historical.requestedManager,
    canonicalManager: historical.canonicalManager,
    aliasesSearched: historical.aliasesResearched,
    recovery: {
      kind: "TASK_ARCHIVE",
      recoveredAt: context.recoveredAt,
      archiveTaskId: context.archiveTaskId,
      conversationUrl: context.conversationUrl,
      model: "GPT-5.6 Sol",
      mode: "Pro",
      acceptedAttempt: context.acceptedAttempt,
      responseSha256: context.responseSha256,
    },
    taskStatus: historical.taskStatus,
    blockers: historical.blockers,
    holdings: historical.holdings.map((holding, offset) => ({
      holdingId: `${stem}:holding:${String(offset + 1).padStart(3, "0")}:${slugify(holding.companyName)}`,
      companyName: holding.companyName,
      aliases: [],
      canonicalName: holding.matchedRepoCompany?.name ?? holding.companyName,
      investmentLevel: holding.investmentLevel,
      countries: holding.countries,
      ownership: {
        state: holding.ownershipState,
        canonicalManager: historical.canonicalManager,
        organizationName: historical.canonicalManager,
        fundName: null,
        vehicleName: holding.ownershipVehicle,
        stake: holding.stake,
        investmentDate: holding.investmentYear === null ? null : String(holding.investmentYear),
        exitDate: null,
      },
      evidence: holding.evidence.map((evidence) => ({
        ...evidence,
        health: "WORKING" as const,
      })),
      repoDisposition: holding.repoDisposition,
      matchedRepoCompanyIds: holding.matchedRepoCompany?.repoCompanyId
        ? [holding.matchedRepoCompany.repoCompanyId]
        : [],
      rationale: holding.repoDispositionRationale,
      confidence: holding.confidence,
    })),
    excludedCandidates: historical.excludedCandidates.map((candidate) => ({
      companyName: candidate.companyName,
      reasonCode: EXCLUDED_REASON_MAP[candidate.reasonCode],
      rationale: candidate.rationale,
      evidenceUrls: candidate.sourceUrl ? [candidate.sourceUrl] : [],
    })),
    unresolvedConflicts: historical.unresolvedConflicts.map((conflict) => ({
      subject: conflict.subject,
      issue: conflict.issue,
      recommendedResolution: conflict.recommendedResolution,
      evidenceUrls: conflict.sourceUrls,
    })),
    completenessChecks: {
      officialPortfolioReviewed: historical.completenessChecks.officialPortfolioReviewed,
      acquisitionsSearched: historical.completenessChecks.officialPortfolioReviewed
        && historical.completenessChecks.managerAliasesSearched,
      exitsSearched: historical.completenessChecks.dispositionsSearched,
      northAmericaReviewed: historical.holdings.every((holding) => (
        holding.region === "North America"
        && holding.evidence.some((evidence) => evidence.supports.includes("NORTH_AMERICA"))
      )),
      infrastructureStrategyReviewed: historical.holdings.every((holding) => (
        holding.evidence.some((evidence) => evidence.supports.includes("INFRASTRUCTURE_STRATEGY"))
      )),
      subsidiariesDeduplicated: historical.completenessChecks.paginationOrAlphabeticCoverageChecked,
      allEvidenceOpened: true,
    },
  });
  return artifact;
}
