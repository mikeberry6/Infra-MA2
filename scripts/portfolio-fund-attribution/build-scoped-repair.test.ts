import { describe, expect, it } from "vitest";
import { canonicalSha256 } from "./schema";
import { buildScopedAttributionRepair } from "./build-scoped-repair";

function snapshot() {
  const content = {
    schemaVersion: 1 as const,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_PRODUCTION_SNAPSHOT" as const,
    asOfDate: "2026-09-01",
    companyCount: 1,
    activeOwnershipCount: 2,
    publishedFundCount: 1,
    availableFundNames: ["Fund IV"],
    records: [
      {
        ownershipPeriodId: "owner-1",
        companyId: "company-1",
        companyName: "Example",
        country: "United States",
        description: "",
        investmentFirm: "Manager",
        vehicleName: "Vehicle",
        displayVehicleName: "Vehicle",
        currentLinkedFundName: null,
        currentFundAttribution: "UNRESOLVED",
        investmentYear: 2026,
        stake: null,
        milestones: [],
        sources: [],
      },
      {
        ownershipPeriodId: "owner-2",
        companyId: "company-1",
        companyName: "Example",
        country: "United States",
        description: "",
        investmentFirm: "Direct",
        vehicleName: null,
        displayVehicleName: "Direct",
        currentLinkedFundName: null,
        currentFundAttribution: "DIRECT_PROGRAM",
        investmentYear: 2026,
        stake: null,
        milestones: [],
        sources: [],
      },
    ],
  };
  return { ...content, capturedAt: "2026-09-01T00:00:00.000Z", snapshotSha256: canonicalSha256(content) };
}

function seed() {
  const content = {
    schemaVersion: 1 as const,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_SEED_MANIFEST" as const,
    sourceApplyManifestSha256: "a".repeat(64),
    sourceLedgerSha256: "b".repeat(64),
    policy: { fundCreates: 0 as const, fundUpdates: 0 as const, inferredAssignments: 1 },
    recordCount: 2,
    records: [
      {
        recordId: "record-1",
        companyName: "Example",
        country: "United States",
        investmentFirm: "Manager",
        currentVehicleName: "Vehicle",
        investmentYear: 2026,
        stake: null,
        targetLinkedFundName: "Fund IV",
        fundAttribution: "INFERRED" as const,
        attributedFundName: "Fund IV",
        attributionConfidence: "LOW" as const,
        attributionRationale: "Reviewed estimate.",
        evidenceUrls: ["https://example.com/owner"],
      },
      {
        recordId: "record-2",
        companyName: "Example",
        country: "United States",
        investmentFirm: "Direct",
        currentVehicleName: "Direct",
        investmentYear: 2026,
        stake: null,
        targetLinkedFundName: null,
        fundAttribution: "DIRECT_PROGRAM" as const,
        attributedFundName: null,
        attributionConfidence: null,
        attributionRationale: "Reviewed direct investment.",
        evidenceUrls: ["https://example.com/direct"],
      },
    ],
  };
  return { ...content, manifestSha256: canonicalSha256(content) };
}

describe("scoped attribution repair", () => {
  it("emits only production rows that differ from reviewed seed judgments", () => {
    const result = buildScopedAttributionRepair({
      asOfDate: "2026-09-01",
      productionSnapshot: snapshot(),
      seedManifest: seed(),
      companyNames: ["Example"],
    });
    expect(result.expectedMutationCount).toBe(1);
    expect(result.mutations[0]).toMatchObject({
      ownershipPeriodId: "owner-1",
      expected: { fundAttribution: "UNRESOLVED", currentLinkedFundName: null },
      targetLinkedFundName: "Fund IV",
      set: { fundAttribution: "INFERRED", attributedFundName: "Fund IV" },
    });
    expect(result.policy.fundLinkChanges).toBe(1);
  });

  it("fails closed when a reviewed owner cannot be matched exactly", () => {
    const broken = seed();
    broken.records[0].currentVehicleName = "Different";
    expect(() => buildScopedAttributionRepair({
      asOfDate: "2026-09-01",
      productionSnapshot: snapshot(),
      seedManifest: broken,
      companyNames: ["Example"],
    })).toThrow(/Expected one seed attribution/);
  });
});
