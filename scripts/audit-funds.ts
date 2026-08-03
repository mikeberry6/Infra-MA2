import "dotenv/config";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { resolveOrgName } from "../prisma/entity-resolution";
import { fundEvidenceManifestRecordSchema, fundRefreshSnapshotSchema } from "../src/modules/funds/refresh-schema";
import { buildFundSourceAudit } from "./generate-fund-source-audit";
import {
  REPO_ROOT,
  canonicalManagerKey,
  canonicalJson,
  evidenceSourceId,
  loadFundEvidenceManifest,
  loadFundEvidenceManifestAtCommit,
  loadFundManifest,
  loadFundManifestAtCommit,
  manifestRecordToSnapshot,
  normalizeIdentity,
  parseCliArgs,
  snapshotChangedFields,
  snapshotFingerprint,
  validateFundEvidenceManifest,
} from "./fund-refresh/lib";
import {
  checkFundRefreshFoundations,
  createFundDatabaseClient,
  fetchFundOperationalFingerprint,
  fetchFundSnapshots,
  fetchOwnershipFingerprint,
} from "./fund-refresh/database";

export interface AuditFinding {
  severity: "error" | "warning";
  code: string;
  message: string;
  legacyId?: string;
}

export interface ComparableAuditReport {
  findings?: AuditFinding[];
  database?: {
    manifestOnly?: string[];
    liveOnly?: string[];
    snapshots?: Array<{ legacyId: string; [key: string]: unknown }>;
    drift?: Array<{ legacyId: string; changedFields?: string[] }>;
    evidence?: {
      missingLegacyIds?: string[];
      semanticDriftKeys?: string[];
      semanticDrift?: Array<{ key: string; desired: unknown; live: unknown }>;
    } | null;
    ownership?: { fingerprint?: string };
  };
}

export function withoutReviewedRollbackScope(
  report: ComparableAuditReport,
  reviewedLegacyIds: Set<string>,
): ComparableAuditReport {
  if (reviewedLegacyIds.size === 0) return report;
  const aggregateCodes = new Set(["LIVE_MANIFEST_DRIFT", "LIVE_EVIDENCE_COVERAGE", "LIVE_EVIDENCE_DRIFT"]);
  const evidenceBelongsToReviewedFund = (key: string) => reviewedLegacyIds.has(key.split("\u0000", 1)[0]);
  const database = report.database;
  return {
    ...report,
    findings: (report.findings ?? []).filter((finding) =>
      !aggregateCodes.has(finding.code) && !(finding.legacyId && reviewedLegacyIds.has(finding.legacyId)),
    ),
    database: database ? {
      ...database,
      manifestOnly: (database.manifestOnly ?? []).filter((legacyId) => !reviewedLegacyIds.has(legacyId)),
      liveOnly: (database.liveOnly ?? []).filter((legacyId) => !reviewedLegacyIds.has(legacyId)),
      snapshots: (database.snapshots ?? []).filter((snapshot) => !reviewedLegacyIds.has(snapshot.legacyId)),
      drift: (database.drift ?? []).filter((item) => !reviewedLegacyIds.has(item.legacyId)),
      evidence: database.evidence ? {
        ...database.evidence,
        missingLegacyIds: (database.evidence.missingLegacyIds ?? []).filter((legacyId) => !reviewedLegacyIds.has(legacyId)),
        semanticDriftKeys: (database.evidence.semanticDriftKeys ?? []).filter((key) => !evidenceBelongsToReviewedFund(key)),
        semanticDrift: (database.evidence.semanticDrift ?? []).filter((item) => !evidenceBelongsToReviewedFund(item.key)),
      } : database.evidence,
    } : database,
  };
}

function findingKey(finding: AuditFinding): string {
  if (finding.legacyId) return `${finding.code}\u0000${finding.legacyId}\u0000${finding.message}`;
  if (["LIVE_MANIFEST_DRIFT", "LIVE_EVIDENCE_COVERAGE", "LIVE_EVIDENCE_DRIFT"].includes(finding.code)) return finding.code;
  return `${finding.code}\u0000${finding.message}`;
}

function newMembers(current: string[], baseline: string[]): string[] {
  const allowed = new Set(baseline);
  return current.filter((value) => !allowed.has(value)).sort();
}

