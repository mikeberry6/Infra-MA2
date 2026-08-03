import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { ingestFundCensusResponse } from "./ingest";
import {
  RESULT_JSON_END,
  RESULT_JSON_START,
  RESULT_REPORT_END,
  RESULT_REPORT_START,
  atomicWrite,
  createManifest,
  getManagerUniverse,
  loadManifest,
  managerArtifactStem,
  manifestManagerFor,
  parseFundCensusResponse,
  renderWorkerPrompt,
  validateResultAgainstSnapshot,
} from "./lib";
import {
  fundCensusResultSchema,
  type FundCensusRepoSnapshot,
  type FundCensusResult,
  type FundCensusSnapshot,
} from "./schema";
import {
  normalizeExcludedReasonCode,
  normalizeEvidenceRetrievedAtAsOf,
  normalizeExplicitNorthAmericaBasis,
  normalizeMatchedRepoFundIdentities,
  normalizeLifecycleEnum,
  normalizeNullUsdSizeEvidenceSupport,
  normalizeProgramExceptionEvidenceScope,
  normalizeProgramExceptionIdentityEvidence,
  normalizeRepositoryChangedFields,
  normalizeRegionEnum,
  normalizeSummaryCounts,
  normalizeUnsupportedRepositoryDifferences,
  normalizeUnsupportedNorthAmericaHolding,
  normalizeUnsupportedNorthAmericaEvidenceRepoReview,
  normalizeUnsupportedSizeAsOf,
  normalizeUnclassifiedSizeStructure,
  normalizeVerifiedHoldingNorthAmericaRegions,
  normalizeVerifiedSourcePublishedAt,
} from "./normalization";

function fundSnapshot(legacyId: string | null = null): FundCensusSnapshot {
  return {
    legacyId,
    managerName: "3i Group",
    fundName: "3i NA Infrastructure Fund",
    ticker: null,
    investmentStrategy: "North American core-plus direct infrastructure equity.",
    size: "$739M final close",
    sizeUsdMm: 739,
    sizeNativeCurrency: "USD",
    sizeNativeAmount: "739000000",
    sizeBasis: "FINAL_CLOSE",
    sizeAsOf: "2023-12-01",
    sizeUsdFxRate: null,
    sizeUsdFxDate: null,
    vintage: "2022",
    strategies: ["Core-Plus"],
    structure: "Closed-End",
    fundStatus: "Financial Close",
    sectors: ["Digital", "Transportation", "Social Infra"],
    regions: ["North America"],
    sourceUrls: ["https://example.com/fund"],
    strategyUrl: "https://example.com/strategy",
  };
}

function snapshot(withFund = false): FundCensusRepoSnapshot {
  const fund = fundSnapshot("FUND-002");
  return {
    schemaVersion: 1,
    artifactType: "FUND_CENSUS_REPO_SNAPSHOT",
    asOfDate: "2026-07-29",
    requestedManager: "3i Infrastructure",
    canonicalManager: "3i Group",
    knownManager: true,
    aliases: ["3i Group", "3i Infrastructure"],
    overlappingSuppliedManagers: [],
    source: "PROVIDED",
    generatedAt: "2026-07-29T12:00:00.000Z",
    sourceNote: "Test fixture supplied to the prompt builder.",
    funds: withFund ? [{ ...fund, legacyId: "FUND-002" }] : [],
  };
}

function evidence(
  scope: "FUND" | "PROGRAM_EXCEPTION" = "FUND",
): FundCensusResult["funds"][number]["evidence"][number] {
  return {
    url: "https://example.com/fund",
    title: "Official fund page",
    publisher: "3i Group",
    sourceTier: "PRIMARY",
    scope,
    publishedAt: "2023-12-01",
    retrievedAt: "2026-07-29",
    confidence: scope === "PROGRAM_EXCEPTION" ? "MEDIUM" : "HIGH",
    evidenceLabel: "Fund identity, strategy, region, and current lifecycle",
    evidenceSummary: "The official page identifies the fund and its North American direct-equity mandate.",
    supports: [
      "FUND_IDENTITY",
      "DIRECT_EQUITY_INFRASTRUCTURE",
      "NORTH_AMERICA",
      "CURRENT_LIFECYCLE",
    ],
    supportedFields: [
      "fundName",
      "fundStatus",
      "investmentStrategy",
      "regions",
      "size",
      "sizeBasis",
      "sizeNativeAmount",
      "sizeNativeCurrency",
      "sizeUsdMm",
      "structure",
      "strategies",
      "vintage",
    ],
  };
}

function includedFund(
  disposition: FundCensusResult["funds"][number]["repoDisposition"] = "PROPOSED_NEW",
): FundCensusResult["funds"][number] {
  const existing = disposition !== "PROPOSED_NEW";
  return {
    fundName: "3i NA Infrastructure Fund",
    aliases: ["3i North American Infrastructure Fund"],
    vehicleType: "NAMED_FUND",
    lifecycle: "CLOSED_ACTIVE",
    directEquityBasis: "The official strategy is direct infrastructure equity.",
    northAmericaQualification: {
      basis: "EXPLICIT_NA_MANDATE",
      rationale: "The official fund page identifies a North American mandate.",
      currentHoldingName: null,
      currentHoldingUrl: null,
    },
    snapshot: fundSnapshot(existing ? "FUND-002" : null),
    evidence: [evidence()],
    repoDisposition: disposition,
    matchedRepoFunds: existing ? [{
      legacyId: "FUND-002",
      managerName: "3i Group",
      fundName: "3i NA Infrastructure Fund",
    }] : [],
    changedFields: [],
    repoDispositionRationale: existing
      ? "The repository row agrees with opened evidence."
      : "No repository fund matches this vehicle.",
    confidence: "HIGH",
  };
}

