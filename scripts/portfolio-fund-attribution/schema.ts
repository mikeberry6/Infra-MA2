import crypto from "crypto";
import { z } from "zod";

const sha256Value = z.string().regex(/^[a-f0-9]{64}$/);
const nonEmpty = z.string().min(1).refine((value) => value.trim().length > 0, "Value must not be blank");
const attribution = z.enum(["DISCLOSED", "INFERRED", "DIRECT_PROGRAM", "UNRESOLVED"]);
const confidence = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const attributionMutationSchema = z.strictObject({
  recordId: nonEmpty,
  ownershipPeriodId: nonEmpty.nullable(),
  companyName: nonEmpty,
  country: nonEmpty,
  investmentFirm: nonEmpty,
  currentVehicleName: nonEmpty,
  databaseVehicleName: nonEmpty.nullable(),
  investmentYear: z.number().int().min(1900).max(2200).nullable(),
  stake: nonEmpty.nullable(),
  targetLinkedFundName: nonEmpty.nullable(),
  expected: z.strictObject({
    fundAttribution: attribution,
    currentLinkedFundName: nonEmpty.nullable(),
  }),
  set: z.strictObject({
    fundAttribution: attribution,
    attributedFundName: nonEmpty.nullable(),
    attributionConfidence: confidence.nullable(),
    attributionRationale: nonEmpty,
  }),
  evidenceUrls: z.array(z.string().url()).min(1),
}).superRefine((mutation, context) => {
  if (mutation.set.fundAttribution === "INFERRED") {
    if (mutation.set.attributionConfidence !== "LOW" && mutation.set.attributionConfidence !== "MEDIUM") {
      context.addIssue({
        code: "custom",
        path: ["set", "attributionConfidence"],
        message: "Inferred attribution must be Low or Medium confidence",
      });
    }
    if (!mutation.set.attributedFundName) {
      context.addIssue({
        code: "custom",
        path: ["set", "attributedFundName"],
        message: "Inferred attribution must name an estimated fund",
      });
    }
  } else if (mutation.set.attributionConfidence !== null) {
    context.addIssue({
      code: "custom",
      path: ["set", "attributionConfidence"],
      message: "Only inferred attribution stores confidence",
    });
  }
  if (
    (mutation.set.fundAttribution === "DIRECT_PROGRAM" || mutation.set.fundAttribution === "UNRESOLVED")
    && mutation.targetLinkedFundName !== null
  ) {
    context.addIssue({
      code: "custom",
      path: ["targetLinkedFundName"],
      message: "Direct/program and unresolved attribution cannot link a fund",
    });
  }
  if (mutation.set.fundAttribution === "DISCLOSED" && !mutation.set.attributedFundName) {
    context.addIssue({ code: "custom", path: ["set", "attributedFundName"], message: "Disclosed attribution must name the disclosed fund or vehicle" });
  }
  if (
    (mutation.set.fundAttribution === "DIRECT_PROGRAM" || mutation.set.fundAttribution === "UNRESOLVED")
    && mutation.set.attributedFundName !== null
  ) {
    context.addIssue({ code: "custom", path: ["set", "attributedFundName"], message: "Direct/program and unresolved attribution cannot name a fund" });
  }
});

