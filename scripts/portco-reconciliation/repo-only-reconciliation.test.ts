import { describe, expect, it } from "vitest";
import { extendRecoveredInputV2 } from "./build-reconciliation-inputs";
import { finalizeRecoveredCensusInput, verifyRecoveredCensusInput } from "./artifacts";
import { buildTwoSidedLedger } from "./ledger-builder";
import {
  FIXTURE_NOW,
  productionSnapshotFixture,
  recoveredCensusFixture,
  seedSnapshotFixture,
} from "./test-fixtures";
import type { RecoveredCensusInput, RecoveredRepoOnlyRecord } from "./schema";

function managerUniverse(): string[] {
  return Array.from({ length: 100 }, (_, index) => `Manager ${index + 1}`);
}

function v2Input(input: {
  index: number;
  repoOnlyRecords?: RecoveredRepoOnlyRecord[];
  withExclusion?: boolean;
}): RecoveredCensusInput {
  const base = recoveredCensusFixture();
  const { artifactSha256: recoveredInputV1Sha256, ...withoutHash } = base;
  const manager = `Manager ${input.index}`;
  const responseSha256 = input.index.toString(16).padStart(64, "0");
  return finalizeRecoveredCensusInput({
    ...withoutHash,
    managerIndex: input.index,
    requestedManager: manager,
    canonicalManager: manager,
    aliasesSearched: [manager],
    recovery: {
      ...base.recovery,
      conversationUrl: `https://chatgpt.com/c/manager-${input.index}`,
      responseSha256,
    },
    holdings: [],
    reconciliationInputVersion: 2,
    sourceResult: {
      acceptedResultPath: `audits/source/${String(input.index).padStart(3, "0")}.json`,
      acceptedResultSha256: (input.index + 100).toString(16).padStart(64, "0"),
      acceptedResponseSha256: responseSha256,
      recoveredInputV1Sha256,
    },
    repoOnlyRecords: input.repoOnlyRecords ?? [],
    excludedCandidates: input.withExclusion ? [{
      excludedCandidateId: `${String(input.index).padStart(3, "0")}:excluded:001:project`,
      sourceOrdinal: 1,
      companyName: "Excluded Project",
      reasonCode: "SUBSIDIARY_OR_PROJECT",
      rationale: "A project beneath the manager-level platform.",
      evidenceUrls: ["https://acme.example.com/project"],
    }] : [],
  });
}

