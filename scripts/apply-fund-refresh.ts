import "dotenv/config";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { inferSourceType } from "../src/lib/source-utils";
import type { FundRefreshCandidate, FundRefreshSnapshot } from "../src/modules/funds/refresh-schema";
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
  type EvidenceManifestRecord,
  canonicalManagerKey,
  canonicalJson,
  findUnreviewedEvidenceWrites,
  loadFundEvidenceManifest,
  loadFundEvidenceManifestAtCommit,
  loadFundManifest,
  loadFundManifestAtCommit,
  manifestRecordToSnapshot,
  parseAndValidateProposal,
  parseCliArgs,
  requiredString,
  snapshotFingerprint,
  validateFundEvidenceManifest,
} from "./fund-refresh/lib";
import {
  assertMutationDatabaseTarget,
  checkFundRefreshFoundations,
  createFundDatabaseClient,
  fetchFundSnapshot,
  fetchFundSnapshots,
  fetchFundOperationalFingerprint,
  fetchOwnershipFingerprint,
} from "./fund-refresh/database";

const GIT_SHA_PATTERN = /^[a-f0-9]{40}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const VALIDATION_FAILPOINT = "after-candidates";

function gitHead(): string {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO_ROOT, encoding: "utf8" }).trim();
}

function writeJson(filePath: string, value: unknown) {
  const resolved = path.resolve(REPO_ROOT, filePath);
  mkdirSync(path.dirname(resolved), { recursive: true });
  writeFileSync(resolved, JSON.stringify(value, null, 2) + "\n");
}

async function captureAffectedOperationalState(
  prisma: PrismaClient,
  legacyIds: string[],
) {
  return prisma.fund.findMany({
    where: { legacyId: { in: legacyIds } },
    select: {
      id: true,
      legacyId: true,
      status: true,
      lastVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
      evidence: {
        select: {
          supportedFields: true,
          sourceTier: true,
          scope: true,
          publishedAt: true,
          retrievedAt: true,
          confidence: true,
          evidenceLabel: true,
          pipelineRunId: true,
          createdAt: true,
          source: { select: { id: true, label: true, url: true, type: true } },
        },
        orderBy: [{ source: { url: "asc" } }, { evidenceLabel: "asc" }],
      },
    },
    orderBy: { legacyId: "asc" },
  });
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function date(value: string | null): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function ensureMapped<T>(map: Record<string, T>, values: string[], field: string): T[] {
  return values.map((value) => {
    const mapped = map[value];
    if (!mapped) throw new Error(`Cannot map ${field} value: ${value}`);
    return mapped;
  });
}

function databaseData(snapshot: FundRefreshSnapshot, managerId: string, verifiedAt = new Date()) {
  const structure = FUND_STRUCTURE_MAP[snapshot.structure];
  const fundStatus = FUND_STATUS_MAP[snapshot.fundStatus];
  if (!structure || !fundStatus) throw new Error(`Cannot map structure/status for ${snapshot.legacyId}`);
  return {
    managerId,
    fundName: snapshot.fundName,
    ticker: snapshot.ticker,
    investmentStrategy: snapshot.investmentStrategy,
    size: snapshot.size,
    sizeUsdMm: snapshot.sizeUsdMm,
    sizeNativeCurrency: snapshot.sizeNativeCurrency,
    sizeNativeAmount: snapshot.sizeNativeAmount,
    sizeBasis: snapshot.sizeBasis,
    sizeAsOf: date(snapshot.sizeAsOf),
    sizeUsdFxRate: snapshot.sizeUsdFxRate,
    sizeUsdFxDate: date(snapshot.sizeUsdFxDate),
    vintage: snapshot.vintage,
    strategies: ensureMapped(FUND_STRATEGY_MAP, snapshot.strategies, "strategy"),
    structure,
    fundStatus,
    sectors: ensureMapped(FUND_SECTOR_MAP, snapshot.sectors, "sector"),
    regions: ensureMapped(FUND_REGION_MAP, snapshot.regions, "region"),
    sourceUrls: snapshot.sourceUrls,
    strategyUrl: snapshot.strategyUrl ?? "",
    lastVerifiedAt: verifiedAt,
  };
}

interface RevisionEvidenceBefore {
  url: string;
  evidenceLabel: string;
  existing: null | {
    supportedFields: string[];
    sourceTier: string;
    scope: string;
    publishedAt: string | null;
    retrievedAt: string;
    confidence: string;
    pipelineRunId: string | null;
  };
}

async function captureEvidenceBefore(
  tx: Pick<Prisma.TransactionClient, "fundEvidence">,
  evidenceKeys: Array<{ url: string; evidenceLabel: string }>,
  fundId: string | null,
): Promise<RevisionEvidenceBefore[]> {
  const uniqueKeys = [...new Map(evidenceKeys.map((evidence) => [
    `${evidence.url}\u0000${evidence.evidenceLabel}`,
    evidence,
  ])).values()].sort((left, right) =>
    left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel),
  );
  return Promise.all(uniqueKeys.map(async (evidence) => {
    if (!fundId) return { url: evidence.url, evidenceLabel: evidence.evidenceLabel, existing: null };
    const existing = await tx.fundEvidence.findFirst({
      where: {
        fundId,
        evidenceLabel: evidence.evidenceLabel,
        source: { url: evidence.url },
      },
      select: {
        supportedFields: true,
        sourceTier: true,
        scope: true,
        publishedAt: true,
        retrievedAt: true,
        confidence: true,
        pipelineRunId: true,
      },
    });
    return {
      url: evidence.url,
      evidenceLabel: evidence.evidenceLabel,
      existing: existing ? {
        supportedFields: existing.supportedFields,
        sourceTier: existing.sourceTier,
        scope: existing.scope,
        publishedAt: existing.publishedAt?.toISOString() ?? null,
        retrievedAt: existing.retrievedAt.toISOString(),
        confidence: existing.confidence,
        pipelineRunId: existing.pipelineRunId,
      } : null,
    };
  }));
}