export const attributionApplyManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTFOLIO_FUND_ATTRIBUTION_APPLY_MANIFEST"),
  asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ledgerSha256: sha256Value,
  sourceSnapshotSha256: sha256Value.nullable(),
  policy: z.strictObject({
    sourceScope: z.enum(["PRODUCTION_SNAPSHOT", "EVALUATED_SEED"]),
    mutationScope: z.literal("OwnershipPeriod attribution metadata and existing-fund link only"),
    allowedAttributions: z.tuple([
      z.literal("DISCLOSED"),
      z.literal("INFERRED"),
      z.literal("DIRECT_PROGRAM"),
      z.literal("UNRESOLVED"),
    ]),
    fundCreates: z.literal(0),
    fundUpdates: z.literal(0),
    ownershipIdentityChanges: z.literal(0),
    attributionCounts: z.strictObject({
      DISCLOSED: z.number().int().nonnegative(),
      INFERRED: z.number().int().nonnegative(),
      DIRECT_PROGRAM: z.number().int().nonnegative(),
      UNRESOLVED: z.number().int().nonnegative(),
    }),
    inferredWrites: z.number().int().nonnegative(),
    fundLinkChanges: z.number().int().nonnegative(),
  }),
  expectedMutationCount: z.number().int().positive(),
  mutations: z.array(attributionMutationSchema).min(1),
  manifestSha256: sha256Value,
}).superRefine((manifest, context) => {
  if (manifest.expectedMutationCount !== manifest.mutations.length) {
    context.addIssue({
      code: "custom",
      path: ["expectedMutationCount"],
      message: "Mutation count does not match the immutable mutation list",
    });
  }
  const recordIds = manifest.mutations.map((mutation) => mutation.recordId);
  if (new Set(recordIds).size !== recordIds.length) {
    context.addIssue({ code: "custom", path: ["mutations"], message: "Mutation record IDs must be unique" });
  }
  const fundLinkChanges = manifest.mutations.filter((mutation) => (
    mutation.expected.currentLinkedFundName !== mutation.targetLinkedFundName
  )).length;
  if (manifest.policy.fundLinkChanges !== fundLinkChanges) {
    context.addIssue({ code: "custom", path: ["policy", "fundLinkChanges"], message: "Fund-link change count is incorrect" });
  }
  const counts = manifest.mutations.reduce<Record<string, number>>((result, mutation) => {
    result[mutation.set.fundAttribution] = (result[mutation.set.fundAttribution] ?? 0) + 1;
    return result;
  }, {});
  for (const status of attribution.options) {
    if ((manifest.policy.attributionCounts[status] ?? 0) !== (counts[status] ?? 0)) {
      context.addIssue({
        code: "custom",
        path: ["policy", "attributionCounts", status],
        message: "Attribution count is incorrect",
      });
    }
  }
  if (manifest.policy.inferredWrites !== (counts.INFERRED ?? 0)) {
    context.addIssue({ code: "custom", path: ["policy", "inferredWrites"], message: "Inferred-write count is incorrect" });
  }
});

export const attributionApprovalSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTFOLIO_FUND_ATTRIBUTION_APPROVAL"),
  manifestSha256: sha256Value,
  decision: z.literal("APPROVE"),
  approver: nonEmpty,
  approvedAt: z.string().datetime({ offset: true }),
  approvalSha256: sha256Value,
});

export const attributionProductionSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTFOLIO_FUND_ATTRIBUTION_PRODUCTION_SNAPSHOT"),
  asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  companyCount: z.number().int().positive(),
  activeOwnershipCount: z.number().int().positive(),
  publishedFundCount: z.number().int().positive(),
  availableFundNames: z.array(nonEmpty).min(1),
  records: z.array(z.unknown()).min(1),
  capturedAt: z.string().datetime({ offset: true }),
  snapshotSha256: sha256Value,
}).superRefine((snapshot, context) => {
  if (snapshot.activeOwnershipCount !== snapshot.records.length) {
    context.addIssue({ code: "custom", path: ["activeOwnershipCount"], message: "Snapshot count does not match records" });
  }
  if (snapshot.publishedFundCount !== snapshot.availableFundNames.length) {
    context.addIssue({ code: "custom", path: ["publishedFundCount"], message: "Snapshot fund count does not match names" });
  }
});

const receiptState = z.strictObject({
  linkedFundName: nonEmpty.nullable(),
  fundAttribution: attribution,
  attributedFundName: nonEmpty.nullable(),
  attributionConfidence: confidence.nullable(),
  attributionRationale: z.string().nullable(),
});

export const attributionApplyReceiptSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTFOLIO_FUND_ATTRIBUTION_APPLY_RECEIPT"),
  manifestSha256: sha256Value,
  approvalSha256: sha256Value,
  environment: z.enum(["validation", "production"]),
  pipelineRunId: nonEmpty.nullable(),
  mutationCount: z.number().int().positive(),
  changed: z.number().int().nonnegative(),
  idempotent: z.boolean(),
  beforeFingerprint: sha256Value,
  afterFingerprint: sha256Value,
  rows: z.array(z.strictObject({
    recordId: nonEmpty,
    ownershipPeriodId: nonEmpty,
    companyId: nonEmpty,
    stateBeforeApply: z.enum(["PENDING", "ALREADY_APPLIED"]),
    before: receiptState,
    after: receiptState,
  })).min(1),
  appliedAt: z.string().datetime({ offset: true }),
  receiptSha256: sha256Value,
}).superRefine((receipt, context) => {
  if (receipt.mutationCount !== receipt.rows.length) {
    context.addIssue({ code: "custom", path: ["mutationCount"], message: "Receipt mutation count does not match rows" });
  }
  const changed = receipt.rows.filter((row) => row.stateBeforeApply === "PENDING").length;
  if (receipt.changed !== changed || receipt.idempotent !== (changed === 0)) {
    context.addIssue({ code: "custom", path: ["changed"], message: "Receipt changed/idempotent summary is invalid" });
  }
});

