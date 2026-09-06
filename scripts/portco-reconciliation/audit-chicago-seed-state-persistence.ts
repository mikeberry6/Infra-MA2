/** Pinned READ ONLY capture and exclusive proofs. No database/source transitions. */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { baseCompanies, companies } from "../../prisma/seed-data/companies";
import { applyApprovedPortCoAfterImages } from "../../prisma/seed-data/approved-portco-after-images";
import { CHICAGO_SEED_NAME, CHICAGO_SEED_COUNTRY, CHICAGO_LEGACY_PROPOSAL, persistChicagoDisplayedOwnerStates } from "../../prisma/seed-data/chicago-seed-state-persistence";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { verifyBatchTerminalDecision } from "./batch-artifacts";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
import { databaseTargetIdentity } from "./snapshot";
import { PRISMA_COMPANY_IMAGE_INCLUDE, prismaCompanyRowToImage } from "./prisma-company-image";
import { verifyPublicCompanyPayload } from "./public-api-verifier";

const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-06/chicago-seed-state-persistence";
const id = "cmrxpj47q00g7ivhe2d22x3iq";
const protectedBase = "342118055e7cf10c24c7d8732547dfd0d94cd2f0";
const executionPath = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const ledgerPath = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
const json = async (file: string) => JSON.parse(await readFile(file, "utf8"));
const write = async (name: string, value: unknown) => writeFile(`${out}/${name}`, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });

