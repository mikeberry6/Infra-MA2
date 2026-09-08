/** Internal ten-name release compiler. No database writes or source-task transitions. */
import { z } from "zod";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { companyImageSchema } from "../portco-reconciliation/schema";
import { verifyAttributionChain } from "../portco-reconciliation/attribution-chronology";
import {
  attributionMutationSchema, attributionSeedRecordSchema, canonicalSha256,
  verifyManifest, verifyProductionSnapshot, verifySeedManifest, type AttributionApplyManifest,
} from "../portfolio-fund-attribution/schema";

const text = z.string().trim().min(1);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const commit = z.string().regex(/^[a-f0-9]{40}$/);
export const fileSchema = z.strictObject({ path: text, sha256: hash });
const stateSchema = attributionMutationSchema.shape.set.extend({ linkedFundName: text.nullable(), attributionRationale: z.string().nullable() });
const desiredSchema = stateSchema.extend({ attributionRationale: text.nullable() });
const sourceSchema = fileSchema.extend({ url: z.string().url(), primary: z.boolean() });
const ownerSchema = z.strictObject({
  id: text, companyId: text, fundId: text.nullable(), organizationId: text.nullable(),
  state: stateSchema,
});
export const companySchema = z.strictObject({
  image: companyImageSchema, owners: z.array(ownerSchema),
  redirects: z.array(z.record(z.string(), z.unknown())),
});
export const snapshotSchema = z.strictObject({
  schemaVersion: z.literal(1), artifactType: z.literal("PORTCO_COMPLETION_SNAPSHOT"),
  baseCommit: commit, capturedAt: z.string().datetime(), targetFingerprint: hash,
  companies: z.array(companySchema).min(1).max(10),
  funds: z.array(z.strictObject({ id: text, fundName: text, managerName: text })),
  // Separate published catalog from the possibly empty selected link dependencies.
  // Optional only for immutable legacy snapshots; every new capture supplies it.
  publishedFundNames: z.array(text).min(1).optional(),
  snapshotSha256: hash,
});
const patchSchema = z.strictObject({
  ownerId: text, seedRecordId: text,
  expectedSeedSha256: hash, expectedOwnerSha256: hash,
  desired: desiredSchema,
  // Seed schema requires a source-supported explanation, even when production has none.
  // This annotation can never authorize or accompany a production mutation.
  seedOnlyRationale: text.optional(),
  // Explicit substantive justification; wording-only differences never authorize writes.
  productionChange: z.enum(["NONE", "SUBSTANTIVE_ATTRIBUTION"]),
  reason: text, sources: z.array(sourceSchema).min(1),
});
export const decisionSchema = z.strictObject({
  companyId: text, name: text, sequence: z.number().int().positive(),
  classification: z.enum(["NO_CHANGE", "SEED_ONLY", "ATTRIBUTION_CORRECTION", "PARKED"]),
  expectedCompanySha256: hash, evidence: z.array(fileSchema).min(1),
  owners: z.array(patchSchema),
  // All candidate owners must be adjudicated; excluded owners need explicit evidence.
  preservedOwnerIds: z.array(text),
  issue: text.nullable(),
});
export const batchSchema = z.strictObject({
  schemaVersion: z.literal(1), artifactType: z.literal("PORTCO_COMPLETION_BATCH"),
  batchId: text, baseCommit: commit, asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // Omitted for immutable main-pass releases; explicit and hash-bound for the revisit.
  phase: z.literal("PARKED_REVISIT").optional(),
  executionManifestSha256: hash, sourceLedgerSha256: hash, progressSha256: hash,
  seedManifestSha256: hash, snapshotSha256: hash, targetFingerprint: hash,
  dependencies: z.array(fileSchema).min(1), decisions: z.array(decisionSchema).min(1).max(10),
  batchSha256: hash,
});
export type Batch = z.infer<typeof batchSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export type Company = z.infer<typeof companySchema>;
export type Decision = z.infer<typeof decisionSchema>;