describe("repo-only reconciliation lineage", () => {
  it("extends a recovered input without modifying its accepted source semantics", () => {
    const base = recoveredCensusFixture();
    const { artifactSha256: _hash, ...withoutHash } = base;
    const empty = finalizeRecoveredCensusInput({
      ...withoutHash,
      holdings: [],
      excludedCandidates: [],
    });
    const extended = extendRecoveredInputV2({
      recoveredV1: empty,
      artifactStem: "001-manager-1",
      acceptedResultPath: "audits/source/001-manager-1.json",
      acceptedResultSha256: "d".repeat(64),
      historicalResult: {
        schemaVersion: 1,
        artifactType: "PORTFOLIO_CENSUS_RESULT",
        methodologyVersion: "NA_INFRA_CENSUS_V1",
        asOfDate: empty.asOfDate,
        requestedManager: empty.requestedManager,
        canonicalManager: empty.canonicalManager!,
        aliasesResearched: empty.aliasesSearched,
        overlappingSuppliedManagers: [],
        taskStatus: "COMPLETE",
        blockers: [],
        repoSnapshotSource: "DATABASE",
        sourceStandard: "ONE_RELIABLE_SOURCE_MINIMUM",
        holdings: [],
        excludedCandidates: [],
        repoOnlyRecords: [{
          repoCompanyName: "Acme Infrastructure, LLC",
          repoCountry: "United States",
          disposition: "PROPOSED_RETIRE",
          rationale: "The manager exited the company.",
          evidenceUrls: ["https://acme.example.com/exit"],
        }],
        unresolvedConflicts: [],
        completenessChecks: {
          officialPortfolioReviewed: true,
          dispositionsSearched: true,
          managerAliasesSearched: true,
          paginationOrAlphabeticCoverageChecked: true,
          sourcesOpened: 1,
          searchQueriesRun: 1,
          notes: ["Complete."],
        },
        summary: {
          includedHoldings: 0,
          closedActive: 0,
          signedPendingIncoming: 0,
          signedPendingExit: 0,
          proposedNew: 0,
          excludedCandidates: 0,
          repoOnlyRecords: 1,
          unresolvedConflicts: 0,
        },
      },
    });
    expect(extended.sourceResult?.recoveredInputV1Sha256).toBe(empty.artifactSha256);
    expect(extended.repoOnlyRecords?.[0]).toMatchObject({
      repoOnlyId: "001-manager-1:repo-only:001:acme-infrastructure-llc",
      sourceOrdinal: 1,
      disposition: "PROPOSED_RETIRE",
    });
    expect(verifyRecoveredCensusInput(extended).artifactSha256).toBe(extended.artifactSha256);
    expect(() => verifyRecoveredCensusInput({
      ...extended,
      repoOnlyRecords: [{ ...extended.repoOnlyRecords![0], rationale: "Tampered" }],
    })).toThrow(/hash/i);
  });

  it("keeps one canonical proposal while preserving every exact repo-only judgment", () => {
    const records = new Map<number, RecoveredRepoOnlyRecord[]>([
      [1, [{
        repoOnlyId: "001:repo-only:retire-acme",
        sourceOrdinal: 1,
        repoCompanyName: "Acme Infrastructure, LLC",
        repoCountry: "United States",
        disposition: "PROPOSED_RETIRE",
        rationale: "Manager 1 exited Acme.",
        evidenceUrls: ["https://acme.example.com/exit"],
      }]],
      [2, [{
        repoOnlyId: "002:repo-only:merge-acme",
        sourceOrdinal: 1,
        repoCompanyName: "Acme Infrastructure, LLC",
        repoCountry: "United States",
        disposition: "MATCHED_ELSEWHERE",
        rationale: "Acme should be consolidated into its platform record.",
        evidenceUrls: ["https://acme.example.com/platform"],
      }]],
      [3, [{
        repoOnlyId: "003:repo-only:unknown",
        sourceOrdinal: 1,
        repoCompanyName: "Unknown Infrastructure",
        repoCountry: "Mexico",
        disposition: "PROPOSED_RETIRE",
        rationale: "The source snapshot record could not be mapped.",
        evidenceUrls: ["https://unknown.example.com/exit"],
      }]],
    ]);
    const recovered = managerUniverse().map((_manager, offset) => v2Input({
      index: offset + 1,
      repoOnlyRecords: records.get(offset + 1),
      withExclusion: offset === 0,
    }));
    const built = buildTwoSidedLedger({
      runId: "repo-only-ledger-test",
      generatedAt: FIXTURE_NOW,
      managerUniverse: managerUniverse(),
      recoveredInputs: recovered,
      productionSnapshot: productionSnapshotFixture(),
      seedSnapshot: seedSnapshotFixture(),
    });
    expect(built.ledger.repoOnlyRows).toHaveLength(3);
    expect(built.ledger.excludedCandidateLineage).toHaveLength(1);
    const exactEntries = built.proposalQueue.entries.filter((entry) =>
      entry.canonicalKey === "acme-infrastructure-llc|united-states");
    expect(exactEntries).toHaveLength(1);
    expect(exactEntries[0].sourceRepoOnlyIds).toEqual([
      "001:repo-only:retire-acme",
      "002:repo-only:merge-acme",
    ]);
    expect(exactEntries[0].actionScopes.ownership).toEqual(["RETIRE_OWNERSHIP"]);
    expect(exactEntries[0].actionScopes.company).toEqual(["MERGE_COMPANIES"]);
    expect(exactEntries[0].actionScopes.company).not.toContain("REALIZE_COMPANY");
    expect(exactEntries[0].decisionStatus).toBe("NEEDS_REVIEW");
    const unmatched = built.proposalQueue.entries.find((entry) =>
      entry.sourceRepoOnlyIds.includes("003:repo-only:unknown"))!;
    expect(unmatched.canonicalKey).toBeNull();
    expect(unmatched.actionScopes).toEqual({ company: [], ownership: [], verification: [] });
    expect(unmatched.decisionStatus).toBe("NEEDS_REVIEW");
    expect(built.proposalQueue.summary.repoOnlyJudgmentSources).toBe(3);
  });
});
