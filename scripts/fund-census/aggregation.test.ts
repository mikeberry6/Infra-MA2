import { describe, expect, it } from "vitest";
import {
  type AggregateFund,
  deduplicateAggregateFunds,
} from "./aggregation";

function fund(overrides: Partial<AggregateFund>): AggregateFund {
  return {
    requestedManager: "Manager A",
    canonicalManager: "Canonical Manager",
    fundName: "Infrastructure Fund I",
    aliases: [],
    vehicleType: "NAMED_FUND",
    lifecycle: "CLOSED_ACTIVE",
    directEquityBasis: "Direct infrastructure equity",
    northAmericaQualification: {
      basis: "EXPLICIT_NA_MANDATE",
      rationale: "North American mandate",
      currentHoldingName: null,
      currentHoldingUrl: null,
    },
    snapshot: {
      legacyId: "FUND-1",
      managerName: "Canonical Manager",
      fundName: "Infrastructure Fund I",
      ticker: null,
      investmentStrategy: "Infrastructure",
      size: "$1B",
      sizeUsdMm: 1000,
      sizeNativeCurrency: "USD",
      sizeNativeAmount: "1000000000",
      sizeBasis: "FINAL_CLOSE",
      sizeAsOf: "2025-01-01",
      sizeUsdFxRate: null,
      sizeUsdFxDate: null,
      vintage: "2025",
      strategies: ["Core"],
      structure: "Closed-End",
      fundStatus: "Financial Close",
      sectors: ["Power & ET"],
      regions: ["North America"],
      sourceUrls: ["https://example.com/fund"],
      strategyUrl: "https://example.com",
    },
    evidence: [
      {
        url: "https://example.com/fund",
        title: "Fund",
        publisher: "Manager",
        sourceTier: "PRIMARY",
        scope: "FUND",
        publishedAt: "2025-01-01",
        retrievedAt: "2026-07-29",
        confidence: "HIGH",
        evidenceLabel: "Fund evidence",
        evidenceSummary: "Supports the fund.",
        supports: [
          "FUND_IDENTITY",
          "DIRECT_EQUITY_INFRASTRUCTURE",
          "NORTH_AMERICA",
          "CURRENT_LIFECYCLE",
        ],
        supportedFields: ["fundName"],
      },
    ],
    repoDisposition: "PROPOSED_CORRECTION",
    matchedRepoFunds: [
      {
        legacyId: "FUND-1",
        managerName: "Canonical Manager",
        fundName: "Infrastructure Fund I",
      },
    ],
    changedFields: ["size"],
    repoDispositionRationale: "Corrected size.",
    confidence: "HIGH",
    ...overrides,
  } as AggregateFund;
}

describe("deduplicateAggregateFunds", () => {
  it("suppresses weaker cross-manager rows that share a repository identity", () => {
    const stronger = fund({
      requestedManager: "CVC",
      evidence: [
        ...fund({}).evidence,
        {
          ...fund({}).evidence[0],
          url: "https://example.com/second",
        },
      ],
    });
    const weaker = fund({ requestedManager: "DIF" });

    const result = deduplicateAggregateFunds([stronger, weaker]);

    expect(result.funds).toEqual([stronger]);
    expect(result.duplicateRowsSuppressed).toBe(1);
    expect(result.crossManagerDuplicates).toHaveLength(1);
    expect(result.crossManagerDuplicates[0]).toMatchObject({
      reason: "SHARED_REPOSITORY_LEGACY_ID",
      matchedLegacyIds: ["FUND-1"],
      preferred: stronger,
      duplicates: [weaker],
    });
  });

  it("deduplicates exact canonical fund identities without repository IDs", () => {
    const first = fund({
      requestedManager: "Alias A",
      snapshot: { ...fund({}).snapshot, legacyId: null },
      matchedRepoFunds: [],
      repoDisposition: "PROPOSED_NEW",
    });
    const second = fund({
      requestedManager: "Alias B",
      snapshot: { ...fund({}).snapshot, legacyId: null },
      matchedRepoFunds: [],
      repoDisposition: "PROPOSED_NEW",
    });

    const result = deduplicateAggregateFunds([first, second]);

    expect(result.funds).toHaveLength(1);
    expect(result.crossManagerDuplicates[0].reason)
      .toBe("CANONICAL_FUND_IDENTITY");
  });

  it("preserves same-named funds under different canonical managers", () => {
    const first = fund({
      requestedManager: "Manager A",
      canonicalManager: "Manager A",
      snapshot: { ...fund({}).snapshot, legacyId: null },
      matchedRepoFunds: [],
      repoDisposition: "PROPOSED_NEW",
    });
    const second = fund({
      requestedManager: "Manager B",
      canonicalManager: "Manager B",
      snapshot: { ...fund({}).snapshot, legacyId: null },
      matchedRepoFunds: [],
      repoDisposition: "PROPOSED_NEW",
    });

    const result = deduplicateAggregateFunds([first, second]);

    expect(result.funds).toHaveLength(2);
    expect(result.crossManagerDuplicates).toHaveLength(0);
  });
});