export const attributionRollbackApprovalSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTFOLIO_FUND_ATTRIBUTION_ROLLBACK_APPROVAL"),
  receiptSha256: sha256Value,
  decision: z.literal("ROLLBACK"),
  approver: nonEmpty,
  approvedAt: z.string().datetime({ offset: true }),
  approvalSha256: sha256Value,
});

export const attributionSeedRecordSchema = z.strictObject({
  recordId: nonEmpty,
  companyName: nonEmpty,
  country: nonEmpty,
  investmentFirm: nonEmpty,
  currentVehicleName: nonEmpty,
  investmentYear: z.number().int().min(1900).max(2200).nullable(),
  stake: nonEmpty.nullable(),
  targetLinkedFundName: nonEmpty.nullable(),
  fundAttribution: attribution,
  attributedFundName: nonEmpty.nullable(),
  attributionConfidence: confidence.nullable(),
  attributionRationale: nonEmpty,
  evidenceUrls: z.array(z.string().url()).min(1),
});

const attributionSeedReconciliationSchema = z.strictObject({
  batchId: nonEmpty,
  batchSha256: sha256Value,
  reconciledAt: z.string().datetime({ offset: true }),
  sourceManifestSha256: sha256Value,
  specSha256: sha256Value,
  changesSha256: sha256Value,
});

export const attributionSeedManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTFOLIO_FUND_ATTRIBUTION_SEED_MANIFEST"),
  sourceApplyManifestSha256: sha256Value,
  sourceLedgerSha256: sha256Value,
  policy: z.strictObject({
    fundCreates: z.literal(0),
    fundUpdates: z.literal(0),
    inferredAssignments: z.number().int().positive(),
  }),
  recordCount: z.number().int().positive(),
  records: z.array(attributionSeedRecordSchema).min(1),
  reconciliations: z.array(attributionSeedReconciliationSchema).optional(),
  manifestSha256: sha256Value,
}).superRefine((manifest, context) => {
  if (manifest.recordCount !== manifest.records.length) {
    context.addIssue({ code: "custom", path: ["recordCount"], message: "Record count does not match records" });
  }
  if (new Set(manifest.records.map((record) => record.recordId)).size !== manifest.records.length) {
    context.addIssue({ code: "custom", path: ["records"], message: "Seed attribution record IDs must be unique" });
  }
  if (manifest.reconciliations) {
    if (new Set(manifest.reconciliations.map((entry) => entry.batchId)).size !== manifest.reconciliations.length) {
      context.addIssue({ code: "custom", path: ["reconciliations"], message: "Seed reconciliation batch IDs must be unique" });
    }
  }
  let inferredAssignments = 0;
  for (const [index, record] of manifest.records.entries()) {
    if (record.fundAttribution === "INFERRED") {
      inferredAssignments += 1;
      if ((record.attributionConfidence !== "LOW" && record.attributionConfidence !== "MEDIUM") || !record.attributedFundName) {
        context.addIssue({
          code: "custom",
          path: ["records", index],
          message: "Inferred seed attribution requires confidence and a target fund",
        });
      }
    } else if (record.attributionConfidence !== null) {
      context.addIssue({
        code: "custom",
        path: ["records", index, "attributionConfidence"],
        message: "Only inferred seed attribution stores confidence",
      });
    }
    if (record.fundAttribution === "DISCLOSED" && !record.attributedFundName) {
      context.addIssue({ code: "custom", path: ["records", index, "attributedFundName"], message: "Disclosed seed attribution must name the disclosed fund or vehicle" });
    }
    if ((record.fundAttribution === "DIRECT_PROGRAM" || record.fundAttribution === "UNRESOLVED") && record.targetLinkedFundName !== null) {
      context.addIssue({
        code: "custom",
        path: ["records", index, "targetLinkedFundName"],
        message: "Direct/program and unresolved seed attribution cannot link a fund",
      });
    }
    if ((record.fundAttribution === "DIRECT_PROGRAM" || record.fundAttribution === "UNRESOLVED") && record.attributedFundName !== null) {
      context.addIssue({ code: "custom", path: ["records", index, "attributedFundName"], message: "Direct/program and unresolved seed attribution cannot name a fund" });
    }
  }
  if (manifest.policy.inferredAssignments !== inferredAssignments) {
    context.addIssue({
      code: "custom",
      path: ["policy", "inferredAssignments"],
      message: "Inferred-assignment count is incorrect",
    });
  }
});

