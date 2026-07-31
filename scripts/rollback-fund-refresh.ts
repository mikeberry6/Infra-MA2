import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { Prisma, PrismaClient } from "../src/generated/prisma/client";
import {
  fundRefreshConfidenceSchema,
  fundRefreshEvidenceScopeSchema,
  fundRefreshSnapshotSchema,
  fundRefreshSourceTierSchema,
  fundEvidenceManifestRecordSchema,
} from "../src/modules/funds/refresh-schema";
import {
  FUND_REGION_MAP,
  FUND_SECTOR_MAP,
  FUND_STATUS_MAP,
  FUND_STRATEGY_MAP,
  FUND_STRUCTURE_MAP,
} from "../src/modules/shared/enum-maps";
import { resolveOrgName } from "../prisma/entity-resolution";
import {
  REPO_ROOT,
  canonicalJson,
  compareManifestEvidenceRecords,
  loadFundEvidenceManifest,
  loadFundEvidenceManifestAtCommit,
  loadFundManifest,
  loadFundManifestAtCommit,
  manifestRecordToSnapshot,
  parseCliArgs,
  requiredString,
  rollbackGuard,
  rollbackManifestScopeBlockers,
  sha256,
} from "./fund-refresh/lib";
import {
  assertMutationDatabaseTarget,
  checkFundRefreshFoundations,
  createFundDatabaseClient,
  fetchFundSnapshot,
} from "./fund-refresh/database";

const isoDateTimeSchema = z.string().datetime({ offset: true });

const revisionEvidenceExistingSchema = z.strictObject({
  supportedFields: z.array(z.string().trim().min(1)).min(1),
  sourceTier: fundRefreshSourceTierSchema,
  scope: fundRefreshEvidenceScopeSchema,
  publishedAt: isoDateTimeSchema.nullable(),
  retrievedAt: isoDateTimeSchema,
  confidence: fundRefreshConfidenceSchema,
  pipelineRunId: z.string().trim().min(1).nullable(),
});

const revisionEvidenceSchema = z.strictObject({
  url: z.string().url().refine((value) => value.startsWith("https://"), "Evidence URLs must use HTTPS"),
  evidenceLabel: z.string().trim().min(1).max(500),
  existing: revisionEvidenceExistingSchema.nullable(),
});

const revisionImageSchema = z.strictObject({
  snapshot: fundRefreshSnapshotSchema.nullable(),
  lastVerifiedAt: isoDateTimeSchema.nullable(),
  evidence: z.array(revisionEvidenceSchema),
  manifestEvidence: z.array(fundEvidenceManifestRecordSchema),
}).superRefine((image, context) => {
  const seen = new Set<string>();
  for (const [index, evidence] of image.evidence.entries()) {
    const key = `${evidence.url}\u0000${evidence.evidenceLabel}`;
    if (seen.has(key)) {
      context.addIssue({
        code: "custom",
        path: ["evidence", index],
        message: "Revision evidence keys must be unique",
      });
    }
    seen.add(key);
  }
  const manifestKeys = new Set<string>();
  for (const [index, evidence] of image.manifestEvidence.entries()) {
    const key = `${evidence.legacyId}\u0000${evidence.url}\u0000${evidence.evidenceLabel}`;
    if (manifestKeys.has(key)) {
      context.addIssue({
        code: "custom",
        path: ["manifestEvidence", index],
        message: "Revision manifest evidence keys must be unique",
      });
    }
    manifestKeys.add(key);
  }
});

type EvidenceBefore = z.infer<typeof revisionEvidenceSchema>;
type RevisionImage = z.infer<typeof revisionImageSchema>;
type RollbackQueryClient = PrismaClient | Prisma.TransactionClient;

interface RollbackRevision {
  id: string;
  fundId: string;
  proposalHash: string;
  beforeJson: Prisma.JsonValue | null;
  afterJson: Prisma.JsonValue;
  changedFields: string[];
  appliedAt: Date;
  fund: { legacyId: string };
}

