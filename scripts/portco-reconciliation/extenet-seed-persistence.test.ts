import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import { describe, expect, it } from "vitest";
import { companies } from "../../prisma/seed-data/companies";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import { sha256Canonical, sha256Text, hashWithoutField } from "./hash";
import { prismaCompanyRowToImage } from "./prisma-company-image";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { reconcileSeedAttributionManifest } from "../portfolio-fund-attribution/reconcile-seed-manifest";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { EXTENET_NAME, EXTENET_OLD_NAME, EXTENET_DUPLICATE_NAME, projectExtenetSeedIdentity } from "./extenet-seed-persistence";

const directory = "audits/portco-reconciliation/2026-09-06/extenet-seed-persistence";
const json = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const plan = json(`${directory}/repair-plan.json`);
const snapshot = json(`${directory}/production-snapshot.json`);
const image = prismaCompanyRowToImage(snapshot.production.companies[0]);
const earlierPlan = json("audits/portco-reconciliation/2026-09-06/seed-alias-persistence/repair-plan.json");
const source: PortCo[] = json("audits/portco-reconciliation/2026-09-06/final-reconciliation/evaluated-seed.json")
  .filter((company: PortCo) => !earlierPlan.members.some((member: { retiredSeed: PortCo; country: string }) => member.retiredSeed.name === company.name && member.country === company.country));

describe("Extenet identity-only seed persistence", () => {
  it("binds fresh read-only production, exact terminal evidence, and the unchanged exception", () => {
    expect(hashWithoutField(plan, "repairSha256")).toBe(plan.repairSha256);
    expect(sha256Canonical(snapshot.production)).toBe(plan.productionSnapshotSha256);
    const manifest = verifyExecutionManifest(json("audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json"));
    const ledger = verifyBatchExecutionLedger(json("audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json"));
    expect(manifest.manifestSha256).toBe(plan.executionManifestSha256);
    expect(ledger.ledgerSha256).toBe(plan.ledgerSha256);
    expect(manifest.activeTaskId).toBeNull();
    expect(ledger.activeBatchId).toBeNull();
    const task = manifest.tasks.find((task) => task.sequence === 213)!;
    expect(task.status).toBe("DEFERRED");
    expect(task.artifacts.proposal).toBeNull();
    expect(task.artifacts.applyReceipt).toBeNull();
    const research = json(task.reAdjudications!.at(-1)!.evidence.researchDecision.location);
    expect(research.seedMutationCandidate).toBe(false);
    expect(research.freshException).toEqual(plan.freshException);
    expect(sha256Canonical(research.freshException)).toBe(plan.freshExceptionSha256);
    expect(plan.members.map((member: { sequence: number }) => member.sequence)).toEqual([213, 424, 475, 476]);
    expect(plan.productionAliasesObserved).toEqual([]);
    for (const ref of plan.references) expect(sha256Text(readFileSync(ref.location.split("#")[0], "utf8"))).toBe(ref.fileSha256);
    for (const dependency of plan.dependencies) {
      if (["prisma/seed-data/companies.ts", "prisma/seed-data/ownership-attributions.manifest.json"].includes(dependency.path)) continue;
      expect(sha256Text(readFileSync(dependency.path, "utf8"))).toBe(dependency.sha256);
    }
    expect([plan.databaseWrites, plan.sourceTransitions, plan.retainedOwnerChanges, plan.productionAttributionChanges]).toEqual([0, 0, 0, 0]);
  });

  it("changes only one name and removes one duplicate; all retained owner and other fields are exact", () => {
    expect(sha256Canonical(source)).toBe(plan.sourceSeedSha256);
    const projected = projectExtenetSeedIdentity(source, image);
    expect(projected.before).toEqual(plan.retainedBefore);
    expect(projected.retired).toEqual(plan.retiredDuplicate);
    expect(projected.after).toEqual({ ...plan.retainedBefore, name: EXTENET_NAME });
    // Preserve the complete historical PR917 image; later scoped state repairs
    // have their own exact whole-live-seed assertion and cannot rewrite this one.
    expect(sha256Canonical(projected.resultingCompanies)).toBe(plan.resultingSeedSha256);
    expect(companies.find((company) => company.name === EXTENET_NAME)).toEqual(projected.after);
    expect(companies.some((company) => [EXTENET_OLD_NAME, EXTENET_DUPLICATE_NAME].includes(company.name))).toBe(false);
    expect(companies).toHaveLength(1128);
    const key = (company: { name: string; country: string }) => `${company.name.toLowerCase()}\0${company.country.toLowerCase()}`;
    expect(companies.map(key).sort()).toEqual(snapshot.production.publishedIdentities.map(key).sort());
  });

  it("renames four attribution lookup keys without changing record IDs/metadata and removes only the duplicate", () => {
    const oldManifest = json("audits/portco-reconciliation/2026-09-06/seed-alias-persistence/resulting-attribution-manifest.json");
    const spec = json(`${directory}/seed-attribution-spec.json`);
    const reconciled = reconcileSeedAttributionManifest({ sourceManifest: oldManifest, spec, evaluatedCompanies: projectExtenetSeedIdentity(source, image).resultingCompanies });
    expect(reconciled.manifest).toEqual(verifySeedManifest(json("prisma/seed-data/ownership-attributions.manifest.json")));
    expect(reconciled.artifact).toEqual(json(`${directory}/seed-attribution-reconciliation.json`));
    expect(spec.batchSha256).toBe(plan.repairSha256);
    expect(spec.removeRecordIds).toEqual(["OFA-F01811471EBB"]);
    expect(spec.upsertRecords).toHaveLength(4);
    for (const record of spec.upsertRecords) {
      expect(record.companyName).toBe(EXTENET_NAME);
      expect({ ...record, companyName: EXTENET_OLD_NAME }).toEqual(oldManifest.records.find((old: { recordId: string }) => old.recordId === record.recordId));
    }
    expect(reconciled.manifest.recordCount).toBe(1393);
  });

  it("fails closed for stale identity, owner, description, duplicate scope and repeated application", () => {
    expect(() => projectExtenetSeedIdentity([...source, { ...plan.retainedBefore, name: EXTENET_NAME }], image)).toThrow(/ambiguous/);
    expect(() => projectExtenetSeedIdentity(source.filter((company) => company.name !== EXTENET_DUPLICATE_NAME), image)).toThrow(/Missing/);
    expect(() => projectExtenetSeedIdentity(source, { ...image, description: "Changed" })).toThrow(/dependencies/);
    expect(() => projectExtenetSeedIdentity(source, { ...image, ownershipPeriods: image.ownershipPeriods.slice(1) })).toThrow(/owners differ/);
    expect(() => projectExtenetSeedIdentity(source.map((company) => company.name === EXTENET_DUPLICATE_NAME ? { ...company, owners: [{ ...company.owners![0], stake: "50%" }] } : company), image)).toThrow(/subset/);
    expect(() => projectExtenetSeedIdentity(companies, image)).toThrow(/already repaired/);
  });
});