function result(funds: FundCensusResult["funds"]): FundCensusResult {
  return {
    schemaVersion: 1,
    artifactType: "FUND_CENSUS_RESULT",
    methodologyVersion: "NA_DIRECT_EQUITY_FUND_CENSUS_V1",
    asOfDate: "2026-07-29",
    requestedManager: "3i Infrastructure",
    canonicalManager: "3i Group",
    managerScopeStatus: "KNOWN_MANAGER",
    aliasesResearched: ["3i Group", "3i Infrastructure"],
    overlappingSuppliedManagers: [],
    taskStatus: "COMPLETE",
    blockers: [],
    repoSnapshotSource: "PROVIDED",
    sourceStandard: "FUND_SPECIFIC_EVIDENCE_REQUIRED",
    funds,
    excludedCandidates: [],
    repoOnlyRecords: [],
    unresolvedConflicts: [],
    completenessChecks: {
      officialFundMaterialsReviewed: true,
      fundraisingAndCloseSourcesReviewed: true,
      currentHoldingsAttributionReviewed: true,
      managerAliasesAndSuccessorsReviewed: true,
      parallelAndFeederVehiclesReviewed: true,
      sourcesOpened: 1,
      searchQueriesRun: 4,
      notes: ["Official materials and lifecycle evidence were reviewed."],
    },
    summary: {
      includedFunds: funds.length,
      explicitNaMandate: funds.filter((fund) =>
        fund.northAmericaQualification.basis === "EXPLICIT_NA_MANDATE").length,
      verifiedCurrentNaHolding: funds.filter((fund) =>
        fund.northAmericaQualification.basis === "VERIFIED_CURRENT_NA_HOLDING").length,
      proposedNew: funds.filter((fund) => fund.repoDisposition === "PROPOSED_NEW").length,
      proposedCorrections: funds.filter((fund) =>
        fund.repoDisposition === "PROPOSED_CORRECTION").length,
      possibleDuplicates: funds.filter((fund) =>
        fund.repoDisposition === "POSSIBLE_DUPLICATE").length,
      needsReview: funds.filter((fund) => fund.repoDisposition === "NEEDS_REVIEW").length,
      excludedCandidates: 0,
      repoOnlyRecords: 0,
      unresolvedConflicts: 0,
    },
  };
}

function responseFor(value: FundCensusResult): string {
  return [
    RESULT_JSON_START,
    JSON.stringify(value),
    RESULT_JSON_END,
    RESULT_REPORT_START,
    `# ${value.requestedManager} — North American direct infrastructure fund census`,
    "",
    "## Conclusion",
    "",
    "The evidence-backed fund census and repository reconciliation are complete for human review.",
    "",
    "## Included funds",
    "",
    "All included funds have opened, field-specific evidence.",
    RESULT_REPORT_END,
  ].join("\n");
}

