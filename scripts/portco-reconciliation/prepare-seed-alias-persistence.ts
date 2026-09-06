/** One-time, read-only production capture for five already-superseded seed labels.
 * Generates exclusive audit artifacts, never edits seeds or writes to a database.
 * Run from the authorized worktree with node --env-file=<production env> --import tsx.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { companies } from "../../prisma/seed-data/companies";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { verifyBatchTerminalDecision } from "./batch-artifacts";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
import { databaseTargetIdentity } from "./snapshot";
import { PRISMA_COMPANY_IMAGE_INCLUDE } from "./prisma-company-image";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { finalizeSeedAttributionReconciliationSpec, reconcileSeedAttributionManifest } from "../portfolio-fund-attribution/reconcile-seed-manifest";

const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-06/seed-alias-persistence";
const executionPath = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const ledgerPath = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
const attributionPath = "prisma/seed-data/ownership-attributions.manifest.json";
const selected = [466, 472, 490, 495, 496];
const json = async (file: string) => JSON.parse(await readFile(file, "utf8"));
const write = async (name: string, value: unknown) => writeFile(`${out}/${name}`, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });

async function main() {
  if (process.cwd() !== root) throw new Error("Wrong worktree");
  const baseCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (baseCommit !== "e800427881fe13269e20b9eafd9607db43094b5e") throw new Error("Unexpected protected base");
  const manifest = verifyExecutionManifest(await json(executionPath));
  const ledger = verifyBatchExecutionLedger(await json(ledgerPath));
  if (manifest.manifestSha256 !== "e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07"
      || ledger.ledgerSha256 !== "9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c"
      || ledger.activeBatchId !== null || manifest.activeTaskId !== null) throw new Error("Source state changed or active work exists");
  const audit = await json("audits/portco-reconciliation/2026-09-06/final-reconciliation/production-state.json");
  const prior = audit.production;
  if (sha256Canonical(prior) !== audit.stateSha256) throw new Error("Prior snapshot hash mismatch");
  const localReceipts = new Map<string, string>();
  for (const file of execFileSync("git", ["ls-files", "-z", "*receipt*.json"], { encoding: "utf8", maxBuffer: 2000000 }).split("\0").filter(Boolean)) {
    const value = await json(file);
    if (value.receiptSha256 && hashWithoutField(value, "receiptSha256") === value.receiptSha256) localReceipts.set(value.receiptSha256, file);
  }
  const references: Array<{ location: string; sha256: string; fileSha256: string }> = [];
  async function ref(reference: { location: string; sha256: string }) {
    let location = reference.location;
    if (/^https:\/\/github.com\/mikeberry6\/Infra-MA2\/actions\/runs\/\d+$/.test(location)) {
      const local = localReceipts.get(reference.sha256);
      if (!local) throw new Error("No canonical-hash-valid downloaded receipt");
      location = local;
    }
    const [file, fragment] = location.split("#");
    if (file.startsWith("/") || file.split("/").includes("..") || file.includes("://")) throw new Error("Nonlocal artifact");
    const bytes = await readFile(file, "utf8");
    let value = JSON.parse(bytes);
    if (fragment) for (const part of fragment.split("/")) value = value[part];
    const hashes = [sha256Canonical(value), ...(!fragment ? [sha256Text(bytes)] : [])];
    for (const key of Object.keys(value).filter((key) => key.endsWith("Sha256"))) {
      if (value[key] === reference.sha256) hashes.push(hashWithoutField(value, key));
    }
    if (!hashes.includes(reference.sha256)) throw new Error(`Artifact hash mismatch: ${location}`);
    references.push({ ...reference, location, fileSha256: sha256Text(bytes) });
    return value;
  }
  const members = [];
  for (const sequence of selected) {
    const source = manifest.tasks.find((task) => task.sequence === sequence)!;
    const canonical = manifest.tasks.find((task) => task.taskId === source.supersededByTaskId)!;
    if (source.status !== "SUPERSEDED" || canonical.status !== "COMPLETED" || !source.artifacts.decision) throw new Error("Unresolved source relationship");
    const decision = verifyBatchTerminalDecision(await ref(source.artifacts.decision));
    if (decision.supersededByTaskId !== canonical.taskId || decision.outcome !== "SUPERSEDED") throw new Error("Decision target mismatch");
    for (const binding of [decision.taskSnapshot, decision.researchDecision, decision.sourceVerification]) await ref({ location: binding.path, sha256: binding.sha256 });
    const proposal = verifyProposal(await ref(canonical.artifacts.proposal!));
    const approval = verifyApproval(await ref(canonical.artifacts.approval!), proposal);
    const receipt = verifyApplyReceipt(await ref(canonical.artifacts.applyReceipt!), proposal, approval);
    const image = proposal.afterImage;
    if (image.country !== "United States" || !image.aliases.includes(source.subject) || image.citations.filter((citation) => citation.isPrimary).length !== 1) throw new Error("Missing explicit canonical alias or primary citation");
    const oldSeed = companies.filter((company) => company.name === source.subject && company.country === image.country);
    const targetSeed = companies.filter((company) => company.name === image.name && company.country === image.country);
    if (oldSeed.length !== 1 || targetSeed.length !== 1) throw new Error("Missing or ambiguous seed identities");
    members.push({ sourceSequence: sequence, sourceTaskId: source.taskId, canonicalSequence: canonical.sequence, canonicalTaskId: canonical.taskId,
      retiredSeed: oldSeed[0], retiredSeedSha256: sha256Canonical(oldSeed[0]), canonicalSeed: targetSeed[0], canonicalSeedSha256: sha256Canonical(targetSeed[0]),
      canonicalCompanyId: image.id!, canonicalName: image.name, country: image.country, proposalSha256: proposal.proposalSha256,
      approvalSha256: approval.approvalSha256, applyReceiptSha256: receipt.receiptSha256, primaryCitation: image.citations.find((citation) => citation.isPrimary),
      terminalDecisionSha256: decision.decisionSha256, rationale: decision.rationale });
  }
  const names = members.flatMap((member) => [member.retiredSeed.name, member.canonicalName]);
  const target = databaseTargetIdentity({ connectionString: process.env.DATABASE_URL!, expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let production;
  try {
    production = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      return { companies: await tx.company.findMany({ where: { OR: [{ id: { in: members.map((member) => member.canonicalCompanyId) } }, { name: { in: names } }] }, include: PRISMA_COMPANY_IMAGE_INCLUDE, orderBy: { id: "asc" } }),
        publishedCount: await tx.company.count({ where: { status: "PUBLISHED" } }), redirects: await tx.companyRedirect.findMany({ orderBy: { retiredId: "asc" } }) };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await prisma.$disconnect(); }
  const capturedAt = new Date().toISOString();
  for (const member of members) {
    const live = production.companies.find((company) => company.id === member.canonicalCompanyId);
    if (!live || live.status !== "PUBLISHED" || live.name !== member.canonicalName || !live.aliases.includes(member.retiredSeed.name)) throw new Error("Canonical production identity changed");
    if (production.companies.some((company) => company.name === member.retiredSeed.name && company.status === "PUBLISHED")) throw new Error("Alias is still independently published");
    const old = prior.companies.find((company: { id: string }) => company.id === member.canonicalCompanyId);
    if (sha256Canonical(JSON.parse(JSON.stringify(live))) !== sha256Canonical(old)) throw new Error("Canonical production dependencies changed since verified audit");
  }
  if (production.publishedCount !== 1128 || sha256Canonical(JSON.parse(JSON.stringify(production.redirects))) !== sha256Canonical(prior.redirects)) throw new Error("Production population or redirects changed");
  const retiredKeys = new Set(members.map((member) => `${member.retiredSeed.name}\0${member.country}`));
  const resultingCompanies = companies.filter((company) => !retiredKeys.has(`${company.name}\0${company.country}`));
  if (resultingCompanies.length !== companies.length - 5) throw new Error("Unexpected removal count");
  const dependencyPaths = [executionPath, ledgerPath, "prisma/seed-data/companies.ts", "prisma/seed-data/approved-portco-after-images.json", attributionPath, "prisma/seed-data/company-redirect-baseline.json"];
  const dependencies = [];
  for (const file of dependencyPaths) dependencies.push({ path: file, sha256: sha256Text(await readFile(file, "utf8")) });
  const plan = { schemaVersion: 1, artifactType: "PORTCO_SEED_ALIAS_PERSISTENCE_REPAIR", releaseId: "seed-alias-persistence-0466-0496-v1", baseCommit, capturedAt, target,
    executionManifestSha256: manifest.manifestSha256, ledgerSha256: ledger.ledgerSha256, activeBatchId: null,
    productionSnapshotSha256: sha256Canonical(JSON.parse(JSON.stringify(production))), sourceSeedSha256: sha256Canonical(companies), resultingSeedSha256: sha256Canonical(resultingCompanies),
    sourceCompanyCount: companies.length, resultingCompanyCount: resultingCompanies.length, dependencies, references, members,
    databaseWrites: 0, sourceTransitions: 0, canonicalCompanyChanges: 0, qualification: "Seed-only removal of five already-superseded duplicate labels. Existing canonical companies, ownership, pending transactions, citations and redirects remain byte-identical. This release is not a new source bundle and must not replay any transaction. Extenet, Chicago Parking Meters and attribution parity candidates remain out of scope." };
  const repairSha256 = sha256Canonical(plan);
  const seedManifest = verifySeedManifest(await json(attributionPath));
  const spec = finalizeSeedAttributionReconciliationSpec({ schemaVersion: 1, artifactType: "PORTCO_BATCH_SEED_ATTRIBUTION_RECONCILIATION_SPEC", batchId: plan.releaseId, batchSha256: repairSha256,
    reconciledAt: capturedAt, sourceManifestSha256: seedManifest.manifestSha256, rationale: "Seed-only persistence release, not a source-task activation: remove only attribution records attached to the five already-superseded labels. Canonical owner attribution records are unchanged; zero production changes.",
    removeRecordIds: seedManifest.records.filter((record) => retiredKeys.has(`${record.companyName}\0${record.country}`)).map((record) => record.recordId), upsertRecords: [] });
  const reconciled = reconcileSeedAttributionManifest({ sourceManifest: seedManifest, spec, evaluatedCompanies: resultingCompanies });
  await mkdir(out, { recursive: true });
  await write("production-snapshot.json", { capturedAt, target, production, stateSha256: plan.productionSnapshotSha256 });
  await write("repair-plan.json", { ...plan, repairSha256 });
  await write("seed-attribution-spec.json", spec);
  await write("seed-attribution-reconciliation.json", reconciled.artifact);
  await write("resulting-attribution-manifest.json", reconciled.manifest);
  console.log(JSON.stringify({ repairSha256, removedCompanies: 5, removedAttributions: spec.removeRecordIds.length, sourceCompanyCount: companies.length, resultingCompanyCount: resultingCompanies.length, productionWrites: 0 }, null, 2));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Capture failed"); process.exitCode = 1; });