export function seal<T extends object>(value: T, field: string) {
  return { ...value, [field]: sha256Canonical(value) };
}
export function verifyHash<T extends object>(value: T, field: keyof T): T {
  const { [field]: actual, ...content } = value;
  if (sha256Canonical(content) !== actual) throw Error(`Invalid ${String(field)}`);
  return value;
}
function equal(a: unknown, b: unknown) { return sha256Canonical(a) === sha256Canonical(b); }
function unique(values: string[], label: string) {
  if (new Set(values).size !== values.length) throw Error(`Duplicate ${label}`);
}
export function verifyBatch(value: unknown) {
  const batch = verifyHash(batchSchema.parse(value), "batchSha256");
  unique(batch.decisions.map(d => d.companyId), "company");
  unique(batch.decisions.map(d => String(d.sequence)), "source order");
  if (batch.decisions.some((d, i) => i > 0 && d.sequence <= batch.decisions[i - 1].sequence)) throw Error("Original source order required");
  unique(batch.dependencies.map(f => f.path), "dependency");
  const owners: string[] = [], seeds: string[] = [];
  for (const d of batch.decisions) {
    if ((d.classification === "PARKED") !== (d.issue !== null)) throw Error("Parked issue must state exact required work");
    if (d.classification === "PARKED" && d.owners.length) throw Error("Parked company cannot mutate");
    unique([...d.preservedOwnerIds, ...d.owners.map(o => o.ownerId)], "owner decision");
    for (const o of d.owners) {
      owners.push(o.ownerId); seeds.push(o.seedRecordId);
      if (o.sources.filter(s => s.primary).length !== 1) throw Error("Exactly one primary citation per owner decision required");
      unique(o.sources.map(s => s.url), "source URL");
      if (o.desired.fundAttribution === "INFERRED") throw Error("New inferred assignments are forbidden");
      if (o.seedOnlyRationale !== undefined && (o.productionChange !== "NONE" || o.desired.attributionRationale !== null)) throw Error("Seed-only rationale requires unchanged null production rationale");
    }
  }
  unique(owners, "conflicting owner"); unique(seeds, "seed target");
  return batch;
}
export function verifySnapshot(value: unknown) {
  const s = verifyHash(snapshotSchema.parse(value), "snapshotSha256");
  unique(s.companies.map(c => c.image.id!), "snapshot company");
  unique(s.funds.map(f => f.id), "fund ID"); unique(s.funds.map(f => f.fundName), "fund name");
  if (s.publishedFundNames) unique(s.publishedFundNames, "published fund name");
  for (const c of s.companies) {
    unique(c.owners.map(o => o.id), "snapshot owner");
    if (!equal(c.owners.map(o => o.id).sort(), c.image.ownershipPeriods.map(o => o.id).sort())) throw Error("Complete owner coverage required");
    for (const o of c.owners) {
      const core = c.image.ownershipPeriods.find(p => p.id === o.id)!;
      if (o.companyId !== c.image.id || core.fundName !== o.state.linkedFundName) throw Error("Owner identity/link differs");
      if (o.fundId && !s.funds.some(f => f.id === o.fundId && f.fundName === core.fundName && f.managerName === core.managerName)) throw Error("Fund dependency differs");
      if (!o.fundId && core.fundName !== null) throw Error("Missing fund identity");
    }
  }
  return s;
}