export function compareWithBaseline(current: ComparableAuditReport, baseline: ComparableAuditReport) {
  const baselineErrors = (baseline.findings ?? []).filter((finding) => finding.severity === "error");
  const currentErrors = (current.findings ?? []).filter((finding) => finding.severity === "error");
  const allowedErrorKeys = new Set(baselineErrors.map(findingKey));
  const newErrors = currentErrors.filter((finding) => !allowedErrorKeys.has(findingKey(finding)));
  const currentDatabase = current.database ?? {};
  const baselineDatabase = baseline.database ?? {};
  const currentDrift = currentDatabase.drift ?? [];
  const baselineDrift = baselineDatabase.drift ?? [];
  const baselineDriftById = new Map(baselineDrift.map((item) => [item.legacyId, item]));
  const baselineSnapshots = new Map((baselineDatabase.snapshots ?? []).map((item) => [item.legacyId, item]));
  const currentSnapshots = new Map((currentDatabase.snapshots ?? []).map((item) => [item.legacyId, item]));
  const changedDriftRegressions = currentDrift.flatMap((item) => {
    const previous = baselineDriftById.get(item.legacyId);
    if (!previous) return [];
    const newFields = newMembers(item.changedFields ?? [], previous.changedFields ?? []);
    const beforeSnapshot = baselineSnapshots.get(item.legacyId);
    const afterSnapshot = currentSnapshots.get(item.legacyId);
    const changedWhileStillDrifted = beforeSnapshot && afterSnapshot
      ? JSON.stringify(beforeSnapshot) !== JSON.stringify(afterSnapshot)
      : false;
    if (newFields.length === 0 && !changedWhileStillDrifted) return [];
    return [{
      severity: "error" as const,
      code: "BASELINE_REGRESSION",
      message: changedWhileStillDrifted
        ? `Previously drifted fund ${item.legacyId} changed but remains drifted`
        : `Previously drifted fund ${item.legacyId} gained changed fields: ${newFields.join(", ")}`,
    }];
  });
  const baselineEvidenceDriftByKey = new Map(
    (baselineDatabase.evidence?.semanticDrift ?? []).map((item) => [item.key, item]),
  );
  const changedEvidenceDriftRegressions = (currentDatabase.evidence?.semanticDrift ?? []).flatMap((item) => {
    const previous = baselineEvidenceDriftByKey.get(item.key);
    if (!previous || canonicalJson(previous) === canonicalJson(item)) return [];
    return [{
      severity: "error" as const,
      code: "BASELINE_REGRESSION",
      message: `Previously drifted evidence record changed but remains drifted: ${item.key}`,
    }];
  });
  const ownershipChanged = Boolean(
    baselineDatabase.ownership?.fingerprint
      && currentDatabase.ownership?.fingerprint
      && baselineDatabase.ownership.fingerprint !== currentDatabase.ownership.fingerprint,
  );
  const regressions = [
    ["manifest-only funds", newMembers(currentDatabase.manifestOnly ?? [], baselineDatabase.manifestOnly ?? [])],
    ["live-only funds", newMembers(currentDatabase.liveOnly ?? [], baselineDatabase.liveOnly ?? [])],
    [
      "drifted funds",
      newMembers(
        currentDrift.map((item) => item.legacyId),
        baselineDrift.map((item) => item.legacyId),
      ),
    ],
    [
      "published funds missing normalized evidence",
      newMembers(
        currentDatabase.evidence?.missingLegacyIds ?? [],
        baselineDatabase.evidence?.missingLegacyIds ?? [],
      ),
    ],
    [
      "normalized evidence drift keys",
      newMembers(
        currentDatabase.evidence?.semanticDriftKeys ?? [],
        baselineDatabase.evidence?.semanticDriftKeys ?? [],
      ),
    ],
  ].flatMap(([label, values]) => (values as string[]).length > 0
    ? [{
        severity: "error" as const,
        code: "BASELINE_REGRESSION",
        message: `New ${label}: ${(values as string[]).join(", ")}`,
      }]
    : []);
  regressions.push(...changedDriftRegressions, ...changedEvidenceDriftRegressions);
  if (ownershipChanged) {
    regressions.push({
      severity: "error",
      code: "BASELINE_REGRESSION",
      message: "OwnershipPeriod fingerprint changed during a fund-only operation",
    });
  }
  return {
    baselineErrors: baselineErrors.length,
    currentErrors: currentErrors.length,
    resolvedErrors: baselineErrors.filter((finding) =>
      !new Set(currentErrors.map(findingKey)).has(findingKey(finding)),
    ).length,
    newErrors,
    regressions,
    gateErrors: [...newErrors, ...regressions],
  };
}

