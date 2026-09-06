/** Read-only attribution provenance checks. No desired production mutations are emitted. */
import {
  canonicalSha256, verifyManifest, verifyApproval, verifyApplyReceipt,
  type AttributionApplyReceipt,
} from "../portfolio-fund-attribution/schema";
import { sha256Canonical } from "./hash";

export function verifyAttributionChain(input: { manifest: unknown; approval: unknown; receipt: unknown }) {
  const manifest = verifyManifest(input.manifest);
  const approval = verifyApproval(input.approval, manifest);
  const receipt = verifyApplyReceipt(input.receipt);
  if (receipt.environment !== "production" || !receipt.pipelineRunId
    || receipt.manifestSha256 !== manifest.manifestSha256 || receipt.approvalSha256 !== approval.approvalSha256
    || receipt.rows.length !== manifest.mutations.length
    || new Set(receipt.rows.map((row) => row.ownershipPeriodId)).size !== receipt.rows.length) throw new Error("Receipt/manifest/approval binding differs");
  for (const row of receipt.rows) {
    const matches = manifest.mutations.filter((mutation) => mutation.recordId === row.recordId);
    if (matches.length !== 1) throw new Error("Receipt row is not uniquely approved");
    const mutation = matches[0];
    if ((mutation.ownershipPeriodId && mutation.ownershipPeriodId !== row.ownershipPeriodId)
      || sha256Canonical(row.after) !== sha256Canonical({ linkedFundName: mutation.targetLinkedFundName, ...mutation.set })) throw new Error("Receipt after-image differs from approved mutation");
    if (row.stateBeforeApply === "PENDING" && (row.before.fundAttribution !== mutation.expected.fundAttribution
      || row.before.linkedFundName !== mutation.expected.currentLinkedFundName)) throw new Error("Receipt before-image differs from approved precondition");
    if (row.stateBeforeApply === "ALREADY_APPLIED" && sha256Canonical(row.before) !== sha256Canonical(row.after)) throw new Error("Idempotent receipt changed data");
  }
  if (canonicalSha256(receipt.rows.map((row) => ({ id: row.ownershipPeriodId, ...row.before }))) !== receipt.beforeFingerprint
    || canonicalSha256(receipt.rows.map((row) => ({ id: row.ownershipPeriodId, ...row.after }))) !== receipt.afterFingerprint) throw new Error("Receipt row fingerprint differs");
  return { manifest, approval, receipt };
}

export interface PipelineObservation {
  id: string; pipeline: string; status: string; startedAt: string; endedAt: string | null;
  updated: number; skipped: number; metadata: unknown;
}
export interface RevisionObservation {
  id: string; companyId: string; proposalHash: string; beforeJson: unknown; afterJson: unknown;
  changedFields: string[]; approver: string; appliedAt: string; pipelineRunId: string | null;
}
export interface RedirectObservation {
  retiredId: string; companyId: string; reason: string; createdAt: string;
}

function orderedRevisionRows(value: unknown) {
  if (!Array.isArray(value) || value.some((row) => !row || typeof row.ownershipPeriodId !== "string")
    || new Set(value.map((row) => row.ownershipPeriodId)).size !== value.length) throw new Error("Invalid/duplicate attribution revision rows");
  return [...value].sort((left, right) => left.ownershipPeriodId.localeCompare(right.ownershipPeriodId));
}

