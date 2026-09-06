/** Exclusive read-only checkpoint; does not reopen tasks or prepare mutations. */
import { readFile, writeFile, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { proveThreeIFieldAuthority, THREE_I_GROUP, THREE_I_SOURCE } from "./three-i-field-authority";
import { loadPrismaCompanyImage } from "./prisma-company-image";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { databaseTargetIdentity } from "./snapshot";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const BASE = "bce1f58a96a231d803fee2e3aab5e6a3b00cb28a";
const OUT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/three-i";
const CHRONOLOGY = "audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json";
const EXECUTION = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const LEDGER = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
const SEED = "prisma/seed-data/ownership-attributions.manifest.json";
const FUNDS = "prisma/seed-data/funds.manifest.json";
const json = async (file: string) => JSON.parse(await readFile(file, "utf8"));
const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 30_000_000 }).trim();

async function main() {
  const option = (key: string) => process.argv.find((arg) => arg.startsWith(`--${key}=`))?.slice(key.length + 3);
  const phase = option("phase"), expectedSha = option("expected-sha");
  if (process.cwd() !== ROOT || !["prepare", "production-release"].includes(phase ?? "") || !expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error("Explicit permitted worktree/phase/full SHA required");
  if (phase === "prepare" && (expectedSha !== BASE || git("rev-parse", "HEAD") !== BASE || git("rev-parse", "origin/main") !== BASE)) throw new Error("Protected base changed");
  const outputs = phase === "prepare" ? ["production-snapshot.json", "authority.json", "capture-verification.json"] : ["production-release-verification.json"];
  for (const file of outputs) {
    let exists = true;
    try { await access(`${OUT}/${file}`); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; exists = false; }
    if (exists) throw new Error(`Frozen output exists: ${file}`);
  }
  const execution = verifyExecutionManifest(await json(EXECUTION)), ledger = verifyBatchExecutionLedger(await json(LEDGER));
  if (execution.manifestSha256 !== "e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07" || execution.activeTaskId
    || ledger.ledgerSha256 !== "9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c" || ledger.activeBatchId) throw new Error("Terminal idle source boundary changed");
  const chronology = await json(CHRONOLOGY);
  const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
  if (!reference || reference.sourceFiles.length !== 3) throw new Error("Original receipt chain missing");
  const [manifest, approval, receipt] = await Promise.all(reference.sourceFiles.map(async (file: { path: string; fileSha256: string }) => {
    if (sha256Text(await readFile(file.path, "utf8")) !== file.fileSha256) throw new Error("Frozen attribution chain changed");
    return json(file.path);
  }));
  const dependencies: string[] = [CHRONOLOGY, EXECUTION, LEDGER, SEED, FUNDS, "scripts/generate-portfolio-fund-attribution.ts",
    ...reference.sourceFiles.map((file: { path: string }) => file.path)];
  const proofs = await Promise.all(THREE_I_GROUP.map(async (group) => {
    const task = execution.tasks.find((row) => row.sequence === group.sequence);
    if (!task || task.status !== "COMPLETED" || task.artifacts.proposal?.sha256 !== group.proposalSha256
      || !task.artifacts.approval || !task.artifacts.applyReceipt) throw new Error("Current source task chain changed");
    const paths = [task.artifacts.proposal.location, task.artifacts.approval.location, task.artifacts.applyReceipt.location];
    dependencies.push(...paths);
    const [proposal, approval, receipt] = await Promise.all(paths.map(json));
    return { proposal, approval, receipt };
  }));
  const boundFiles = await Promise.all(dependencies.sort().map(async (path) => {
    const bytes = await readFile(path, "utf8");
    if (execFileSync("git", ["show", `${BASE}:${path}`], { encoding: "utf8", maxBuffer: 30_000_000 }) !== bytes) throw new Error(`Protected input changed: ${path}`);
    return { path, sha256: sha256Text(bytes) };
  }));
  const sourceCapture = await json(`${OUT}/source-capture.json`);
  if (sourceCapture.requestedUrl !== THREE_I_SOURCE || sourceCapture.finalUrl !== THREE_I_SOURCE || sourceCapture.httpStatus !== 200) throw new Error("Direct source capture differs");
  const vercel = (...args: string[]) => JSON.parse(execFileSync("npx", ["vercel", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 8_000_000 }));
  const alias = vercel("inspect", "https://infra-ma-2.vercel.app", "--json"), deployment = vercel("api", `/v13/deployments/${alias.id}`, "--method", "GET");
  if (alias.readyState !== "READY" || deployment.readyState !== "READY" || deployment.target !== "production" || deployment.gitSource?.type !== "github"
    || deployment.gitSource.ref !== "main" || deployment.gitSource.sha !== expectedSha || deployment.meta?.githubCommitSha !== expectedSha
    || !deployment.alias.includes("infra-ma-2.vercel.app")) throw new Error("Canonical exact main deployment differs");
  const target = databaseTargetIdentity({ connectionString: process.env.DATABASE_URL!, expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let captured;
  try {
    captured = await db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      const images = await Promise.all(THREE_I_GROUP.map((row) => loadPrismaCompanyImage(tx, row.companyId)));
      const owners = await tx.ownershipPeriod.findMany({ where: { companyId: { in: THREE_I_GROUP.map((row) => row.companyId) } }, select: {
        id: true, companyId: true, fundId: true, fundAttribution: true, attributedFundName: true, attributionConfidence: true, attributionRationale: true, isActive: true,
      }, orderBy: { id: "asc" } });
      const fund = await tx.fund.findUniqueOrThrow({ where: { id: "cmrxpj0q100awivhe614f48xf" }, select: { id: true, fundName: true, status: true, manager: { select: { name: true } } } });
      return { images, owners, fund };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await db.$disconnect(); }
  const production = JSON.parse(JSON.stringify(captured));
  const seedFunds = (await json(FUNDS)).funds.filter((fund: { id: string }) => fund.id === "FUND-002");
  if (seedFunds.length !== 1) throw new Error("Curated seed fund collision");
  const proof = proveThreeIFieldAuthority({ chronology, seed: await json(SEED), proofs, attribution: { manifest, approval, receipt }, production,
    seedFund: seedFunds[0], sourcePdf: await readFile(`${OUT}/source.pdf`), sourceText: await readFile(`${OUT}/source-pages-21-22.txt`, "utf8") });
  const report = { ...proof, baseCommit: BASE, executionManifestSha256: execution.manifestSha256, ledgerSha256: ledger.ledgerSha256,
    productionSnapshotSha256: sha256Canonical(production), dependencies: boundFiles, sourceCaptureSha256: sha256Canonical(sourceCapture),
    visualReview: { oneBasedPages: [21, 22], method: "PDF pages rendered to PNG and visually inspected by the agent; table label, footnote marker and company grouping confirmed." } };
  const reportSha256 = sha256Canonical(report), checkedAt = new Date().toISOString();
  const canonicalDeployment = { id: deployment.id, url: deployment.url, gitSource: deployment.gitSource, aliases: deployment.alias, readyState: deployment.readyState, target: deployment.target };
  const write = (file: string, value: unknown) => writeFile(`${OUT}/${file}`, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  if (phase === "prepare") {
    await write("production-snapshot.json", { capturedAt: checkedAt, target, production, stateSha256: report.productionSnapshotSha256 });
    await write("authority.json", { ...report, reportSha256 });
    await write("capture-verification.json", { checkedAt, canonicalDeployment, target, reportSha256, passed: true, databaseWrites: 0, completionAllowed: false });
  } else {
    const old = await json(`${OUT}/authority.json`);
    if (old.reportSha256 !== reportSha256 || hashWithoutField(old, "reportSha256") !== reportSha256) throw new Error("Frozen source/production/authority proof changed");
    await write("production-release-verification.json", { checkedAt, expectedSha, canonicalDeployment, target, reportSha256,
      productionSnapshotSha256: report.productionSnapshotSha256, passed: true, databaseWrites: 0, completionAllowed: false });
  }
  console.log(JSON.stringify({ phase, reportSha256, reviewedFields: proof.candidateFieldsAdjudicated, remaining: proof.remainingCandidateFields, metadataFollowups: 3, databaseWrites: 0 }));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Authority checkpoint failed"); process.exitCode = 1; });