async function listFundEvidenceKeys(
  tx: Pick<Prisma.TransactionClient, "fundEvidence">,
  fundId: string | null,
): Promise<Array<{ url: string; evidenceLabel: string }>> {
  if (!fundId) return [];
  const rows = await tx.fundEvidence.findMany({
    where: { fundId },
    select: { evidenceLabel: true, source: { select: { url: true } } },
    orderBy: [{ source: { url: "asc" } }, { evidenceLabel: "asc" }],
  });
  return rows.map((row) => ({ url: row.source.url, evidenceLabel: row.evidenceLabel }));
}

async function resolveManager(tx: Prisma.TransactionClient, candidate: FundRefreshCandidate): Promise<string> {
  const managerName = candidate.after?.managerName ?? candidate.identity.managerName;
  const canonical = resolveOrgName(managerName);
  if (canonical !== managerName) {
    throw new Error(`${candidate.identity.legacyId}: manager must be canonical (${managerName} resolves to ${canonical})`);
  }
  const manager = await tx.organization.findUnique({ where: { name: canonical }, select: { id: true, types: true } });
  if (!manager || !manager.types.includes("FUND_MANAGER")) {
    throw new Error(`${candidate.identity.legacyId}: reviewed manager organization does not exist as FUND_MANAGER`);
  }
  return manager.id;
}

