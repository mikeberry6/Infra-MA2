import { describe, expect, it, vi } from "vitest";
import {
  applyPendingOwnershipUpdates,
  observeManifest,
} from "../apply-portfolio-fund-attribution";
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
  expected: {
    fundAttribution: "DISCLOSED" | "INFERRED" | "DIRECT_PROGRAM" | "UNRESOLVED";
    currentLinkedFundName: string | null;
  };
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
      ownershipPeriod: { findMany: vi.fn().mockResolvedValue([period()]) },
      fund: { findMany: vi.fn().mockResolvedValue([{ id: "fund-3", fundName: "DigitalBridge Fund III" }]) },
    };

    const observed = await observeManifest(tx as never, manifest);
    expect(tx.ownershipPeriod.findMany).toHaveBeenCalledOnce();
    expect(tx.fund.findMany).toHaveBeenCalledOnce();
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
      ownershipPeriod: { findMany: vi.fn().mockResolvedValue([period({
          id: "owner-2",
          vehicleName: "Example Sidecar",
          investmentYear: 2022,
          stake: null,
          organization: { name: "Example Manager" },
          company: { id: "company-2", name: "Example PortCo", country: "United States" },
        })]) },
      fund: { findMany: vi.fn() },
    };

    const observed = await observeManifest(tx as never, manifest);
    expect(tx.fund.findMany).not.toHaveBeenCalled();
    expect(observed[0]).toMatchObject({ targetFundId: null, state: "PENDING" });
  });

  it("applies pending rows with one guarded bulk update", async () => {
    const executeRaw = vi.fn().mockResolvedValue(1);
    await applyPendingOwnershipUpdates({ $executeRaw: executeRaw } as never, [{
      ownershipPeriodId: "owner-1",
      currentFundId: null,
      targetFundId: "fund-3",
      expectedFundAttribution: "UNRESOLVED",
      desired: {
        linkedFundName: "DigitalBridge Fund III",
        fundAttribution: "INFERRED",
        attributedFundName: "DigitalBridge Fund III",
        attributionConfidence: "LOW",
        attributionRationale: "Estimated from manager and vintage evidence.",
      },
    }] as never);

    expect(executeRaw).toHaveBeenCalledOnce();
    const query = executeRaw.mock.calls[0][0] as { strings: string[]; values: unknown[] };
    expect(query.strings.join("?")).toContain('UPDATE "OwnershipPeriod"');
    expect(query.strings.join("?")).toContain('IS NOT DISTINCT FROM desired."expectedFundId"');
    expect(query.strings.join("?")).toContain('ownership."fundAttribution" = desired."expectedFundAttribution"');
    expect(query.values).toContain("owner-1");
    expect(query.values).toContain("fund-3");
  });

  it("rejects a guarded bulk update count mismatch", async () => {
    const executeRaw = vi.fn().mockResolvedValue(0);
    await expect(applyPendingOwnershipUpdates({ $executeRaw: executeRaw } as never, [{
      ownershipPeriodId: "owner-1",
      currentFundId: null,
      targetFundId: "fund-3",
      expectedFundAttribution: "UNRESOLVED",
      desired: {
        linkedFundName: "DigitalBridge Fund III",
        fundAttribution: "INFERRED",
        attributedFundName: "DigitalBridge Fund III",
        attributionConfidence: "LOW",
        attributionRationale: "Estimated from manager and vintage evidence.",
      },
    }] as never)).rejects.toThrow(/expected 1 guarded updates, received 0/);
  });

  it("supports a reviewed correction from inferred to unresolved", async () => {
    const manifest = reviewedManifest({
      recordId: "OFA-CORRECTION",
      ownershipPeriodId: "owner-3",
      companyName: "Example PortCo",
      country: "Canada",
      investmentFirm: "Example Manager",
      currentVehicleName: "Example LP",
      databaseVehicleName: "Example LP",
      investmentYear: 2017,
      stake: "85%",
      targetLinkedFundName: null,
      expected: { fundAttribution: "INFERRED", currentLinkedFundName: null },
      set: {
        fundAttribution: "UNRESOLVED",
        attributedFundName: null,
        attributionConfidence: null,
        attributionRationale: "Reviewed evidence does not identify a commingled fund.",
      },
      evidenceUrls: ["https://example.com/evidence"],
    });
    const tx = {
      ownershipPeriod: { findMany: vi.fn().mockResolvedValue([period({
        id: "owner-3",
        vehicleName: "Example LP",
        investmentYear: 2017,
        stake: "85%",
        fundAttribution: "INFERRED",
        attributedFundName: "Example Fund IV",
        attributionConfidence: "LOW",
        attributionRationale: "Old estimate.",
        organization: { name: "Example Manager" },
        company: { id: "company-3", name: "Example PortCo", country: "Canada" },
      })]) },
      fund: { findMany: vi.fn() },
    };

    const observed = await observeManifest(tx as never, manifest);
    expect(observed[0]).toMatchObject({
      expectedFundAttribution: "INFERRED",
      state: "PENDING",
      desired: { fundAttribution: "UNRESOLVED", attributedFundName: null },
    });
  });
});
