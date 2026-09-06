/** Pinned READ ONLY history inventory. Never emits or applies a repair manifest. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { companies } from "../../prisma/seed-data/companies";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifySeedAttributionReconciliationSpec } from "../portfolio-fund-attribution/reconcile-seed-manifest";
import { verifyAttributionChain, verifyAttributionDatabaseHistory } from "./attribution-chronology";
import { sha256Canonical, sha256Text, hashWithoutField } from "./hash";
import { databaseTargetIdentity } from "./snapshot";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { latestSemanticOverlays } from "./owner-semantic-contract";

const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const BASE = "cba48dfc4c46af5f574cb87320a95bfb7641c4fe";
const OUT = "audits/portco-reconciliation/2026-09-06/attribution-chronology";
const SEMANTIC = "audits/portco-reconciliation/2026-09-06/owner-semantic-contract";
const DIAGNOSTIC = "audits/portco-reconciliation/2026-09-06/final-reconciliation/reconciliation-diagnostic-v3.json";
const EXECUTION = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const LEDGER = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
const SEED = "prisma/seed-data/ownership-attributions.manifest.json";
const OVERLAYS = "prisma/seed-data/approved-portco-after-images.json";
const RECOVERED = `${OUT}/recovered-initial-apply/apply-receipt.json`;
const json = async (file: string) => JSON.parse(await readFile(file, "utf8"));
const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 50_000_000 }).trim();
const equal = (left: unknown, right: unknown) => sha256Canonical(left) === sha256Canonical(right);
const write = async (file: string, value: unknown) => writeFile(`${OUT}/${file}`, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });

async function main() {
  const option = (name: string) => process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  const phase = option("phase");
  const expectedSha = option("expected-sha");
  if (process.cwd() !== ROOT || !["prepare", "production-release"].includes(phase ?? "") || !expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error("Explicit permitted worktree/phase/full SHA required");
  if (phase === "prepare" && (expectedSha !== BASE || git("rev-parse", "HEAD") !== BASE || git("rev-parse", "origin/main") !== BASE)) throw new Error("Protected base changed");
  const execution = verifyExecutionManifest(await json(EXECUTION));
  const ledger = verifyBatchExecutionLedger(await json(LEDGER));
  if (execution.manifestSha256 !== "e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07" || execution.activeTaskId !== null
    || ledger.ledgerSha256 !== "9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c" || ledger.activeBatchId !== null) throw new Error("Terminal source boundary changed");
  const semanticAudit = await json(`${SEMANTIC}/audit.json`);
  if (hashWithoutField(semanticAudit, "auditSha256") !== semanticAudit.auditSha256 || sha256Canonical(companies) !== semanticAudit.seedSha256) throw new Error("Semantic audit/seed changed");
  for (const dependency of semanticAudit.dependencies) if (sha256Text(await readFile(dependency.path, "utf8")) !== dependency.sha256) throw new Error(`Semantic dependency changed: ${dependency.path}`);
  const seed = verifySeedManifest(await json(SEED));
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257") throw new Error("Attribution seed changed");
  const diagnostic = await json(DIAGNOSTIC);
  const candidateIds: string[] = [...new Set<string>(diagnostic.attributionDifferences.map((row: { ownershipPeriodId: string }) => row.ownershipPeriodId))].sort();
  const companyIds: string[] = [...new Set<string>(diagnostic.attributionDifferences.map((row: { companyId: string }) => row.companyId))].sort();
  if (candidateIds.length !== 277 || companyIds.length !== 155 || diagnostic.attributionDifferences.length !== 603) throw new Error("Diagnostic scope changed");

  const tracked = new Set(git("ls-files", "-z", "audits").split("\0"));
  const paths = execFileSync("rg", ["-l", '"artifactType": "(PORTFOLIO_FUND_ATTRIBUTION_(APPLY_RECEIPT|APPLY_MANIFEST|APPROVAL)|PORTCO_BATCH_SEED_ATTRIBUTION_RECONCILIATION_SPEC)"', "audits", "-g", "*.json"], { encoding: "utf8", maxBuffer: 8_000_000 }).trim().split("\n").filter((path) => tracked.has(path) && path !== RECOVERED).sort();
  // The initial production receipt was absent from Git but survives in the
  // immutable successful workflow artifact. Bind archive digest and exact bytes.
  const archive = `${OUT}/recovered-initial-apply/artifact.zip`;
  if (createHash("sha256").update(await readFile(archive)).digest("hex") !== "4a0fe2ef97cc95ac052db2d7dd47a16889c275f56e22eda56d76d008a4447299") throw new Error("Recovered artifact archive changed");
  const recoveredBytes = await readFile(RECOVERED, "utf8");
  if (sha256Text(recoveredBytes) !== "ad91679544c16da42eb4c1a89785243cf2e0a22a5ffdd229bd5ac97269497487"
    || recoveredBytes !== execFileSync("unzip", ["-p", archive, "apply-receipt.json"], { encoding: "utf8", maxBuffer: 10_000_000 })) throw new Error("Recovered receipt bytes differ from verified archive");
  if (!paths.includes(RECOVERED)) paths.push(RECOVERED);
  for (const [file, expectedHash] of [
    ["release-provenance-before-write.json", "24c32c2faf6fddd3315b31dd10c43d1773e5382f5684ea622a53c2195d067646"],
    ["canonical-deployment-before-write.json", "15a0ba39fc3aeb0fe98c6eff55d8bbd930b96b1f5a50f48d021d982f9f8b3b99"],
  ]) {
    const bytes = await readFile(`${OUT}/recovered-initial-apply/${file}`, "utf8");
    if (sha256Text(bytes) !== expectedHash || bytes !== execFileSync("unzip", ["-p", archive, file], { encoding: "utf8" })) throw new Error("Recovered release proof differs from original archive");
  }
  const docs = await Promise.all(paths.map(async (path) => ({ path, data: await json(path) })));
  const artifact = (kind: string) => docs.filter((doc) => doc.data.artifactType === kind);
  const chains = [];
  const references = [];
  for (const receipt of artifact("PORTFOLIO_FUND_ATTRIBUTION_APPLY_RECEIPT")) {
    const manifest = artifact("PORTFOLIO_FUND_ATTRIBUTION_APPLY_MANIFEST").find((doc) => doc.data.manifestSha256 === receipt.data.manifestSha256);
    const approval = artifact("PORTFOLIO_FUND_ATTRIBUTION_APPROVAL").find((doc) => doc.data.approvalSha256 === receipt.data.approvalSha256);
    if (!manifest || !approval) throw new Error(`Missing receipt chain: ${receipt.path}`);
    const chain = verifyAttributionChain({ manifest: manifest.data, approval: approval.data, receipt: receipt.data });
    const sourceFiles = [];
    for (const doc of [manifest, approval, receipt]) {
      if (doc.path === RECOVERED) {
        sourceFiles.push({ path: doc.path, fileSha256: sha256Text(recoveredBytes), introducedBy: null,
          workflowRunId: 32087303941, artifactId: 9307153117, archiveSha256: "4a0fe2ef97cc95ac052db2d7dd47a16889c275f56e22eda56d76d008a4447299" });
        continue;
      }
      const introducedBy = git("log", "origin/main", "--diff-filter=A", "--format=%H", "--", doc.path).split("\n").at(-1)!;
      if (!/^[a-f0-9]{40}$/.test(introducedBy)) throw new Error("Missing protected-main artifact history");
      execFileSync("git", ["merge-base", "--is-ancestor", introducedBy, BASE]);
      const bytes = await readFile(doc.path, "utf8");
      const protectedBytes = execFileSync("git", ["show", `${BASE}:${doc.path}`], { encoding: "utf8", maxBuffer: 30_000_000 });
      if (bytes !== protectedBytes) throw new Error("Local artifact is not exact protected-main bytes");
      sourceFiles.push({ path: doc.path, fileSha256: sha256Text(bytes), introducedBy });
    }
    chains.push(chain);
    references.push({ receiptSha256: chain.receipt.receiptSha256, manifestSha256: chain.manifest.manifestSha256, approvalSha256: chain.approval.approvalSha256, pipelineRunId: chain.receipt.pipelineRunId, sourceFiles });
  }
  if (chains.length !== 46) throw new Error("Unexpected retained/recovered receipt count");
  const specDocs = artifact("PORTCO_BATCH_SEED_ATTRIBUTION_RECONCILIATION_SPEC");
  const specs = new Map(specDocs.map((doc) => { const spec = verifySeedAttributionReconciliationSpec(doc.data); return [spec.specSha256, { path: doc.path, spec }]; }));
  const lastSeedWrite = new Map<string, { path: string; specSha256: string; reconciledAt: string; recordSha256: string }>();
  for (const lineage of seed.reconciliations ?? []) {
    const found = specs.get(lineage.specSha256);
    if (!found || found.spec.batchId !== lineage.batchId || found.spec.sourceManifestSha256 !== lineage.sourceManifestSha256 || found.spec.batchSha256 !== lineage.batchSha256) throw new Error("Missing seed-reconciliation lineage");
    for (const id of found.spec.removeRecordIds) lastSeedWrite.delete(id);
    for (const record of found.spec.upsertRecords) lastSeedWrite.set(record.recordId, { path: found.path, specSha256: lineage.specSha256, reconciledAt: lineage.reconciledAt, recordSha256: sha256Canonical(record) });
  }

  const vercel = (...args: string[]) => JSON.parse(execFileSync("npx", ["vercel", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 8_000_000 }));
  const alias = vercel("inspect", "https://infra-ma-2.vercel.app", "--json");
  const deployment = vercel("api", `/v13/deployments/${alias.id}`, "--method", "GET");
  if (alias.readyState !== "READY" || deployment.readyState !== "READY" || deployment.target !== "production" || deployment.gitSource?.type !== "github"
    || deployment.gitSource?.ref !== "main" || deployment.gitSource?.sha !== expectedSha || deployment.meta?.githubCommitSha !== expectedSha || !deployment.alias.includes("infra-ma-2.vercel.app")) throw new Error("Canonical main deployment mismatch");
  const target = databaseTargetIdentity({ connectionString: process.env.DATABASE_URL!, expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let captured;
  try {
    captured = await db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      const pipelines = await tx.pipelineRun.findMany({ where: { pipeline: { contains: "attribution" } }, select: { id: true, pipeline: true, status: true, startedAt: true, endedAt: true, updated: true, skipped: true, metadata: true }, orderBy: { startedAt: "asc" } });
      const revisions = await tx.companyRevision.findMany({ where: { OR: [{ pipelineRunId: { in: pipelines.map((run) => run.id) } }, { companyId: { in: companyIds } }] }, orderBy: [{ appliedAt: "asc" }, { id: "asc" }] });
      const auditEvents = await tx.auditEvent.findMany({ where: { entityId: { in: [...companyIds, ...candidateIds] } }, select: { id: true, entityType: true, entityId: true, action: true, changes: true, metadata: true, createdAt: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
      const published = await tx.company.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true, country: true, status: true, companyStatus: true,
        ownershipPeriods: { include: { organization: { select: { name: true } }, fund: { select: { fundName: true, manager: { select: { name: true } } } } }, orderBy: { id: "asc" } },
        pendingOwnershipTransactions: { select: { id: true, direction: true, state: true, counterpartyName: true, transactionDescription: true, announcedAt: true, expectedClosing: true }, orderBy: { id: "asc" } },
      }, orderBy: { id: "asc" } });
      const redirects = await tx.companyRedirect.findMany({ orderBy: { retiredId: "asc" } });
      return { companies: published, redirects, pipelines, revisions, auditEvents };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await db.$disconnect(); }
  const production = JSON.parse(JSON.stringify(captured));
  const coreStateSha256 = sha256Canonical({ companies: production.companies, redirects: production.redirects });
  if (coreStateSha256 !== semanticAudit.productionSnapshotSha256) throw new Error("Published production state changed since semantic audit");
  const { latest, revisionBindings } = verifyAttributionDatabaseHistory({ chains, pipelines: production.pipelines, revisions: production.revisions, redirects: production.redirects });
  const overlayMap = latestSemanticOverlays(await json(OVERLAYS));
  const candidates = [];
  for (const company of captured.companies.filter((company) => companyIds.includes(company.id))) for (const owner of company.ownershipPeriods.filter((owner) => candidateIds.includes(owner.id))) {
    const differences = diagnostic.attributionDifferences.filter((row: { ownershipPeriodId: string }) => row.ownershipPeriodId === owner.id);
    const recordIds = [...new Set(differences.map((row: { matchedAttributionRecord: string }) => row.matchedAttributionRecord))];
    if (recordIds.length !== 1 || !owner.isActive) throw new Error("Candidate identity/active state differs");
    const record = seed.records.find((record) => record.recordId === recordIds[0]);
    const entry = overlayMap.get(`${company.name.trim().toLowerCase()}\0${company.country.trim().toLowerCase()}`);
    if (!record || !entry?.canonicalAfterImage) throw new Error("Candidate seed/canonical binding missing");
    const core = (row: { organizationName?: string | null; managerName?: string; vehicleName: string | null; stake: string | null; investmentYear: number | null; exitYear: number | null; isActive: boolean; transactionState: string }) => ({ organization: row.organizationName ?? row.managerName, vehicleName: row.vehicleName, stake: row.stake, investmentYear: row.investmentYear, exitYear: row.exitYear, isActive: row.isActive, transactionState: row.transactionState });
    const canonicalOwners = entry.canonicalAfterImage.ownershipPeriods.filter((row) => equal(core(row), core({ ...owner, organizationName: owner.organization?.name ?? owner.fund?.manager.name })));
    if (canonicalOwners.length !== 1) throw new Error("Candidate canonical owner is not unique");
    const observed = { linkedFundName: owner.fund?.fundName ?? null, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName, attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
    const seedState = { linkedFundName: record.targetLinkedFundName, fundAttribution: record.fundAttribution, attributedFundName: record.attributedFundName, attributionConfidence: record.attributionConfidence, attributionRationale: record.attributionRationale };
    for (const difference of differences) {
      const field = difference.field === "fundName" ? "linkedFundName" : difference.field;
      if (!equal(observed[field as keyof typeof observed], difference.actual) || !equal(seedState[field as keyof typeof seedState], difference.expected)) throw new Error("Candidate before/expected state drifted");
    }
    const last = latest.get(owner.id);
    const seedWrite = lastSeedWrite.get(record.recordId);
    candidates.push({ companyId: company.id, name: company.name, ownershipPeriodId: owner.id, recordId: record.recordId,
      proposalSha256: entry.proposalSha256, canonicalFundName: canonicalOwners[0].fundName,
      observed, diagnosticSeedExpectation: seedState, seedRecord: record,
      changedFields: differences.map((row: { field: string }) => row.field).sort(),
      seedWrite: seedWrite ? { ...seedWrite, currentRecordMatches: seedWrite.recordSha256 === sha256Canonical(record) } : null,
      latestAttributionReceipt: last ? { receiptSha256: last.receipt.receiptSha256, manifestSha256: last.receipt.manifestSha256, pipelineRunId: last.receipt.pipelineRunId, endedAt: last.endedAt, after: last.row.after, productionMatches: equal(observed, last.row.after) } : null,
      canonicalFundMatchesProduction: canonicalOwners[0].fundName === observed.linkedFundName,
      adjudication: "REVIEW_REQUIRED_NO_MUTATION_AUTHORIZED" });
  }
  if (candidates.length !== candidateIds.length) throw new Error("Missing candidate coverage");
  const report = { schemaVersion: 1, artifactType: "PORTCO_ATTRIBUTION_CHRONOLOGY_INVENTORY", baseCommit: BASE,
    executionManifestSha256: execution.manifestSha256, ledgerSha256: ledger.ledgerSha256, seedManifestSha256: seed.manifestSha256,
    coreStateSha256, productionSnapshotSha256: sha256Canonical(production),
    counts: { verifiedReceiptChains: chains.length, productionPipelines: production.pipelines.length, retainedRevisions: production.revisions.length, auditEvents: production.auditEvents.length,
      candidateFields: 603, candidateCompanies: companyIds.length, candidateOwners: candidates.length,
      ownersWithLatestReceipt: candidates.filter((row) => row.latestAttributionReceipt).length,
      ownersMatchingLatestReceipt: candidates.filter((row) => row.latestAttributionReceipt?.productionMatches).length,
      ownersWithSeedWrite: candidates.filter((row) => row.seedWrite).length,
      ownersMatchingLastSeedWrite: candidates.filter((row) => row.seedWrite?.currentRecordMatches).length },
    receiptReferences: references, revisionBindings, candidates, databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, completionAllowed: false,
    qualification: "Receipt/approval/manifest hashes, complete production attribution pipeline coverage and actual revision rows are verified. Exact protected-main artifact bytes are retained. These establish historical writes, not which current conflicting expectation is substantively correct. Per-record seed chronology, field overrides, fund-link authority and evidence remain review inputs; no repair manifest or new ownership claim is emitted." };
  const reportSha256 = sha256Canonical(report);
  const canonicalDeployment = { id: deployment.id, url: deployment.url, gitSource: deployment.gitSource, aliases: deployment.alias, readyState: deployment.readyState, target: deployment.target };
  if (phase === "prepare") {
    const dependencies = [];
    for (const path of [EXECUTION, LEDGER, SEED, OVERLAYS, DIAGNOSTIC, `${SEMANTIC}/audit.json`, "scripts/portco-reconciliation/attribution-chronology.ts", "scripts/portfolio-fund-attribution/schema.ts"]) dependencies.push({ path, sha256: sha256Text(await readFile(path, "utf8")) });
    await mkdir(OUT, { recursive: true });
    await write("production-snapshot.json", { capturedAt: new Date().toISOString(), target, production, stateSha256: report.productionSnapshotSha256 });
    await write("chronology.json", { ...report, reportSha256 });
    await write("capture-verification.json", { capturedAt: new Date().toISOString(), canonicalDeployment, target, reportSha256, dependencies, sourceTransitions: 0, databaseWrites: 0 });
  } else {
    const old = await json(`${OUT}/chronology.json`);
    const capture = await json(`${OUT}/capture-verification.json`);
    if (hashWithoutField(old, "reportSha256") !== reportSha256 || old.reportSha256 !== reportSha256) throw new Error("Frozen chronology/state changed");
    for (const dependency of capture.dependencies) if (sha256Text(await readFile(dependency.path, "utf8")) !== dependency.sha256) throw new Error("Chronology dependency changed");
    await write("production-release-verification.json", { checkedAt: new Date().toISOString(), expectedSha, canonicalDeployment, reportSha256, productionSnapshotSha256: report.productionSnapshotSha256, target, passed: true, productionUnchanged: true, databaseWrites: 0, completionAllowed: false });
  }
  console.log(JSON.stringify({ phase, reportSha256, counts: report.counts, databaseWrites: 0, completionAllowed: false }));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Chronology audit failed"); process.exitCode = 1; });