async function reconcileEvidence(
  tx: Prisma.TransactionClient,
  candidate: FundRefreshCandidate,
  desiredEvidence: EvidenceManifestRecord[],
  fundId: string,
  pipelineRunId: string,
) {
  const evidenceKey = (evidence: { url: string; evidenceLabel: string }) =>
    `${evidence.url}\u0000${evidence.evidenceLabel}`;
  const desiredKeys = new Set(desiredEvidence.map(evidenceKey));
  const reopenedKeys = new Set(candidate.evidence.map(evidenceKey));
  const existing = await tx.fundEvidence.findMany({
    where: { fundId },
    select: {
      id: true,
      evidenceLabel: true,
      supportedFields: true,
      sourceTier: true,
      scope: true,
      publishedAt: true,
      retrievedAt: true,
      confidence: true,
      source: { select: { url: true } },
    },
  });
  const unexpectedLiveEvidence = existing
    .filter((row) => !desiredKeys.has(evidenceKey({ url: row.source.url, evidenceLabel: row.evidenceLabel })))
    .map((row) => evidenceKey({ url: row.source.url, evidenceLabel: row.evidenceLabel }))
    .sort();
  if (unexpectedLiveEvidence.length > 0) {
    throw new Error(
      `${candidate.identity.legacyId}: live evidence is absent from reviewed desired state; preserve or reconcile separately: ${unexpectedLiveEvidence.join(", ")}`,
    );
  }

  const currentEvidence = existing.map((row) => ({
    url: row.source.url,
    evidenceLabel: row.evidenceLabel,
    supportedFields: row.supportedFields,
    sourceTier: row.sourceTier,
    scope: row.scope,
    publishedAt: row.publishedAt?.toISOString().slice(0, 10) ?? null,
    retrievedAt: row.retrievedAt.toISOString().slice(0, 10),
    confidence: row.confidence,
  }));
  const unreviewedWrites = findUnreviewedEvidenceWrites(desiredEvidence, currentEvidence, candidate.evidence);
  if (unreviewedWrites.length > 0) {
    throw new Error(
      `${candidate.identity.legacyId}: database evidence insert/update is absent from the reviewed candidate evidence: ${unreviewedWrites.join(", ")}`,
    );
  }

  for (const evidence of desiredEvidence) {
    const source = await tx.source.upsert({
      where: { url: evidence.url },
      update: {},
      create: {
        label: evidence.evidenceLabel,
        url: evidence.url,
        type: inferSourceType({ label: evidence.evidenceLabel, url: evidence.url }),
      },
    });
    await tx.fundEvidence.upsert({
      where: {
        fundId_sourceId_evidenceLabel: {
          fundId,
          sourceId: source.id,
          evidenceLabel: evidence.evidenceLabel,
        },
      },
      update: {
        supportedFields: evidence.supportedFields,
        sourceTier: evidence.sourceTier,
        scope: evidence.scope,
        publishedAt: date(evidence.publishedAt),
        retrievedAt: date(evidence.retrievedAt)!,
        confidence: evidence.confidence,
        ...(reopenedKeys.has(evidenceKey(evidence)) ? { pipelineRunId } : {}),
      },
      create: {
        fundId,
        sourceId: source.id,
        supportedFields: evidence.supportedFields,
        sourceTier: evidence.sourceTier,
        scope: evidence.scope,
        publishedAt: date(evidence.publishedAt),
        retrievedAt: date(evidence.retrievedAt)!,
        confidence: evidence.confidence,
        evidenceLabel: evidence.evidenceLabel,
        pipelineRunId,
      },
    });
  }
}

function ensureApplyEligible(candidates: FundRefreshCandidate[]) {
  const ownershipImpactedRenames = candidates.filter((candidate) =>
    candidate.before !== null &&
    candidate.after !== null &&
    candidate.before.fundName !== candidate.after.fundName &&
    candidate.ownershipLinkImpact.matchedOwnershipPeriodCount > 0,
  );
  if (ownershipImpactedRenames.length > 0) {
    throw new Error(`Proposal contains ${ownershipImpactedRenames.length} rename(s) with exact OwnershipPeriod matches; automated apply is prohibited`);
  }
  const blocked = candidates.filter((candidate) =>
    candidate.action === "ARCHIVE_REVIEW" ||
    candidate.confidence === "LOW" ||
    candidate.unresolvedQuestions.length > 0,
  );
  if (blocked.length > 0) {
    throw new Error(`Proposal contains ${blocked.length} unresolved, low-confidence, or archive-review candidate(s)`);
  }
}

async function verifyOwnershipImpact(
  tx: Prisma.TransactionClient,
  candidate: FundRefreshCandidate,
  fundId: string | null,
) {
  const names = [...new Set([
    candidate.before?.fundName,
    candidate.after?.fundName,
  ].filter((value): value is string => Boolean(value)))].sort();
  const exactRows = await tx.ownershipPeriod.findMany({
    where: { vehicleName: { in: names } },
    select: { vehicleName: true },
  });
  const actualNames = [...new Set(exactRows.flatMap((row) => row.vehicleName ? [row.vehicleName] : []))].sort();
  const linkedRows = fundId ? await tx.ownershipPeriod.findMany({
    where: { fundId },
    select: { companyId: true },
  }) : [];
  const linkedCompanyIds = [...new Set(linkedRows.map((row) => row.companyId))].sort();
  if (
    exactRows.length !== candidate.ownershipLinkImpact.matchedOwnershipPeriodCount ||
    canonicalJson(actualNames) !== canonicalJson(candidate.ownershipLinkImpact.matchedOwnershipVehicles) ||
    linkedRows.length !== candidate.ownershipLinkImpact.linkedOwnershipPeriodCount ||
    canonicalJson(linkedCompanyIds) !== canonicalJson(candidate.ownershipLinkImpact.linkedCompanyIds)
  ) {
    throw new Error(`${candidate.identity.legacyId}: live OwnershipPeriod exact-name or fund-linked impact differs from the reviewed proposal`);
  }
  const isRename = candidate.before !== null && candidate.after !== null && candidate.before.fundName !== candidate.after.fundName;
  if (isRename) {
    if (linkedRows.length > 0 || exactRows.length > 0) {
      throw new Error(`${candidate.identity.legacyId}: automated rename is prohibited while live OwnershipPeriod links or exact-name rows exist`);
    }
  }
}

