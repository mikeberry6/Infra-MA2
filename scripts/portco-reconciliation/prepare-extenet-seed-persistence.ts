/** Exclusive artifact generation and pinned READ ONLY capture. No seed/database writes. */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { companies } from "../../prisma/seed-data/companies";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { verifyBatchTerminalDecision } from "./batch-artifacts";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
import { databaseTargetIdentity } from "./snapshot";
import { PRISMA_COMPANY_IMAGE_INCLUDE, prismaCompanyRowToImage } from "./prisma-company-image";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { finalizeSeedAttributionReconciliationSpec, reconcileSeedAttributionManifest } from "../portfolio-fund-attribution/reconcile-seed-manifest";
import { EXTENET_ID, EXTENET_NAME, EXTENET_OLD_NAME, EXTENET_DUPLICATE_NAME, EXTENET_COUNTRY, projectExtenetSeedIdentity } from "./extenet-seed-persistence";

const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-06/extenet-seed-persistence";
const executionPath = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const ledgerPath = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
const attributionPath = "prisma/seed-data/ownership-attributions.manifest.json";
const json = async (file: string) => JSON.parse(await readFile(file, "utf8"));
const write = async (name: string, value: unknown) => writeFile(`${out}/${name}`, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });

async function main() {
  if (process.cwd() !== root) throw new Error("Wrong worktree");
  const baseCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (baseCommit !== "59b5d797abc1cff8e71949f08686a6d7ee7221af"
    || execFileSync("git", ["rev-parse", "origin/main"], { encoding: "utf8" }).trim() !== baseCommit) throw new Error("Unexpected protected base");
  const manifest = verifyExecutionManifest(await json(executionPath));
  const ledger = verifyBatchExecutionLedger(await json(ledgerPath));
  if (manifest.manifestSha256 !== "e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07"
    || ledger.ledgerSha256 !== "9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c"
    || ledger.activeBatchId !== null || manifest.activeTaskId !== null) throw new Error("Source state changed or active work exists");
  if (sha256Canonical(companies) !== "f2a398507cb2c320456b9f6ea4b9514095d8443ed3f22cbfaffcf9446aaf07bc") throw new Error("Stale seed before-image");
  const references: Array<{ location: string; sha256: string; fileSha256: string }> = [];
  async function ref(reference: { location: string; sha256: string }) {
    const [file, fragment] = reference.location.split("#");
    if (file.startsWith("/") || file.split("/").includes("..") || file.includes("://")) throw new Error("Nonlocal artifact");
    const bytes = await readFile(file, "utf8");
    let value;
    try { value = JSON.parse(bytes); } catch { value = bytes; }
    if (fragment) for (const part of fragment.split("/")) value = value[part];
    const hashes = [sha256Canonical(value), ...(!fragment ? [sha256Text(bytes)] : [])];
    if (value && typeof value === "object") for (const key of Object.keys(value).filter((key) => key.endsWith("Sha256"))) {
      if (value[key] === reference.sha256) hashes.push(hashWithoutField(value, key));
    }
    if (!hashes.includes(reference.sha256)) throw new Error(`Artifact hash mismatch: ${file}`);
    references.push({ ...reference, fileSha256: sha256Text(bytes) });
    return value;
  }
  const canonical = manifest.tasks.find((task) => task.sequence === 213)!;
  if (canonical.status !== "DEFERRED" || canonical.artifacts.proposal || canonical.artifacts.approval || canonical.artifacts.applyReceipt) throw new Error("Task 213 is not the untouched exact exception");
  const members = [];
  for (const sequence of [213, 424, 475, 476]) {
    const task = manifest.tasks.find((task) => task.sequence === sequence)!;
    const decision = verifyBatchTerminalDecision(await ref(task.artifacts.decision!));
    if (decision.outcome !== task.status || (sequence !== 213 && (task.status !== "SUPERSEDED" || task.supersededByTaskId !== canonical.taskId || decision.supersededByTaskId !== canonical.taskId))) throw new Error("Identity decision changed");
    for (const binding of [decision.taskSnapshot, decision.researchDecision, decision.sourceVerification]) await ref({ location: binding.path, sha256: binding.sha256 });
    members.push({ sequence, taskId: task.taskId, subject: task.subject, status: task.status, decisionSha256: decision.decisionSha256, rationale: decision.rationale });
  }
  const evidence = canonical.reAdjudications!.at(-1)!.evidence;
  for (const binding of Object.values(evidence)) await ref(binding);
  const research = await ref(evidence.researchDecision);
  if (research.decision !== "DEFERRED" || research.freshException.status !== "EXACT_FACT_UNAVAILABLE"
    || research.identityResolution.productionCompanyId !== EXTENET_ID || research.identityResolution.legalContinuity !== "SAME_ENTITY_CORPORATE_FORM_CHANGE"
    || ![EXTENET_OLD_NAME, EXTENET_DUPLICATE_NAME].every((name) => research.identityResolution.aliases.includes(name))) throw new Error("Missing exact identity/exception evidence");
  const priorAudit = await json("audits/portco-reconciliation/2026-09-06/final-reconciliation/production-state.json");
  if (sha256Canonical(priorAudit.production) !== priorAudit.stateSha256) throw new Error("Prior production snapshot hash mismatch");
  const target = databaseTargetIdentity({ connectionString: process.env.DATABASE_URL!, expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let production;
  try {
    production = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      return { companies: await tx.company.findMany({ where: { OR: [{ id: EXTENET_ID }, { name: { in: [EXTENET_NAME, EXTENET_OLD_NAME, EXTENET_DUPLICATE_NAME] } }] }, include: PRISMA_COMPANY_IMAGE_INCLUDE, orderBy: { id: "asc" } }),
        publishedIdentities: await tx.company.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true, country: true }, orderBy: { id: "asc" } }),
        redirects: await tx.companyRedirect.findMany({ orderBy: { retiredId: "asc" } }) };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await prisma.$disconnect(); }
  const capturedAt = new Date().toISOString();
  if (production.companies.length !== 1 || production.publishedIdentities.length !== 1128) throw new Error("Unexpected production population or identity collision");
  const live = production.companies[0];
  const normalized = JSON.parse(JSON.stringify(production));
  if (sha256Canonical(normalized.companies[0]) !== sha256Canonical(priorAudit.production.companies.find((company: { id: string }) => company.id === EXTENET_ID))
    || sha256Canonical(normalized.redirects) !== sha256Canonical(priorAudit.production.redirects)) throw new Error("Production dependencies changed since verified audit");
  const projection = projectExtenetSeedIdentity(companies, prismaCompanyRowToImage(live));
  const identityKey = (company: { name: string; country: string }) => `${company.name.toLowerCase()}\0${company.country.toLowerCase()}`;
  if (sha256Canonical(projection.resultingCompanies.map(identityKey).sort()) !== sha256Canonical(production.publishedIdentities.map(identityKey).sort())) throw new Error("Whole published seed/production identity parity did not pass");
  const dependencies = [];
  for (const file of [executionPath, ledgerPath, "prisma/seed-data/companies.ts", "prisma/seed-data/approved-portco-after-images.json", attributionPath, "prisma/seed-data/company-redirect-baseline.json", "audits/portco-reconciliation/2026-09-06/seed-alias-persistence/production-release-verification.json"]) dependencies.push({ path: file, sha256: sha256Text(await readFile(file, "utf8")) });
  const plan = { schemaVersion: 1, artifactType: "PORTCO_EXTENET_SEED_IDENTITY_PERSISTENCE", releaseId: "extenet-seed-identity-persistence-v1", baseCommit, capturedAt, target,
    executionManifestSha256: manifest.manifestSha256, ledgerSha256: ledger.ledgerSha256, activeBatchId: null, dependencies, references, members,
    canonicalCompanyId: EXTENET_ID, canonicalName: EXTENET_NAME, country: EXTENET_COUNTRY,
    retainedBefore: projection.before, retainedAfter: projection.after, retiredDuplicate: projection.retired,
    sourceSeedSha256: sha256Canonical(companies), resultingSeedSha256: sha256Canonical(projection.resultingCompanies), sourceCompanyCount: companies.length, resultingCompanyCount: projection.resultingCompanies.length,
    productionSnapshotSha256: sha256Canonical(normalized), productionAliasesObserved: live.aliases, wholePublishedIdentityParity: true,
    freshException: research.freshException, freshExceptionSha256: sha256Canonical(research.freshException),
    databaseWrites: 0, sourceTransitions: 0, retainedOwnerChanges: 0, productionAttributionChanges: 0,
    qualification: "Separate technical identity persistence authorized by the continuation instruction, not application of deferred task 213. Its no-mutation research decision and exact exception are unchanged. Rename only the retained legacy seed identity to the existing production name and remove the exact Stonepeak-only duplicate. Preserve all retained fields and legacy attribution metadata without asserting fresh cutoff correctness. No production alias approval is claimed; observed aliases are empty. No full database seed or transaction replay is authorized." };
  const repairSha256 = sha256Canonical(plan);
  const seedManifest = verifySeedManifest(await json(attributionPath));
  const renamed = seedManifest.records.filter((record) => record.companyName === EXTENET_OLD_NAME && record.country === EXTENET_COUNTRY);
  const removed = seedManifest.records.filter((record) => record.companyName === EXTENET_DUPLICATE_NAME && record.country === EXTENET_COUNTRY);
  if (renamed.length !== 4 || removed.length !== 1 || removed[0].investmentFirm !== "Stonepeak") throw new Error("Attribution scope changed");
  const spec = finalizeSeedAttributionReconciliationSpec({ schemaVersion: 1, artifactType: "PORTCO_BATCH_SEED_ATTRIBUTION_RECONCILIATION_SPEC", batchId: plan.releaseId, batchSha256: repairSha256,
    reconciledAt: capturedAt, sourceManifestSha256: seedManifest.manifestSha256, rationale: "Technical seed identity persistence, not a source bundle: rename four company-name lookup keys, retaining record IDs and every other field; remove only the duplicate Stonepeak record. Existing estimates remain legacy estimates, not fresh ownership findings. Zero production writes.",
    removeRecordIds: removed.map((record) => record.recordId), upsertRecords: renamed.map((record) => ({ ...record, companyName: EXTENET_NAME })) });
  const reconciled = reconcileSeedAttributionManifest({ sourceManifest: seedManifest, spec, evaluatedCompanies: projection.resultingCompanies });
  await mkdir(out, { recursive: true });
  await write("production-snapshot.json", { capturedAt, target, production, stateSha256: plan.productionSnapshotSha256 });
  await write("repair-plan.json", { ...plan, repairSha256 });
  await write("seed-attribution-spec.json", spec);
  await write("seed-attribution-reconciliation.json", reconciled.artifact);
  await write("resulting-attribution-manifest.json", reconciled.manifest);
  console.log(JSON.stringify({ repairSha256, seedCompanies: projection.resultingCompanies.length, removedAttributions: removed.length, renamedAttributionKeys: renamed.length, wholePublishedIdentityParity: true, databaseWrites: 0 }, null, 2));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Capture failed"); process.exitCode = 1; });
