import { describe, expect, it } from "vitest";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import { canonicalSha256, verifySeedManifest } from "./schema";
import {
  finalizeSeedAttributionReconciliationSpec,
  reconcileSeedAttributionManifest,
} from "./reconcile-seed-manifest";

function record(recordId: string, companyName: string, vehicle: string, inferred = false) {
  return {
    recordId,
    companyName,
    country: "United States",
    investmentFirm: "Manager",
    currentVehicleName: vehicle,
    investmentYear: 2020,
    stake: null,
    targetLinkedFundName: "Fund I",
    fundAttribution: inferred ? "INFERRED" as const : "DISCLOSED" as const,
    attributedFundName: "Fund I",
    attributionConfidence: inferred ? "MEDIUM" as const : null,
    attributionRationale: "Directly disclosed in the reviewed acquisition evidence.",
    evidenceUrls: ["https://example.com/evidence"],
  };
}

function sourceManifest() {
  const content = {
    schemaVersion: 1 as const,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_SEED_MANIFEST" as const,
    sourceApplyManifestSha256: "1".repeat(64),
    sourceLedgerSha256: "2".repeat(64),
    policy: { fundCreates: 0 as const, fundUpdates: 0 as const, inferredAssignments: 1 },
    recordCount: 2,
    records: [record("owner-old", "Alpha", "Old Vehicle"), record("owner-beta", "Beta", "Fund I", true)],
  };
  return verifySeedManifest({ ...content, manifestSha256: canonicalSha256(content) });
}

function companies(vehicle = "New Vehicle") {
  return [{
    name: "Alpha",
    country: "United States",
    investmentFirm: "Manager",
    ownershipVehicle: vehicle,
    investmentYear: 2020,
    status: "Active",
  }, {
    name: "Beta",
    country: "United States",
    investmentFirm: "Manager",
    ownershipVehicle: "Fund I",
    investmentYear: 2020,
    status: "Active",
  }] as PortCo[];
}

describe("seed ownership-attribution reconciliation", () => {
  it("replaces only approved identities and proves exact active-owner coverage", () => {
    const source = sourceManifest();
    const spec = finalizeSeedAttributionReconciliationSpec({
      schemaVersion: 1,
      artifactType: "PORTCO_BATCH_SEED_ATTRIBUTION_RECONCILIATION_SPEC",
      batchId: "batch-1",
      batchSha256: "3".repeat(64),
      reconciledAt: "2026-08-23T05:10:00.000Z",
      sourceManifestSha256: source.manifestSha256,
      rationale: "The approved PortCo after-image changed the legal vehicle identity.",
      removeRecordIds: ["owner-old"],
      upsertRecords: [record("owner-new", "Alpha", "New Vehicle")],
    });
    const result = reconcileSeedAttributionManifest({ sourceManifest: source, spec, evaluatedCompanies: companies() });
    expect(result.manifest.records.map((entry) => entry.recordId)).toEqual(["owner-beta", "owner-new"]);
    expect(result.manifest.reconciliations).toHaveLength(1);
    expect(result.artifact.removedRecords.map((entry) => entry.recordId)).toEqual(["owner-old"]);
    expect(result.artifact.resultingManifestSha256).toBe(result.manifest.manifestSha256);
  });

  it("rejects stale source lineage", () => {
    const source = sourceManifest();
    const spec = finalizeSeedAttributionReconciliationSpec({
      schemaVersion: 1,
      artifactType: "PORTCO_BATCH_SEED_ATTRIBUTION_RECONCILIATION_SPEC",
      batchId: "batch-1",
      batchSha256: "3".repeat(64),
      reconciledAt: "2026-08-23T05:10:00.000Z",
      sourceManifestSha256: "4".repeat(64),
      rationale: "The approved PortCo after-image changed the legal vehicle identity.",
      removeRecordIds: ["owner-old"],
      upsertRecords: [record("owner-new", "Alpha", "New Vehicle")],
    });
    expect(() => reconcileSeedAttributionManifest({ sourceManifest: source, spec, evaluatedCompanies: companies() }))
      .toThrow("another source manifest");
  });

  it("rejects a transformation that does not match evaluated seed owners", () => {
    const source = sourceManifest();
    const spec = finalizeSeedAttributionReconciliationSpec({
      schemaVersion: 1,
      artifactType: "PORTCO_BATCH_SEED_ATTRIBUTION_RECONCILIATION_SPEC",
      batchId: "batch-1",
      batchSha256: "3".repeat(64),
      reconciledAt: "2026-08-23T05:10:00.000Z",
      sourceManifestSha256: source.manifestSha256,
      rationale: "The approved PortCo after-image changed the legal vehicle identity.",
      removeRecordIds: ["owner-old"],
      upsertRecords: [],
    });
    expect(() => reconcileSeedAttributionManifest({ sourceManifest: source, spec, evaluatedCompanies: companies() }))
      .toThrow("does not match every evaluated active owner");
  });
});
