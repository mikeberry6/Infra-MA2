import { describe, expect, it } from "vitest";
import { verifyRecoveredCensusInput } from "../portco-reconciliation";
import type { PortfolioCensusRepoSnapshot, PortfolioCensusResult } from "./schema";
import {
  assembleChunkedPortfolioCensus,
  selectLastValidPortfolioEnvelope,
  toRecoveredCensusInput,
} from "./recovery";

function holding(companyName: string): PortfolioCensusResult["holdings"][number] {
  return {
    companyName,
    website: "https://example.com/",
    parentPlatform: null,
    investmentLevel: "PLATFORM",
    sector: "Digital",
    subsector: "Fiber networks",
    region: "North America",
    countries: ["United States"],
    headquarters: "New York, New York",
    ownershipVehicle: "Example Infrastructure Vehicle",
    stake: "40%",
    investmentYear: 2024,
    ownershipState: "CLOSED_ACTIVE",
    infrastructureStrategyBasis: "The manager identifies the platform as an infrastructure investment.",
    northAmericaBasis: "The platform operates infrastructure in the United States.",
    evidence: [{
      url: "https://example.com/ownership",
      title: "Official ownership profile",
      publisher: "Example Manager",
      sourceTier: "PRIMARY",
      publishedAt: "2024-05-01",
      retrievedAt: "2026-07-28",
      evidenceSummary: "Supports ownership, strategy, geography, and current transaction state.",
      supports: ["OWNERSHIP", "INFRASTRUCTURE_STRATEGY", "NORTH_AMERICA", "OWNERSHIP_STATE"],
    }],
    repoDisposition: "PROPOSED_NEW",
    matchedRepoCompany: null,
    repoDispositionRationale: "No repository company matches the manager-level platform.",
    confidence: "HIGH",
  };
}

function result(companyName = "Example Platform"): PortfolioCensusResult {
  const holdings = [holding(companyName)];
  return {
    schemaVersion: 1,
    artifactType: "PORTFOLIO_CENSUS_RESULT",
    methodologyVersion: "NA_INFRA_CENSUS_V1",
    asOfDate: "2026-07-28",
    requestedManager: "3i Infrastructure",
    canonicalManager: "3i Group",
    aliasesResearched: ["3i Infrastructure", "3i Group"],
    overlappingSuppliedManagers: [],
    taskStatus: "COMPLETE",
    blockers: [],
    repoSnapshotSource: "PROVIDED",
    sourceStandard: "ONE_RELIABLE_SOURCE_MINIMUM",
    holdings,
    excludedCandidates: [{
      companyName: "Example Fund LP",
      reasonCode: "FUND_OR_LP_EXPOSURE",
      rationale: "This is an LP exposure, not a directly owned operating company.",
      sourceUrl: "https://example.com/fund",
    }],
    repoOnlyRecords: [],
    unresolvedConflicts: [],
    completenessChecks: {
      officialPortfolioReviewed: true,
      dispositionsSearched: true,
      managerAliasesSearched: true,
      paginationOrAlphabeticCoverageChecked: true,
      sourcesOpened: 4,
      searchQueriesRun: 5,
      notes: ["Official portfolio and disposition sources were checked."],
    },
    summary: {
      includedHoldings: 1,
      closedActive: 1,
      signedPendingIncoming: 0,
      signedPendingExit: 0,
      proposedNew: 1,
      excludedCandidates: 1,
      repoOnlyRecords: 0,
      unresolvedConflicts: 0,
    },
  };
}

function report(manager = "3i Infrastructure"): string {
  return `# ${manager} — North American portfolio census\n\nThe evidence-backed census and repository reconciliation are complete and ready for review.\n\n## Completeness\n\nOfficial sources and disposition searches were checked.`;
}

function response(value: PortfolioCensusResult): string {
  return [
    "<portfolio_census_json>",
    JSON.stringify(value),
    "</portfolio_census_json>",
    "<portfolio_census_report>",
    report(value.requestedManager),
    "</portfolio_census_report>",
  ].join("\n");
}

function snapshot(): PortfolioCensusRepoSnapshot {
  return {
    schemaVersion: 1,
    artifactType: "PORTFOLIO_CENSUS_REPO_SNAPSHOT",
    asOfDate: "2026-07-28",
    requestedManager: "3i Infrastructure",
    canonicalManager: "3i Group",
    aliases: ["3i Infrastructure"],
    source: "PROVIDED",
    generatedAt: "2026-07-28T12:00:00.000Z",
    sourceNote: "Fixture snapshot supplied for deterministic assembly.",
    companies: [],
  };
}

