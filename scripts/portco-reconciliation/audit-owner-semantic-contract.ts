/** Fresh pinned READ ONLY semantic audit; no production or seed writes. */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { companies } from "../../prisma/seed-data/companies";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
import { databaseTargetIdentity } from "./snapshot";
import { buildOwnerSemanticContract, latestSemanticOverlays, type AppliedOwnerProof, type SemanticOverlay } from "./owner-semantic-contract";

const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-06/owner-semantic-contract";
const base = "c4fe14071d6a0a4d17f07c95165e742dbed1da62";
const executionPath = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const ledgerPath = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
const overlayPath = "prisma/seed-data/approved-portco-after-images.json";
const priorPath = "audits/portco-reconciliation/2026-09-06/final-reconciliation/production-state.json";
const referencesPath = "audits/portco-reconciliation/2026-09-06/final-reconciliation/artifact-reference-checks-v3.json";
const chicagoPath = "audits/portco-reconciliation/2026-09-06/chicago-seed-state-persistence/repair-plan.json";
const json = async (file: string) => JSON.parse(await readFile(file, "utf8"));
const write = async (name: string, value: unknown) => writeFile(`${out}/${name}`, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
const pendingSelect = { id: true, direction: true, state: true, counterpartyName: true, transactionDescription: true, announcedAt: true, expectedClosing: true } as const;

async function main() {
  if (process.cwd() !== root) throw new Error("Wrong worktree");
  const option = (name: string) => process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  const phase = option("phase");
  const expectedSha = option("expected-sha");
  if (!phase || !["prepare", "production-release"].includes(phase) || !expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error("Explicit phase and full expected SHA required");
  if (phase === "prepare" && (expectedSha !== base || ["HEAD", "origin/main"].some((ref) => execFileSync("git", ["rev-parse", ref], { encoding: "utf8" }).trim() !== base))) throw new Error("Unexpected protected base");
  const manifest = verifyExecutionManifest(await json(executionPath));
  const ledger = verifyBatchExecutionLedger(await json(ledgerPath));
  if (manifest.manifestSha256 !== "e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07"
    || ledger.ledgerSha256 !== "9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c"
    || manifest.activeTaskId !== null || ledger.activeBatchId !== null) throw new Error("Source state changed");
  const seedSha256 = sha256Canonical(companies);
  if (seedSha256 !== "d9cf4d477f5640c4f69b8e2b5ab499cb14a2050222c3af75d0a643f2c271523c") throw new Error("Evaluated seed changed");
  const overlays: SemanticOverlay[] = await json(overlayPath);
  const priorReferences: Array<{ location: string; originalLocation: string; sha256: string }> = await json(referencesPath);
  const localReferences: Array<{ location: string; originalLocation: string; sha256: string; fileSha256: string }> = [];
  async function readRef(ref: { location: string; sha256: string }) {
    const originalLocation = ref.location;
    if (/^https:\/\/github.com\/mikeberry6\/Infra-MA2\/actions\/runs\/\d+$/.test(ref.location)) {
      const paths = [...new Set(priorReferences.filter((entry) => entry.sha256 === ref.sha256 && !entry.location.includes("://")).map((entry) => entry.location))].sort();
      if (!paths.length) throw new Error("No retained local receipt for workflow reference");
      ref = { location: paths[0], sha256: ref.sha256 };
    }
    const [file, fragment] = ref.location.split("#");
    if (file.startsWith("/") || file.split("/").includes("..") || file.includes("://")) throw new Error("Nonlocal source reference");
    const bytes = await readFile(file, "utf8");
    let value = JSON.parse(bytes);
    if (fragment) for (const part of fragment.replace(/^\//, "").split("/")) value = value[part];
    const candidates = [sha256Canonical(value), ...(!fragment ? [sha256Text(bytes)] : [])];
    for (const field of Object.keys(value).filter((field) => field.endsWith("Sha256"))) if (value[field] === ref.sha256) candidates.push(hashWithoutField(value, field));
    if (!candidates.includes(ref.sha256)) throw new Error(`Reference hash changed: ${ref.location}`);
    localReferences.push({ ...ref, originalLocation, fileSha256: sha256Text(bytes) });
    return value;
  }
  const proofs: AppliedOwnerProof[] = [];
  const proofReferences = [];
  for (const entry of latestSemanticOverlays(overlays).values()) {
    if (!entry.canonicalAfterImage) continue;
    const task = manifest.tasks.find((task) => task.taskId === entry.taskId);
    if (!task || task.status !== "COMPLETED" || task.artifacts.proposal?.sha256 !== entry.proposalSha256 || !task.artifacts.approval || !task.artifacts.applyReceipt) throw new Error(`Latest canonical overlay is not current applied source: ${entry.company.name}`);
    const start = localReferences.length;
    proofs.push({ proposal: await readRef(task.artifacts.proposal), approval: await readRef(task.artifacts.approval), receipt: await readRef(task.artifacts.applyReceipt) });
    proofReferences.push({ taskId: task.taskId, sequence: task.sequence, proposalSha256: entry.proposalSha256, references: localReferences.slice(start) });
  }
  const freshReferences = [];
  for (const task of manifest.tasks.filter((task) => task.reAdjudications?.length)) {
    for (const [kind, reference] of Object.entries(task.reAdjudications!.at(-1)!.evidence)) {
      if (reference.location.includes("://") || reference.location.includes("#") || reference.location.startsWith("/") || reference.location.split("/").includes("..")) throw new Error("Fresh evidence path is not local");
      const bytes = await readFile(reference.location, "utf8");
      if (sha256Text(bytes) !== reference.sha256) throw new Error("Fresh evidence bytes changed");
      freshReferences.push({ taskIndex: task.sequence, kind, ...reference });
    }
  }
  if (freshReferences.length !== 315) throw new Error("Expected 45 complete seven-file fresh chains");
  const vercel = (...args: string[]) => JSON.parse(execFileSync("npx", ["vercel", ...args], { encoding: "utf8", maxBuffer: 8000000, stdio: ["ignore", "pipe", "pipe"] }));
  const alias = vercel("inspect", "https://infra-ma-2.vercel.app", "--json");
  const deployment = vercel("api", `/v13/deployments/${alias.id}`, "--method", "GET");
  if (alias.readyState !== "READY" || deployment.readyState !== "READY" || deployment.target !== "production"
    || deployment.gitSource?.type !== "github" || deployment.gitSource?.ref !== "main" || deployment.gitSource?.sha !== expectedSha
    || deployment.meta?.githubCommitSha !== expectedSha || !deployment.alias?.includes("infra-ma-2.vercel.app")) throw new Error("Canonical production is not required Git-integrated main SHA");
  const target = databaseTargetIdentity({ connectionString: process.env.DATABASE_URL!, expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let production;
  try {
    production = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      return { companies: await tx.company.findMany({ where: { status: "PUBLISHED" }, select: {
        id: true, name: true, country: true, status: true, companyStatus: true,
        ownershipPeriods: { include: { organization: { select: { name: true } }, fund: { select: { fundName: true, manager: { select: { name: true } } } } }, orderBy: { id: "asc" } },
        pendingOwnershipTransactions: { select: pendingSelect, orderBy: { id: "asc" } },
      }, orderBy: { id: "asc" } }), redirects: await tx.companyRedirect.findMany({ orderBy: { retiredId: "asc" } }) };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await prisma.$disconnect(); }
  const normalized = JSON.parse(JSON.stringify(production));
  const stateSha256 = sha256Canonical(normalized);
  const capturedAt = new Date().toISOString();
  const chicagoPlan = await json(chicagoPath);
  const contract = buildOwnerSemanticContract({ companies, overlays, production: production.companies, proofs, chicagoPlan });
  if (contract.publishedCompanies !== 1128 || contract.canonicalCompanies !== 298 || contract.representationDifferenceCompanies !== 74) throw new Error("Unexpected ownership contract scope");
  const contractSha256 = sha256Canonical(contract);
  const canonicalDeployment = { id: deployment.id, url: deployment.url, aliases: deployment.alias, gitSource: deployment.gitSource, readyState: deployment.readyState, target: deployment.target };
  if (phase === "prepare") {
    const prior = await json(priorPath);
    if (sha256Canonical(prior.production) !== prior.stateSha256) throw new Error("Prior audit hash changed");
    const expected = { companies: prior.production.companies.filter((company: { status: string }) => company.status === "PUBLISHED").map((company: Record<string, unknown>) => ({
      id: company.id, name: company.name, country: company.country, status: company.status, companyStatus: company.companyStatus, ownershipPeriods: company.ownershipPeriods,
      pendingOwnershipTransactions: (company.pendingOwnershipTransactions as Array<Record<string, unknown>>).map((transaction) => Object.fromEntries(Object.keys(pendingSelect).map((key) => [key, transaction[key]]))),
    })), redirects: prior.production.redirects };
    if (sha256Canonical(expected) !== stateSha256) throw new Error("Published ownership/pending/redirect state changed since final audit");
    const dependencies = [];
    for (const file of [executionPath, ledgerPath, overlayPath, referencesPath, chicagoPath, "prisma/seed-data/companies.ts", "prisma/seed-data/chicago-seed-state-persistence.ts", "prisma/seed-data/ownership-attributions.manifest.json", "prisma/entity-resolution.ts", "prisma/seed-runner.ts", "scripts/portco-reconciliation/approved-seed.ts", "scripts/portco-reconciliation/owner-semantic-contract.ts", "prisma/seed-data/company-redirect-baseline.json"]) dependencies.push({ path: file, sha256: sha256Text(await readFile(file, "utf8")) });
    const historyCommit = execFileSync("git", ["rev-parse", "f943b55f^"], { encoding: "utf8" }).trim();
    const historical = execFileSync("git", ["show", `${historyCommit}:scripts/portco-reconciliation/approved-seed.ts`], { encoding: "utf8" });
    const body = { schemaVersion: 1, artifactType: "PORTCO_OWNER_SEMANTIC_AUDIT", baseCommit: base, capturedAt, canonicalDeployment, target,
      executionManifestSha256: manifest.manifestSha256, ledgerSha256: ledger.ledgerSha256, activeBatchId: null, seedSha256, productionSnapshotSha256: stateSha256, contractSha256,
      dependencies, proofReferences, freshReferences, historicalProjection: { commit: historyCommit, path: "scripts/portco-reconciliation/approved-seed.ts", fileSha256: sha256Text(historical), separateFieldsIntroducedBy: "f943b55f" },
      counts: { published: contract.publishedCompanies, canonicalCompanies: contract.canonicalCompanies, canonicalOwners: contract.canonicalOwners, legacyCompanies: contract.legacyCompanies,
        active: production.companies.filter((company) => company.companyStatus === "ACTIVE").length, realized: production.companies.filter((company) => company.companyStatus === "REALIZED").length,
        pendingTransactionCompanies: production.companies.filter((company) => company.pendingOwnershipTransactions.length > 0).length, redirects: production.redirects.length },
      databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, attributionChanges: 0, wholeCoreOwnershipParity: true, fullSeedReplayParity: false, completionAllowed: false,
      qualification: contract.qualification };
    await mkdir(out, { recursive: true });
    await write("production-snapshot.json", { capturedAt, target, production, stateSha256 });
    await write("owner-contract.json", contract);
    await write("audit.json", { ...body, auditSha256: sha256Canonical(body) });
    await writeFile(`${out}/historical-approved-seed-before-f943b55f.txt`, historical, { flag: "wx" });
    console.log(JSON.stringify({ phase, auditSha256: sha256Canonical(body), contractSha256, counts: body.counts, databaseWrites: 0, fullSeedReplayParity: false }));
    return;
  }
  const audit = await json(`${out}/audit.json`);
  if (hashWithoutField(audit, "auditSha256") !== audit.auditSha256 || audit.productionSnapshotSha256 !== stateSha256 || audit.contractSha256 !== contractSha256 || audit.seedSha256 !== seedSha256) throw new Error("Published audit, contract, seed or production state changed");
  for (const dependency of audit.dependencies) if (sha256Text(await readFile(dependency.path, "utf8")) !== dependency.sha256) throw new Error(`Audit dependency changed: ${dependency.path}`);
  await write("production-release-verification.json", { schemaVersion: 1, artifactType: "PORTCO_OWNER_SEMANTIC_RELEASE_VERIFICATION", checkedAt: capturedAt, expectedSha, canonicalDeployment,
    auditSha256: audit.auditSha256, contractSha256, seedSha256, target, productionSnapshotSha256: stateSha256, productionUnchanged: true,
    canonicalProofsVerified: proofs.length, freshEvidenceFilesVerified: freshReferences.length, coreOwnershipParity: true, fullSeedReplayParity: false,
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, attributionChanges: 0, completionAllowed: false, passed: true });
  console.log(JSON.stringify({ phase, expectedSha, passed: true, coreOwnershipParity: true, fullSeedReplayParity: false, productionUnchanged: true }));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Semantic audit failed"); process.exitCode = 1; });
