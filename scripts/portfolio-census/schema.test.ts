import { describe, expect, it } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  RESULT_JSON_END,
  RESULT_JSON_START,
  RESULT_REPORT_END,
  RESULT_REPORT_START,
  createManifest,
  getManagerUniverse,
  managerAliases,
  parsePortfolioCensusResponse,
  renderWorkerPrompt,
  atomicWrite,
  loadManifest,
  managerArtifactStem,
} from "./lib";
import { ingestPortfolioCensusResponse } from "./ingest";
import {
  portfolioCensusResultSchema,
  type PortfolioCensusRepoSnapshot,
  type PortfolioCensusResult,
} from "./schema";

function snapshot(manager: string): PortfolioCensusRepoSnapshot {
  return {
    schemaVersion: 1,
    artifactType: "PORTFOLIO_CENSUS_REPO_SNAPSHOT",
    asOfDate: "2026-07-28",
    requestedManager: manager,
    canonicalManager: manager,
    aliases: [manager],
    source: "PROVIDED",
    generatedAt: "2026-07-28T12:00:00.000Z",
    sourceNote: "Test fixture provided to the prompt builder.",
    companies: [],
  };
}

function holding(
  companyName: string,
  ownershipState: PortfolioCensusResult["holdings"][number]["ownershipState"] = "CLOSED_ACTIVE",
): PortfolioCensusResult["holdings"][number] {
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
    ownershipVehicle: null,
    stake: "Minority interest",
    investmentYear: 2024,
    ownershipState,
    infrastructureStrategyBasis: "The manager identifies the investment as part of its infrastructure strategy.",
    northAmericaBasis: "The platform is dedicated to infrastructure operations in the United States.",
    evidence: [{
      url: "https://example.com/ownership",
      title: "Official portfolio profile",
      publisher: "Example Manager",
      sourceTier: "PRIMARY",
      publishedAt: "2024-05-01",
      retrievedAt: "2026-07-28",
      evidenceSummary: "Supports manager ownership, infrastructure strategy, geography, and current transaction state.",
      supports: [
        "OWNERSHIP",
        "INFRASTRUCTURE_STRATEGY",
        "NORTH_AMERICA",
        "OWNERSHIP_STATE",
      ],
    }],
    repoDisposition: "PROPOSED_NEW",
    matchedRepoCompany: null,
    repoDispositionRationale: "No repository company matches this manager-level platform.",
    confidence: "HIGH",
  };
}

function result(holdings: PortfolioCensusResult["holdings"]): PortfolioCensusResult {
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
    excludedCandidates: [],
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
      includedHoldings: holdings.length,
      closedActive: holdings.filter((item) => item.ownershipState === "CLOSED_ACTIVE").length,
      signedPendingIncoming: holdings.filter((item) => item.ownershipState === "SIGNED_PENDING_INCOMING").length,
      signedPendingExit: holdings.filter((item) => item.ownershipState === "SIGNED_PENDING_EXIT").length,
      proposedNew: holdings.length,
      excludedCandidates: 0,
      repoOnlyRecords: 0,
      unresolvedConflicts: 0,
    },
  };
}

function responseFor(value: PortfolioCensusResult): string {
  return [
    RESULT_JSON_START,
    JSON.stringify(value),
    RESULT_JSON_END,
    RESULT_REPORT_START,
    `# ${value.requestedManager} — North American portfolio census`,
    "",
    "## Conclusion",
    "",
    "The evidence-backed census is complete and the repository reconciliation is summarized below for editorial review.",
    "",
    "## Included holdings",
    "",
    "All included manager-level holdings have direct evidence links.",
    RESULT_REPORT_END,
  ].join("\n");
}