async function applyCandidate(
  tx: Prisma.TransactionClient,
  candidate: FundRefreshCandidate,
  liveById: Map<string, FundRefreshSnapshot>,
  pipelineRunId: string,
  proposalHashValue: string,
  approver: string,
  desiredEvidence: EvidenceManifestRecord[],
  baseManifestEvidence: EvidenceManifestRecord[],
) {
  if (candidate.action === "ARCHIVE_REVIEW") throw new Error("ARCHIVE_REVIEW cannot be applied");
  const current = liveById.get(candidate.identity.legacyId) ?? null;
  if (canonicalJson(current) !== canonicalJson(candidate.before)) {
    throw new Error(`${candidate.identity.legacyId}: live row no longer matches the reviewed before image`);
  }
  const existingOperational = candidate.action === "CREATE"
    ? null
    : await tx.fund.findUnique({
        where: { legacyId: candidate.identity.legacyId },
        select: { id: true, lastVerifiedAt: true },
      });
  await verifyOwnershipImpact(tx, candidate, existingOperational?.id ?? null);
  const evidenceKeys = [
    ...await listFundEvidenceKeys(tx, existingOperational?.id ?? null),
    ...desiredEvidence.map((evidence) => ({ url: evidence.url, evidenceLabel: evidence.evidenceLabel })),
  ];
  const evidenceBefore = await captureEvidenceBefore(tx, evidenceKeys, existingOperational?.id ?? null);
  const verifiedAt = new Date();
  const managerId = await resolveManager(tx, candidate);
  let persistedFund: { id: string; lastVerifiedAt: Date | null };
  if (candidate.action === "CREATE") {
    if (!candidate.after || current) throw new Error(`${candidate.identity.legacyId}: invalid CREATE baseline`);
    const created = await tx.fund.create({
      data: {
        legacyId: candidate.after.legacyId,
        ...databaseData(candidate.after, managerId, verifiedAt),
        status: "PUBLISHED",
      },
      select: { id: true, lastVerifiedAt: true },
    });
    persistedFund = created;
  } else {
    if (!candidate.after || !current) throw new Error(`${candidate.identity.legacyId}: existing fund is missing`);
    const updated = await tx.fund.update({
      where: { legacyId: candidate.identity.legacyId },
      data: candidate.action === "VERIFY_NO_CHANGE"
        ? { lastVerifiedAt: verifiedAt }
        : databaseData(candidate.after, managerId, verifiedAt),
      select: { id: true, lastVerifiedAt: true },
    });
    persistedFund = updated;
  }

  await reconcileEvidence(tx, candidate, desiredEvidence, persistedFund.id, pipelineRunId);
  const persistedSnapshot = await fetchFundSnapshot(tx, candidate.identity.legacyId, true);
  if (!persistedSnapshot) throw new Error(`${candidate.identity.legacyId}: persisted after-image could not be read`);
  const evidenceAfter = await captureEvidenceBefore(tx, evidenceKeys, persistedFund.id);
  await tx.fundRevision.create({
    data: {
      fundId: persistedFund.id,
      proposalHash: proposalHashValue,
      beforeJson: candidate.before ? jsonValue({
        snapshot: current,
        lastVerifiedAt: existingOperational?.lastVerifiedAt?.toISOString() ?? null,
        evidence: evidenceBefore,
        manifestEvidence: baseManifestEvidence,
      }) : undefined,
      afterJson: jsonValue({
        snapshot: persistedSnapshot,
        lastVerifiedAt: persistedFund.lastVerifiedAt?.toISOString() ?? verifiedAt.toISOString(),
        evidence: evidenceAfter,
        manifestEvidence: desiredEvidence,
      }),
      changedFields: candidate.action === "VERIFY_NO_CHANGE"
        ? ["lastVerifiedAt"]
        : candidate.changedFields,
      approver,
      pipelineRunId,
    },
  });
}