export function verifyAttributionDatabaseHistory(input: {
  chains: Array<ReturnType<typeof verifyAttributionChain>>;
  pipelines: PipelineObservation[];
  revisions: RevisionObservation[];
  redirects: RedirectObservation[];
}) {
  const redirects = new Map(input.redirects.map((row) => [row.retiredId, row]));
  if (redirects.size !== input.redirects.length) throw new Error("Duplicate historical redirect");
  const resolve = (companyId: string, endedAt: string) => {
    const seen = new Set<string>();
    const path: RedirectObservation[] = [];
    while (redirects.has(companyId)) {
      if (seen.has(companyId)) throw new Error("Historical redirect cycle");
      seen.add(companyId);
      const redirect = redirects.get(companyId)!;
      if (redirect.reason !== "CANONICAL_MERGE" || !redirect.companyId || redirect.createdAt <= endedAt) throw new Error("Unbound historical revision relocation");
      path.push(redirect);
      companyId = redirect.companyId;
    }
    return { companyId, path };
  };
  const byRun = new Map(input.chains.map((chain) => [chain.receipt.pipelineRunId, chain]));
  if (byRun.size !== input.chains.length || new Set(input.pipelines.map((run) => run.id)).size !== input.pipelines.length
    || input.pipelines.length !== input.chains.length) throw new Error(`Incomplete/duplicate attribution pipeline coverage: ${JSON.stringify({ chains: input.chains.length, distinctRuns: byRun.size, pipelines: input.pipelines.length, missing: input.pipelines.filter((run) => !byRun.has(run.id)).map((run) => ({ id: run.id, metadata: run.metadata })), extra: [...byRun.keys()].filter((id) => !input.pipelines.some((run) => run.id === id)) })}`);
  const latest = new Map<string, { receipt: AttributionApplyReceipt; row: AttributionApplyReceipt["rows"][number]; endedAt: string }>();
  const revisionBindings = [];
  for (const run of [...input.pipelines].sort((left, right) => left.startedAt.localeCompare(right.startedAt))) {
    const chain = byRun.get(run.id);
    if (!chain || run.pipeline !== "portfolio-fund-attribution" || run.status !== "SUCCESS" || !run.endedAt
      || run.endedAt < run.startedAt || run.updated !== chain.receipt.changed || run.skipped !== chain.receipt.mutationCount - chain.receipt.changed
      || sha256Canonical(run.metadata) !== sha256Canonical({ manifestSha256: chain.manifest.manifestSha256, approvalSha256: chain.approval.approvalSha256, environment: "production" })) throw new Error("Unbound production attribution pipeline");
    const revisions = input.revisions.filter((revision) => revision.pipelineRunId === run.id);
    const pendingRows = chain.receipt.rows.filter((row) => row.stateBeforeApply === "PENDING");
    const relocations = new Map([...new Set(pendingRows.map((row) => row.companyId))].map((id) => [id, resolve(id, run.endedAt!)]));
    const pendingCompanies = [...new Set([...relocations.values()].map((row) => row.companyId))];
    if (revisions.length !== pendingCompanies.length) throw new Error(`Attribution revision coverage differs: ${JSON.stringify({ runId: run.id, expected: pendingCompanies.length, actual: revisions.length, missing: pendingCompanies.filter((id) => !revisions.some((revision) => revision.companyId === id)), unexpected: revisions.filter((revision) => !pendingCompanies.includes(revision.companyId)).map((revision) => ({ id: revision.id, companyId: revision.companyId })) })}`);
    for (const companyId of pendingCompanies) {
      const rows = pendingRows.filter((row) => relocations.get(row.companyId)!.companyId === companyId);
      const candidates = revisions.filter((revision) => revision.companyId === companyId);
      if (candidates.length !== 1) throw new Error("Attribution revision company is not unique");
      const revision = candidates[0];
      const expectedFields = rows.some((row) => row.before.linkedFundName !== row.after.linkedFundName)
        ? ["ownershipPeriods.fundAttribution", "ownershipPeriods.fundId"] : ["ownershipPeriods.fundAttribution"];
      if (revision.proposalHash !== chain.manifest.manifestSha256 || revision.approver !== chain.approval.approver
        || revision.appliedAt < run.startedAt || revision.appliedAt > run.endedAt
        || sha256Canonical([...revision.changedFields].sort()) !== sha256Canonical(expectedFields)
        || sha256Canonical(orderedRevisionRows(revision.beforeJson)) !== sha256Canonical(orderedRevisionRows(rows.map((row) => ({ ownershipPeriodId: row.ownershipPeriodId, ...row.before }))))
        || sha256Canonical(orderedRevisionRows(revision.afterJson)) !== sha256Canonical(orderedRevisionRows(rows.map((row) => ({ ownershipPeriodId: row.ownershipPeriodId, ...row.after }))))) throw new Error(`Production revision differs from immutable receipt: ${run.id}/${revision.id}`);
      revisionBindings.push({ pipelineRunId: run.id, revisionId: revision.id, currentCompanyId: companyId,
        originalCompanies: [...new Set(rows.map((row) => row.companyId))].sort().map((id) => ({ companyId: id, redirects: relocations.get(id)!.path })),
        ownershipRows: rows.length });
    }
    for (const row of chain.receipt.rows) {
      const prior = latest.get(row.ownershipPeriodId);
      if (prior && prior.endedAt >= run.startedAt) throw new Error("Ambiguous attribution chronology");
      latest.set(row.ownershipPeriodId, { receipt: chain.receipt, row, endedAt: run.endedAt });
    }
  }
  return { latest, revisionBindings };
}