/** Validates expected seed, complete company/owner before-images and all file bindings. */
export function compileBatch(input: { batch: unknown; snapshot: unknown; seed: unknown; files: Map<string, string> }) {
  const batch = verifyBatch(input.batch), snapshot = verifySnapshot(input.snapshot), seed = verifySeedManifest(input.seed);
  if (batch.snapshotSha256 !== snapshot.snapshotSha256 || batch.baseCommit !== snapshot.baseCommit
    || batch.targetFingerprint !== snapshot.targetFingerprint || batch.seedManifestSha256 !== seed.manifestSha256) throw Error("Stale snapshot/seed/dependency binding");
  const files = [...batch.dependencies, ...batch.decisions.flatMap(d => [...d.evidence, ...d.owners.flatMap(o => o.sources)])];
  for (const f of files) if (input.files.get(f.path) !== f.sha256) throw Error(`Missing or stale evidence: ${f.path}`);
  if (!equal(batch.decisions.map(d => d.companyId).sort(), snapshot.companies.map(c => c.image.id).sort())) throw Error("Snapshot must cover selected ten-name scope exactly");
  const records = structuredClone(seed.records), mutations: AttributionApplyManifest["mutations"] = [];
  const projected = structuredClone(snapshot.companies);
  for (const d of batch.decisions) {
    const company = snapshot.companies.find(c => c.image.id === d.companyId)!;
    if (company.image.name !== d.name || sha256Canonical(company) !== d.expectedCompanySha256) throw Error(`Stale complete before-image: ${d.name}`);
    if (d.classification === "PARKED") continue;
    if (!equal([...d.owners.map(o => o.ownerId), ...d.preservedOwnerIds].sort(), company.owners.map(o => o.id).sort())) throw Error(`Incomplete company review: ${d.name}`);
    let changes = 0, seedChanges = 0;
    for (const patch of d.owners) {
      const owner = company.owners.find(o => o.id === patch.ownerId);
      const core = company.image.ownershipPeriods.find(o => o.id === patch.ownerId);
      const record = records.find(r => r.recordId === patch.seedRecordId);
      if (!owner || !core || !record || sha256Canonical(owner) !== patch.expectedOwnerSha256 || sha256Canonical(record) !== patch.expectedSeedSha256) throw Error(`Stale owner/seed: ${patch.ownerId}`);
      // Do not repair missing/ambiguous identity bindings by inference.
      const display = core.vehicleName || core.fundName || core.organizationName || "n.a.";
      if (!core.isActive || record.companyName !== d.name || record.country !== company.image.country
        || (record.investmentFirm !== core.managerName && record.investmentFirm !== core.organizationName) || record.currentVehicleName !== display
        || record.stake !== core.stake || record.investmentYear !== core.investmentYear) throw Error(`Unsupported seed identity binding: ${d.name}/${patch.ownerId}; park for scoped repair`);
      const desired = patch.desired;
      const target = desired.linkedFundName === null ? null : snapshot.funds.find(f => f.fundName === desired.linkedFundName);
      if (desired.linkedFundName && !target) throw Error("Existing target fund required");
      // Changing links must never implicitly change the displayed manager or lose an owner.
      if (owner.fundId !== (target?.id ?? null) && (target?.managerName ?? core.organizationName) !== core.managerName) throw Error("Fund change would alter owner; park instead");
      const differs = !equal(owner.state, desired);
      if (differs !== (patch.productionChange === "SUBSTANTIVE_ATTRIBUTION")) throw Error("No-op/wording-only production write forbidden");
      if (differs && desired.attributionRationale === null) throw Error("Production correction requires a substantive rationale");
      const { linkedFundName, ...metadata } = desired;
      const nextRecord = attributionSeedRecordSchema.parse({ ...record, ...metadata,
        attributionRationale: patch.seedOnlyRationale ?? metadata.attributionRationale, targetLinkedFundName: linkedFundName,
        evidenceUrls: patch.sources.map(s => s.url) });
      if (!equal(nextRecord, record)) { seedChanges++; records[records.indexOf(record)] = nextRecord; }
      if (differs) {
        const mutation = attributionMutationSchema.parse({
          recordId: record.recordId, ownershipPeriodId: owner.id, companyName: d.name,
          country: company.image.country, investmentFirm: core.managerName, currentVehicleName: record.currentVehicleName,
          databaseVehicleName: core.vehicleName, investmentYear: core.investmentYear, stake: core.stake, expectedIsActive: core.isActive,
          targetLinkedFundName: linkedFundName,
          expected: { fundAttribution: owner.state.fundAttribution, currentLinkedFundName: owner.state.linkedFundName },
          set: metadata, evidenceUrls: patch.sources.map(s => s.url),
        });
        mutations.push(mutation); changes++;
        const projectedCompany = projected.find(c => c.image.id === d.companyId)!;
        const projectedOwner = projectedCompany.owners.find(o => o.id === owner.id)!;
        projectedOwner.state = desired; projectedOwner.fundId = target?.id ?? null;
        projectedCompany.image.ownershipPeriods.find(o => o.id === owner.id)!.fundName = linkedFundName;
      }
    }
    const classification = changes ? "ATTRIBUTION_CORRECTION" : seedChanges ? "SEED_ONLY" : "NO_CHANGE";
    if (d.classification !== classification) throw Error(`Incorrect classification: ${d.name} is ${classification}`);
  }
  const { manifestSha256: _old, ...seedContent } = seed;
  const nextSeedContent = { ...seedContent, records, policy: { ...seed.policy, inferredAssignments: records.filter(r => r.fundAttribution === "INFERRED").length } };
  const nextSeed = verifySeedManifest({ ...nextSeedContent, manifestSha256: canonicalSha256(nextSeedContent) });
  let manifest: AttributionApplyManifest | null = null;
  if (mutations.length) {
    const counts = { DISCLOSED: 0, INFERRED: 0, DIRECT_PROGRAM: 0, UNRESOLVED: 0 };
    for (const m of mutations) counts[m.set.fundAttribution]++;
    const content = { schemaVersion: 1, artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPLY_MANIFEST", asOfDate: batch.asOfDate,
      ledgerSha256: batch.batchSha256, sourceSnapshotSha256: attributionSnapshot(snapshot, batch.asOfDate).snapshotSha256,
      policy: { sourceScope: "PRODUCTION_SNAPSHOT", mutationScope: "OwnershipPeriod attribution metadata and existing-fund link only",
        allowedAttributions: ["DISCLOSED", "INFERRED", "DIRECT_PROGRAM", "UNRESOLVED"], fundCreates: 0, fundUpdates: 0, ownershipIdentityChanges: 0,
        attributionCounts: counts, inferredWrites: 0, fundLinkChanges: mutations.filter(m => m.expected.currentLinkedFundName !== m.targetLinkedFundName).length },
      expectedMutationCount: mutations.length, mutations };
    manifest = verifyManifest({ ...content, manifestSha256: canonicalSha256(content) });
  }
  return { batch, snapshot, seed: nextSeed, manifest, projected, databaseApplyRequired: manifest !== null };
}