async function verifyIdempotentReapply(
  prisma: PrismaClient,
  proposalHashValue: string,
  candidates: FundRefreshCandidate[],
): Promise<number> {
  const priorRevisions = await prisma.fundRevision.findMany({
    where: { proposalHash: proposalHashValue },
    include: { fund: { select: { legacyId: true } } },
    orderBy: [{ appliedAt: "asc" }, { id: "asc" }],
  });
  if (priorRevisions.length === 0) return 0;
  if (priorRevisions.length !== candidates.length) {
    throw new Error("Partial proposal revision set detected; manual investigation required");
  }

  const revisionsByLegacyId = new Map(priorRevisions.map((revision) => [revision.fund.legacyId, revision]));
  if (revisionsByLegacyId.size !== candidates.length) {
    throw new Error("Duplicate or mismatched proposal revision identities detected");
  }
  for (const candidate of candidates) {
    const revision = revisionsByLegacyId.get(candidate.identity.legacyId);
    if (!revision) throw new Error(`${candidate.identity.legacyId}: proposal revision is missing`);
    const latest = await prisma.fundRevision.findFirst({
      where: { fundId: revision.fundId },
      orderBy: [{ appliedAt: "desc" }, { id: "desc" }],
      select: { id: true, proposalHash: true },
    });
    if (!latest || latest.id !== revision.id) {
      throw new Error(`${candidate.identity.legacyId}: proposal was superseded or rolled back by revision ${latest?.id ?? "unknown"}`);
    }
    const current = await fetchFundSnapshot(prisma, candidate.identity.legacyId, true);
    if (canonicalJson(current ?? null) !== canonicalJson(candidate.after)) {
      throw new Error(`${candidate.identity.legacyId}: live state no longer matches the previously applied proposal`);
    }
    const afterImage = revision.afterJson && typeof revision.afterJson === "object" && !Array.isArray(revision.afterJson)
      ? revision.afterJson as Record<string, unknown>
      : null;
    const recordedAfter = afterImage?.snapshot;
    if (canonicalJson(recordedAfter ?? null) !== canonicalJson(candidate.after)) {
      throw new Error(`${candidate.identity.legacyId}: recorded revision after-image does not match the proposal`);
    }
    if (typeof afterImage?.lastVerifiedAt !== "string" || !Array.isArray(afterImage.evidence)) {
      throw new Error(`${candidate.identity.legacyId}: recorded operational after-image is malformed`);
    }
    const recordedEvidenceKeys = afterImage.evidence.map((value) => {
      if (
        !value || typeof value !== "object" || Array.isArray(value) ||
        typeof (value as Record<string, unknown>).url !== "string" ||
        typeof (value as Record<string, unknown>).evidenceLabel !== "string"
      ) {
        throw new Error(`${candidate.identity.legacyId}: recorded evidence key is malformed`);
      }
      return {
        url: String((value as Record<string, unknown>).url),
        evidenceLabel: String((value as Record<string, unknown>).evidenceLabel),
      };
    });
    const operational = await prisma.fund.findUnique({
      where: { id: revision.fundId },
      select: { status: true, lastVerifiedAt: true },
    });
    if (
      operational?.status !== "PUBLISHED" ||
      operational.lastVerifiedAt?.toISOString() !== afterImage.lastVerifiedAt
    ) {
      throw new Error(`${candidate.identity.legacyId}: verification timestamp or publication state changed after the proposal was applied`);
    }
    const currentEvidence = await captureEvidenceBefore(
      prisma,
      [...recordedEvidenceKeys, ...await listFundEvidenceKeys(prisma, revision.fundId)],
      revision.fundId,
    );
    if (canonicalJson(currentEvidence) !== canonicalJson(afterImage.evidence)) {
      throw new Error(`${candidate.identity.legacyId}: evidence state changed after the proposal was applied`);
    }
  }
  return priorRevisions.length;
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const applyRequested = args.get("apply") === true;
  if (args.has("apply") && !applyRequested) throw new Error("--apply is a boolean flag and cannot take a value");
  const proposalPath = path.resolve(REPO_ROOT, requiredString(args, "proposal"));
  if (!proposalPath.startsWith(`${REPO_ROOT}${path.sep}`)) throw new Error("Proposal path must be inside the repository");
  const expectedHash = requiredString(args, "expected-sha256").toLowerCase();
  const expectedCommit = requiredString(args, "expected-head-sha").toLowerCase();
  const reviewedPrHeadSha = requiredString(args, "reviewed-pr-head-sha").toLowerCase();
  const prNumber = requiredString(args, "pr-number");
  const environment = requiredString(args, "environment");
  if (environment !== "validation" && environment !== "production") throw new Error("--environment must be validation or production");
  const testFailpoint = process.env.FUND_REFRESH_TEST_FAILPOINT;
  if (testFailpoint !== undefined && (
    !applyRequested || environment !== "validation" || testFailpoint !== VALIDATION_FAILPOINT
  )) {
    throw new Error(`FUND_REFRESH_TEST_FAILPOINT is accepted only as ${VALIDATION_FAILPOINT} for a validation --apply run`);
  }
  if (!SHA256_PATTERN.test(expectedHash)) throw new Error("--expected-sha256 must be a lowercase SHA-256 hash");
  if (!GIT_SHA_PATTERN.test(expectedCommit)) throw new Error("--expected-head-sha must be a lowercase full Git SHA");
  if (!GIT_SHA_PATTERN.test(reviewedPrHeadSha)) throw new Error("--reviewed-pr-head-sha must be a lowercase full Git SHA");
  if (!/^[1-9][0-9]*$/.test(prNumber)) throw new Error("--pr-number must be a positive integer");
  if (gitHead().toLowerCase() !== expectedCommit) throw new Error("Checked-out HEAD does not match --expected-head-sha");
  if (applyRequested) assertMutationDatabaseTarget(environment);

  const raw = JSON.parse(readFileSync(proposalPath, "utf8")) as unknown;
  const rawBaseCommit = raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>).baseCommit
    : null;
  if (typeof rawBaseCommit !== "string" || !GIT_SHA_PATTERN.test(rawBaseCommit.toLowerCase())) {
    throw new Error("Proposal baseCommit must be a full Git SHA");
  }
  const manifest = loadFundManifest();
  const baseManifest = loadFundManifestAtCommit(rawBaseCommit.toLowerCase());
  const validation = parseAndValidateProposal(raw, manifest, baseManifest);
  if (!validation.proposal || validation.zodIssues || validation.issues.some((issue) => issue.severity === "error")) {
    throw new Error("Proposal failed deterministic validation; run funds:proposal:validate for details");
  }
  const proposal = validation.proposal;
  if (proposal.proposalHash !== expectedHash) throw new Error("Proposal hash does not match --expected-sha256");
  ensureApplyEligible(proposal.candidates);

  const evidenceManifest = loadFundEvidenceManifest();
  const baseEvidenceManifest = loadFundEvidenceManifestAtCommit(rawBaseCommit.toLowerCase());
  const evidenceManifestIssues = validateFundEvidenceManifest(evidenceManifest)
    .filter((issue) => issue.severity === "error");
  if (evidenceManifestIssues.length > 0) {
    throw new Error(`Evidence manifest failed validation: ${evidenceManifestIssues.slice(0, 3).map((issue) => issue.message).join("; ")}`);
  }
  const desiredEvidenceByFund = new Map<string, EvidenceManifestRecord[]>();
  for (const record of evidenceManifest.records) {
    const records = desiredEvidenceByFund.get(record.legacyId) ?? [];
    records.push(record);
    desiredEvidenceByFund.set(record.legacyId, records);
  }
  const baseEvidenceByFund = new Map<string, EvidenceManifestRecord[]>();
  for (const record of baseEvidenceManifest.records) {
    const records = baseEvidenceByFund.get(record.legacyId) ?? [];
    records.push(record);
    baseEvidenceByFund.set(record.legacyId, records);
  }
  const actionableCount = proposal.candidates.filter((candidate) => candidate.action === "CREATE" || candidate.action === "UPDATE").length;
  if (baseManifest.funds.length > 0 && actionableCount / baseManifest.funds.length > 0.1) {
    throw new Error(`Actionable changes affect ${actionableCount}/${baseManifest.funds.length} reviewed base funds (>10%)`);
  }
  const baseManagers = new Set(baseManifest.funds.map((fund) => canonicalManagerKey(fund.managerName)));
  for (const candidate of proposal.candidates) {
    if (!baseManagers.has(canonicalManagerKey(candidate.identity.managerName))) {
      throw new Error(`${candidate.identity.legacyId}: manager was not present in the reviewed base-commit universe`);
    }
  }
  const desiredById = new Map(manifest.funds.map((fund) => [fund.id, manifestRecordToSnapshot(fund)]));
  for (const candidate of proposal.candidates.filter((item) =>
    item.action === "CREATE" || item.action === "UPDATE",
  )) {
    if (!candidate.after || canonicalJson(candidate.after) !== canonicalJson(desiredById.get(candidate.identity.legacyId))) {
      throw new Error(`${candidate.identity.legacyId}: reviewed after image does not match the merged manifest`);
    }
  }

  const prisma = createFundDatabaseClient();
  try {
    const foundations = await checkFundRefreshFoundations(prisma);
    if (!foundations.ready) throw new Error("Required migrations are not fully applied or a migration is failed/pending");

    const priorRevisions = await verifyIdempotentReapply(prisma, proposal.proposalHash, proposal.candidates);
    if (priorRevisions > 0) {
      const output = { applied: false, idempotent: true, environment, proposalHash: proposal.proposalHash, revisions: priorRevisions };
      if (typeof args.get("output") === "string") writeJson(String(args.get("output")), output);
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    const live = await fetchFundSnapshots(prisma, true);
    if (live.length !== proposal.coverage.liveFunds) {
      throw new Error(`Proposal coverage reports ${proposal.coverage.liveFunds} live funds; trusted baseline contains ${live.length}`);
    }
    const liveFundFingerprint = snapshotFingerprint(live);
    const liveDatabaseFingerprint = await fetchFundOperationalFingerprint(prisma);
    if (liveDatabaseFingerprint !== proposal.liveDatabaseFingerprint) {
      throw new Error(`Live operational database fingerprint changed: expected ${proposal.liveDatabaseFingerprint}, got ${liveDatabaseFingerprint}`);
    }
    const liveById = new Map(live.map((snapshot) => [snapshot.legacyId, snapshot]));
    const ownershipFingerprint = await fetchOwnershipFingerprint(prisma);
    const affectedOperationalState = await captureAffectedOperationalState(
      prisma,
      proposal.candidates.map((candidate) => candidate.identity.legacyId),
    );
    const beforeExport = {
      generatedAt: new Date().toISOString(),
      environment,
      proposalHash: proposal.proposalHash,
      liveDatabaseFingerprint,
      liveFundFingerprint,
      liveFundCount: live.length,
      ownershipFingerprint,
      liveFunds: live,
      affectedOperationalState,
      affected: proposal.candidates.map((candidate) => ({
        action: candidate.action,
        legacyId: candidate.identity.legacyId,
        before: liveById.get(candidate.identity.legacyId) ?? null,
      })),
    };
    const snapshotOutput = args.get("snapshot-output");
    if (typeof snapshotOutput === "string") writeJson(snapshotOutput, beforeExport);

    const preview = {
      applied: false,
      environment,
      proposalHash: proposal.proposalHash,
      candidateCount: proposal.candidates.length,
      creates: proposal.candidates.filter((candidate) => candidate.action === "CREATE").length,
      updates: proposal.candidates.filter((candidate) => candidate.action === "UPDATE").length,
      verifications: proposal.candidates.filter((candidate) => candidate.action === "VERIFY_NO_CHANGE").length,
      databaseFingerprint: liveDatabaseFingerprint,
      fundFingerprint: liveFundFingerprint,
    };
    if (!applyRequested) {
      if (typeof args.get("output") === "string") writeJson(String(args.get("output")), preview);
      console.log(JSON.stringify(preview, null, 2));
      return;
    }

    const approver = process.env.FUND_REFRESH_APPROVER;
    const initiator = process.env.FUND_REFRESH_INITIATOR || process.env.GITHUB_ACTOR;
    if (!approver) throw new Error("FUND_REFRESH_APPROVER is required for an applied proposal");
    if (!initiator) throw new Error("FUND_REFRESH_INITIATOR or GITHUB_ACTOR is required for an applied proposal");
    const pipelineRun = await prisma.pipelineRun.create({
      data: {
        pipeline: "FUND_REFRESH_APPLY",
        status: "RUNNING",
        metadata: jsonValue({
          runId: proposal.runId,
          proposalHash: proposal.proposalHash,
          environment,
          mergedCommitSha: expectedCommit,
          reviewedPrHeadSha,
          prNumber: Number(prNumber),
          approver,
          initiator,
        }),
      },
      select: { id: true },
    });

    try {
      await prisma.$transaction(async (tx) => {
        const concurrentRevisionCount = await tx.fundRevision.count({
          where: { proposalHash: proposal.proposalHash },
        });
        if (concurrentRevisionCount > 0) {
          throw new Error("Proposal began applying concurrently; stop and rerun for deterministic idempotence verification");
        }
        const transactionLive = await fetchFundSnapshots(tx, true);
        if (transactionLive.length !== proposal.coverage.liveFunds) {
          throw new Error(`Transactional live fund count changed: expected ${proposal.coverage.liveFunds}, got ${transactionLive.length}`);
        }
        const transactionFingerprint = await fetchFundOperationalFingerprint(tx);
        if (transactionFingerprint !== proposal.liveDatabaseFingerprint) {
          throw new Error(`Transactional operational database fingerprint changed: expected ${proposal.liveDatabaseFingerprint}, got ${transactionFingerprint}`);
        }
        const transactionLiveById = new Map(transactionLive.map((snapshot) => [snapshot.legacyId, snapshot]));
        const ownershipBefore = await fetchOwnershipFingerprint(tx);
        for (const candidate of proposal.candidates) {
          const desiredEvidence = desiredEvidenceByFund.get(candidate.identity.legacyId) ?? [];
          if (desiredEvidence.length === 0) {
            throw new Error(`${candidate.identity.legacyId}: reviewed desired state has no normalized evidence records`);
          }
          await applyCandidate(
            tx,
            candidate,
            transactionLiveById,
            pipelineRun.id,
            proposal.proposalHash,
            approver,
            desiredEvidence,
            baseEvidenceByFund.get(candidate.identity.legacyId) ?? [],
          );
        }
        if (testFailpoint === VALIDATION_FAILPOINT) {
          throw new Error("FUND_REFRESH_INTENTIONAL_APPLY_FAILPOINT_AFTER_CANDIDATES");
        }
        const ownershipAfter = await fetchOwnershipFingerprint(tx);
        if (ownershipAfter !== ownershipBefore || ownershipAfter !== ownershipFingerprint) {
          throw new Error("OwnershipPeriod state changed during the fund refresh transaction");
        }
        await tx.auditEvent.create({
          data: {
            entityType: "Fund",
            action: "FUND_REFRESH_APPLY",
            changes: jsonValue({
              proposalHash: proposal.proposalHash,
              candidates: proposal.candidates.map((candidate) => ({ legacyId: candidate.identity.legacyId, action: candidate.action, changedFields: candidate.changedFields })),
            }),
            metadata: jsonValue({
              runId: proposal.runId,
              environment,
              approver,
              initiator,
              mergedCommitSha: expectedCommit,
              reviewedPrHeadSha,
              prNumber: Number(prNumber),
            }),
          },
        });
        await tx.pipelineRun.update({
          where: { id: pipelineRun.id },
          data: {
            status: "SUCCEEDED",
            endedAt: new Date(),
            inserted: preview.creates,
            updated: preview.updates + preview.verifications,
            skipped: 0,
          },
        });
      }, { isolationLevel: "Serializable", maxWait: 15_000, timeout: 120_000 });
    } catch (error) {
      await prisma.pipelineRun.updateMany({
        where: { id: pipelineRun.id, status: "RUNNING" },
        data: {
          status: "FAILED",
          endedAt: new Date(),
          errorSummary: (error instanceof Error ? error.message : String(error)).slice(0, 500),
        },
      }).catch(() => undefined);
      throw error;
    }

    const after = await fetchFundSnapshots(prisma, true);
    const afterDatabaseFingerprint = await fetchFundOperationalFingerprint(prisma);
    const output = {
      ...preview,
      applied: true,
      idempotent: false,
      pipelineRunId: pipelineRun.id,
      approver,
      initiator,
      mergedCommitSha: expectedCommit,
      reviewedPrHeadSha,
      beforeDatabaseFingerprint: liveDatabaseFingerprint,
      afterDatabaseFingerprint,
      beforeFundFingerprint: liveFundFingerprint,
      afterFundFingerprint: snapshotFingerprint(after),
      cacheRevalidationRequired: environment === "production",
    };
    if (typeof args.get("output") === "string") writeJson(String(args.get("output")), output);
    console.log(JSON.stringify(output, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
