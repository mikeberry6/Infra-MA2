/** Exclusive target-pinned READ ONLY capture and matching protected-main proof. */
import { access, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { proveUsdFieldAuthority, USD, USD_SOURCES } from "./usd-field-authority";
import { loadPrismaCompanyImage } from "./prisma-company-image";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { databaseTargetIdentity } from "./snapshot";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const BASE = "80265ddc8dc9a3ff452647c685bb607889e6c599";
const OUT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/usd-clean-fuels";
const CHRONOLOGY = "audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json";
const PRIOR = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/durham-region-courthouse/authority.json";
const EXECUTION = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const LEDGER = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
const SEED = "prisma/seed-data/ownership-attributions.manifest.json";
const FUNDS = "prisma/seed-data/funds.manifest.json";
const RECEIPT = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0062-usd-clean-fuels/attempt-1/production-apply/apply-receipt.json";
const json = async (path: string) => JSON.parse(await readFile(path, "utf8"));
const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 40_000_000 }).trim();

async function main() {
  const option = (key: string) => process.argv.find(arg => arg.startsWith(`--${key}=`))?.slice(key.length + 3);
  const phase = option("phase"), expectedSha = option("expected-sha");
  if (process.cwd() !== ROOT || !["prepare", "production-release"].includes(phase ?? "") || !expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error("Explicit permitted worktree/phase/full SHA required");
  if (phase === "prepare" && (expectedSha !== BASE || git("rev-parse", "HEAD") !== BASE || git("rev-parse", "origin/main") !== BASE)) throw new Error("Protected base changed");
  const outputs = phase === "prepare" ? ["production-snapshot.json", "authority.json", "capture-verification.json"] : ["production-release-verification.json"];
  for (const file of outputs) {
    try { await access(`${OUT}/${file}`); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") continue; throw error; }
    throw new Error(`Frozen output exists: ${file}`);
  }
  const execution = verifyExecutionManifest(await json(EXECUTION)), ledger = verifyBatchExecutionLedger(await json(LEDGER));
  if (execution.manifestSha256 !== "e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07" || execution.activeTaskId
    || ledger.ledgerSha256 !== "9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c" || ledger.activeBatchId) throw new Error("Terminal idle source boundary changed");
  const task = execution.tasks.find(row => row.sequence === 62);
  if (!task || task.status !== "COMPLETED" || task.artifacts.proposal?.sha256 !== USD.proposalSha256 || !task.artifacts.approval || !task.artifacts.applyReceipt
    || task.artifacts.applyReceipt.location !== "https://github.com/mikeberry6/Infra-MA2/actions/runs/31649881552"
    || task.artifacts.applyReceipt.sha256 !== "56b8bc3de4faa5286de6c3880fdb412d139f18d15d744036c94efcaad4d66b88") throw new Error("Canonical task62 binding changed");
  const chronology = await json(CHRONOLOGY), reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
  if (!reference || reference.sourceFiles.length !== 3) throw new Error("Original attribution chain missing");
  const [manifest, attributionApproval, attributionReceipt] = await Promise.all(reference.sourceFiles.map(async (file: { path: string; fileSha256: string }) => {
    if (sha256Text(await readFile(file.path, "utf8")) !== file.fileSha256) throw new Error("Frozen attribution receipt file changed");
    return json(file.path);
  }));
  const dependencies = [CHRONOLOGY, PRIOR, EXECUTION, LEDGER, SEED, FUNDS, "scripts/generate-portfolio-fund-attribution.ts", "scripts/portfolio-fund-attribution/schema.ts",
    task.artifacts.proposal.location, task.artifacts.approval.location, RECEIPT,
    "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0062-usd-clean-fuels/research-decision.json",
    ...reference.sourceFiles.map((file: { path: string }) => file.path)];
  const boundFiles = await Promise.all(dependencies.sort().map(async path => {
    const bytes = await readFile(path, "utf8");
    if (execFileSync("git", ["show", `${BASE}:${path}`], { encoding: "utf8", maxBuffer: 40_000_000 }) !== bytes) throw new Error(`Protected input changed: ${path}`);
    return { path, sha256: sha256Text(bytes) };
  }));
  const sourceCapture = await json(`${OUT}/source-capture.json`);
  if (sourceCapture.sources.length !== 2) throw new Error("Direct source capture cardinality changed");
  for (const source of USD_SOURCES) {
    const records = sourceCapture.sources.filter((row: { id: string }) => row.id === source.id);
    if (records.length !== 1 || records[0].requestedUrl !== source.url || records[0].finalUrl !== source.url || records[0].httpStatus !== 200
      || records[0].path !== `${OUT}/${source.file}` || records[0].sha256 !== source.sha256) throw new Error("Direct source capture identity changed");
  }
  const vercel = (...args: string[]) => JSON.parse(execFileSync("npx", ["vercel", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 8_000_000 }));
  const alias = vercel("inspect", "https://infra-ma-2.vercel.app", "--json"), deployment = vercel("api", `/v13/deployments/${alias.id}`, "--method", "GET");
  if (alias.readyState !== "READY" || deployment.readyState !== "READY" || deployment.target !== "production" || deployment.gitSource?.type !== "github"
    || deployment.gitSource.ref !== "main" || deployment.gitSource.sha !== expectedSha || deployment.meta?.githubCommitSha !== expectedSha
    || !deployment.alias.includes("infra-ma-2.vercel.app")) throw new Error("Canonical exact protected-main deployment differs");
  const target = databaseTargetIdentity({ connectionString: process.env.DATABASE_URL!, expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  if (target.fingerprint !== "45836a2e3306aa27a98c47cded3087b545691ec737c22861a69c4ab202986929") throw new Error("Target fingerprint changed");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let captured;
  try {
    captured = await db.$transaction(async tx => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      const image = await loadPrismaCompanyImage(tx, USD.companyId);
      const owners = await tx.ownershipPeriod.findMany({ where: { companyId: USD.companyId }, select: { id: true, companyId: true, fundId: true,
        fundAttribution: true, attributedFundName: true, attributionConfidence: true, attributionRationale: true, isActive: true }, orderBy: { id: "asc" } });
      const fund = await tx.fund.findUniqueOrThrow({ where: { id: USD.fundId }, select: { id: true, fundName: true, status: true, manager: { select: { name: true } } } });
      const redirects = await tx.companyRedirect.findMany({ where: { OR: [{ companyId: USD.companyId }, { retiredId: USD.companyId }] }, orderBy: { retiredId: "asc" } });
      return { images: [image], owners, fund, redirects };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await db.$disconnect(); }
  const production = JSON.parse(JSON.stringify(captured));
  const seedFunds = (await json(FUNDS)).funds.filter((fund: { id: string }) => fund.id === "FUND-017");
  if (seedFunds.length !== 1) throw new Error("Curated seed fund collision");
  const proof = proveUsdFieldAuthority({ chronology, priorAuthority: await json(PRIOR), seed: await json(SEED), seedFund: seedFunds[0],
    proposal: await json(task.artifacts.proposal.location), approval: await json(task.artifacts.approval.location), receipt: await json(RECEIPT),
    attribution: { manifest, approval: attributionApproval, receipt: attributionReceipt }, production,
    sources: await Promise.all(USD_SOURCES.map(async source => ({ id: source.id, bytes: await readFile(`${OUT}/${source.file}`) }))) });
  const report = { ...proof, baseCommit: BASE, executionManifestSha256: execution.manifestSha256, ledgerSha256: ledger.ledgerSha256,
    productionSnapshotSha256: sha256Canonical(production), dependencies: boundFiles, sourceCaptureSha256: sha256Canonical(sourceCapture) };
  const reportSha256 = sha256Canonical(report), checkedAt = new Date().toISOString();
  const canonicalDeployment = { id: deployment.id, url: deployment.url, gitSource: deployment.gitSource, aliases: deployment.alias, readyState: deployment.readyState, target: deployment.target };
  const write = (file: string, value: unknown) => writeFile(`${OUT}/${file}`, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  if (phase === "prepare") {
    await write("production-snapshot.json", { capturedAt: checkedAt, target, production, stateSha256: report.productionSnapshotSha256 });
    await write("authority.json", { ...report, reportSha256 });
    await write("capture-verification.json", { checkedAt, canonicalDeployment, target, reportSha256, passed: true, databaseWrites: 0, completionAllowed: false });
  } else {
    const frozen = await json(`${OUT}/authority.json`);
    if (frozen.reportSha256 !== reportSha256 || hashWithoutField(frozen, "reportSha256") !== reportSha256) throw new Error("Frozen authority/dependency/production proof changed");
    await write("production-release-verification.json", { checkedAt, expectedSha, canonicalDeployment, target, reportSha256,
      productionSnapshotSha256: report.productionSnapshotSha256, passed: true, databaseWrites: 0, completionAllowed: false });
  }
  console.log(JSON.stringify({ phase, reportSha256, reviewedFields: proof.candidateFieldsAdjudicated, remaining: proof.remainingCandidateFields, databaseWrites: 0 }));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Authority checkpoint failed"); process.exitCode = 1; });