/** Compatibility artifact for the existing protected attribution workflow. */
export function attributionSnapshot(snapshot: Snapshot, asOfDate: string) {
  const records = snapshot.companies.flatMap(c => c.owners.map(o => {
    const core = c.image.ownershipPeriods.find(p => p.id === o.id)!;
    return { ownershipPeriodId: o.id, companyId: c.image.id, companyName: c.image.name, country: c.image.country,
      description: c.image.description, investmentFirm: core.managerName, vehicleName: core.vehicleName,
      displayVehicleName: core.vehicleName || core.fundName || core.organizationName || "n.a.",
      currentLinkedFundName: o.state.linkedFundName, currentFundAttribution: o.state.fundAttribution,
      currentAttributedFundName: o.state.attributedFundName, currentAttributionConfidence: o.state.attributionConfidence,
      currentAttributionRationale: o.state.attributionRationale, investmentYear: core.investmentYear, stake: core.stake,
      isActive: core.isActive, milestones: c.image.milestones, sources: c.image.citations };
  }));
  const availableFundNames = snapshot.publishedFundNames ?? snapshot.funds.map(f => f.fundName);
  const content = { schemaVersion: 1, artifactType: "PORTFOLIO_FUND_ATTRIBUTION_PRODUCTION_SNAPSHOT", asOfDate,
    companyCount: snapshot.companies.length, activeOwnershipCount: records.length,
    publishedFundCount: availableFundNames.length, availableFundNames, records };
  // Exercise the actual protected-workflow schema during local compilation.
  return verifyProductionSnapshot({ ...content, capturedAt: snapshot.capturedAt, snapshotSha256: canonicalSha256(content) });
}

const progressNameSchema = z.strictObject({ companyId: text, name: text, sequence: z.number().int().positive(),
  reviewedEvidence: z.array(fileSchema), status: z.enum(["REMAINING", "PARKED", "VERIFIED"]),
  parkedReview: z.strictObject({ priorIssue: text, batchId: text, completion: fileSchema }).optional(),
  issue: text.nullable(), completion: fileSchema.nullable() });
export const progressSchema = z.strictObject({ schemaVersion: z.literal(1), artifactType: z.literal("PORTCO_COMPLETION_PROGRESS"),
  universe: fileSchema, names: z.array(progressNameSchema).min(1),
  active: z.strictObject({ batchId: text, batchSha256: hash,
    state: z.enum(["PREPARING", "RELEASED", "APPLYING", "VERIFYING", "VERIFYING_FAILED"]),
    releaseSha: commit.nullable(), failure: text.nullable() }).nullable(),
  completedBatchIds: z.array(text), consumedReceiptHashes: z.array(hash), progressSha256: hash });
