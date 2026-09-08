/** Exclusive target-pinned READ ONLY capture and matching protected-main proof. */
import { access, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { proveAesFieldAuthority, AES, AES_SOURCES, AES_SOURCE_ROOT, AES_PACKET, AES_TASK_ROOT, AES_BATCH_ROOT, AES_RENDERED } from "./aes-field-authority";
import { loadPrismaCompanyImage } from "./prisma-company-image";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { databaseTargetIdentity } from "./snapshot";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const BASE = "d0eec989f20d6e73ff1877c7f4757a5d1adb0af1";
const OUT = "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes";
const CHRONOLOGY = "audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json";
const PRIOR = "audits/portco-reconciliation/2026-09-07/attribution-field-authority/stratos/authority.json";
const EXECUTION = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const LEDGER = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
const SEED = "prisma/seed-data/ownership-attributions.manifest.json";
const BATCH_MANIFEST = `${AES_BATCH_ROOT}/batch-manifest-v2.json`;
const SEED_SPEC = `${AES_BATCH_ROOT}/seed-attribution-reconciliation-spec.json`;
const SEED_BATCH_MANIFEST = BATCH_MANIFEST;
const ORIGINAL = "audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json";
const RECEIPT = `${AES_BATCH_ROOT}/production-apply/batch-apply-receipt.json`;
const json = async (path: string) => JSON.parse(await readFile(path, "utf8"));
const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 40_000_000 }).trim();

