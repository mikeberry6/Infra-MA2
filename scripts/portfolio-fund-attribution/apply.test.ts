import { describe, expect, it, vi } from "vitest";
import { observeManifest } from "../apply-portfolio-fund-attribution";
import { canonicalSha256, verifyManifest } from "./schema";

function reviewedManifest(mutation: {
  recordId: string;
  ownershipPeriodId: string | null;
  companyName: string;
  country: string;
  investmentFirm: string;
  currentVehicleName: string;
  databaseVehicleName: string | null;
  investmentYear: number | null;
  stake: string | null;
  targetLinkedFundName: string | null;
  expected: { fundAttribution: "UNRESOLVED"; currentLinkedFundName: string | null };
  set: {
    fundAttribution: "DISCLOSED" | "INFERRED" | "DIRECT_PROGRAM" | "UNRESOLVED";
    attributedFundName: string | null;
    attributionConfidence: "HIGH" | "MEDIUM" | "LOW" | null;
    attributionRationale: string;
  };
  evidenceUrls: string[];
}) {
  const statuses = { DISCLOSED: 0, INFERRED: 0, DIRECT_PROGRAM: 0, UNRESOLVED: 0 };
  statuses[mutation.set.fundAttribution] = 1;
  const content = {
    schemaVersion: 1 as const,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPLY_MANIFEST" as const,
    asOfDate: "2026-08-16",
    ledgerSha256: "a".repeat(64),
    sourceSnapshotSha256: "e".repeat(64),
    policy: {
      sourceScope: "PRODUCTION_SNAPSHOT" as const,
      mutationScope: "OwnershipPeriod attribution metadata and existing-fund link only" as const,
      allowedAttributions: ["DISCLOSED", "INFERRED", "DIRECT_PROGRAM", "UNRESOLVED"] as const,
      fundCreates: 0 as const,
      fundUpdates: 0 as const,
      ownershipIdentityChanges: 0 as const,
      attributionCounts: statuses,
      inferredWrites: statuses.INFERRED,
      fundLinkChanges: Number(mutation.expected.currentLinkedFundName !== mutation.targetLinkedFundName),
    },
    expectedMutationCount: 1,
    mutations: [mutation],
  };
  return verifyManifest({ ...content, manifestSha256: canonicalSha256(content) });
}

function period(overrides: Record<string, unknown> = {}) {
  return {
    id: "owner-1",
    fundId: null,
    vehicleName: "n.a.",
    investmentYear: 2024,
    stake: "Lead investor",
    fundAttribution: "UNRESOLVED",
    attributedFundName: null,
    attributionConfidence: null,
    attributionRationale: null,
    organization: { name: "DigitalBridge" },
    fund: null,
    isActive: true,
    company: { id: "company-1", name: "Vantage Data Centers", country: "United States / Canada" },
    ...overrides,
  };
}

describe("portfolio fund attribution observation", () => {
  it("uses vehicle, year, and stake to select one active ownership row", async () => {
    const manifest = reviewedManifest({
      recordId: "OFA-TEST",
      ownershipPeriodId: "owner-1",
      companyName: "Vantage Data Centers",
      country: "United States / Canada",
      investmentFirm: "DigitalBridge",
      currentVehicleName: "n.a.",
      databaseVehicleName: "n.a.",
      investmentYear: 2024,
      stake: "Lead investor",
      targetLinkedFundName: "DigitalBridge Fund III",
      expected: { fundAttribution: "UNRESOLVED", currentLinkedFundName: null },
      set: {
        fundAttribution: "INFERRED",
        attributedFundName: "DigitalBridge Fund III",
        attributionConfidence: "LOW",
        attributionRationale: "Estimated from manager and vintage evidence.",
      },
      evidenceUrls: ["https://example.com/evidence"],
    });
    const tx = {
      ownershipPeriod: { findUnique: vi.fn().mockResolvedValue(period()) },
      fund: { findUnique: vi.fn().mockResolvedValue({ id: "fund-3", fundName: "DigitalBridge Fund III" }) },
    };

    const observed = await observeManifest(tx as never, manifest);
    expect(observed).toHaveLength(1);
    expect(observed[0]).toMatchObject({
      ownershipPeriodId: "owner-1",
      targetFundId: "fund-3",
      state: "PENDING",
      desired: {
        linkedFundName: "DigitalBridge Fund III",
        fundAttribution: "INFERRED",
        attributedFundName: "DigitalBridge Fund III",
        attributionConfidence: "LOW",
      },
    });
  });

  it("supports a disclosed but size-gated vehicle without creating or linking a fund", async () => {
    const manifest = reviewedManifest({
      recordId: "OFA-UNLISTED",
      ownershipPeriodId: "owner-2",
      companyName: "Example PortCo",
      country: "United States",
      investmentFirm: "Example Manager",
      currentVehicleName: "Example Sidecar",
      databaseVehicleName: "Example Sidecar",
      investmentYear: 2022,
      stake: null,
      targetLinkedFundName: null,
      expected: { fundAttribution: "UNRESOLVED", currentLinkedFundName: null },
      set: {
        fundAttribution: "DISCLOSED",
        attributedFundName: "Example Sidecar",
        attributionConfidence: null,
        attributionRationale: "Public evidence names the sidecar, which remains outside the curated fund database.",
      },
      evidenceUrls: ["https://example.com/disclosure"],
    });
    const tx = {
      ownershipPeriod: { findUnique: vi.fn().mockResolvedValue(period({
          id: "owner-2",
          vehicleName: "Example Sidecar",
          investmentYear: 2022,
          stake: null,
          organization: { name: "Example Manager" },
          company: { id: "company-2", name: "Example PortCo", country: "United States" },
        })) },
      fund: { findUnique: vi.fn() },
    };

    const observed = await observeManifest(tx as never, manifest);
    expect(tx.fund.findUnique).not.toHaveBeenCalled();
    expect(observed[0]).toMatchObject({ targetFundId: null, state: "PENDING" });
  });
});