export type Progress = z.infer<typeof progressSchema>;
export function verifyProgress(value: unknown) {
  const p = verifyHash(progressSchema.parse(value), "progressSha256");
  unique(p.names.map(n => n.companyId), "progress name");
  unique(p.completedBatchIds, "completed batch"); unique(p.consumedReceiptHashes, "receipt");
  for (const n of p.names) {
    if ((n.status === "PARKED") !== (n.issue !== null) || (n.status === "VERIFIED") !== (n.completion !== null)) throw Error("Incorrect name status evidence");
    if (n.parkedReview && (n.status === "REMAINING" || !p.completedBatchIds.includes(n.parkedReview.batchId)
      || (n.status === "VERIFIED" && !equal(n.completion, n.parkedReview.completion)))) throw Error("Incorrect parked-review completion lineage");
  }
  return p;
}
export function nextNames(value: unknown, revisitParked = false) {
  const p = verifyProgress(value);
  if (p.active) throw Error("One active release only");
  const remaining = p.names.filter(n => n.status === "REMAINING");
  if (revisitParked && remaining.length) throw Error("Parked queue follows main pass");
  const pool = revisitParked ? p.names.filter(n => n.status === "PARKED" && !n.parkedReview) : remaining;
  // Every parked name has already had its main pass; never reorder this queue by packet availability.
  if (revisitParked) return pool.sort((a, b) => a.sequence - b.sequence).slice(0, 10);
  const reviewed = pool.filter(n => n.reviewedEvidence.length > 0);
  return (reviewed.length ? reviewed : pool).sort((a, b) => a.sequence - b.sequence).slice(0, 10);
}
export function counts(value: unknown) {
  const p = verifyProgress(value);
  return { fullyVerified: p.names.filter(n => n.status === "VERIFIED").length,
    parked: p.names.filter(n => n.status === "PARKED").length, remaining: p.names.filter(n => n.status === "REMAINING").length };
}
function reseal(p: Progress) { const { progressSha256: _old, ...content } = p; return verifyProgress(seal(content, "progressSha256")); }
export function activate(progress: unknown, input: unknown, revisitParked?: boolean) {
  const p = verifyProgress(progress), batch = verifyBatch(input);
  const revisit = batch.phase === "PARKED_REVISIT";
  if (revisitParked !== undefined && revisitParked !== revisit) throw Error("Parked revisit must be bound in the batch phase");
  if (p.active || p.completedBatchIds.includes(batch.batchId) || batch.progressSha256 !== p.progressSha256) throw Error("Active, duplicate or stale batch");
  if (!equal(nextNames(p, revisit).map(n => n.companyId), batch.decisions.map(d => d.companyId))) throw Error("Select earliest ten eligible names");
  for (const d of batch.decisions) {
    const n = p.names.find(n => n.companyId === d.companyId)!;
    if (n.name !== d.name || n.sequence !== d.sequence) throw Error("Source name/order mismatch");
  }
  return reseal({ ...p, active: { batchId: batch.batchId, batchSha256: batch.batchSha256, state: "PREPARING", releaseSha: null, failure: null } });
}
export function freeze(progress: unknown, reason: string) {
  const p = verifyProgress(progress);
  if (!p.active || !reason.trim()) throw Error("Active batch and exact failure required");
  return reseal({ ...p, active: { ...p.active, state: "VERIFYING_FAILED", failure: reason } });
}