describe("fund census prompt and result contract", () => {
  it("uses the exact 100-manager universe and one-worker manifest", () => {
    expect(getManagerUniverse()).toHaveLength(100);
    const manifest = createManifest("2026-07-29", "2026-07-29T12:00:00.000Z");
    expect(manifest.managerCount).toBe(100);
    expect(manifest.concurrency).toBe(1);
    expect(manifest.modelConfiguration).toEqual({
      surface: "CHATGPT_WEB",
      model: "gpt-5.6-sol",
      reasoningMode: "pro",
    });
  });

  it("maps requested aliases to reviewed manifest managers without inventing unknowns", () => {
    const managers = ["3i Group", "CVC DIF", "BlackRock (GIP)"];
    expect(manifestManagerFor("3i Infrastructure", managers)).toBe("3i Group");
    expect(manifestManagerFor("DIF", managers)).toBe("CVC DIF");
    expect(manifestManagerFor("Global Infrastructure Partners", managers)).toBe("BlackRock (GIP)");
    expect(manifestManagerFor("Unlisted Manager", managers)).toBeNull();
  });

  it("renders a complete manager-specific prompt", () => {
    const rendered = renderWorkerPrompt({
      asOfDate: "2026-07-29",
      managerIndex: 1,
      requestedManager: "3i Infrastructure",
      snapshot: snapshot(),
    });
    expect(rendered).toContain("# North American direct infrastructure fund census — 3i Infrastructure");
    expect(rendered).toContain("VERIFIED_CURRENT_NA_HOLDING");
    expect(rendered).toContain("PROGRAM_EXCEPTION");
    expect(rendered).toContain("FUND_CENSUS_REPO_SNAPSHOT");
    expect(rendered).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it("accepts an evidence-backed direct-equity North American fund", () => {
    expect(fundCensusResultSchema.safeParse(result([includedFund()])).success).toBe(true);
  });

  it("rejects a pure debt fund and a deployment qualification without a holding", () => {
    const invalid = result([includedFund()]);
    invalid.funds[0].snapshot.strategies = ["Credit / Debt"];
    invalid.funds[0].northAmericaQualification = {
      basis: "VERIFIED_CURRENT_NA_HOLDING",
      rationale: "An attributable holding was asserted.",
      currentHoldingName: null,
      currentHoldingUrl: null,
    };
    const parsed = fundCensusResultSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.message)).toEqual(expect.arrayContaining([
        "Included fund has no direct-equity strategy classification",
        "VERIFIED_CURRENT_NA_HOLDING requires a holding name and source URL",
      ]));
    }
  });

  it("requires primary program evidence and caps program confidence", () => {
    const invalid = result([includedFund()]);
    invalid.funds[0].vehicleType = "PROGRAM_EXCEPTION";
    invalid.funds[0].evidence[0].scope = "PROGRAM_EXCEPTION";
    invalid.funds[0].evidence[0].sourceTier = "INSTITUTIONAL";
    const parsed = fundCensusResultSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.message)).toEqual(expect.arrayContaining([
        "PROGRAM_EXCEPTION requires primary program-level evidence",
        "PROGRAM_EXCEPTION cannot be HIGH confidence",
      ]));
    }
  });

  it("enforces exact repository reconciliation and field diffs", () => {
    const existing = result([includedFund("EXISTING_VERIFIED")]);
    expect(validateResultAgainstSnapshot(existing, snapshot(true))).toEqual([]);

    existing.funds[0].snapshot.size = "$750M final close";
    expect(validateResultAgainstSnapshot(existing, snapshot(true))).toEqual(expect.arrayContaining([
      expect.stringContaining("changedFields must exactly equal repository diff: size"),
    ]));
  });

  it("hydrates only missing repository identity fields from the supplied snapshot", () => {
    const existing = result([includedFund("EXISTING_VERIFIED")]);
    const rawMatch = existing.funds[0].matchedRepoFunds[0] as Partial<
      FundCensusResult["funds"][number]["matchedRepoFunds"][number]
    >;
    delete rawMatch.managerName;
    const normalized = normalizeMatchedRepoFundIdentities(
      responseFor(existing),
      snapshot(true),
    );

    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      matchIndex: 0,
      legacyId: "FUND-002",
      field: "managerName",
      value: "3i Group",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(parsed.result, snapshot(true))).toEqual([]);
  });

  it("refuses to replace a conflicting repository identity", () => {
    const existing = result([includedFund("EXISTING_VERIFIED")]);
    existing.funds[0].matchedRepoFunds[0].managerName = "Different Manager";

    expect(() => normalizeMatchedRepoFundIdentities(
      responseFor(existing),
      snapshot(true),
    )).toThrow("Refusing to replace conflicting managerName for FUND-002");
  });

  it("maps the open-ended lifecycle synonym only for an evergreen open-end vehicle", () => {
    const existing = result([includedFund("PROPOSED_CORRECTION")]);
    (existing.funds[0] as unknown as { lifecycle: string }).lifecycle =
      "OPEN_ENDED_ACTIVE";
    existing.funds[0].snapshot.structure = "Open-End";
    existing.funds[0].snapshot.fundStatus = "Evergreen";
    existing.funds[0].snapshot.sizeBasis = "AUM";
    existing.funds[0].changedFields = ["structure", "fundStatus", "sizeBasis"];

    const normalized = normalizeLifecycleEnum(responseFor(existing));

    expect(normalized.changes).toEqual([expect.objectContaining({
      fundIndex: 0,
      fundName: "3i NA Infrastructure Fund",
      field: "lifecycle",
      from: "OPEN_ENDED_ACTIVE",
      value: "EVERGREEN_ACTIVE",
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].lifecycle).toBe("EVERGREEN_ACTIVE");

    existing.funds[0].snapshot.fundStatus = "Financial Close";
    expect(() => normalizeLifecycleEnum(responseFor(existing))).toThrow(
      "without Open-End structure and Evergreen status",
    );
  });

  it("maps explicit NAV evidence to removal of a stale USD fund-size value", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.size = "$1.9B total net asset value; not classified as fund size";
    existing.snapshot.sizeUsdMm = null;
    existing.snapshot.sizeNativeCurrency = null;
    existing.snapshot.sizeNativeAmount = null;
    existing.snapshot.sizeBasis = null;
    existing.snapshot.sizeAsOf = null;
    existing.changedFields = ["size", "sizeUsdMm"];
    existing.evidence[0].evidenceSummary =
      "The primary source displays $1.9 billion of total net asset value.";
    existing.evidence[0].supportedFields =
      existing.evidence[0].supportedFields.filter((field) => field !== "sizeUsdMm");

    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      legacyId: "FUND-002",
      size: "$1.7B",
      sizeUsdMm: 1700,
    };
    const normalized = normalizeNullUsdSizeEvidenceSupport(
      responseFor(result([existing])),
      repositorySnapshot,
    );

    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      evidenceIndex: 0,
      legacyId: "FUND-002",
      url: "https://example.com/fund",
      field: "sizeUsdMm",
      rationale:
        "Existing primary or institutional evidence states that the displayed amount is net asset value while the normalized snapshot explicitly does not classify it as fund size.",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("does not infer null USD-size evidence without explicit NAV semantics", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.size = "Undisclosed";
    existing.snapshot.sizeUsdMm = null;
    existing.snapshot.sizeNativeCurrency = null;
    existing.snapshot.sizeNativeAmount = null;
    existing.snapshot.sizeBasis = null;
    existing.snapshot.sizeAsOf = null;
    existing.changedFields = ["size", "sizeUsdMm"];
    existing.evidence[0].supportedFields =
      existing.evidence[0].supportedFields.filter((field) => field !== "sizeUsdMm");

    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      legacyId: "FUND-002",
      size: "$1.7B",
      sizeUsdMm: 1700,
    };

    expect(normalizeNullUsdSizeEvidenceSupport(
      responseFor(result([existing])),
      repositorySnapshot,
    ).changes).toEqual([]);
  });

  it("maps an unclassified descriptive non-USD amount to stale USD-conversion removal", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.size = "C$32.5B infrastructure investments";
    existing.snapshot.sizeUsdMm = null;
    existing.snapshot.sizeNativeCurrency = null;
    existing.snapshot.sizeNativeAmount = null;
    existing.snapshot.sizeBasis = null;
    existing.changedFields = ["size", "sizeUsdMm"];
    existing.evidence[0].evidenceSummary =
      "The primary source reports C$32.5 billion of infrastructure investments.";
    existing.evidence[0].supportedFields =
      existing.evidence[0].supportedFields.filter((field) =>
        field !== "sizeUsdMm" && field !== "sizeBasis");

    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      legacyId: "FUND-002",
      size: "C$33B",
      sizeUsdMm: 24_420,
    };
    const normalized = normalizeNullUsdSizeEvidenceSupport(
      responseFor(result([existing])),
      repositorySnapshot,
    );

    expect(normalized.changes).toEqual([expect.objectContaining({
      fundIndex: 0,
      evidenceIndex: 0,
      legacyId: "FUND-002",
      field: "sizeUsdMm",
      rationale:
        "Existing primary or institutional evidence supports a descriptive non-USD amount but no allowed amount basis or USD equivalent, so the stale repository USD conversion is removed.",
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("maps native-currency-only fund evidence to removal of a stale USD conversion", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.vehicleType = "PROGRAM_EXCEPTION";
    existing.confidence = "MEDIUM";
    existing.evidence[0].scope = "PROGRAM_EXCEPTION";
    existing.evidence[0].confidence = "MEDIUM";
    existing.snapshot.size = "€739M final close";
    existing.snapshot.sizeUsdMm = null;
    existing.snapshot.sizeNativeCurrency = "EUR";
    existing.snapshot.sizeNativeAmount = "739000000";
    existing.changedFields = [
      "size",
      "sizeNativeAmount",
      "sizeNativeCurrency",
      "sizeUsdMm",
    ];
    existing.evidence[0].evidenceSummary =
      "The official fund release confirms a €739 million final close.";
    existing.evidence[0].supportedFields =
      existing.evidence[0].supportedFields.filter((field) => field !== "sizeUsdMm");

    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      size: "$800M",
      sizeUsdMm: 800,
      sizeNativeCurrency: null,
      sizeNativeAmount: null,
    };
    const normalized = normalizeNullUsdSizeEvidenceSupport(
      responseFor(result([existing])),
      repositorySnapshot,
    );

    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      evidenceIndex: 0,
      legacyId: "FUND-002",
      url: "https://example.com/fund",
      field: "sizeUsdMm",
      rationale:
        "Existing primary or institutional fund evidence supports the native-currency amount and amount basis but states no USD equivalent, so the stale repository USD conversion is removed.",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("maps an exact native USD amount to its deterministic millions value", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.size = "$13.8B amount sold";
    existing.snapshot.sizeUsdMm = 13_832;
    existing.snapshot.sizeNativeCurrency = "USD";
    existing.snapshot.sizeNativeAmount = "13832300000";
    existing.snapshot.sizeBasis = "AMOUNT_SOLD";
    existing.changedFields = [
      "size",
      "sizeUsdMm",
      "sizeNativeCurrency",
      "sizeNativeAmount",
      "sizeBasis",
    ];
    existing.evidence[0].evidenceSummary =
      "The primary filing reports $13,832,300,000 of securities sold.";
    existing.evidence[0].supportedFields =
      existing.evidence[0].supportedFields.filter((field) => field !== "sizeUsdMm");

    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      size: "$3.2B",
      sizeUsdMm: 3200,
      sizeNativeCurrency: null,
      sizeNativeAmount: null,
      sizeBasis: null,
    };
    const normalized = normalizeNullUsdSizeEvidenceSupport(
      responseFor(result([existing])),
      repositorySnapshot,
    );

    expect(normalized.changes).toEqual([expect.objectContaining({
      fundIndex: 0,
      evidenceIndex: 0,
      field: "sizeUsdMm",
      rationale:
        "Existing primary or institutional fund evidence supports an exact native USD amount whose deterministic rounded millions-value equals sizeUsdMm.",
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("anchors an unsupported size-as-of date to the unique amount source", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.sizeNativeCurrency = "EUR";
    existing.snapshot.sizeAsOf = "2024-01-01";
    existing.changedFields = ["sizeAsOf", "sizeNativeCurrency"];

    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      sizeAsOf: null,
      sizeNativeCurrency: null,
    };
    const normalized = normalizeUnsupportedSizeAsOf(
      responseFor(result([existing])),
      repositorySnapshot,
    );

    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      evidenceIndex: 0,
      legacyId: "FUND-002",
      url: "https://example.com/fund",
      field: "sizeAsOf",
      from: "2024-01-01",
      value: "2023-12-01",
      rationale:
        "The model supplied a size-as-of date that no evidence row supports; the amount is anchored instead to the publication date of the single opened primary or institutional fund source supporting the classified native amount.",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].snapshot.sizeAsOf).toBe("2023-12-01");
    expect(parsed.result.funds[0].changedFields).toEqual([
      "sizeAsOf",
      "sizeNativeCurrency",
    ]);
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("records an operator-verified publication date before amount-date anchoring", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.sizeNativeCurrency = "EUR";
    existing.snapshot.sizeAsOf = "2023-12-01";
    existing.changedFields = ["sizeAsOf", "sizeNativeCurrency"];
    existing.evidence[0].publishedAt = null;
    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      sizeAsOf: null,
      sizeNativeCurrency: null,
    };

    const sourceNormalized = normalizeVerifiedSourcePublishedAt(
      responseFor(result([existing])),
      [{
        url: "https://example.com/fund",
        publishedAt: "2023-12-01",
      }],
    );
    expect(sourceNormalized.changes).toEqual([expect.objectContaining({
      fundIndex: 0,
      evidenceIndex: 0,
      url: "https://example.com/fund",
      field: "publishedAt",
      from: null,
      value: "2023-12-01",
    })]);

    const dateNormalized = normalizeUnsupportedSizeAsOf(
      sourceNormalized.response,
      repositorySnapshot,
    );
    const parsed = parseFundCensusResponse(dateNormalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].evidence[0]).toMatchObject({
      publishedAt: "2023-12-01",
      supportedFields: expect.arrayContaining(["sizeAsOf"]),
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("anchors a missing size-as-of date to the unique amount source", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.sizeAsOf = null;
    existing.changedFields = [];
    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      sizeAsOf: null,
    };

    const dateNormalized = normalizeUnsupportedSizeAsOf(
      responseFor(result([existing])),
      repositorySnapshot,
    );

    expect(dateNormalized.changes).toEqual([expect.objectContaining({
      field: "sizeAsOf",
      from: null,
      value: "2023-12-01",
    })]);
    const fieldsNormalized = normalizeRepositoryChangedFields(
      dateNormalized.response,
      repositorySnapshot,
    );
    const parsed = parseFundCensusResponse(fieldsNormalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].snapshot.sizeAsOf).toBe("2023-12-01");
    expect(parsed.result.funds[0].changedFields).toContain("sizeAsOf");
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("anchors an undeclared size-as-of difference before reconciling changedFields", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.sizeNativeCurrency = "EUR";
    existing.snapshot.sizeAsOf = "2024-01-01";
    existing.changedFields = ["sizeNativeCurrency"];

    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      sizeAsOf: null,
      sizeNativeCurrency: null,
    };
    const dateNormalized = normalizeUnsupportedSizeAsOf(
      responseFor(result([existing])),
      repositorySnapshot,
    );
    expect(dateNormalized.changes).toHaveLength(1);

    const fieldsNormalized = normalizeRepositoryChangedFields(
      dateNormalized.response,
      repositorySnapshot,
    );
    const parsed = parseFundCensusResponse(fieldsNormalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].snapshot.sizeAsOf).toBe("2023-12-01");
    expect(parsed.result.funds[0].changedFields).toEqual([
      "sizeNativeCurrency",
      "sizeAsOf",
    ]);
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("does not remove a size-as-of date claimed by evidence", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.sizeAsOf = "2024-01-01";
    existing.changedFields = ["sizeAsOf"];
    existing.evidence[0].supportedFields.push("sizeAsOf");
    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      sizeAsOf: null,
    };

    expect(normalizeUnsupportedSizeAsOf(
      responseFor(result([existing])),
      repositorySnapshot,
    ).changes).toEqual([]);
  });

  it("reverts only undeclared repository differences lacking evidence support", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.investmentStrategy = "Incidental model rewrite.";
    existing.snapshot.size = "$739M final close";
    existing.changedFields = ["size"];
    existing.evidence[0].supportedFields =
      existing.evidence[0].supportedFields.filter(
        (field) => field !== "investmentStrategy",
      );

    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...existing.snapshot,
      investmentStrategy: "Reviewed repository strategy.",
      size: "$700M final close",
    };
    const normalized = normalizeUnsupportedRepositoryDifferences(
      responseFor(result([existing])),
      repositorySnapshot,
    );

    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      legacyId: "FUND-002",
      field: "investmentStrategy",
      from: "Incidental model rewrite.",
      value: "Reviewed repository strategy.",
      rationale:
        "The model changed this repository field without declaring it in changedFields or mapping any opened evidence to it, so the incidental rewrite is reverted.",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].snapshot.investmentStrategy).toBe(
      "Reviewed repository strategy.",
    );
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("reverts declared repository corrections that lack field evidence", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.size = "$800M classified AUM";
    existing.snapshot.sizeBasis = "AUM";
    existing.snapshot.sizeAsOf = null;
    existing.changedFields = ["size", "sizeBasis"];
    existing.evidence[0].supportedFields =
      existing.evidence[0].supportedFields.filter(
        (field) => field !== "size" && field !== "sizeBasis",
      );
    const repositorySnapshot = snapshot(true);

    const normalized = normalizeUnsupportedRepositoryDifferences(
      responseFor(result([existing])),
      repositorySnapshot,
    );
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].snapshot).toEqual(repositorySnapshot.funds[0]);
    expect(parsed.result.funds[0]).toMatchObject({
      repoDisposition: "EXISTING_VERIFIED",
      changedFields: [],
    });
    expect(parsed.result.summary.proposedCorrections).toBe(0);
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("reverts every snapshot difference on an existing-verified row", () => {
    const existing = includedFund("EXISTING_VERIFIED");
    existing.snapshot.investmentStrategy = "Incidental supported rewrite.";
    existing.snapshot.sourceUrls = ["https://example.com/replacement"];
    existing.evidence[0].supportedFields.push("investmentStrategy");
    existing.changedFields = [];
    const repositorySnapshot = snapshot(true);

    const normalized = normalizeUnsupportedRepositoryDifferences(
      responseFor(result([existing])),
      repositorySnapshot,
    );
    expect(normalized.changes.map((change) => change.field)).toEqual([
      "investmentStrategy",
      "sourceUrls",
    ]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].snapshot).toEqual(repositorySnapshot.funds[0]);
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("demotes a proposed fund whose claimed holding lacks North America evidence", () => {
    const proposed = includedFund("PROPOSED_NEW");
    proposed.northAmericaQualification = {
      basis: "VERIFIED_CURRENT_NA_HOLDING",
      rationale: "The fund was claimed to hold Example Solar.",
      currentHoldingName: "Example Solar",
      currentHoldingUrl: "https://example.com/holding",
    };
    proposed.snapshot.regions = ["Global"];
    proposed.evidence[0].supports =
      proposed.evidence[0].supports.filter((claim) => claim !== "NORTH_AMERICA");
    proposed.evidence[0].evidenceSummary =
      "The manager page describes the strategy but does not attribute Example Solar to the fund.";
    const normalized = normalizeUnsupportedNorthAmericaHolding(
      responseFor(result([proposed])),
    );

    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      fundName: "3i NA Infrastructure Fund",
      field: "funds",
      dispositionFrom: "PROPOSED_NEW",
      dispositionValue: "EXCLUDED",
      reasonCode: "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE",
      sourceUrls: ["https://example.com/fund"],
      rationale:
        "Opened evidence does not establish that Example Solar is a current North American holding attributed specifically to 3i NA Infrastructure Fund.",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds).toEqual([]);
    expect(parsed.result.summary).toMatchObject({
      includedFunds: 0,
      explicitNaMandate: 0,
      verifiedCurrentNaHolding: 0,
      proposedNew: 0,
      excludedCandidates: 1,
      unresolvedConflicts: 1,
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      snapshot(),
    )).toEqual([]);
  });

  it("moves a needs-review repository fund without North America evidence to repo-only review", () => {
    const existing = includedFund("NEEDS_REVIEW");
    existing.evidence[0].supports = existing.evidence[0].supports.filter(
      (claim) => claim !== "NORTH_AMERICA",
    );
    existing.repoDispositionRationale =
      "The supplied North American mandate is not confirmed by opened fund evidence.";
    const censusResult = result([existing]);

    const normalized = normalizeUnsupportedNorthAmericaEvidenceRepoReview(
      responseFor(censusResult),
      snapshot(true),
    );

    expect(normalized.changes).toEqual([expect.objectContaining({
      fundIndex: 0,
      legacyId: "FUND-002",
      fundName: "3i NA Infrastructure Fund",
      field: "funds",
      dispositionFrom: "NEEDS_REVIEW",
      dispositionValue: "REPO_ONLY_NEEDS_REVIEW",
      sourceUrls: ["https://example.com/fund"],
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds).toEqual([]);
    expect(parsed.result.repoOnlyRecords).toEqual([expect.objectContaining({
      legacyId: "FUND-002",
      repoFundName: "3i NA Infrastructure Fund",
      disposition: "NEEDS_REVIEW",
      evidenceUrls: ["https://example.com/fund"],
    })]);
    expect(parsed.result.summary).toMatchObject({
      includedFunds: 0,
      explicitNaMandate: 0,
      needsReview: 0,
      repoOnlyRecords: 1,
      unresolvedConflicts: 1,
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      snapshot(true),
    )).toEqual([]);
  });

  it("moves a repository correction without North America evidence to repo-only review", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.changedFields = ["investmentStrategy"];
    existing.snapshot.investmentStrategy =
      "Updated evidence-backed infrastructure strategy.";
    existing.evidence[0].supports = existing.evidence[0].supports.filter(
      (claim) => claim !== "NORTH_AMERICA",
    );
    existing.evidence[0].supportedFields = [
      "fundName",
      "investmentStrategy",
      "fundStatus",
    ];
    const censusResult = result([existing]);
    censusResult.summary.proposedCorrections = 1;

    const normalized = normalizeUnsupportedNorthAmericaEvidenceRepoReview(
      responseFor(censusResult),
      snapshot(true),
    );

    expect(normalized.changes).toEqual([expect.objectContaining({
      legacyId: "FUND-002",
      dispositionFrom: "PROPOSED_CORRECTION",
      unsupportedClaim: "NORTH_AMERICA",
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds).toEqual([]);
    expect(validateResultAgainstSnapshot(
      parsed.result,
      snapshot(true),
    )).toEqual([]);
  });

  it("moves a repository correction without current lifecycle evidence to repo-only review", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.changedFields = ["investmentStrategy"];
    existing.snapshot.investmentStrategy =
      "Updated evidence-backed infrastructure strategy.";
    existing.evidence[0].supports = existing.evidence[0].supports.filter(
      (claim) => claim !== "CURRENT_LIFECYCLE",
    );
    existing.evidence[0].supportedFields = [
      "fundName",
      "investmentStrategy",
      "regions",
    ];
    const censusResult = result([existing]);
    censusResult.summary.proposedCorrections = 1;

    const normalized = normalizeUnsupportedNorthAmericaEvidenceRepoReview(
      responseFor(censusResult),
      snapshot(true),
      "CURRENT_LIFECYCLE",
    );

    expect(normalized.changes).toEqual([expect.objectContaining({
      fundIndex: 0,
      legacyId: "FUND-002",
      dispositionFrom: "PROPOSED_CORRECTION",
      dispositionValue: "REPO_ONLY_NEEDS_REVIEW",
      unsupportedClaim: "CURRENT_LIFECYCLE",
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds).toEqual([]);
    expect(parsed.result.repoOnlyRecords).toEqual([expect.objectContaining({
      legacyId: "FUND-002",
      disposition: "NEEDS_REVIEW",
    })]);
    expect(parsed.result.summary).toMatchObject({
      includedFunds: 0,
      proposedCorrections: 0,
      repoOnlyRecords: 1,
      unresolvedConflicts: 1,
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      snapshot(true),
    )).toEqual([]);
  });

  it("moves a secondary-only repository correction to repo-only review", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.changedFields = ["investmentStrategy"];
    existing.snapshot.investmentStrategy =
      "Updated evidence-backed infrastructure strategy.";
    existing.evidence[0].sourceTier = "REPUTABLE_SECONDARY";
    existing.evidence[0].confidence = "MEDIUM";
    const censusResult = result([existing]);
    censusResult.summary.proposedCorrections = 1;

    const normalized = normalizeUnsupportedNorthAmericaEvidenceRepoReview(
      responseFor(censusResult),
      snapshot(true),
      "SECONDARY_ONLY",
    );

    expect(normalized.changes).toEqual([expect.objectContaining({
      legacyId: "FUND-002",
      dispositionFrom: "PROPOSED_CORRECTION",
      unsupportedClaim: "SECONDARY_ONLY",
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds).toEqual([]);
    expect(parsed.result.repoOnlyRecords).toEqual([expect.objectContaining({
      legacyId: "FUND-002",
      disposition: "NEEDS_REVIEW",
    })]);
    expect(validateResultAgainstSnapshot(
      parsed.result,
      snapshot(true),
    )).toEqual([]);
  });

  it("aligns only post-cutoff retrieval dates required by the census contract", () => {
    const censusResult = result([includedFund()]);
    censusResult.funds[0].evidence[0].retrievedAt = "2026-07-30";
    const normalized = normalizeEvidenceRetrievedAtAsOf(
      responseFor(censusResult),
      snapshot(),
    );

    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      evidenceIndex: 0,
      url: "https://example.com/fund",
      field: "retrievedAt",
      from: "2026-07-30",
      value: "2026-07-29",
      rationale:
        "The fixed census worker contract requires evidence retrieval dates to equal the declared census as-of date; the source was not published after that cutoff.",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(parsed.result, snapshot())).toEqual([]);
  });

  it("refuses retrieval-date alignment for evidence published after cutoff", () => {
    const censusResult = result([includedFund()]);
    censusResult.funds[0].evidence[0].publishedAt = "2026-07-30";
    censusResult.funds[0].evidence[0].retrievedAt = "2026-07-30";

    expect(() => normalizeEvidenceRetrievedAtAsOf(
      responseFor(censusResult),
      snapshot(),
    )).toThrow("Refusing post-cutoff evidence at funds.0.evidence.0");
  });

  it("normalizes only explicit primary program-identity evidence scope", () => {
    const program = includedFund();
    program.vehicleType = "PROGRAM_EXCEPTION";
    program.confidence = "MEDIUM";
    program.evidence[0].scope = "FUND";
    program.evidence[0].confidence = "MEDIUM";
    program.evidence[0].evidenceLabel =
      "Documented program identity and direct-investment scope";

    const normalized = normalizeProgramExceptionEvidenceScope(
      responseFor(result([program])),
    );

    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      evidenceIndex: 0,
      url: "https://example.com/fund",
      field: "scope",
      from: "FUND",
      value: "PROGRAM_EXCEPTION",
      rationale:
        "The PRIMARY evidence row explicitly supports program identity and direct-equity infrastructure scope for a PROGRAM_EXCEPTION vehicle.",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(parsed.result, snapshot())).toEqual([]);
  });

  it("does not relabel generic fund evidence as program evidence", () => {
    const program = includedFund();
    program.vehicleType = "PROGRAM_EXCEPTION";
    program.confidence = "MEDIUM";
    program.evidence[0].scope = "FUND";
    program.evidence[0].confidence = "MEDIUM";
    program.evidence[0].evidenceLabel =
      "Official fund identity and direct-investment scope";

    expect(normalizeProgramExceptionEvidenceScope(
      responseFor(result([program])),
    ).changes).toEqual([]);
  });

  it("attributes program identity only from an exact primary program row", () => {
    const program = includedFund();
    program.vehicleType = "PROGRAM_EXCEPTION";
    program.confidence = "MEDIUM";
    program.evidence[0].scope = "PROGRAM_EXCEPTION";
    program.evidence[0].confidence = "MEDIUM";
    program.evidence[0].supports = [
      "DIRECT_EQUITY_INFRASTRUCTURE",
      "NORTH_AMERICA",
      "CURRENT_LIFECYCLE",
    ];
    program.evidence[0].supportedFields =
      program.evidence[0].supportedFields.filter((field) => field !== "fundName");
    program.evidence[0].publisher = program.fundName;

    const normalized = normalizeProgramExceptionIdentityEvidence(
      responseFor(result([program])),
    );

    expect(normalized.changes).toEqual([expect.objectContaining({
      fundIndex: 0,
      evidenceIndex: 0,
      fundName: program.fundName,
      claimsAdded: ["FUND_IDENTITY"],
      fieldsAdded: ["fundName"],
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(parsed.result, snapshot())).toEqual([]);
  });

  it("removes structured size fields instead of inventing an undisclosed basis", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.size = "$739M infrastructure investments";
    existing.snapshot.sizeBasis = null;
    existing.snapshot.sizeUsdMm = null;
    existing.evidence[0].supportedFields =
      existing.evidence[0].supportedFields.filter((field) =>
        field !== "sizeBasis" && field !== "sizeUsdMm");
    existing.changedFields = [
      "size",
      "sizeNativeCurrency",
      "sizeNativeAmount",
      "sizeAsOf",
    ];
    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0] = {
      ...repositorySnapshot.funds[0],
      size: "$739M final close",
      sizeUsdMm: null,
      sizeNativeCurrency: null,
      sizeNativeAmount: null,
      sizeBasis: null,
      sizeAsOf: existing.snapshot.sizeAsOf,
    };
    const normalized = normalizeUnclassifiedSizeStructure(
      responseFor(result([existing])),
    );

    expect(normalized.changes).toEqual([
      expect.objectContaining({ field: "sizeNativeCurrency", value: null }),
      expect.objectContaining({ field: "sizeNativeAmount", value: null }),
    ]);
    const reconciled = normalizeRepositoryChangedFields(
      normalized.response,
      repositorySnapshot,
    );
    const parsed = parseFundCensusResponse(reconciled.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].snapshot).toMatchObject({
      size: "$739M infrastructure investments",
      sizeNativeCurrency: null,
      sizeNativeAmount: null,
      sizeBasis: null,
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("normalizes explicit program and program-attributed holding scopes", () => {
    const program = includedFund();
    program.vehicleType = "PROGRAM_EXCEPTION";
    program.confidence = "MEDIUM";
    program.evidence[0].scope =
      "PROGRAM" as FundCensusResult["funds"][number]["evidence"][number]["scope"];
    program.evidence[0].evidenceLabel =
      "Primary audited program-level infrastructure disclosure";
    const holding = {
      ...evidence(),
      scope:
        "HOLDING" as FundCensusResult["funds"][number]["evidence"][number]["scope"],
      evidenceLabel: "North American direct-equity infrastructure deployment",
      evidenceSummary:
        "The source attributes the investment to the infrastructure investment team.",
      supports: [
        "DIRECT_EQUITY_INFRASTRUCTURE",
        "NORTH_AMERICA",
        "CURRENT_LIFECYCLE",
      ] as FundCensusResult["funds"][number]["evidence"][number]["supports"],
      supportedFields: ["investmentStrategy", "regions", "sectors"],
    };
    program.evidence.push(holding);

    const normalized = normalizeProgramExceptionEvidenceScope(
      responseFor(result([program])),
    );

    expect(normalized.changes).toEqual([
      expect.objectContaining({
        evidenceIndex: 0,
        from: "PROGRAM",
        value: "PROGRAM_EXCEPTION",
      }),
      expect.objectContaining({
        evidenceIndex: 1,
        from: "HOLDING",
        value: "PROGRAM_EXCEPTION",
      }),
    ]);
  });

  it("appends only exact missing repository diff fields", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.size = "$750M final close";
    existing.snapshot.sectors = ["Digital", "Transportation"];
    existing.changedFields = ["size"];
    existing.evidence[0].supportedFields.push("sectors");
    const repositorySnapshot = snapshot(true);

    const normalized = normalizeRepositoryChangedFields(
      responseFor(result([existing])),
      repositorySnapshot,
    );

    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      legacyId: "FUND-002",
      field: "changedFields",
      from: ["size"],
      value: ["size", "sectors"],
      rationale:
        "The changedFields list is replaced with the deterministic field diff between the researched snapshot and its single matched repository row; every added field is evidence-supported.",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("removes an objectively extraneous changed field", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.size = "$750M final close";
    existing.changedFields = ["size", "sectors"];

    const normalized = normalizeRepositoryChangedFields(
      responseFor(result([existing])),
      snapshot(true),
    );
    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      legacyId: "FUND-002",
      field: "changedFields",
      from: ["size", "sectors"],
      value: ["size"],
      rationale:
        "The changedFields list is replaced with the deterministic field diff between the researched snapshot and its single matched repository row; every added field is evidence-supported.",
    }]);
  });

  it("refuses to append a repository diff field without evidence support", () => {
    const existing = includedFund("PROPOSED_CORRECTION");
    existing.snapshot.size = "$750M final close";
    existing.snapshot.sectors = ["Digital", "Transportation"];
    existing.changedFields = ["size"];

    expect(() => normalizeRepositoryChangedFields(
      responseFor(result([existing])),
      snapshot(true),
    )).toThrow(
      "Refusing unsupported changedFields at funds.0: sectors",
    );
  });

  it("maps only explicit insufficient fund-specific evidence shorthand", () => {
    const censusResult = result([includedFund()]);
    const invalidCandidate = {
      fundName: "3i Infrastructure Fund I",
      reasonCode: "INSUFFICIENT_EVIDENCE",
      rationale:
        "The opened fund evidence does not establish a fund-attributed current North American holding or qualifying current lifecycle.",
      sourceUrls: ["https://example.com/older-fund"],
    };
    censusResult.excludedCandidates = [
      invalidCandidate as FundCensusResult["excludedCandidates"][number],
    ];
    censusResult.summary.excludedCandidates = 1;

    const normalized = normalizeExcludedReasonCode(responseFor(censusResult));

    expect(normalized.changes).toEqual([{
      excludedCandidateIndex: 0,
      fundName: "3i Infrastructure Fund I",
      field: "reasonCode",
      from: "INSUFFICIENT_EVIDENCE",
      value: "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE",
      rationale:
        "The exclusion narrative and opened source URLs explicitly describe missing fund-specific evidence for current North American qualification.",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.excludedCandidates[0].reasonCode).toBe(
      "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE",
    );
  });

  it("maps NEEDS_REVIEW when the rationale explicitly states a fund-specific evidence shortfall", () => {
    const censusResult = result([includedFund()]);
    censusResult.excludedCandidates = [{
      fundName: "InfraRed Infrastructure Fund VII",
      reasonCode: "NEEDS_REVIEW",
      rationale:
        "The fund lacks sufficient fund-specific primary evidence confirming an explicit North American mandate or current holdings.",
      sourceUrls: ["https://example.com/fund-overview"],
    } as FundCensusResult["excludedCandidates"][number]];
    censusResult.summary.excludedCandidates = 1;

    const normalized = normalizeExcludedReasonCode(responseFor(censusResult));

    expect(normalized.changes[0]).toMatchObject({
      fundName: "InfraRed Infrastructure Fund VII",
      from: "NEEDS_REVIEW",
      value: "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE",
    });
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.excludedCandidates[0].reasonCode).toBe(
      "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE",
    );
  });

  it("maps unambiguous fund-of-funds and parallel-vehicle exclusion shorthands", () => {
    const censusResult = result([includedFund()]);
    censusResult.excludedCandidates = [
      {
        fundName: "Retail Access Fund",
        reasonCode: "FUND_OF_FUNDS",
        rationale:
          "Retail access vehicle investing into underlying funds rather than directly in infrastructure assets.",
        sourceUrls: ["https://example.com/access"],
      },
      {
        fundName: "WASH Co-Investment LP",
        reasonCode: "PARALLEL_OR_FEEDER",
        rationale:
          "Deal-specific co-investment vehicle without independent strategy distinct from the underlying fund.",
        sourceUrls: ["https://example.com/co-invest"],
      },
    ] as FundCensusResult["excludedCandidates"];
    censusResult.summary.excludedCandidates = 2;

    const normalized = normalizeExcludedReasonCode(responseFor(censusResult));

    expect(normalized.changes).toEqual([
      expect.objectContaining({
        from: "FUND_OF_FUNDS",
        value: "SECONDARIES_OR_FUND_OF_FUNDS",
      }),
      expect.objectContaining({
        from: "PARALLEL_OR_FEEDER",
        value: "DUPLICATE_OR_PARALLEL_VEHICLE",
      }),
    ]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.excludedCandidates.map((candidate) =>
      candidate.reasonCode)).toEqual([
      "SECONDARIES_OR_FUND_OF_FUNDS",
      "DUPLICATE_OR_PARALLEL_VEHICLE",
    ]);
  });

  it("refuses vague insufficient-evidence shorthand", () => {
    const censusResult = result([includedFund()]);
    censusResult.excludedCandidates = [{
      fundName: "3i Infrastructure Fund I",
      reasonCode: "INSUFFICIENT_EVIDENCE",
      rationale: "The evidence was incomplete.",
      sourceUrls: ["https://example.com/older-fund"],
    } as FundCensusResult["excludedCandidates"][number]];
    censusResult.summary.excludedCandidates = 1;

    expect(() => normalizeExcludedReasonCode(
      responseFor(censusResult),
    )).toThrow(
      "Refusing unsupported exclusion reason-code normalization at excludedCandidates.0",
    );
  });

  it("adds North America only for an exactly sourced current holding", () => {
    const existing = includedFund("EXISTING_VERIFIED");
    existing.snapshot.regions = ["Global"];
    existing.northAmericaQualification = {
      basis: "VERIFIED_CURRENT_NA_HOLDING",
      rationale: "The official source attributes the current QTS holding.",
      currentHoldingName: "QTS, Inc.",
      currentHoldingUrl: "https://example.com/fund",
    };
    existing.evidence[0].evidenceSummary =
      "The official source presents a current North American holding.";
    const censusResult = result([existing]);
    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0].regions = ["Global"];

    const normalized = normalizeVerifiedHoldingNorthAmericaRegions(
      responseFor(censusResult),
      repositorySnapshot,
    );

    expect(normalized.changes).toEqual([{
      fundIndex: 0,
      legacyId: "FUND-002",
      field: "snapshot.regions",
      from: ["Global"],
      value: ["North America", "Global"],
      repoDispositionFrom: "EXISTING_VERIFIED",
      repoDispositionValue: "PROPOSED_CORRECTION",
      rationale:
        "The fund already qualifies through a named current North American holding whose exact PRIMARY or INSTITUTIONAL source supports the canonical regions field.",
    }]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(
      parsed.result,
      repositorySnapshot,
    )).toEqual([]);
  });

  it("adds North America to a proposed-new program from an exact current U.S. holding", () => {
    const proposed = includedFund();
    proposed.snapshot.regions = ["Global"];
    proposed.northAmericaQualification = {
      basis: "VERIFIED_CURRENT_NA_HOLDING",
      rationale: "The official source attributes the current QTS holding.",
      currentHoldingName: "QTS, Inc.",
      currentHoldingUrl: "https://example.com/fund",
    };
    proposed.evidence[0].evidenceSummary =
      "The official source presents QTS as a current U.S. holding.";
    const censusResult = result([proposed]);

    const normalized = normalizeVerifiedHoldingNorthAmericaRegions(
      responseFor(censusResult),
      snapshot(),
    );

    expect(normalized.changes).toEqual([expect.objectContaining({
      fundIndex: 0,
      legacyId: null,
      from: ["Global"],
      value: ["North America", "Global"],
      repoDispositionFrom: "PROPOSED_NEW",
      repoDispositionValue: "PROPOSED_NEW",
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(validateResultAgainstSnapshot(parsed.result, snapshot())).toEqual([]);
  });

  it("maps a holding basis to an explicit mandate only from qualifying fund evidence", () => {
    const existing = includedFund();
    existing.northAmericaQualification = {
      basis: "VERIFIED_CURRENT_NA_HOLDING",
      rationale:
        "The fund invests in North American climate infrastructure.",
      currentHoldingName: null,
      currentHoldingUrl: null,
    };
    existing.evidence[0].evidenceSummary =
      "The fund investment strategy includes North America.";
    existing.evidence[0].supportedFields = [
      "fundName",
      "investmentStrategy",
      "regions",
      "fundStatus",
    ];
    const censusResult = result([existing]);
    censusResult.summary.explicitNaMandate = 0;
    censusResult.summary.verifiedCurrentNaHolding = 1;

    const normalized = normalizeExplicitNorthAmericaBasis(
      responseFor(censusResult),
    );

    expect(normalized.changes).toEqual([expect.objectContaining({
      fundIndex: 0,
      from: "VERIFIED_CURRENT_NA_HOLDING",
      value: "EXPLICIT_NA_MANDATE",
      evidenceUrl: "https://example.com/fund",
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].northAmericaQualification.basis).toBe(
      "EXPLICIT_NA_MANDATE",
    );
    expect(parsed.result.summary).toMatchObject({
      explicitNaMandate: 1,
      verifiedCurrentNaHolding: 0,
    });
  });

  it("recomputes stale summary counters from result arrays", () => {
    const censusResult = result([]);
    censusResult.repoOnlyRecords = [{
      legacyId: "FUND-002",
      repoFundName: "3i NA Infrastructure Fund",
      disposition: "NEEDS_REVIEW",
      rationale: "The repository row is retained for review.",
      evidenceUrls: ["https://example.com/fund"],
    }];
    censusResult.summary.needsReview = 1;
    censusResult.summary.repoOnlyRecords = 0;

    const normalized = normalizeSummaryCounts(responseFor(censusResult));

    expect(normalized.changes).toEqual([
      expect.objectContaining({
        field: "summary.needsReview",
        from: 1,
        value: 0,
      }),
      expect.objectContaining({
        field: "summary.repoOnlyRecords",
        from: 0,
        value: 1,
      }),
    ]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.summary).toMatchObject({
      needsReview: 0,
      repoOnlyRecords: 1,
    });
  });

  it("maps the Asia shorthand to the canonical Asia-Pacific region", () => {
    const existing = includedFund();
    existing.snapshot.regions = [
      "North America",
      "Europe",
      "Asia" as FundCensusResult["funds"][number]["snapshot"]["regions"][number],
    ];

    const normalized = normalizeRegionEnum(responseFor(result([existing])));

    expect(normalized.changes).toEqual([expect.objectContaining({
      fundIndex: 0,
      from: ["North America", "Europe", "Asia"],
      value: ["North America", "Europe", "Asia-Pacific"],
    })]);
    const parsed = parseFundCensusResponse(normalized.response, {
      manager: "3i Infrastructure",
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.funds[0].snapshot.regions).toEqual([
      "North America",
      "Europe",
      "Asia-Pacific",
    ]);
  });

  it("does not add North America without an exact holding evidence URL", () => {
    const existing = includedFund("EXISTING_VERIFIED");
    existing.snapshot.regions = ["Global"];
    existing.northAmericaQualification = {
      basis: "VERIFIED_CURRENT_NA_HOLDING",
      rationale: "A holding was identified.",
      currentHoldingName: "QTS",
      currentHoldingUrl: "https://example.com/different-source",
    };
    const repositorySnapshot = snapshot(true);
    repositorySnapshot.funds[0].regions = ["Global"];

    expect(normalizeVerifiedHoldingNorthAmericaRegions(
      responseFor(result([existing])),
      repositorySnapshot,
    ).changes).toEqual([]);
  });

  it("parses and ingests a validated response only once", () => {
    const runDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "fund-census-test-"));
    const manifest = createManifest("2026-07-29", "2026-07-29T12:00:00.000Z");
    atomicWrite(path.join(runDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    const manager = "3i Infrastructure";
    const stem = managerArtifactStem(1, manager);
    atomicWrite(
      path.join(runDirectory, "snapshots", `${stem}.json`),
      `${JSON.stringify(snapshot(), null, 2)}\n`,
    );
    const rawPath = path.join(runDirectory, "raw", `${stem}.txt`);
    atomicWrite(rawPath, responseFor(result([includedFund()])));

    const parsed = parseFundCensusResponse(fs.readFileSync(rawPath, "utf8"), {
      manager,
      asOfDate: "2026-07-29",
      snapshotSource: "PROVIDED",
      knownManager: true,
    });
    expect(parsed.result.summary.includedFunds).toBe(1);

    const output = ingestFundCensusResponse({ runDirectory, managerIndex: 1, inputPath: rawPath });
    expect(fs.existsSync(output.resultPath)).toBe(true);
    expect(loadManifest(output.manifestPath).currentIndex).toBe(2);
    expect(() => ingestFundCensusResponse({
      runDirectory,
      managerIndex: 1,
      inputPath: rawPath,
    })).toThrow("Refusing to overwrite terminal manager result COMPLETE");
  });
});