async function main() {
  if (process.cwd() !== root) throw new Error("Wrong worktree");
  const option = (name: string) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
  const phase = option("phase");
  const expectedSha = option("expected-sha");
  if (!phase || !["prepare", "pre-release", "production-release"].includes(phase)
    || !expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error("Explicit phase and full Git SHA required");
  const beforeCompanies = applyApprovedPortCoAfterImages(baseCompanies);
  const resulting = persistChicagoDisplayedOwnerStates(beforeCompanies);
  if (sha256Canonical(beforeCompanies) !== "f87ac491a6f1e43228c5c8e2755beacda34f1685538f279d9a2299ca598fc7d8") throw new Error("Stale whole seed before-image");
  const manifest = verifyExecutionManifest(await json(executionPath));
  const ledger = verifyBatchExecutionLedger(await json(ledgerPath));
  if (manifest.manifestSha256 !== "e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07"
    || ledger.ledgerSha256 !== "9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c"
    || manifest.activeTaskId !== null || ledger.activeBatchId !== null) throw new Error("Changed or active source state");
  const task = manifest.tasks.find((task) => task.sequence === 345)!;
  if (task.status !== "DEFERRED" || task.artifacts.proposal || task.artifacts.approval || task.artifacts.applyReceipt) throw new Error("Task 345 changed");
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
  const terminal = verifyBatchTerminalDecision(await ref(task.artifacts.decision!));
  if (terminal.outcome !== "DEFERRED" || terminal.taskId !== task.taskId) throw new Error("Terminal decision changed");
  for (const binding of [terminal.taskSnapshot, terminal.researchDecision, terminal.sourceVerification]) await ref({ location: binding.path, sha256: binding.sha256 });
  const evidence = task.reAdjudications!.at(-1)!.evidence;
  for (const binding of Object.values(evidence)) await ref(binding);
  const research = await ref(evidence.researchDecision);
  if (research.decision !== "DEFERRED" || research.seedMutationCandidate !== false || research.databaseMutationCandidate !== false
    || research.freshException.status !== "EXACT_FACT_UNAVAILABLE" || research.identityResolution.productionCompanyId !== id
    || research.transactionResolution.pendingTransaction.signedPendingExitAuthorized !== false
    || research.transactionResolution.pendingTransaction.stonepeakCurrentOwnerVerified !== false) throw new Error("Exact exception or research boundary changed");
  const vercel = (...args: string[]) => JSON.parse(execFileSync("npx", ["vercel", ...args], { encoding: "utf8", maxBuffer: 8000000, stdio: ["ignore", "pipe", "pipe"] }));
  const alias = vercel("inspect", "https://infra-ma-2.vercel.app", "--json");
  const deployment = vercel("api", `/v13/deployments/${alias.id}`, "--method", "GET");
  if (alias.readyState !== "READY" || deployment.readyState !== "READY" || deployment.target !== "production"
    || deployment.gitSource?.type !== "github" || deployment.gitSource?.ref !== "main" || deployment.gitSource?.sha !== expectedSha
    || deployment.meta?.githubCommitSha !== expectedSha || !deployment.alias?.includes("infra-ma-2.vercel.app")) throw new Error("Canonical alias is not the required Git-integrated main SHA");
  const target = databaseTargetIdentity({ connectionString: process.env.DATABASE_URL!, expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let production;
  try {
    production = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      return { companies: await tx.company.findMany({ where: { OR: [{ id }, { name: CHICAGO_SEED_NAME }] }, include: PRISMA_COMPANY_IMAGE_INCLUDE, orderBy: { id: "asc" } }),
        publishedIdentities: await tx.company.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true, country: true }, orderBy: { id: "asc" } }),
        redirects: await tx.companyRedirect.findMany({ orderBy: { retiredId: "asc" } }) };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await prisma.$disconnect(); }
  const normalized = JSON.parse(JSON.stringify(production));
  const company = production.companies[0];
  if (production.companies.length !== 1 || company.id !== id || company.name !== CHICAGO_SEED_NAME || company.country !== CHICAGO_SEED_COUNTRY
    || company.aliases.length !== 0 || company.pendingOwnershipTransactions.length !== 0) throw new Error("Chicago identity or pending state changed");
  const ownerBindings = [
    { productionId: "cmrxpjpd301coivhezreysio6", productionName: "MSIP", seedName: "Morgan Stanley Infrastructure Partners", vehicle: "North Haven Infrastructure Partners", stake: "50.1%" },
    { productionId: "cmrxpjpdm01cpivheou5raic6", productionName: "Abu Dhabi Investment Authority (ADIA)", seedName: "ADIA Infrastructure", vehicle: "Deeside Investments, Inc.", stake: "24.9%" },
    { productionId: "cmrxpjpe801cqivhexqthua8m", productionName: "Allianz Global Investors", seedName: "Allianz Global Investors", vehicle: "Deeside Investments, Inc.", stake: "25.0%" },
  ];
  if (company.ownershipPeriods.length !== 3 || ownerBindings.some((binding) => {
    const owner = company.ownershipPeriods.find((owner) => owner.id === binding.productionId);
    return !owner || owner.organization?.name !== binding.productionName || owner.vehicleName !== binding.vehicle || owner.stake !== binding.stake
      || owner.investmentYear !== 2009 || owner.exitYear !== null || !owner.isActive || owner.transactionState !== "CLOSED_ACTIVE";
  })) throw new Error("Existing displayed owner scope changed");
  const key = (item: { name: string; country: string }) => `${item.name.toLowerCase()}\0${item.country.toLowerCase()}`;
  if (production.publishedIdentities.length !== 1128 || new Set(resulting.map(key)).size !== resulting.length
    || sha256Canonical(resulting.map(key).sort()) !== sha256Canonical(production.publishedIdentities.map(key).sort())) throw new Error("Whole published identity parity failed");
  const capturedAt = new Date().toISOString();
  const stateSha256 = sha256Canonical(normalized);
  const before = beforeCompanies.find((company) => company.name === CHICAGO_SEED_NAME)!;
  const after = resulting.find((company) => company.name === CHICAGO_SEED_NAME)!;
  const canonicalDeployment = { id: deployment.id, url: deployment.url, readyState: deployment.readyState, target: deployment.target, aliases: deployment.alias, gitSource: deployment.gitSource };
  if (phase === "prepare") {
    if (expectedSha !== protectedBase || ["HEAD", "origin/main"].some((ref) => execFileSync("git", ["rev-parse", ref], { encoding: "utf8" }).trim() !== protectedBase)
      || sha256Canonical(companies) !== sha256Canonical(beforeCompanies)) throw new Error("Preparation must precede seed edit on exact protected base");
    const prior = await json("audits/portco-reconciliation/2026-09-06/final-reconciliation/production-state.json");
    if (sha256Canonical(prior.production) !== prior.stateSha256 || sha256Canonical(normalized.companies[0]) !== sha256Canonical(prior.production.companies.find((item: { id: string }) => item.id === id))
      || sha256Canonical(normalized.redirects) !== sha256Canonical(prior.production.redirects)) throw new Error("Production dependencies changed since prior audit");
    const dependencies = [];
    for (const file of [executionPath, ledgerPath, "prisma/seed-data/companies.ts", "prisma/seed-data/approved-portco-after-images.json", "prisma/seed-data/ownership-attributions.manifest.json", "prisma/seed-data/company-redirect-baseline.json", "prisma/seed-data/chicago-seed-state-persistence.ts"]) dependencies.push({ path: file, sha256: sha256Text(await readFile(file, "utf8")) });
    const body = { schemaVersion: 1, artifactType: "PORTCO_CHICAGO_DISPLAY_STATE_SEED_PERSISTENCE", baseCommit: protectedBase, capturedAt, target, canonicalDeployment,
      executionManifestSha256: manifest.manifestSha256, ledgerSha256: ledger.ledgerSha256, activeBatchId: null, dependencies, references,
      taskId: task.taskId, taskStatus: task.status, terminalDecisionSha256: terminal.decisionSha256, immutableOverlayProposalSha256: CHICAGO_LEGACY_PROPOSAL,
      canonicalCompanyId: id, before, after, ownerBindings, productionSnapshotSha256: stateSha256,
      sourceSeedSha256: sha256Canonical(beforeCompanies), resultingSeedSha256: sha256Canonical(resulting), resultingCompanyCount: resulting.length,
      freshException: research.freshException, freshExceptionSha256: sha256Canonical(research.freshException),
      changedFields: before.owners!.map((owner, index) => ({ path: `owners/${index}/transactionState`, before: owner.transactionState, after: "CLOSED_ACTIVE" })),
      databaseWrites: 0, sourceTransitions: 0, attributionChanges: 0, citationChanges: 0,
      qualification: "Separate technical persistence of the existing production display, not application of research task 345. Only three seed machine-state fields change; current displayed owners, legal vehicles, stakes and dates are preserved, not newly verified. CLOSED_ACTIVE is an existing display state, not a finding about the contemplated Stonepeak sale. Its signing, final consent, legal closing and current cap table remain exactly deferred. The old overlay and citation evidenceLabels (including legacy SIGNED_PENDING_EXIT annotations already present in both seed and production) remain byte-identical historical metadata, not executed-transaction authority. Scoped owner bindings are presentation equivalents, not new legal identity evidence or a global alias rule. No seed replay or production data write is authorized." };
    await mkdir(out, { recursive: true });
    await write("production-snapshot.json", { capturedAt, target, production, stateSha256 });
    await write("repair-plan.json", { ...body, repairSha256: sha256Canonical(body) });
    console.log(JSON.stringify({ phase, repairSha256: sha256Canonical(body), resultingSeedSha256: body.resultingSeedSha256, changedFields: 3, databaseWrites: 0 }));
    return;
  }
  const plan = await json(`${out}/repair-plan.json`);
  if (hashWithoutField(plan, "repairSha256") !== plan.repairSha256 || sha256Canonical(companies) !== plan.resultingSeedSha256
    || sha256Canonical(resulting) !== plan.resultingSeedSha256 || stateSha256 !== plan.productionSnapshotSha256
    || sha256Canonical(research.freshException) !== plan.freshExceptionSha256) throw new Error("Repair, seed, exception or production changed");
  for (const dependency of plan.dependencies) {
    if (dependency.path === "prisma/seed-data/companies.ts") continue;
    if (sha256Text(await readFile(dependency.path, "utf8")) !== dependency.sha256) throw new Error(`Changed dependency ${dependency.path}`);
  }
  for (const reference of plan.references) if (sha256Text(await readFile(reference.location.split("#")[0], "utf8")) !== reference.fileSha256) throw new Error("Source artifact changed");
  const apiChecks = [];
  const retiredIds = production.redirects.filter((redirect) => redirect.companyId === id).map((redirect) => redirect.retiredId);
  for (const focusId of [id, ...retiredIds]) {
    const url = `https://infra-ma-2.vercel.app/Infra-MA2/api/portfolio/${encodeURIComponent(focusId)}`;
    const response = await fetch(url, { cache: "no-store", headers: { "cache-control": "no-cache" }, signal: AbortSignal.timeout(20000) });
    const bytes = await response.text();
    if (response.status !== 200) throw new Error(`API ${focusId}: HTTP ${response.status}`);
    verifyPublicCompanyPayload({ payload: JSON.parse(bytes), companyId: id, afterImage: prismaCompanyRowToImage(company), retiredCompanyIds: retiredIds });
    apiChecks.push({ id: focusId, url, httpStatus: response.status, bodySha256: sha256Text(bytes), passed: true });
  }
  await write(`${phase}-verification.json`, { schemaVersion: 1, artifactType: "PORTCO_CHICAGO_DISPLAY_STATE_SEED_VERIFICATION", phase, checkedAt: capturedAt,
    repairSha256: plan.repairSha256, expectedSha, canonicalDeployment, target, productionSnapshotSha256: stateSha256,
    productionUnchanged: true, wholePublishedIdentityParity: true, publishedCount: 1128, redirects: production.redirects.length,
    resultingSeedSha256: plan.resultingSeedSha256, preservedExceptionSha256: plan.freshExceptionSha256,
    changedSeedFields: plan.changedFields, apiChecks, databaseWrites: 0, sourceTransitions: 0, attributionChanges: 0, citationChanges: 0, passed: true });
  console.log(JSON.stringify({ phase, passed: true, expectedSha, apiChecks: apiChecks.length, changedSeedFields: 3, productionUnchanged: true }));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Audit failed"); process.exitCode = 1; });