describe("portfolio census deterministic recovery", () => {
  it("selects the last schema-valid matching portfolio envelope and ignores fund census", () => {
    const first = result("First Platform");
    const last = result("Final Platform");
    const fund = "<fund_census_json>{\"requestedManager\":\"3i Infrastructure\"}</fund_census_json>";
    const selected = selectLastValidPortfolioEnvelope([
      response(first),
      fund,
      response({ ...last, requestedManager: "BlackRock" }),
      response(last),
    ], {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-28",
      snapshotSource: "PROVIDED",
    });

    expect(selected.candidate?.result.holdings[0].companyName).toBe("Final Platform");
    expect(selected.diagnostics.some((item) => item.detail.includes("Expected manager"))).toBe(true);
  });

  it("reassembles an exact, contiguous documented chunk protocol", () => {
    const source = result();
    const reconciliation = {
      excludedCandidates: source.excludedCandidates,
      repoOnlyRecords: source.repoOnlyRecords,
      unresolvedConflicts: source.unresolvedConflicts,
      completenessChecks: source.completenessChecks,
      summary: source.summary,
      reportMarkdown: report(),
    };
    const assembled = assembleChunkedPortfolioCensus({
      requestedManager: "3i Infrastructure",
      asOfDate: "2026-07-28",
      snapshot: snapshot(),
      texts: [
        {
          source: "index.txt",
          text: `<threei_index>${JSON.stringify({
            canonicalManager: source.canonicalManager,
            aliasesResearched: source.aliasesResearched,
            overlappingSuppliedManagers: [],
            holdings: [{ number: 1, companyName: "Example Platform" }],
          })}</threei_index>`,
        },
        {
          source: "holdings-1-1.txt",
          text: `<threei_holdings_1_1>${JSON.stringify(source.holdings)}</threei_holdings_1_1>`,
        },
        {
          source: "reconciliation.txt",
          text: `<threei_reconciliation>${JSON.stringify(reconciliation)}</threei_reconciliation>`,
        },
      ],
    });

    expect(assembled.result).toEqual(source);
    expect(assembled.selectedTags).toEqual([
      "threei_index",
      "threei_holdings_1_1",
      "threei_reconciliation",
    ]);
  });

  it("fails closed when staged facts have no recoverable Markdown", () => {
    const source = result();
    expect(() => assembleChunkedPortfolioCensus({
      requestedManager: "3i Infrastructure",
      asOfDate: "2026-07-28",
      snapshot: snapshot(),
      texts: [{
        source: "chunks.txt",
        text: [
          `<threei_index>${JSON.stringify({
            canonicalManager: source.canonicalManager,
            aliasesResearched: source.aliasesResearched,
            overlappingSuppliedManagers: [],
            holdings: [{ number: 1 }],
          })}</threei_index>`,
          `<threei_holdings_1_1>${JSON.stringify(source.holdings)}</threei_holdings_1_1>`,
          `<threei_reconciliation>${JSON.stringify({
            excludedCandidates: source.excludedCandidates,
            repoOnlyRecords: [],
            unresolvedConflicts: [],
            completenessChecks: source.completenessChecks,
          })}</threei_reconciliation>`,
        ].join("\n"),
      }],
    })).toThrow("MISSING_REPORT_MARKDOWN");
  });

  it("maps the accepted result into a hash-bound downstream wrapper without inventing a fund", () => {
    const artifact = toRecoveredCensusInput(result(), {
      managerIndex: 1,
      recoveredAt: "2026-08-03T11:23:08.278Z",
      archiveTaskId: "019faa37-a18b-7cf0-b471-221e1b67ef11",
      conversationUrl: "https://chatgpt.com/c/6a696657-8bcc-83ea-afd4-918adfbd1f99",
      acceptedAttempt: 2,
      responseSha256: "a".repeat(64),
      acceptanceEvidenceCoveragePassed: true,
    });

    expect(() => verifyRecoveredCensusInput(artifact)).not.toThrow();
    expect(artifact.holdings[0].holdingId).toBe("001-3i-infrastructure:holding:001:example-platform");
    expect(artifact.holdings[0].ownership.fundName).toBeNull();
    expect(artifact.holdings[0].ownership.vehicleName).toBe("Example Infrastructure Vehicle");
    expect(artifact.holdings[0].evidence[0].health).toBe("WORKING");
    expect(artifact.excludedCandidates[0].reasonCode).toBe("LP_OR_FUND_OF_FUNDS");
  });
});