/** Narrow recovery for a conclusively skipped transaction, never an uncertain apply. */
export function recoverPreApply(input: { progress: unknown; priorBatch: unknown; batch: unknown;
  priorSnapshot: unknown; snapshot: unknown; failureEvidence: z.infer<typeof fileSchema>;
  files: Map<string, string>; run: { headSha: string; status: string; conclusion: string; workflowName: string;
    jobs: { steps: { name: string; conclusion: string }[] }[] } }) {
  const p = verifyProgress(input.progress), old = verifyBatch(input.priorBatch), batch = verifyBatch(input.batch);
  const before = verifySnapshot(input.priorSnapshot), snapshot = verifySnapshot(input.snapshot), run = input.run;
  if (!p.active || p.active.state !== "VERIFYING_FAILED" || p.active.batchSha256 !== old.batchSha256
    || p.active.batchId !== batch.batchId || old.batchId !== batch.batchId
    || p.completedBatchIds.includes(batch.batchId) || batch.baseCommit !== p.active.releaseSha
    || run.headSha !== p.active.releaseSha || run.status !== "completed" || run.conclusion !== "failure"
    || run.workflowName !== "Apply Reviewed Portfolio Fund Attribution" || run.jobs.length !== 1) throw Error("Exact failed pre-apply release required");
  const steps = run.jobs[0].steps;
  if (steps.filter(s => s.conclusion === "failure").length !== 1
    || steps.find(s => s.name === "Verify immutable attribution artifacts")?.conclusion !== "failure") throw Error("Failure was not at immutable-artifact gate");
  for (const name of ["Prove staged schema and exact production target", "Dry-run all reviewed mutations against fresh production state",
    "Prove cache revalidation readiness", "Final release, schema, target, and artifact recheck",
    "Apply reviewed portfolio fund attribution transactionally", "Revalidate public portfolio caches", "Verify public attribution samples and portfolio page"]) {
    if (steps.find(s => s.name === name)?.conclusion !== "skipped") throw Error("Cannot prove all database and apply steps skipped");
  }
  if (input.files.get(input.failureEvidence.path) !== input.failureEvidence.sha256
    || !batch.dependencies.some(d => equal(d, input.failureEvidence))) throw Error("Immutable failure evidence must be bound");
  for (const dependency of old.dependencies) if (!batch.dependencies.some(d => equal(d, dependency))) throw Error("Prior evidence must be preserved");
  if (old.snapshotSha256 !== before.snapshotSha256 || batch.snapshotSha256 !== snapshot.snapshotSha256
    || snapshot.baseCommit !== batch.baseCommit || !snapshot.publishedFundNames?.length
    || snapshot.capturedAt <= before.capturedAt || snapshot.targetFingerprint !== before.targetFingerprint
    || batch.targetFingerprint !== old.targetFingerprint || !equal(before.companies, snapshot.companies)
    || !equal(before.funds, snapshot.funds) || !equal(old.decisions, batch.decisions)
    || old.seedManifestSha256 !== batch.seedManifestSha256 || old.progressSha256 !== batch.progressSha256
    || old.executionManifestSha256 !== batch.executionManifestSha256 || old.sourceLedgerSha256 !== batch.sourceLedgerSha256
    || old.asOfDate !== batch.asOfDate || old.phase !== batch.phase) throw Error("Recovery must preserve every reviewed decision and complete target before-image");
  // This gate validates the newly supplied real catalog without weakening the protected schema.
  attributionSnapshot(snapshot, batch.asOfDate);
  return reseal({ ...p, active: { ...p.active, batchSha256: batch.batchSha256, state: "PREPARING", releaseSha: null, failure: null } });
}

export const releaseSchema = z.strictObject({ mergeSha: commit, canonicalSha: commit, headSha: commit,
  gitRef: z.literal("main"), gitProvider: z.literal("github"), canonicalUrl: z.literal("https://infra-ma-2.vercel.app"),
  ready: z.literal(true), requiredChecksPassed: z.literal(true), evidence: fileSchema });
export function markReleased(progress: unknown, release: unknown) {
  const p = verifyProgress(progress), r = releaseSchema.parse(release);
  if (!p.active || p.active.state !== "PREPARING" || r.mergeSha !== r.canonicalSha || r.mergeSha !== r.headSha) throw Error("Exact protected-main canonical release required");
  return reseal({ ...p, active: { ...p.active, state: "RELEASED", releaseSha: r.mergeSha } });
}
export function beginApply(progress: unknown, batch: Batch, manifest: AttributionApplyManifest) {
  const p = verifyProgress(progress); verifyBatch(batch); verifyManifest(manifest);
  if (!p.active || p.active.state !== "RELEASED" || p.active.batchSha256 !== batch.batchSha256
    || manifest.ledgerSha256 !== batch.batchSha256) throw Error("Cannot apply: release missing, stale or transaction may already exist");
  return reseal({ ...p, active: { ...p.active, state: "APPLYING" } });
}

