import { z } from "zod";
import type { PortCo, PortCoOwner } from "../../prisma/seed-data/portco-types";
import {
  attributionSeedRecordSchema,
  canonicalSha256,
  verifySeedManifest,
  type AttributionSeedManifest,
} from "./schema";

const nonEmpty = z.string().trim().min(1);
const sha256Value = z.string().regex(/^[a-f0-9]{64}$/);

export const seedAttributionReconciliationSpecSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_BATCH_SEED_ATTRIBUTION_RECONCILIATION_SPEC"),
  batchId: nonEmpty,
  batchSha256: sha256Value,
  reconciledAt: z.string().datetime({ offset: true }),
  sourceManifestSha256: sha256Value,
  rationale: nonEmpty,
  removeRecordIds: z.array(nonEmpty),
  upsertRecords: z.array(attributionSeedRecordSchema),
  specSha256: sha256Value,
}).superRefine((spec, context) => {
  if (new Set(spec.removeRecordIds).size !== spec.removeRecordIds.length) {
    context.addIssue({ code: "custom", path: ["removeRecordIds"], message: "Removed record IDs must be unique" });
  }
  if (new Set(spec.upsertRecords.map((record) => record.recordId)).size !== spec.upsertRecords.length) {
    context.addIssue({ code: "custom", path: ["upsertRecords"], message: "Upsert record IDs must be unique" });
  }
});

export type SeedAttributionReconciliationSpec = z.infer<typeof seedAttributionReconciliationSpecSchema>;

export function finalizeSeedAttributionReconciliationSpec(
  input: Omit<SeedAttributionReconciliationSpec, "specSha256">,
): SeedAttributionReconciliationSpec {
  const normalized = seedAttributionReconciliationSpecSchema.parse({ ...input, specSha256: "0".repeat(64) });
  const { specSha256: _specSha256, ...withoutHash } = normalized;
  return seedAttributionReconciliationSpecSchema.parse({
    ...withoutHash,
    specSha256: canonicalSha256(withoutHash),
  });
}

export function verifySeedAttributionReconciliationSpec(input: unknown): SeedAttributionReconciliationSpec {
  const spec = seedAttributionReconciliationSpecSchema.parse(input);
  const { specSha256, ...withoutHash } = spec;
  if (canonicalSha256(withoutHash) !== specSha256) {
    throw new Error("Seed attribution reconciliation spec hash does not match its contents");
  }
  return spec;
}

type SeedAttributionRecord = AttributionSeedManifest["records"][number];

function ownerKey(input: {
  companyName: string;
  country: string;
  investmentFirm: string;
  currentVehicleName: string;
  investmentYear: number | null;
  stake: string | null;
}): string {
  return [
    input.companyName,
    input.country,
    input.investmentFirm,
    input.currentVehicleName,
    input.investmentYear ?? "",
    input.stake ?? "",
  ].join("\u0000");
}

function evaluatedActiveOwnerKeys(companies: readonly PortCo[]): string[] {
  const keys = companies.flatMap((company) => {
    const owners: PortCoOwner[] = company.owners?.length
      ? company.owners
      : [{
          investmentFirm: company.investmentFirm,
          ownershipVehicle: company.ownershipVehicle,
          investmentYear: company.investmentYear,
          status: company.status,
        }];
    return owners.filter((owner) => owner.status === "Active").map((owner) => ownerKey({
      companyName: company.name,
      country: company.country,
      investmentFirm: owner.investmentFirm,
      currentVehicleName: owner.vehicleName || owner.ownershipVehicle || owner.investmentFirm,
      investmentYear: owner.investmentYear ?? null,
      stake: owner.stake ?? null,
    }));
  });
  if (new Set(keys).size !== keys.length) throw new Error("Evaluated seed contains duplicate active-owner identities");
  return keys.sort();
}