async function checkUrl(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    let response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if ([405, 501].includes(response.status)) {
      response = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, redirect: "follow", signal: controller.signal });
      await response.body?.cancel();
    }
    return { url, status: response.status, finalUrl: response.url, ok: response.status < 400 || [401, 403, 429].includes(response.status) };
  } catch (error) {
    return { url, status: null, finalUrl: null, ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

async function mapLimited<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current]);
    }
  }));
  return results;
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const positiveIntegerArg = (name: string): number | null => {
    const value = args.get(name);
    if (value === undefined) return null;
    if (typeof value !== "string" || !/^[1-9][0-9]*$/.test(value)) {
      throw new Error(`--${name} must be a positive integer`);
    }
    return Number(value);
  };
  const maxVerificationAgeDays = positiveIntegerArg("max-verification-age-days");
  const maxRaisingVerificationAgeDays = positiveIntegerArg("max-raising-verification-age-days");
  const maxEvidenceAgeDays = positiveIntegerArg("max-evidence-age-days");
  const dataCommit = args.get("data-commit");
  if (dataCommit !== undefined && (typeof dataCommit !== "string" || !/^[a-f0-9]{40}$/i.test(dataCommit))) {
    throw new Error("--data-commit must be a full Git SHA");
  }
  const reviewedRollbackHash = args.get("allow-reviewed-rollback-from");
  if (reviewedRollbackHash !== undefined && (
    typeof reviewedRollbackHash !== "string" || !/^[a-f0-9]{64}$/.test(reviewedRollbackHash)
  )) {
    throw new Error("--allow-reviewed-rollback-from must be an exact lowercase proposal SHA-256");
  }
  if (reviewedRollbackHash !== undefined && args.has("offline")) {
    throw new Error("--allow-reviewed-rollback-from requires a live database audit");
  }
  const manifest = typeof dataCommit === "string" ? loadFundManifestAtCommit(dataCommit) : loadFundManifest();
  const evidence = typeof dataCommit === "string" ? loadFundEvidenceManifestAtCommit(dataCommit) : loadFundEvidenceManifest();
  const findings: AuditFinding[] = [];
  const reviewedRollbackLegacyIds = new Set<string>();
  const liveEvidenceSourceUrls = new Set<string>();
  const ids = new Set<string>();
  const identities = new Map<string, string>();

  if (manifest.schemaVersion !== 1) findings.push({ severity: "error", code: "MANIFEST_SCHEMA", message: `Unsupported manifest schema ${manifest.schemaVersion}` });
  if (evidence.schemaVersion !== 2) findings.push({ severity: "error", code: "EVIDENCE_SCHEMA", message: `Unsupported evidence schema ${evidence.schemaVersion}` });

  for (const fund of manifest.funds) {
    if (ids.has(fund.id)) findings.push({ severity: "error", code: "DUPLICATE_ID", legacyId: fund.id, message: "Duplicate legacyId" });
    ids.add(fund.id);
    const identity = `${canonicalManagerKey(fund.managerName)}::${normalizeIdentity(fund.fundName)}`;
    const duplicate = identities.get(identity);
    if (duplicate) findings.push({ severity: "error", code: "DUPLICATE_IDENTITY", legacyId: fund.id, message: `Normalized identity duplicates ${duplicate}` });
    identities.set(identity, fund.id);
    const parsed = fundRefreshSnapshotSchema.safeParse(manifestRecordToSnapshot(fund));
    if (!parsed.success) {
      for (const issue of parsed.error.issues) findings.push({ severity: "error", code: "FUND_SCHEMA", legacyId: fund.id, message: `${issue.path.join(".")}: ${issue.message}` });
    }
    if (!(fund.vintage === "Evergreen" || /^\d{4}$/.test(fund.vintage))) {
      findings.push({ severity: "error", code: "INVALID_VINTAGE", legacyId: fund.id, message: `Vintage must be YYYY or Evergreen, got ${fund.vintage}` });
    }
    const canonicalManager = resolveOrgName(fund.managerName);
    if (canonicalManager !== fund.managerName) {
      findings.push({ severity: "error", code: "NONCANONICAL_MANAGER", legacyId: fund.id, message: `${fund.managerName} resolves to ${canonicalManager}` });
    }
  }

  findings.push(...validateFundEvidenceManifest(evidence));
  const evidenceIds = new Set<string>();
  for (const record of evidence.records) {
    if (!ids.has(record.legacyId)) findings.push({ severity: "error", code: "ORPHAN_EVIDENCE", legacyId: record.legacyId, message: "Evidence references a fund absent from the manifest" });
    evidenceIds.add(record.legacyId);
  }
  const noteIds = new Set(evidence.fundNotes.map((note) => note.legacyId));
  for (const note of evidence.fundNotes) {
    if (!ids.has(note.legacyId)) findings.push({ severity: "error", code: "ORPHAN_EVIDENCE_NOTE", legacyId: note.legacyId, message: "Evidence note references a fund absent from the manifest" });
    if (!evidenceIds.has(note.legacyId)) findings.push({ severity: "error", code: "NOTE_WITHOUT_EVIDENCE", legacyId: note.legacyId, message: "Evidence note has no per-source evidence record" });
  }
  for (const fund of manifest.funds) {
    if (!evidenceIds.has(fund.id)) findings.push({ severity: "error", code: "MISSING_EVIDENCE", legacyId: fund.id, message: "Fund has no migrated evidence record" });
    if (evidenceIds.has(fund.id) && !noteIds.has(fund.id)) findings.push({ severity: "error", code: "MISSING_EVIDENCE_NOTE", legacyId: fund.id, message: "Fund evidence has no contextual note" });
  }

  const auditMatrix = buildFundSourceAudit(manifest, evidence);
  const report: Record<string, unknown> = {
    generatedAt: new Date().toISOString(),
    dataCommit: typeof dataCommit === "string" ? dataCommit : null,
    manifest: {
      funds: manifest.funds.length,
      managers: new Set(manifest.funds.map((fund) => canonicalManagerKey(fund.managerName))).size,
      raisingFunds: manifest.funds.filter((fund) => fund.status === "Raising").length,
      fingerprint: snapshotFingerprint(manifest.funds.map(manifestRecordToSnapshot)),
    },
    evidence: {
      records: evidence.records.length,
      funds: evidenceIds.size,
      missing: manifest.funds.length - evidenceIds.size,
      asOf: evidence.asOf,
      generatedMatrixRows: auditMatrix.rows.length,
    },
  };

  if (!args.has("offline") && process.env.DATABASE_URL) {
    const prisma = createFundDatabaseClient();
    try {
      const foundations = await checkFundRefreshFoundations(prisma);
      if (!foundations.ready) findings.push({ severity: "error", code: "FOUNDATIONS_NOT_READY", message: "Required trust/fund-refresh migrations are not cleanly applied" });
      const live = await fetchFundSnapshots(prisma, foundations.fundEvidence && foundations.fundRevision);
      const managerOrganizations = await prisma.organization.findMany({
        where: { types: { has: "FUND_MANAGER" } },
        select: { id: true, name: true, status: true },
        orderBy: { name: "asc" },
      });
      const managerOrgByNormalizedName = new Map<string, typeof managerOrganizations>();
      for (const organization of managerOrganizations) {
        const canonicalName = resolveOrgName(organization.name);
        if (canonicalName !== organization.name) {
          findings.push({
            severity: "error",
            code: "LIVE_NONCANONICAL_MANAGER_ORG",
            message: `FUND_MANAGER organization ${organization.name} resolves to ${canonicalName}`,
          });
        }
        const key = normalizeIdentity(canonicalName);
        const matches = managerOrgByNormalizedName.get(key) ?? [];
        matches.push(organization);
        managerOrgByNormalizedName.set(key, matches);
      }
      const duplicateManagerOrganizations = [...managerOrgByNormalizedName]
        .filter(([, organizations]) => organizations.length > 1)
        .map(([normalizedName, organizations]) => ({
          normalizedName,
          organizations: organizations.map((organization) => ({ id: organization.id, name: organization.name })),
        }));
      for (const duplicate of duplicateManagerOrganizations) {
        findings.push({
          severity: "error",
          code: "LIVE_DUPLICATE_MANAGER_ORG",
          message: `Multiple FUND_MANAGER organizations normalize to ${duplicate.normalizedName}: ${duplicate.organizations.map((organization) => organization.name).join(", ")}`,
        });
      }
      const liveById = new Map(live.map((fund) => [fund.legacyId, fund]));
      const manifestById = new Map(manifest.funds.map((fund) => [fund.id, manifestRecordToSnapshot(fund)]));
      const manifestOnly = [...manifestById.keys()].filter((id) => !liveById.has(id));
      const liveOnly = [...liveById.keys()].filter((id) => !manifestById.has(id));
      const drift = [...liveById].flatMap(([legacyId, snapshot]) => {
        const desired = manifestById.get(legacyId);
        if (!desired) return [];
        const changedFields = snapshotChangedFields(snapshot, desired);
        return changedFields.length > 0 ? [{ legacyId, changedFields }] : [];
      });
      if (manifestOnly.length || liveOnly.length || drift.length) {
        findings.push({ severity: "error", code: "LIVE_MANIFEST_DRIFT", message: `${manifestOnly.length} manifest-only, ${liveOnly.length} live-only, ${drift.length} drifted records` });
      }
      const ownership = await prisma.ownershipPeriod.findMany({
        select: {
          id: true,
          vehicleName: true,
          fundId: true,
          companyId: true,
          company: { select: { name: true, country: true } },
          fund: { select: { legacyId: true, fundName: true } },
        },
        orderBy: { id: "asc" },
      });
      const linked = ownership.filter((row) => row.fundId !== null);
      const linkedNameMismatch = linked.filter((row) => row.vehicleName && row.fund && row.vehicleName !== row.fund.fundName);
      if (linkedNameMismatch.length > 0) {
        findings.push({
          severity: "warning",
          code: "OWNERSHIP_LINK_NAME_MISMATCH",
          message: `${linkedNameMismatch.length} linked OwnershipPeriod rows use a vehicleName different from the related fundName`,
        });
      }
      const includeLiveSnapshots = args.has("include-live-snapshots");
      const now = Date.now();
      const verificationRows = await prisma.fund.findMany({
        where: { status: "PUBLISHED" },
        select: { legacyId: true, fundStatus: true, lastVerifiedAt: true },
        orderBy: { legacyId: "asc" },
      });
      const verificationFreshness = verificationRows.map((fund) => {
        const threshold = fund.fundStatus === "RAISING" && maxRaisingVerificationAgeDays
          ? maxRaisingVerificationAgeDays
          : maxVerificationAgeDays;
        const ageDays = fund.lastVerifiedAt
          ? Math.floor((now - fund.lastVerifiedAt.getTime()) / 86_400_000)
          : null;
        if (threshold && (ageDays === null || ageDays > threshold)) {
          findings.push({
            severity: "error",
            code: "STALE_FUND_VERIFICATION",
            legacyId: fund.legacyId,
            message: ageDays === null
              ? `lastVerifiedAt is missing (maximum ${threshold} days)`
              : `lastVerifiedAt is ${ageDays} days old (maximum ${threshold} days)`,
          });
        }
        return { legacyId: fund.legacyId, lastVerifiedAt: fund.lastVerifiedAt?.toISOString() ?? null, ageDays, thresholdDays: threshold };
      });
      const evidenceFreshnessRows = maxEvidenceAgeDays && foundations.fundEvidence
        ? await prisma.fundEvidence.findMany({
            where: { fund: { status: "PUBLISHED" } },
            select: {
              fund: { select: { legacyId: true } },
              source: { select: { url: true } },
              evidenceLabel: true,
              retrievedAt: true,
            },
            orderBy: [{ fund: { legacyId: "asc" } }, { source: { url: "asc" } }, { evidenceLabel: "asc" }],
          })
        : [];
      const evidenceFreshness = evidenceFreshnessRows.map((row) => {
        const ageDays = Math.floor((now - row.retrievedAt.getTime()) / 86_400_000);
        if (maxEvidenceAgeDays && ageDays > maxEvidenceAgeDays) {
          findings.push({
            severity: "error",
            code: "STALE_FUND_EVIDENCE",
            legacyId: row.fund.legacyId,
            message: `${row.source.url} (${row.evidenceLabel}) was retrieved ${ageDays} days ago (maximum ${maxEvidenceAgeDays} days)`,
          });
        }
        return { legacyId: row.fund.legacyId, url: row.source.url, evidenceLabel: row.evidenceLabel, retrievedAt: row.retrievedAt.toISOString(), ageDays };
      });
      const liveEvidenceSemanticRows = foundations.fundEvidence
        ? await prisma.fundEvidence.findMany({
            where: { fund: { status: "PUBLISHED" } },
            select: {
              fund: { select: { legacyId: true } },
              source: { select: { url: true } },
              supportedFields: true,
              sourceTier: true,
              scope: true,
              publishedAt: true,
              retrievedAt: true,
              confidence: true,
              evidenceLabel: true,
              pipelineRunId: true,
            },
            orderBy: [{ fund: { legacyId: "asc" } }, { source: { url: "asc" } }, { evidenceLabel: "asc" }],
          })
        : [];
      const evidenceSemanticKey = (record: { legacyId: string; url: string; evidenceLabel: string }) =>
        `${record.legacyId}\u0000${record.url}\u0000${record.evidenceLabel}`;
      const desiredEvidenceSemantics = evidence.records.map((record) => ({
        legacyId: record.legacyId,
        url: record.url,
        evidenceLabel: record.evidenceLabel,
        supportedFields: [...record.supportedFields].sort(),
        sourceTier: record.sourceTier,
        scope: record.scope,
        publishedAt: record.publishedAt,
        retrievedAt: record.retrievedAt,
        confidence: record.confidence,
      }));
      const liveEvidenceSemantics = liveEvidenceSemanticRows.map((record) => ({
        legacyId: record.fund.legacyId,
        url: record.source.url,
        evidenceLabel: record.evidenceLabel,
        supportedFields: [...record.supportedFields].sort(),
        sourceTier: record.sourceTier,
        scope: record.scope,
        publishedAt: record.publishedAt?.toISOString().slice(0, 10) ?? null,
        retrievedAt: record.retrievedAt.toISOString().slice(0, 10),
        confidence: record.confidence,
      }));
      if (typeof reviewedRollbackHash === "string") {
        const originalRevisions = await prisma.fundRevision.findMany({
          where: { proposalHash: reviewedRollbackHash },
          include: { fund: { select: { legacyId: true } } },
          orderBy: [{ appliedAt: "asc" }, { id: "asc" }],
        });
        const rollbackErrors: string[] = [];
        if (originalRevisions.length === 0) rollbackErrors.push("No original FundRevision rows exist for the reviewed proposal hash");
        const verificationById = new Map(verificationRows.map((fund) => [fund.legacyId, fund]));
        for (const revision of originalRevisions) {
          const legacyId = revision.fund.legacyId;
          const before = revision.beforeJson && typeof revision.beforeJson === "object" && !Array.isArray(revision.beforeJson)
            ? revision.beforeJson as Record<string, unknown>
            : null;
          const parsedSnapshot = fundRefreshSnapshotSchema.safeParse(before?.snapshot);
          if (!before || !parsedSnapshot.success || !Array.isArray(before.evidence)) {
            rollbackErrors.push(`${legacyId}: original revision before-image is missing or malformed`);
            continue;
          }
          if (canonicalJson(liveById.get(legacyId) ?? null) !== canonicalJson(parsedSnapshot.data)) {
            rollbackErrors.push(`${legacyId}: live fund does not equal the original operational before-image`);
          }
          const expectedEvidence = before.evidence.flatMap((value): typeof liveEvidenceSemantics => {
            if (!value || typeof value !== "object" || Array.isArray(value)) {
              rollbackErrors.push(`${legacyId}: malformed evidence entry in original before-image`);
              return [];
            }
            const record = value as Record<string, unknown>;
            if (record.existing === null) return [];
            if (!record.existing || typeof record.existing !== "object" || Array.isArray(record.existing)) {
              rollbackErrors.push(`${legacyId}: malformed operational evidence state in original before-image`);
              return [];
            }
            const existing = record.existing as Record<string, unknown>;
            if (typeof existing.pipelineRunId !== "string" && existing.pipelineRunId !== null) {
              rollbackErrors.push(`${legacyId}: original evidence before-image has an invalid pipelineRunId`);
              return [];
            }
            const candidateRecord = {
              legacyId,
              sourceId: typeof record.url === "string" ? evidenceSourceId(record.url) : "invalid",
              url: record.url,
              supportedFields: existing.supportedFields,
              sourceTier: existing.sourceTier,
              scope: existing.scope,
              publishedAt: typeof existing.publishedAt === "string" ? existing.publishedAt.slice(0, 10) : null,
              retrievedAt: typeof existing.retrievedAt === "string" ? existing.retrievedAt.slice(0, 10) : existing.retrievedAt,
              confidence: existing.confidence,
              evidenceLabel: record.evidenceLabel,
            };
            const parsed = fundEvidenceManifestRecordSchema.safeParse(candidateRecord);
            if (!parsed.success) {
              rollbackErrors.push(`${legacyId}: original evidence before-image failed validation`);
              return [];
            }
            return [{
              legacyId,
              url: parsed.data.url,
              evidenceLabel: parsed.data.evidenceLabel,
              supportedFields: [...parsed.data.supportedFields].sort(),
              sourceTier: parsed.data.sourceTier,
              scope: parsed.data.scope,
              publishedAt: parsed.data.publishedAt,
              retrievedAt: parsed.data.retrievedAt,
              confidence: parsed.data.confidence,
            }];
          }).sort((left, right) => left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel));
          const actualEvidence = liveEvidenceSemantics
            .filter((record) => record.legacyId === legacyId)
            .sort((left, right) => left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel));
          if (canonicalJson(actualEvidence) !== canonicalJson(expectedEvidence)) {
            rollbackErrors.push(`${legacyId}: live evidence does not equal the original operational before-image`);
          }
          const expectedEvidencePipelineBindings = before.evidence.flatMap((value) => {
            if (!value || typeof value !== "object" || Array.isArray(value)) return [];
            const record = value as Record<string, unknown>;
            if (!record.existing || typeof record.existing !== "object" || Array.isArray(record.existing)) return [];
            const existing = record.existing as Record<string, unknown>;
            if (
              typeof record.url !== "string" ||
              typeof record.evidenceLabel !== "string" ||
              (typeof existing.pipelineRunId !== "string" && existing.pipelineRunId !== null)
            ) return [];
            return [{
              url: record.url,
              evidenceLabel: record.evidenceLabel,
              pipelineRunId: existing.pipelineRunId,
            }];
          }).sort((left, right) => left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel));
          const actualEvidencePipelineBindings = liveEvidenceSemanticRows
            .filter((record) => record.fund.legacyId === legacyId)
            .map((record) => ({
              url: record.source.url,
              evidenceLabel: record.evidenceLabel,
              pipelineRunId: record.pipelineRunId,
            }))
            .sort((left, right) => left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel));
          if (canonicalJson(actualEvidencePipelineBindings) !== canonicalJson(expectedEvidencePipelineBindings)) {
            rollbackErrors.push(`${legacyId}: live evidence pipeline provenance does not equal the original operational before-image`);
          }
          const expectedLastVerifiedAt = before.lastVerifiedAt;
          const actualLastVerifiedAt = verificationById.get(legacyId)?.lastVerifiedAt?.toISOString() ?? null;
          if ((typeof expectedLastVerifiedAt !== "string" && expectedLastVerifiedAt !== null) || actualLastVerifiedAt !== expectedLastVerifiedAt) {
            rollbackErrors.push(`${legacyId}: lastVerifiedAt does not equal the original operational before-image`);
          }
          const latestRevision = await prisma.fundRevision.findFirst({
            where: { fundId: revision.fundId },
            orderBy: [{ appliedAt: "desc" }, { id: "desc" }],
            select: {
              id: true,
              proposalHash: true,
              afterJson: true,
              pipelineRun: { select: { pipeline: true, status: true, metadata: true } },
            },
          });
          const rollbackMetadata = latestRevision?.pipelineRun?.metadata &&
            typeof latestRevision.pipelineRun.metadata === "object" &&
            !Array.isArray(latestRevision.pipelineRun.metadata)
            ? latestRevision.pipelineRun.metadata as Record<string, unknown>
            : null;
          if (
            !latestRevision ||
            latestRevision.pipelineRun?.pipeline !== "FUND_REFRESH_ROLLBACK" ||
            latestRevision.pipelineRun.status !== "SUCCEEDED" ||
            rollbackMetadata?.originalProposalHash !== reviewedRollbackHash ||
            rollbackMetadata?.rollbackHash !== latestRevision.proposalHash ||
            canonicalJson(latestRevision.afterJson) !== canonicalJson(revision.beforeJson)
          ) {
            rollbackErrors.push(`${legacyId}: latest revision is not the exact reviewed rollback of the original before-image`);
          }
          reviewedRollbackLegacyIds.add(legacyId);
        }
        if (rollbackErrors.length > 0) {
          reviewedRollbackLegacyIds.clear();
          for (const message of rollbackErrors) {
            findings.push({ severity: "error", code: "REVIEWED_ROLLBACK_MISMATCH", message });
          }
        }
        report.rollbackRestoration = {
          originalProposalHash: reviewedRollbackHash,
          valid: rollbackErrors.length === 0,
          legacyIds: [...reviewedRollbackLegacyIds].sort(),
          errors: rollbackErrors,
        };
      }
      const desiredEvidenceByKey = new Map(desiredEvidenceSemantics.map((record) => [evidenceSemanticKey(record), record]));
      const liveEvidenceByKey = new Map(liveEvidenceSemantics.map((record) => [evidenceSemanticKey(record), record]));
      const evidenceSemanticDriftKeys = [...new Set([...desiredEvidenceByKey.keys(), ...liveEvidenceByKey.keys()])]
        .sort()
        .filter((key) => canonicalJson(desiredEvidenceByKey.get(key) ?? null) !== canonicalJson(liveEvidenceByKey.get(key) ?? null));
      const evidenceSemanticDrift = evidenceSemanticDriftKeys.map((key) => ({
        key,
        desired: desiredEvidenceByKey.get(key) ?? null,
        live: liveEvidenceByKey.get(key) ?? null,
      }));
      if (evidenceSemanticDriftKeys.length > 0) {
        findings.push({
          severity: "error",
          code: "LIVE_EVIDENCE_DRIFT",
          message: `${evidenceSemanticDriftKeys.length} normalized FundEvidence source/label records differ from the version-controlled evidence manifest`,
        });
      }
      const normalizedEvidenceRecords = foundations.fundEvidence && includeLiveSnapshots
        ? await prisma.fundEvidence.findMany({
            where: { fund: { status: "PUBLISHED" } },
            select: {
              id: true,
              fund: { select: { legacyId: true } },
              source: { select: { id: true, label: true, url: true, type: true } },
              supportedFields: true,
              sourceTier: true,
              scope: true,
              publishedAt: true,
              retrievedAt: true,
              confidence: true,
              evidenceLabel: true,
              pipelineRunId: true,
              createdAt: true,
            },
            orderBy: [{ fund: { legacyId: "asc" } }, { source: { url: "asc" } }, { evidenceLabel: "asc" }],
          })
        : [];
      for (const record of normalizedEvidenceRecords) liveEvidenceSourceUrls.add(record.source.url);
      const databaseEvidence = foundations.fundEvidence
        ? {
            rows: await prisma.fundEvidence.count({ where: { fund: { status: "PUBLISHED" } } }),
            coveredFunds: await prisma.fund.count({ where: { status: "PUBLISHED", evidence: { some: {} } } }),
            missingLegacyIds: (await prisma.fund.findMany({
              where: { status: "PUBLISHED", evidence: { none: {} } },
              select: { legacyId: true },
              orderBy: { legacyId: "asc" },
            })).map((fund) => fund.legacyId),
            semanticDriftKeys: evidenceSemanticDriftKeys,
            semanticDrift: evidenceSemanticDrift,
            ...(includeLiveSnapshots ? { records: normalizedEvidenceRecords } : {}),
          }
        : null;
      if (databaseEvidence && databaseEvidence.missingLegacyIds.length > 0) {
        findings.push({
          severity: "error",
          code: "LIVE_EVIDENCE_COVERAGE",
          message: `${databaseEvidence.missingLegacyIds.length} published funds have no normalized FundEvidence row`,
        });
      }
      report.database = {
        foundations,
        funds: live.length,
        fingerprint: await fetchFundOperationalFingerprint(prisma),
        fundFingerprint: snapshotFingerprint(live),
        ...(includeLiveSnapshots ? {
          snapshots: live,
          operationalFunds: await prisma.fund.findMany({
            where: { status: "PUBLISHED" },
            select: {
              id: true,
              legacyId: true,
              status: true,
              lastVerifiedAt: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { legacyId: "asc" },
          }),
          revisions: foundations.fundRevision
            ? await prisma.fundRevision.findMany({
                where: { fund: { status: "PUBLISHED" } },
                select: {
                  id: true,
                  fund: { select: { legacyId: true } },
                  proposalHash: true,
                  beforeJson: true,
                  afterJson: true,
                  changedFields: true,
                  approver: true,
                  appliedAt: true,
                  pipelineRunId: true,
                },
                orderBy: [{ appliedAt: "asc" }, { id: "asc" }],
              })
            : [],
        } : {}),
        manifestOnly,
        liveOnly,
        drift,
        evidence: databaseEvidence,
        managerOrganizations: {
          total: managerOrganizations.length,
          noncanonical: managerOrganizations.filter((organization) => resolveOrgName(organization.name) !== organization.name).length,
          duplicateNormalizedGroups: duplicateManagerOrganizations,
        },
        ownership: {
          total: ownership.length,
          linked: linked.length,
          unlinked: ownership.length - linked.length,
          linkedNameMismatch: linkedNameMismatch.length,
          fingerprint: await fetchOwnershipFingerprint(prisma),
          ...(includeLiveSnapshots ? { rows: ownership } : {}),
        },
        freshness: {
          maxVerificationAgeDays,
          maxRaisingVerificationAgeDays,
          maxEvidenceAgeDays,
          funds: verificationFreshness,
          evidence: evidenceFreshness,
        },
      };
    } finally {
      await prisma.$disconnect();
    }
  } else {
    report.database = { skipped: true, reason: process.env.DATABASE_URL ? "--offline" : "DATABASE_URL not set" };
  }

  if (args.has("check-links")) {
    const urls = [...new Set(
      evidence.records.flatMap((record) => [
        record.url,
      ])
        .concat(evidence.fundNotes.flatMap((note) => note.strategyUrl ? [note.strategyUrl] : []))
        .concat(manifest.funds.flatMap((fund) => [
          ...fund.sourceUrls,
          ...(fund.strategyUrl ? [fund.strategyUrl] : []),
        ]))
        .concat([...liveEvidenceSourceUrls]),
    )].sort();
    const links = await mapLimited(urls, 8, checkUrl);
    const hardFailures = links.filter((link) => !link.ok);
    for (const link of hardFailures) findings.push({ severity: "error", code: "SOURCE_UNREACHABLE", message: `${link.url}: ${link.status ?? link.error}` });
    report.sourceHealth = { checked: links.length, hardFailures: hardFailures.length, links };
  }

  const ownershipComparisonInput = args.get("compare-ownership-from");
  const expectedOwnershipFingerprint = args.get("expected-ownership-fingerprint");
  if (ownershipComparisonInput !== undefined && expectedOwnershipFingerprint !== undefined) {
    throw new Error("Use only one of --compare-ownership-from or --expected-ownership-fingerprint");
  }
  if (typeof ownershipComparisonInput === "string") {
    const comparisonPath = path.resolve(REPO_ROOT, ownershipComparisonInput);
    const relative = path.relative(REPO_ROOT, comparisonPath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Ownership comparison report must be inside the repository");
    }
    const previous = JSON.parse(readFileSync(comparisonPath, "utf8")) as ComparableAuditReport;
    const previousFingerprint = previous.database?.ownership?.fingerprint;
    const currentFingerprint = (report.database as ComparableAuditReport["database"] | undefined)?.ownership?.fingerprint;
    if (!previousFingerprint || !currentFingerprint) {
      findings.push({ severity: "error", code: "OWNERSHIP_BASELINE_MISSING", message: "Prior or current audit lacks an OwnershipPeriod fingerprint" });
    } else if (previousFingerprint !== currentFingerprint) {
      findings.push({ severity: "error", code: "OWNERSHIP_FINGERPRINT_CHANGED", message: `OwnershipPeriod fingerprint changed from ${previousFingerprint} to ${currentFingerprint}; review and acknowledge the ownership change separately` });
    }
  } else if (ownershipComparisonInput !== undefined) {
    throw new Error("--compare-ownership-from requires a report path");
  } else if (typeof expectedOwnershipFingerprint === "string") {
    if (!/^[0-9a-f]{64}$/.test(expectedOwnershipFingerprint)) {
      throw new Error("--expected-ownership-fingerprint requires an exact lowercase SHA-256 digest");
    }
    const currentFingerprint = (report.database as ComparableAuditReport["database"] | undefined)?.ownership?.fingerprint;
    if (!currentFingerprint) {
      findings.push({ severity: "error", code: "OWNERSHIP_BASELINE_MISSING", message: "Current audit lacks an OwnershipPeriod fingerprint" });
    } else if (currentFingerprint !== expectedOwnershipFingerprint) {
      findings.push({
        severity: "error",
        code: "OWNERSHIP_FINGERPRINT_CHANGED",
        message: `OwnershipPeriod fingerprint changed from approved baseline ${expectedOwnershipFingerprint} to ${currentFingerprint}; update the baseline only through a separately reviewed ownership-change PR`,
      });
    }
  } else if (expectedOwnershipFingerprint !== undefined) {
    throw new Error("--expected-ownership-fingerprint requires a digest");
  }

  const finalErrors = findings.filter((finding) => finding.severity === "error");
  const baselineInput = args.get("allow-existing-findings-from");
  let baselineComparison: ReturnType<typeof compareWithBaseline> | null = null;
  if (typeof baselineInput === "string") {
    const baselinePath = path.resolve(REPO_ROOT, baselineInput);
    const relative = path.relative(REPO_ROOT, baselinePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Baseline audit report must be inside the repository");
    }
    const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as ComparableAuditReport;
    const rollbackScopedCurrent = withoutReviewedRollbackScope(
      { ...report, findings },
      reviewedRollbackLegacyIds,
    );
    const rollbackScopedBaseline = withoutReviewedRollbackScope(baseline, reviewedRollbackLegacyIds);
    baselineComparison = compareWithBaseline(rollbackScopedCurrent, rollbackScopedBaseline);
  } else if (reviewedRollbackHash !== undefined) {
    throw new Error("--allow-reviewed-rollback-from requires --allow-existing-findings-from");
  }
  const gateErrors = baselineComparison?.gateErrors ?? finalErrors;
  const finalReport = {
    ...report,
    valid: finalErrors.length === 0,
    gateValid: gateErrors.length === 0,
    ...(baselineComparison ? {
      baselineComparison: {
        baselineErrors: baselineComparison.baselineErrors,
        currentErrors: baselineComparison.currentErrors,
        resolvedErrors: baselineComparison.resolvedErrors,
        newErrors: baselineComparison.newErrors,
        regressions: baselineComparison.regressions,
      },
    } : {}),
    findings,
  };
  const output = args.get("output");
  if (typeof output === "string") {
    const outputPath = path.resolve(REPO_ROOT, output);
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, JSON.stringify(finalReport, null, 2) + "\n");
  }
  console.log(JSON.stringify(finalReport, null, 2));
  if (args.has("require-complete") && gateErrors.length > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