export type AttributionApplyManifest = z.infer<typeof attributionApplyManifestSchema>;
export type AttributionApproval = z.infer<typeof attributionApprovalSchema>;
export type AttributionProductionSnapshot = z.infer<typeof attributionProductionSnapshotSchema>;
export type AttributionApplyReceipt = z.infer<typeof attributionApplyReceiptSchema>;
export type AttributionRollbackApproval = z.infer<typeof attributionRollbackApprovalSchema>;
export type AttributionSeedManifest = z.infer<typeof attributionSeedManifestSchema>;

export function canonicalSha256(value: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function verifyManifest(input: unknown): AttributionApplyManifest {
  const manifest = attributionApplyManifestSchema.parse(input);
  const { manifestSha256, ...content } = manifest;
  if (canonicalSha256(content) !== manifestSha256) {
    throw new Error("Attribution apply manifest SHA-256 does not match its content");
  }
  return manifest;
}

export function verifyApproval(input: unknown, manifest: AttributionApplyManifest): AttributionApproval {
  const approval = attributionApprovalSchema.parse(input);
  const { approvalSha256, ...content } = approval;
  if (canonicalSha256(content) !== approvalSha256) {
    throw new Error("Attribution approval SHA-256 does not match its content");
  }
  if (approval.manifestSha256 !== manifest.manifestSha256) {
    throw new Error("Attribution approval does not bind the selected manifest");
  }
  return approval;
}

export function verifyProductionSnapshot(input: unknown): AttributionProductionSnapshot {
  const snapshot = attributionProductionSnapshotSchema.parse(input);
  const { capturedAt: _capturedAt, snapshotSha256, ...content } = snapshot;
  if (canonicalSha256(content) !== snapshotSha256) {
    throw new Error("Attribution production snapshot SHA-256 does not match its content");
  }
  return snapshot;
}

export function verifyApplyReceipt(input: unknown): AttributionApplyReceipt {
  const receipt = attributionApplyReceiptSchema.parse(input);
  const { appliedAt: _appliedAt, receiptSha256, ...content } = receipt;
  if (canonicalSha256(content) !== receiptSha256) {
    throw new Error("Attribution apply receipt SHA-256 does not match its content");
  }
  return receipt;
}

export function verifyRollbackApproval(
  input: unknown,
  receipt: AttributionApplyReceipt,
): AttributionRollbackApproval {
  const approval = attributionRollbackApprovalSchema.parse(input);
  const { approvalSha256, ...content } = approval;
  if (canonicalSha256(content) !== approvalSha256) {
    throw new Error("Attribution rollback approval SHA-256 does not match its content");
  }
  if (approval.receiptSha256 !== receipt.receiptSha256) {
    throw new Error("Attribution rollback approval does not bind the selected receipt");
  }
  return approval;
}

export function verifySeedManifest(input: unknown): AttributionSeedManifest {
  const manifest = attributionSeedManifestSchema.parse(input);
  const { manifestSha256, ...content } = manifest;
  if (canonicalSha256(content) !== manifestSha256) {
    throw new Error("Attribution seed manifest SHA-256 does not match its content");
  }
  return manifest;
}

export const PORTFOLIO_FUND_ATTRIBUTION_WRITE_TOKEN = "APPLY_REVIEWED_PORTFOLIO_FUND_ATTRIBUTION";
export const PORTFOLIO_FUND_ATTRIBUTION_ROLLBACK_TOKEN = "ROLLBACK_REVIEWED_PORTFOLIO_FUND_ATTRIBUTION";