function reconcileRecords(
  source: AttributionSeedManifest,
  spec: SeedAttributionReconciliationSpec,
): { records: SeedAttributionRecord[]; removed: SeedAttributionRecord[]; replaced: SeedAttributionRecord[] } {
  const sourceById = new Map(source.records.map((record) => [record.recordId, record]));
  const removeIds = new Set(spec.removeRecordIds);
  const upsertById = new Map(spec.upsertRecords.map((record) => [record.recordId, record]));
  for (const recordId of removeIds) {
    if (!sourceById.has(recordId)) throw new Error(`Seed attribution removal ${recordId} does not exist`);
  }
  const records: SeedAttributionRecord[] = [];
  const removed: SeedAttributionRecord[] = [];
  const replaced: SeedAttributionRecord[] = [];
  for (const record of source.records) {
    if (removeIds.has(record.recordId)) {
      removed.push(record);
      continue;
    }
    const replacement = upsertById.get(record.recordId);
    if (replacement) {
      records.push(replacement);
      replaced.push(record);
      upsertById.delete(record.recordId);
    } else {
      records.push(record);
    }
  }
  records.push(...upsertById.values());
  if (new Set(records.map((record) => record.recordId)).size !== records.length) {
    throw new Error("Reconciled seed attribution records contain duplicate IDs");
  }
  return { records, removed, replaced };
}

export interface SeedAttributionReconciliationArtifact {
  schemaVersion: 1;
  artifactType: "PORTCO_BATCH_SEED_ATTRIBUTION_RECONCILIATION";
  batchId: string;
  batchSha256: string;
  reconciledAt: string;
  sourceManifestSha256: string;
  specSha256: string;
  changesSha256: string;
  removedRecords: SeedAttributionRecord[];
  replacedRecords: SeedAttributionRecord[];
  upsertRecords: SeedAttributionRecord[];
  resultingRecordCount: number;
  resultingManifestSha256: string;
  reconciliationSha256: string;
}

export function reconcileSeedAttributionManifest(input: {
  sourceManifest: unknown;
  spec: unknown;
  evaluatedCompanies: readonly PortCo[];
}): { manifest: AttributionSeedManifest; artifact: SeedAttributionReconciliationArtifact } {
  const source = verifySeedManifest(input.sourceManifest);
  const spec = verifySeedAttributionReconciliationSpec(input.spec);
  if (source.manifestSha256 !== spec.sourceManifestSha256) {
    throw new Error("Seed attribution reconciliation is bound to another source manifest");
  }
  if (source.reconciliations?.some((entry) => entry.batchId === spec.batchId)) {
    throw new Error(`Seed attribution batch ${spec.batchId} is already reconciled`);
  }
  const { records, removed, replaced } = reconcileRecords(source, spec);
  const recordKeys = records.map(ownerKey).sort();
  const ownerKeys = evaluatedActiveOwnerKeys(input.evaluatedCompanies);
  if (recordKeys.length !== ownerKeys.length || recordKeys.some((key, index) => key !== ownerKeys[index])) {
    throw new Error("Reconciled seed attribution manifest does not match every evaluated active owner exactly once");
  }
  const changes = {
    removeRecordIds: [...spec.removeRecordIds],
    upsertRecords: spec.upsertRecords,
  };
  const changesSha256 = canonicalSha256(changes);
  const { manifestSha256: _manifestSha256, ...sourceWithoutHash } = source;
  const manifestContent = {
    ...sourceWithoutHash,
    policy: {
      ...source.policy,
      inferredAssignments: records.filter((record) => record.fundAttribution === "INFERRED").length,
    },
    recordCount: records.length,
    records,
    reconciliations: [
      ...(source.reconciliations ?? []),
      {
        batchId: spec.batchId,
        batchSha256: spec.batchSha256,
        reconciledAt: spec.reconciledAt,
        sourceManifestSha256: source.manifestSha256,
        specSha256: spec.specSha256,
        changesSha256,
      },
    ],
  };
  const manifest = verifySeedManifest({
    ...manifestContent,
    manifestSha256: canonicalSha256(manifestContent),
  });
  const artifactWithoutHash = {
    schemaVersion: 1 as const,
    artifactType: "PORTCO_BATCH_SEED_ATTRIBUTION_RECONCILIATION" as const,
    batchId: spec.batchId,
    batchSha256: spec.batchSha256,
    reconciledAt: spec.reconciledAt,
    sourceManifestSha256: source.manifestSha256,
    specSha256: spec.specSha256,
    changesSha256,
    removedRecords: removed,
    replacedRecords: replaced,
    upsertRecords: spec.upsertRecords,
    resultingRecordCount: manifest.recordCount,
    resultingManifestSha256: manifest.manifestSha256,
  };
  return {
    manifest,
    artifact: {
      ...artifactWithoutHash,
      reconciliationSha256: canonicalSha256(artifactWithoutHash),
    },
  };
}
