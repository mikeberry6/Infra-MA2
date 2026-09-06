import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { baseCompanies, companies } from "../../prisma/seed-data/companies";
import { provePocahontasLineage, POCA_OLD, POCA_CURRENT, POCA_ID, POCA_INTRO } from "./pocahontas-lineage";
import { sha256Canonical, sha256Text, hashWithoutField } from "./hash";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";

const directory = "audits/portco-reconciliation/2026-09-06/pocahontas-lineage";
const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const report = json(`${directory}/lineage-proof.json`);
const snapshot = json(`${directory}/production-snapshot.json`);
const batch = "audits/portco-reconciliation/2026-08-23/batches/batch-0356-0360-v1";
const input: Parameters<typeof provePocahontasLineage>[0] = {
  baseCompanies, evaluatedCompanies: companies,
  overlays: json("prisma/seed-data/approved-portco-after-images.json"),
  proposal: json("audits/portco-reconciliation/2026-08-03/proposals/0357-pocahontas-parkway-v5/proposal.json"),
  approval: json("audits/portco-reconciliation/2026-08-03/approvals/0357-pocahontas-parkway-v5.json"),
  batchManifest: json(`${batch}/batch-manifest-v7.json`),
  batchReceipt: json(`${batch}/production-apply/batch-apply-receipt.json`),
  production: snapshot.production,
};