describe("portfolio census prompt and result contract", () => {
  it("preserves the exact 100-manager universe and single-concurrency manifest", () => {
    const managers = getManagerUniverse();
    expect(managers).toHaveLength(100);
    expect(managers[0]).toBe("3i Infrastructure");
    expect(managers[99]).toBe("Tallvine");

    const manifest = createManifest("2026-07-28", "2026-07-28T12:00:00.000Z");
    expect(manifest.managerCount).toBe(100);
    expect(manifest.concurrency).toBe(1);
    expect(manifest.modelConfiguration).toEqual({
      surface: "CHATGPT_WEB",
      model: "gpt-5.6-sol",
      reasoningMode: "pro",
    });
  });

  it.each([
    "3i Infrastructure",
    "BlackRock",
    "Pantheon Ventures",
  ])("renders a complete pilot prompt for %s", (manager) => {
    const managers = getManagerUniverse();
    const rendered = renderWorkerPrompt({
      asOfDate: "2026-07-28",
      managerIndex: managers.indexOf(manager) + 1,
      requestedManager: manager,
      snapshot: snapshot(manager),
      managerUniverse: managers,
    });

    expect(rendered).toContain(`# North American infrastructure portfolio census — ${manager}`);
    expect(rendered).toContain(`"requestedManager": "${manager}"`);
    expect(rendered).toContain("SIGNED_PENDING_INCOMING");
    expect(rendered).toContain("SIGNED_PENDING_EXIT");
    expect(rendered).toContain('"repoCompanyId": "repository company id or null"');
    expect(rendered).toContain("do not return a company-name string");
    expect(rendered).toContain("PORTFOLIO_CENSUS_REPO_SNAPSHOT");
    expect(rendered).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it("surfaces known parent-platform overlaps in alias resolution", () => {
    expect(managerAliases("BlackRock")).toEqual(expect.arrayContaining(["GIP", "Global Infrastructure Partners"]));
    expect(managerAliases("CVC")).toEqual(expect.arrayContaining(["CVC DIF", "DIF"]));
    expect(managerAliases("DIF")).toEqual(expect.arrayContaining(["CVC DIF", "CVC"]));
  });

  it("accepts closed and both signed-pending ownership states", () => {
    const parsed = portfolioCensusResultSchema.safeParse(result([
      holding("Closed Platform"),
      holding("Pending Incoming Platform", "SIGNED_PENDING_INCOMING"),
      holding("Pending Exit Platform", "SIGNED_PENDING_EXIT"),
    ]));
    expect(parsed.success).toBe(true);
  });

  it("rejects a holding without evidence for every required claim", () => {
    const invalid = result([holding("Unsupported Platform")]);
    invalid.holdings[0].evidence[0].supports = ["OWNERSHIP"];
    const parsed = portfolioCensusResultSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.message)).toEqual(expect.arrayContaining([
        "Evidence does not support required claim INFRASTRUCTURE_STRATEGY",
        "Evidence does not support required claim NORTH_AMERICA",
        "Evidence does not support required claim OWNERSHIP_STATE",
      ]));
    }
  });

  it("rejects duplicate manager-level holding identities", () => {
    const parsed = portfolioCensusResultSchema.safeParse(result([
      holding("Duplicate Platform"),
      holding("Duplicate Platform"),
    ]));
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.message)).toContain(
        "Duplicate manager-level holding identity",
      );
    }
  });

  it("parses the marked JSON and Markdown response envelope", () => {
    const parsed = parsePortfolioCensusResponse(responseFor(result([holding("Example Platform")])), {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-28",
      snapshotSource: "PROVIDED",
    });
    expect(parsed.result.summary.includedHoldings).toBe(1);
    expect(parsed.report).toContain("## Conclusion");
  });

  it("rejects response envelopes with a mismatched manager", () => {
    expect(() => parsePortfolioCensusResponse(responseFor(result([])), {
      manager: "BlackRock",
      asOfDate: "2026-07-28",
      snapshotSource: "PROVIDED",
    })).toThrow('Expected manager "BlackRock"');
  });

  it("ingests once, advances resumable state, and refuses overwrite", () => {
    const runDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-census-test-"));
    const manifest = createManifest("2026-07-28", "2026-07-28T12:00:00.000Z");
    atomicWrite(path.join(runDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

    const manager = "3i Infrastructure";
    const stem = managerArtifactStem(1, manager);
    atomicWrite(
      path.join(runDirectory, "snapshots", `${stem}.json`),
      `${JSON.stringify(snapshot(manager), null, 2)}\n`,
    );
    const rawPath = path.join(runDirectory, "raw", `${stem}.txt`);
    atomicWrite(rawPath, responseFor(result([holding("Ingested Platform")])));

    const output = ingestPortfolioCensusResponse({
      runDirectory,
      managerIndex: 1,
      inputPath: rawPath,
    });
    expect(fs.existsSync(output.resultPath)).toBe(true);
    expect(fs.existsSync(output.reportPath)).toBe(true);
    expect(loadManifest(output.manifestPath).currentIndex).toBe(2);
    expect(loadManifest(output.manifestPath).managers[0].status).toBe("COMPLETE");

    expect(() => ingestPortfolioCensusResponse({
      runDirectory,
      managerIndex: 1,
      inputPath: rawPath,
    })).toThrow("Refusing to overwrite terminal manager result COMPLETE");
  });
});