interface RollbackPlan {
  revision: RollbackRevision;
  before: RevisionImage;
  after: RevisionImage;
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function writeJson(filePath: string, value: unknown) {
  const resolved = path.resolve(REPO_ROOT, filePath);
  mkdirSync(path.dirname(resolved), { recursive: true });
  writeFileSync(resolved, JSON.stringify(value, null, 2) + "\n");
}

function parseRevisionImage(value: Prisma.JsonValue | null, label: string): RevisionImage | null {
  if (value === null) return null;
  const result = revisionImageSchema.safeParse(value);
  if (!result.success) {
    const detail = result.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "image"}: ${issue.message}`)
      .join("; ");
    throw new Error(`${label} revision image is invalid (${detail})`);
  }
  if (label === "After") {
    if (!result.data.snapshot) throw new Error("After revision image is missing its fund snapshot");
  }
  return result.data;
}

function isoDateTime(value: Date | null | undefined): string | null {
  return value?.toISOString() ?? null;
}

function evidenceKey(evidence: Pick<EvidenceBefore, "url" | "evidenceLabel">): string {
  return `${evidence.url}\u0000${evidence.evidenceLabel}`;
}

function assertCompatibleRevisionImages(before: RevisionImage, after: RevisionImage, legacyId: string) {
  if (!before.snapshot) return;
  if (!after.snapshot || before.snapshot.legacyId !== after.snapshot.legacyId) {
    throw new Error(`${legacyId}: revision before/after snapshots do not share a stable identity`);
  }
  const beforeKeys = before.evidence.map(evidenceKey).sort();
  const afterKeys = after.evidence.map(evidenceKey).sort();
  if (canonicalJson(beforeKeys) !== canonicalJson(afterKeys)) {
    throw new Error(`${legacyId}: revision before/after evidence key sets differ`);
  }
}

async function captureRelevantEvidence(
  prisma: RollbackQueryClient,
  fundId: string,
  evidenceKeys: EvidenceBefore[],
): Promise<EvidenceBefore[]> {
  if (evidenceKeys.length === 0) return [];
  const uniqueEvidenceKeys = [...new Map(evidenceKeys.map((evidence) => [
    evidenceKey(evidence),
    evidence,
  ])).values()].sort((left, right) =>
    left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel),
  );
  const rows = await prisma.fundEvidence.findMany({
    where: {
      fundId,
      OR: uniqueEvidenceKeys.map((evidence) => ({
        evidenceLabel: evidence.evidenceLabel,
        source: { url: evidence.url },
      })),
    },
    select: {
      supportedFields: true,
      sourceTier: true,
      scope: true,
      publishedAt: true,
      retrievedAt: true,
      confidence: true,
      evidenceLabel: true,
      pipelineRunId: true,
      source: { select: { url: true } },
    },
  });
  const byKey = new Map(rows.map((row) => [
    evidenceKey({ url: row.source.url, evidenceLabel: row.evidenceLabel }),
    row,
  ]));
  return uniqueEvidenceKeys.map((evidence) => {
    const current = byKey.get(evidenceKey(evidence));
    return {
      url: evidence.url,
      evidenceLabel: evidence.evidenceLabel,
      existing: current ? {
        supportedFields: current.supportedFields,
        sourceTier: current.sourceTier,
        scope: current.scope,
        publishedAt: isoDateTime(current.publishedAt),
        retrievedAt: current.retrievedAt.toISOString(),
        confidence: current.confidence,
        pipelineRunId: current.pipelineRunId,
      } : null,
    };
  });
}

async function findLaterRevision(
  prisma: RollbackQueryClient,
  revision: Pick<RollbackRevision, "id" | "fundId" | "appliedAt">,
) {
  return prisma.fundRevision.findFirst({
    where: {
      fundId: revision.fundId,
      OR: [
        { appliedAt: { gt: revision.appliedAt } },
        // Equal timestamps are ambiguous at database precision, so fail closed
        // if any other revision exists at the same instant.
        { appliedAt: revision.appliedAt, id: { not: revision.id } },
      ],
    },
    select: { id: true, proposalHash: true },
    orderBy: [{ appliedAt: "asc" }, { id: "asc" }],
  });
}

async function currentStateBlockers(
  prisma: RollbackQueryClient,
  plan: RollbackPlan,
): Promise<string[]> {
  const { revision, before, after } = plan;
  const isRename = Boolean(
    before.snapshot &&
    after.snapshot &&
    before.snapshot.fundName !== after.snapshot.fundName,
  );
  const renameNames = [before.snapshot?.fundName, after.snapshot?.fundName]
    .filter((value): value is string => Boolean(value));
  const currentEvidenceKeys = await prisma.fundEvidence.findMany({
    where: { fundId: revision.fundId },
    select: { evidenceLabel: true, source: { select: { url: true } } },
  });
  const evidenceKeys = [
    ...after.evidence,
    ...currentEvidenceKeys.map((row) => ({
      url: row.source.url,
      evidenceLabel: row.evidenceLabel,
      existing: null,
    })),
  ];
  const [current, operational, later, evidence, ownershipImpact] = await Promise.all([
    fetchFundSnapshot(prisma, revision.fund.legacyId, true),
    prisma.fund.findUnique({
      where: { id: revision.fundId },
      select: { id: true, legacyId: true, lastVerifiedAt: true },
    }),
    findLaterRevision(prisma, revision),
    captureRelevantEvidence(prisma, revision.fundId, evidenceKeys),
    isRename
      ? prisma.ownershipPeriod.count({
          where: {
            OR: [
              { fundId: revision.fundId },
              { vehicleName: { in: renameNames } },
            ],
          },
        })
      : Promise.resolve(0),
  ]);
  const blockers = rollbackGuard({
    legacyId: revision.fund.legacyId,
    before: before.snapshot,
    appliedAfter: after.snapshot,
    current,
    laterRevisionId: later ? `${later.id} (${later.proposalHash})` : null,
  });
  if (!operational || operational.legacyId !== revision.fund.legacyId) {
    blockers.push(`${revision.fund.legacyId}: operational fund row no longer matches the recorded revision`);
    return blockers;
  }
  if (isoDateTime(operational.lastVerifiedAt) !== after.lastVerifiedAt) {
    blockers.push(`${revision.fund.legacyId}: lastVerifiedAt no longer matches the recorded applied image`);
  }
  if (canonicalJson(evidence) !== canonicalJson(after.evidence)) {
    blockers.push(`${revision.fund.legacyId}: fund evidence no longer matches the recorded applied image`);
  }
  if (ownershipImpact > 0) {
    blockers.push(`${revision.fund.legacyId}: a rename rollback is blocked because live OwnershipPeriod links or exact-name rows now exist`);
  }
  return blockers;
}

function mapped<T>(map: Record<string, T>, values: string[], field: string): T[] {
  return values.map((value) => {
    const result = map[value];
    if (!result) throw new Error(`Cannot map ${field}: ${value}`);
    return result;
  });
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const originalHash = requiredString(args, "proposal-hash").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(originalHash)) throw new Error("--proposal-hash must be a lowercase SHA-256 hash");
  const environmentValue = requiredString(args, "environment");
  if (environmentValue !== "validation" && environmentValue !== "production") {
    throw new Error("--environment must be validation or production");
  }
  const environment: "validation" | "production" = environmentValue;
  const baseCommit = requiredString(args, "base-commit").toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(baseCommit)) throw new Error("--base-commit must be a lowercase 40-character Git SHA");
  const shouldApply = args.get("apply") === true;
  if (args.has("apply") && !shouldApply) throw new Error("--apply is a boolean flag and cannot take a value");
  if (shouldApply) assertMutationDatabaseTarget(environment);
  const prisma = createFundDatabaseClient();
  try {
    const foundations = await checkFundRefreshFoundations(prisma);
    if (!foundations.ready) throw new Error("Fund refresh foundations are not ready");
    const revisions = await prisma.fundRevision.findMany({
      where: { proposalHash: originalHash },
      include: { fund: { select: { legacyId: true } } },
      orderBy: [{ appliedAt: "asc" }, { id: "asc" }],
    });
    if (revisions.length === 0) throw new Error("No applied revisions found for that proposal hash");

    const blockers: string[] = [];
    const plans: RollbackPlan[] = [];
    const desiredManifest = loadFundManifest();
    const desiredEvidence = loadFundEvidenceManifest();
    const desiredById = new Map(desiredManifest.funds.map((fund) => [fund.id, manifestRecordToSnapshot(fund)]));
    blockers.push(...rollbackManifestScopeBlockers({
      baseManifest: loadFundManifestAtCommit(baseCommit),
      currentManifest: desiredManifest,
      baseEvidence: loadFundEvidenceManifestAtCommit(baseCommit),
      currentEvidence: desiredEvidence,
      allowedLegacyIds: new Set(revisions.map((revision) => revision.fund.legacyId)),
    }));
    for (const revision of revisions) {
      const before = parseRevisionImage(revision.beforeJson, "Before");
      const after = parseRevisionImage(revision.afterJson, "After");
      if (!before || !after) {
        blockers.push(...rollbackGuard({
          legacyId: revision.fund.legacyId,
          before: before?.snapshot ?? null,
          appliedAfter: after?.snapshot ?? null,
          current: undefined,
        }));
        continue;
      }
      assertCompatibleRevisionImages(before, after, revision.fund.legacyId);
      const plan: RollbackPlan = { revision, before, after };
      const revisionBlockers = await currentStateBlockers(prisma, plan);
      const reviewedRollbackState = desiredById.get(revision.fund.legacyId) ?? null;
      if (canonicalJson(reviewedRollbackState) !== canonicalJson(before.snapshot)) {
        revisionBlockers.push(`${revision.fund.legacyId}: checked-out manifest does not match the recorded before-image; merge a reviewed manifest-revert PR first`);
      }
      const evidenceComparison = compareManifestEvidenceRecords(
        desiredEvidence,
        revision.fund.legacyId,
        before.manifestEvidence,
      );
      if (!evidenceComparison.matches) {
        revisionBlockers.push(...evidenceComparison.differences.map((difference) =>
          `${difference}; merge a reviewed evidence-manifest revert in the rollback PR first`,
        ));
      }
      if (revisionBlockers.length > 0) blockers.push(...revisionBlockers);
      else plans.push(plan);
    }

    const preview = {
      applied: false,
      environment,
      baseCommit,
      originalProposalHash: originalHash,
      restorable: plans.map((plan) => plan.revision.fund.legacyId),
      blockers,
    };
    if (blockers.length > 0) {
      if (typeof args.get("output") === "string") writeJson(String(args.get("output")), preview);
      console.log(JSON.stringify(preview, null, 2));
      if (shouldApply) process.exitCode = 1;
      return;
    }
    if (!shouldApply) {
      if (typeof args.get("output") === "string") writeJson(String(args.get("output")), preview);
      console.log(JSON.stringify(preview, null, 2));
      return;
    }

    const approver = process.env.FUND_REFRESH_APPROVER?.trim();
    if (!approver) throw new Error("FUND_REFRESH_APPROVER is required for an applied rollback");
    const initiatedBy = (process.env.FUND_REFRESH_INITIATOR || process.env.GITHUB_ACTOR)?.trim() || null;
    const rollbackHash = sha256(`rollback:${originalHash}:${new Date().toISOString()}`);
    const pipeline = await prisma.pipelineRun.create({
      data: {
        pipeline: "FUND_REFRESH_ROLLBACK",
        status: "RUNNING",
        metadata: jsonValue({ originalProposalHash: originalHash, rollbackHash, environment, approver, initiatedBy }),
      },
    });
    try {
      await prisma.$transaction(async (tx) => {
        const transactionBlockers: string[] = [];
        for (const plan of plans) {
          transactionBlockers.push(...await currentStateBlockers(tx, plan));
        }
        if (transactionBlockers.length > 0) {
          throw new Error(`Rollback state changed after preview: ${transactionBlockers.join("; ")}`);
        }

        for (const plan of plans) {
          const snapshot = plan.before.snapshot;
          if (!snapshot) throw new Error("Rollback snapshot unexpectedly missing");
          const canonicalManager = resolveOrgName(snapshot.managerName);
          if (canonicalManager !== snapshot.managerName) throw new Error(`${snapshot.legacyId}: before-image manager is not canonical`);
          const manager = await tx.organization.findUnique({ where: { name: canonicalManager }, select: { id: true, types: true } });
          if (!manager || !manager.types.includes("FUND_MANAGER")) throw new Error(`${snapshot.legacyId}: before-image manager is unavailable`);
          const structure = FUND_STRUCTURE_MAP[snapshot.structure];
          const fundStatus = FUND_STATUS_MAP[snapshot.fundStatus];
          if (!structure || !fundStatus) throw new Error(`${snapshot.legacyId}: before-image enums are invalid`);
          await tx.fund.update({
            where: { id: plan.revision.fundId },
            data: {
              managerId: manager.id,
              fundName: snapshot.fundName,
              ticker: snapshot.ticker,
              investmentStrategy: snapshot.investmentStrategy,
              size: snapshot.size,
              sizeUsdMm: snapshot.sizeUsdMm,
              sizeNativeCurrency: snapshot.sizeNativeCurrency,
              sizeNativeAmount: snapshot.sizeNativeAmount,
              sizeBasis: snapshot.sizeBasis,
              sizeAsOf: snapshot.sizeAsOf ? new Date(`${snapshot.sizeAsOf}T00:00:00Z`) : null,
              sizeUsdFxRate: snapshot.sizeUsdFxRate,
              sizeUsdFxDate: snapshot.sizeUsdFxDate ? new Date(`${snapshot.sizeUsdFxDate}T00:00:00Z`) : null,
              vintage: snapshot.vintage,
              strategies: mapped(FUND_STRATEGY_MAP, snapshot.strategies, "strategy"),
              structure,
              fundStatus,
              sectors: mapped(FUND_SECTOR_MAP, snapshot.sectors, "sector"),
              regions: mapped(FUND_REGION_MAP, snapshot.regions, "region"),
              sourceUrls: snapshot.sourceUrls,
              strategyUrl: snapshot.strategyUrl ?? "",
              lastVerifiedAt: plan.before.lastVerifiedAt ? new Date(plan.before.lastVerifiedAt) : null,
            },
          });

          for (const evidence of plan.before.evidence) {
            const source = await tx.source.findUnique({ where: { url: evidence.url }, select: { id: true } });
            if (!source) {
              if (evidence.existing) throw new Error(`${snapshot.legacyId}: source needed for evidence rollback is missing`);
              continue;
            }
            if (!evidence.existing) {
              await tx.fundEvidence.deleteMany({
                where: { fundId: plan.revision.fundId, sourceId: source.id, evidenceLabel: evidence.evidenceLabel },
              });
            } else {
              await tx.fundEvidence.upsert({
                where: {
                  fundId_sourceId_evidenceLabel: {
                    fundId: plan.revision.fundId,
                    sourceId: source.id,
                    evidenceLabel: evidence.evidenceLabel,
                  },
                },
                update: {
                  supportedFields: evidence.existing.supportedFields,
                  sourceTier: evidence.existing.sourceTier,
                  scope: evidence.existing.scope,
                  publishedAt: evidence.existing.publishedAt ? new Date(evidence.existing.publishedAt) : null,
                  retrievedAt: new Date(evidence.existing.retrievedAt),
                  confidence: evidence.existing.confidence,
                  pipelineRunId: evidence.existing.pipelineRunId,
                },
                create: {
                  fundId: plan.revision.fundId,
                  sourceId: source.id,
                  evidenceLabel: evidence.evidenceLabel,
                  supportedFields: evidence.existing.supportedFields,
                  sourceTier: evidence.existing.sourceTier,
                  scope: evidence.existing.scope,
                  publishedAt: evidence.existing.publishedAt ? new Date(evidence.existing.publishedAt) : null,
                  retrievedAt: new Date(evidence.existing.retrievedAt),
                  confidence: evidence.existing.confidence,
                  pipelineRunId: evidence.existing.pipelineRunId,
                },
              });
            }
          }
          await tx.fundRevision.create({
            data: {
              fundId: plan.revision.fundId,
              proposalHash: rollbackHash,
              beforeJson: jsonValue(plan.after),
              afterJson: jsonValue(plan.before),
              changedFields: plan.revision.changedFields,
              approver,
              pipelineRunId: pipeline.id,
            },
          });
        }
        await tx.auditEvent.create({
          data: {
            entityType: "Fund",
            action: "FUND_REFRESH_ROLLBACK",
            changes: jsonValue({ originalProposalHash: originalHash, rollbackHash, funds: plans.map((plan) => plan.revision.fund.legacyId) }),
            metadata: jsonValue({ environment, approver, initiatedBy }),
          },
        });
        await tx.pipelineRun.update({
          where: { id: pipeline.id },
          data: { status: "SUCCEEDED", endedAt: new Date(), updated: plans.length },
        });
      }, { isolationLevel: "Serializable", maxWait: 15_000, timeout: 120_000 });
    } catch (error) {
      await prisma.pipelineRun.updateMany({
        where: { id: pipeline.id, status: "RUNNING" },
        data: { status: "FAILED", endedAt: new Date(), errorSummary: (error instanceof Error ? error.message : String(error)).slice(0, 500) },
      }).catch(() => undefined);
      throw error;
    }

    const result = {
      ...preview,
      applied: true,
      rollbackHash,
      pipelineRunId: pipeline.id,
      approver,
      initiatedBy,
      cacheRevalidationRequired: true,
    };
    if (typeof args.get("output") === "string") writeJson(String(args.get("output")), result);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