/** Completion is fail-closed; caller must persist freeze() on any thrown post-apply error. */
export function complete(input: { progress: unknown; compiled: ReturnType<typeof compileBatch>; after: unknown;
  seed: unknown;
  release: unknown; proof: { companyId: string; checks: Record<string, boolean>; evidence: z.infer<typeof fileSchema>[] }[];
  completionFile: z.infer<typeof fileSchema>; chain?: { manifest: unknown; approval: unknown; receipt: unknown }; files: Map<string, string> }) {
  const p = verifyProgress(input.progress), c = input.compiled, after = verifySnapshot(input.after), r = releaseSchema.parse(input.release);
  if (!p.active || p.active.batchSha256 !== c.batch.batchSha256 || !["RELEASED", "APPLYING", "VERIFYING", "VERIFYING_FAILED"].includes(p.active.state)
    || p.active.releaseSha !== r.mergeSha || r.mergeSha !== r.headSha || r.mergeSha !== r.canonicalSha
    || after.baseCommit !== r.mergeSha || after.targetFingerprint !== c.snapshot.targetFingerprint
    || after.capturedAt < c.snapshot.capturedAt) throw Error("Completion release/target binding failed");
  if (input.files.get(r.evidence.path) !== r.evidence.sha256) throw Error("Release evidence missing");
  if (verifySeedManifest(input.seed).manifestSha256 !== c.seed.manifestSha256) throw Error("Complete seed alignment differs");
  if (!equal(after.companies, c.projected) || !equal(after.funds, c.snapshot.funds)) throw Error("Complete after-image/redirect/owner dependency mismatch");
  if (c.snapshot.publishedFundNames && !equal(after.publishedFundNames, c.snapshot.publishedFundNames)) throw Error("Published fund catalog changed during release");
  let receiptHash: string | null = null;
  if (c.manifest) {
    if (!input.chain) throw Error("Mutation needs immutable production receipt");
    const chain = verifyAttributionChain(input.chain);
    if (chain.manifest.manifestSha256 !== c.manifest.manifestSha256 || p.consumedReceiptHashes.includes(chain.receipt.receiptSha256)) throw Error("Unbound or consumed receipt");
    for (const row of chain.receipt.rows) {
      const before = c.snapshot.companies.flatMap(c => c.owners).find(o => o.id === row.ownershipPeriodId);
      if (!before || before.companyId !== row.companyId || !equal(row.before, before.state) || row.stateBeforeApply !== "PENDING") throw Error("Receipt complete before-image differs; investigate duplicate apply");
    }
    receiptHash = chain.receipt.receiptSha256;
  } else if (input.chain) throw Error("No-op/seed-only batch must not apply");
  const safe = c.batch.decisions.filter(d => d.classification !== "PARKED");
  if (!equal(input.proof.map(p => p.companyId).sort(), safe.map(d => d.companyId).sort())) throw Error("Per-name verification coverage missing");
  for (const proof of input.proof) {
    for (const key of ["afterImages", "seedAlignment", "api", "redirects", "ownership", "citations", "renderedCard"]) if (proof.checks[key] !== true) throw Error(`Incomplete ${key} verification`);
    if (!proof.evidence.length || proof.evidence.some(f => input.files.get(f.path) !== f.sha256)) throw Error("Verification evidence missing/stale");
  }
  const completionFile = fileSchema.parse(input.completionFile);
  if (input.files.get(completionFile.path) !== completionFile.sha256) throw Error("Durable completion artifact required");
  const names = p.names.map(n => {
    const d = c.batch.decisions.find(d => d.companyId === n.companyId);
    if (d && c.batch.phase === "PARKED_REVISIT" && (n.status !== "PARKED" || !n.issue || n.parkedReview)) throw Error("Parked revisit already completed or prior issue missing");
    return !d ? n : { ...n, status: d.classification === "PARKED" ? "PARKED" as const : "VERIFIED" as const,
      ...(c.batch.phase === "PARKED_REVISIT" ? { parkedReview: { priorIssue: n.issue!, batchId: c.batch.batchId, completion: completionFile } } : {}),
      issue: d.issue, completion: d.classification === "PARKED" ? null : completionFile };
  });
  return reseal({ ...p, names, active: null, completedBatchIds: [...p.completedBatchIds, c.batch.batchId],
    consumedReceiptHashes: receiptHash ? [...p.consumedReceiptHashes, receiptHash] : p.consumedReceiptHashes });
}
