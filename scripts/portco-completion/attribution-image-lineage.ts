/** Read-only reconstruction of canonical images across immutable attribution receipts. */
import { z } from "zod";
import { fileSchema, verifySnapshot } from "./batch";
import { companyImageSchema } from "../portco-reconciliation/schema";
import { verifyAttributionChain } from "../portco-reconciliation/attribution-chronology";
import { semanticCompanyImageSha256 } from "../portco-reconciliation/apply-plan";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { ownershipManagerName } from "../portco-reconciliation/ownership-manager";

export const attributionImageLineageSchema = z.strictObject({
  snapshot: fileSchema,
  chains: z.array(z.strictObject({ manifest: fileSchema, approval: fileSchema, receipt: fileSchema })).min(1),
});
type Reference = z.infer<typeof fileSchema>;
export function attributionImageLineageFiles(value: z.infer<typeof attributionImageLineageSchema>): Reference[] {
  return [value.snapshot, ...value.chains.flatMap(c => [c.manifest, c.approval, c.receipt])];
}

/** The caller validates the original apply chain and byte-checks every reference. */
export function verifyAttributionImageLineage(input: {
  value: unknown; companyId: string; originalImage: unknown; originalAppliedAt: string;
  expectedSemanticSha256: string; expectedOwners: { ownerId: string; sha256: string }[];
  read: (ref: Reference) => unknown;
}) {
  const value = attributionImageLineageSchema.parse(input.value);
  const snapshot = verifySnapshot(input.read(value.snapshot));
  const original = companyImageSchema.parse(input.originalImage);
  const company = snapshot.companies.find(c => c.image.id === input.companyId);
  const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
  if (!company || company.image.name !== original.name
    || semanticCompanyImageSha256(company.image) !== input.expectedSemanticSha256
    || !same(company.owners.map(o => ({ ownerId: o.id, sha256: sha256Canonical(o) })).sort((a,b) => a.ownerId.localeCompare(b.ownerId)),
      [...input.expectedOwners].sort((a,b) => a.ownerId.localeCompare(b.ownerId)))) throw Error("Attribution lineage observed image/owners differ");
  const chains = value.chains.map(c => verifyAttributionChain({ manifest: input.read(c.manifest), approval: input.read(c.approval), receipt: input.read(c.receipt) }));
  const seen = new Set<string>();
  let priorTime = Date.parse(input.originalAppliedAt);
  if (!Number.isFinite(priorTime)) throw Error("Invalid original attribution lineage timestamp");
  for (const { receipt } of chains) {
    const time = Date.parse(receipt.appliedAt);
    if (!receipt.pipelineRunId || !(time > priorTime && time < Date.parse(snapshot.capturedAt)) || seen.has(receipt.pipelineRunId)) throw Error("Duplicate or out-of-order attribution lineage");
    seen.add(receipt.pipelineRunId); priorTime = time;
    if (!receipt.rows.some(r => r.companyId === input.companyId)) throw Error("Unrelated attribution lineage receipt");
    if (receipt.rows.some(r => r.companyId !== input.companyId && company.owners.some(o => o.id === r.ownershipPeriodId))) throw Error("Foreign attribution lineage owner");
  }
  const restored = structuredClone(company.image);
  const states = new Map(company.owners.map(o => [o.id, structuredClone(o.state)]));
  for (const { manifest, receipt } of [...chains].reverse()) {
    for (const row of receipt.rows.filter(r => r.companyId === input.companyId)) {
      const core = restored.ownershipPeriods.find(o => o.id === row.ownershipPeriodId);
      const mutation = manifest.mutations.find(m => m.recordId === row.recordId)!;
      if (!core || !same(states.get(row.ownershipPeriodId), row.after) || core.fundName !== row.after.linkedFundName) throw Error("Attribution lineage after-state differs");
      const afterFund = row.after.linkedFundName === null ? null : snapshot.funds.find(f => f.fundName === row.after.linkedFundName);
      if ((row.after.linkedFundName !== null && !afterFund)
        || core.managerName !== ownershipManagerName(afterFund?.managerName, core.organizationName, row.ownershipPeriodId)) throw Error("Attribution lineage observed manager differs");
      // Attribution receipts cannot explain a change to any ownership identity field.
      if (mutation.companyName !== original.name || mutation.country !== original.country
        || mutation.databaseVehicleName !== core.vehicleName || mutation.stake !== core.stake
        || mutation.investmentYear !== core.investmentYear
        || (mutation.expectedIsActive !== undefined && mutation.expectedIsActive !== core.isActive)) throw Error("Attribution lineage ownership identity differs");
      const previousFund = row.before.linkedFundName === null ? null : snapshot.funds.find(f => f.fundName === row.before.linkedFundName);
      if (row.before.linkedFundName !== null && !previousFund) throw Error("Missing historical fund-manager dependency");
      core.fundName = row.before.linkedFundName;
      core.managerName = ownershipManagerName(previousFund?.managerName, core.organizationName, row.ownershipPeriodId);
      if (mutation.investmentFirm !== core.managerName) throw Error("Attribution lineage prior manager differs");
      states.set(row.ownershipPeriodId, row.before);
    }
  }
  if (semanticCompanyImageSha256(restored) !== semanticCompanyImageSha256(original)) throw Error("Unexplained canonical drift outside attribution lineage");
  return { observed: company, restored, snapshot };
}