async function main() {
  const option = (key: string) => process.argv.find(arg => arg.startsWith(`--${key}=`))?.slice(key.length + 3);
  const phase = option("phase"), expectedSha = option("expected-sha");
  if (process.cwd() !== ROOT || !["prepare", "production-release"].includes(phase ?? "") || !expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error("Explicit permitted worktree/phase/full SHA required");
  if (phase === "prepare" && (expectedSha !== BASE || git("rev-parse", "HEAD") !== BASE || git("rev-parse", "origin/main") !== BASE)) throw new Error("Protected base changed");
  const outputs = phase === "prepare" ? ["production-snapshot.json", "authority-v2.json", "capture-verification-v2.json"] : ["production-release-verification.json"];
  for (const file of outputs) {
    try { await access(`${OUT}/${file}`); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") continue; throw error; }
    throw new Error(`Frozen output exists: ${file}`);
  }
  const execution = verifyExecutionManifest(await json(EXECUTION)), ledger = verifyBatchExecutionLedger(await json(LEDGER));
  if (execution.manifestSha256 !== "e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07" || execution.activeTaskId
    || ledger.ledgerSha256 !== "9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c" || ledger.activeBatchId) throw new Error("Terminal idle source boundary changed");
  const task = execution.tasks.find(row => row.sequence === 154);
  if (!task || task.status !== "COMPLETED" || task.artifacts.proposal?.sha256 !== AES.proposalSha256 || !task.artifacts.approval || !task.artifacts.applyReceipt
    || task.artifacts.applyReceipt.location !== `${RECEIPT}#members/2/receipt`
    || task.artifacts.applyReceipt.sha256 !== AES.receiptSha256) throw new Error("Canonical task154 binding changed");
  if (task.artifacts.taskSnapshot?.sha256 !== "0aafd083ad230fb74b6bcc120faa5a399b945d170362725e2ea01d68748b7ee3") throw Error("Canonical task snapshot changed");
  const chronology = await json(CHRONOLOGY), reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
  if (!reference || reference.sourceFiles.length !== 3) throw new Error("Latest attribution repair chain missing");
  const [manifest, attributionApproval, attributionReceipt] = await Promise.all(reference.sourceFiles.map(async (file: { path: string; fileSha256: string }) => {
    if (sha256Text(await readFile(file.path, "utf8")) !== file.fileSha256) throw new Error("Frozen attribution receipt file changed");
    return json(file.path);
  }));
  const laterReference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmt5x4hfa0000ewyy0jj6zuuk");
  if(!laterReference||laterReference.sourceFiles.length!==3)throw Error("Later attribution repair reference missing");
  const [laterManifest,laterApproval,laterReceipt]=await Promise.all(laterReference.sourceFiles.map(async(file:{path:string;fileSha256:string})=>{
    if(sha256Text(await readFile(file.path,"utf8"))!==file.fileSha256)throw Error("Later immutable chain file changed");
    return json(file.path);
  }));
  const dependencies = [...new Set([CHRONOLOGY, PRIOR, EXECUTION, LEDGER, SEED, BATCH_MANIFEST, SEED_SPEC, SEED_BATCH_MANIFEST, ORIGINAL, "scripts/generate-portfolio-fund-attribution.ts", "scripts/portfolio-fund-attribution/schema.ts",
    task.artifacts.proposal.location, task.artifacts.approval.location, RECEIPT, "prisma/seed-data/approved-portco-after-images.json",
    task.artifacts.taskSnapshot.location,
    `${AES_TASK_ROOT}/attempt-1/locked-v2-production-snapshot.json`,
    `${AES_TASK_ROOT}/attempt-1/locked-v2-context.json`,
    ...AES_SOURCES.filter(source => source.reused).map(source => source.path),
    ...AES_PACKET.map(([file]) => `${AES_TASK_ROOT}/${file}`), ...reference.sourceFiles.map((file: { path: string }) => file.path), ...laterReference.sourceFiles.map((file:{path:string})=>file.path)])];
  const boundFiles = await Promise.all(dependencies.sort().map(async path => {
    const bytes = await readFile(path);
    if (!execFileSync("git", ["show", `${BASE}:${path}`], { maxBuffer: 40_000_000 }).equals(bytes)) throw new Error(`Protected input changed: ${path}`);
    return { path, sha256: createHash("sha256").update(bytes).digest("hex") };
  }));
  const sourceCapture = await json(`${AES_SOURCE_ROOT}/source-capture.json`);
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
      const image = await loadPrismaCompanyImage(tx, AES.companyId);
      const owners = await tx.ownershipPeriod.findMany({ where: { companyId: AES.companyId }, select: { id: true, companyId: true, fundId: true, organizationId: true,
        fundAttribution: true, attributedFundName: true, attributionConfidence: true, attributionRationale: true, isActive: true }, orderBy: { id: "asc" } });
      const redirects = await tx.companyRedirect.findMany({ where: { OR: [{ companyId: AES.companyId }, { retiredId: AES.companyId }] }, orderBy: { retiredId: "asc" } });
      const retiredCompany = null; // No retired identity exists in this canonical scope.
      return { images: [image], owners, redirects, retiredCompany };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await db.$disconnect(); }
  const production = JSON.parse(JSON.stringify(captured));
  const original = await json(ORIGINAL);
  if (original.stateSha256 !== "cf46b32ffaa2f00cc3a40f873431c08abcc15c14d0f9922fbc8c2dcbf52eb8cd"
    || sha256Canonical(original.production) !== original.stateSha256) throw Error("Original full snapshot changed");
  const originalCompanies = original.production.companies.filter((row: {id: string}) => row.id === AES.companyId);
  if (originalCompanies.length !== 1) throw Error("Original company collision");
  const originalState = { company: originalCompanies[0], redirects: original.production.redirects.filter((row: {companyId: string; retiredId: string}) => row.companyId === AES.companyId || row.retiredId === AES.companyId) };
  const batchReceipt = await json(RECEIPT);
  const proof = proveAesFieldAuthority({ chronology, priorAuthority: await json(PRIOR), seed: await json(SEED),
    proposal: await json(task.artifacts.proposal.location), approval: await json(task.artifacts.approval.location), receipt: batchReceipt.members[2].receipt,
    batchManifest: await json(BATCH_MANIFEST), batchReceipt, seedSpec: await json(SEED_SPEC), seedBatchManifest: await json(SEED_BATCH_MANIFEST),
    attribution: { manifest, approval: attributionApproval, receipt: attributionReceipt }, laterAttribution:{manifest:laterManifest,approval:laterApproval,receipt:laterReceipt}, production,
    originalState, sourceCapture, filingReview: await json(`${OUT}/filing-review-v2.json`),redactions:await json(`${OUT}/source-redactions.json`),
    seedOverlay: await json("prisma/seed-data/approved-portco-after-images.json"),
    packet: await Promise.all(AES_PACKET.map(async ([file]) => ({ file, bytes: await readFile(`${AES_TASK_ROOT}/${file}`) }))),
    rendered: await Promise.all(AES_RENDERED.map(async row => ({file:row.file,bytes:await readFile(`${OUT}/${row.file}`)}))),
    sources: await Promise.all(AES_SOURCES.map(async source => ({ id: source.id, bytes: await readFile(source.path) }))) });
  const report = { ...proof, baseCommit: BASE, executionManifestSha256: execution.manifestSha256, ledgerSha256: ledger.ledgerSha256,
    productionSnapshotSha256: sha256Canonical(production), dependencies: boundFiles, sourceCaptureSha256: sha256Canonical(sourceCapture) };
  const reportSha256 = sha256Canonical(report), checkedAt = new Date().toISOString();
  const canonicalDeployment = { id: deployment.id, url: deployment.url, gitSource: deployment.gitSource, aliases: deployment.alias, readyState: deployment.readyState, target: deployment.target };
  const write = (file: string, value: unknown) => writeFile(`${OUT}/${file}`, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  if (phase === "prepare") {
    await write("production-snapshot.json", { capturedAt: checkedAt, target, production, stateSha256: report.productionSnapshotSha256 });
    await write("authority-v2.json", { ...report, reportSha256 });
    await write("capture-verification-v2.json", { checkedAt, canonicalDeployment, target, reportSha256, passed: true, databaseWrites: 0, completionAllowed: false });
  } else {
    const frozen = await json(`${OUT}/authority-v2.json`);
    if (frozen.reportSha256 !== reportSha256 || hashWithoutField(frozen, "reportSha256") !== reportSha256) throw new Error("Frozen authority/dependency/production proof changed");
    await write("production-release-verification.json", { checkedAt, expectedSha, canonicalDeployment, target, reportSha256,
      productionSnapshotSha256: report.productionSnapshotSha256, passed: true, databaseWrites: 0, completionAllowed: false });
  }
  console.log(JSON.stringify({ phase, reportSha256, reviewedFields: proof.candidateFieldsAdjudicated, remaining: proof.remainingCandidateFields, databaseWrites: 0 }));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Authority checkpoint failed"); process.exitCode = 1; });