describe("Pocahontas superseded overlay lineage without mutation", () => {
  it("binds protected evidence, the exact live capture and idle terminal source boundary", () => {
    expect(hashWithoutField(report, "reportSha256")).toBe("0a2551b248453630fdd022c40076425cdc075e26a62882ae841e297e2bb67c87");
    expect(report.reportSha256).toBe(hashWithoutField(report, "reportSha256"));
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    expect(snapshot.stateSha256).toBe(report.productionSnapshotSha256);
    for (const dependency of report.dependencies) expect(sha256Text(readFileSync(dependency.path, "utf8"))).toBe(dependency.sha256);
    const execution = verifyExecutionManifest(json("audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json"));
    const ledger = verifyBatchExecutionLedger(json("audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json"));
    expect([execution.manifestSha256, ledger.ledgerSha256]).toEqual([report.executionManifestSha256, report.ledgerSha256]);
    expect([execution.activeTaskId, ledger.activeBatchId]).toEqual([null, null]);
    expect(execution.tasks.find((task) => task.sequence === 357)?.artifacts.proposal?.sha256).toBe(POCA_CURRENT);
    expect(report.protectedIntroduction.commit).toBe(POCA_INTRO);
    expect(report.protectedIntroduction.exactEntries).toEqual(input.overlays.filter((entry) => [POCA_OLD, POCA_CURRENT].includes(entry.proposalSha256)));
    expect(report.protectedIntroduction.scopedOldProposalHistoryMatches).toEqual([]);
  });

  it("reproduces every proof field without changing input, seed, tasks or database", () => {
    const before = sha256Canonical(input);
    const proof = provePocahontasLineage(input);
    expect(sha256Canonical(input)).toBe(before);
    for (const [key, value] of Object.entries(proof)) expect(value).toEqual(report[key]);
    expect(proof.originalApplyReceiptSha256).toBe("937b1b83a0daa673a15e4fcb4398e58457986096bf81e7d8daadf0b3310173f4");
    expect(proof.originalTransactionId).toBe("bc260863-0d69-46d6-b702-d1b93e8d8128");
    expect(proof.revisionId).toBe("cmtizeix1000k282bg51fvjlv");
    expect(proof.currentSemanticImageSha256).toBe("c3d38d75e0b954f129df2de981841be251fd220abeaa810d205dfe991da831f3");
    expect([proof.databaseWrites, proof.seedChanges, proof.sourceTransitions]).toEqual([0, 0, 0]);
    expect(proof.completionAllowed).toBe(false);
    expect(proof.oldProposalArtifactRecovered).toBe(false);
  });

  it("proves equal company values while preserving the four-row ordering footprint", () => {
    const proof = provePocahontasLineage(input);
    expect(proof.companyValuesUnaffected).toBe(true);
    expect(proof.retainedOverlayEvaluationSha256).not.toBe(proof.withoutOldOverlayEvaluationSha256);
    expect(proof.orderingFootprint.map((row) => row.index)).toEqual([1093, 1094, 1095, 1096]);
    expect(proof.orderingFootprint.map((row) => row.retained)).toEqual([
      "Pocahontas Parkway Operations, LLC", "Ascension FBO Network", "DartPoints Holding Company, LLC", "Harbor Logistics, LLC",
    ]);
    expect([proof.oldIndex, proof.currentIndex]).toEqual([276, 280]);
  });

  it("rejects absent, duplicated, reordered or altered obsolete/current entries", () => {
    expect(() => provePocahontasLineage({ ...input, overlays: input.overlays.filter((entry) => entry.proposalSha256 !== POCA_OLD) })).toThrow(/order/);
    expect(() => provePocahontasLineage({ ...input, overlays: [...input.overlays, input.overlays[276]] })).toThrow(/duplicate|order/);
    const swapped = structuredClone(input.overlays);
    [swapped[276], swapped[280]] = [swapped[280], swapped[276]];
    expect(() => provePocahontasLineage({ ...input, overlays: swapped })).toThrow(/order/);
    const altered = structuredClone(input.overlays);
    altered[280].approvalSha256 = "0".repeat(64);
    expect(() => provePocahontasLineage({ ...input, overlays: altered })).toThrow(/receipt-backed/);
  });

  it("rejects tampered proposal, approval or immutable batch receipt", () => {
    for (const field of ["proposal", "approval", "batchReceipt"] as const) {
      const changed = structuredClone(input[field]) as Record<string, unknown>;
      changed[field === "proposal" ? "proposalSha256" : field === "approval" ? "approvalSha256" : "receiptSha256"] = "0".repeat(64);
      expect(() => provePocahontasLineage({ ...input, [field]: changed })).toThrow(/hash/i);
    }
  });

  it("rejects invented ownership, seed drift and swapped pre-existing relation identities", () => {
    const production = structuredClone(input.production);
    production.image.ownershipPeriods.find((row) => row.managerName === "Northleaf")!.stake = "31.86%";
    expect(() => provePocahontasLineage({ ...input, production })).toThrow(/semantic after-image/);
    const seed = structuredClone(companies);
    seed.find((row) => row.name === "Pocahontas Parkway Operations, LLC")!.description = "Unapproved change";
    expect(() => provePocahontasLineage({ ...input, evaluatedCompanies: seed })).toThrow(/Evaluated seed/);
    const swapped = structuredClone(input.production);
    const rows = swapped.image.ownershipPeriods.filter((row) => row.id);
    [rows[0].id, rows[1].id] = [rows[1].id, rows[0].id];
    expect(() => provePocahontasLineage({ ...input, production: swapped })).toThrow(/relation identity/);
  });

  it("rejects missing/duplicate/altered applied revisions and invalid metadata", () => {
    const current = input.production.revisions.find((row) => row.proposalHash === POCA_CURRENT)!;
    expect(() => provePocahontasLineage({ ...input, production: { ...input.production, revisions: [] } })).toThrow(/revision/);
    expect(() => provePocahontasLineage({ ...input, production: { ...input.production, revisions: [...input.production.revisions, current] } })).toThrow(/revision/);
    for (const patch of [
      { approver: "Unapproved" }, { afterJson: { name: "Altered" } }, { beforeJson: null },
      { changedFields: [] }, { pipelineRunId: "unrelated-pipeline" }, { appliedAt: "invalid" },
      { appliedAt: "2026-09-01T17:00:00.000Z" }, { appliedAt: "2026-09-02T00:00:00.000Z" },
    ]) {
      const production = structuredClone(input.production);
      Object.assign(production.revisions.find((row) => row.proposalHash === POCA_CURRENT)!, patch);
      expect(() => provePocahontasLineage({ ...input, production })).toThrow(/revision/);
    }
  });

  it("does not invent old history or confuse seed-label retirement with a production redirect", () => {
    const production = structuredClone(input.production);
    production.revisions.push({ ...production.revisions[0], proposalHash: POCA_OLD });
    expect(() => provePocahontasLineage({ ...input, production })).toThrow(/separate review/);
    const redirects = [...input.production.redirects, { ...input.production.redirects[0], companyId: POCA_ID }];
    expect(() => provePocahontasLineage({ ...input, production: { ...input.production, redirects } })).toThrow(/production redirect/);
  });
});
