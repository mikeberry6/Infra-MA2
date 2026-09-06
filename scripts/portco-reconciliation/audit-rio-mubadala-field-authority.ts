/** Frozen, target-pinned read-only capture and exact protected-main release proof. */
import { access, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { RIO_GRANDE_COMPANY, RIO_GRANDE_PROPOSAL, RIO_GRANDE_SOURCES } from "./rio-grande-field-authority";
import { proveRioMubadalaFieldAuthority } from "./rio-mubadala-field-authority";
import { loadPrismaCompanyImage } from "./prisma-company-image";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { databaseTargetIdentity } from "./snapshot";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const BASE = "feb490099729ad72045bd4af9bfcd5cee41c120b";
const OUT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/rio-mubadala";
const EVIDENCE = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/rio-grande-lng";
const CHRONOLOGY = "audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json";
const ORIGINAL = "audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json";
const PRIOR = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/databank/authority.json";
const EXECUTION = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const LEDGER = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
const SEED = "prisma/seed-data/ownership-attributions.manifest.json";
const BATCH = "audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3";
const TASK = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0151-rio-grande-lng/attempt-1";
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
  const batchEntry = ledger.batches.find(row => row.batchId === "batch-0146-0151-v3");
  if (batchEntry?.state !== "COMPLETED" || batchEntry.batchManifest?.path !== `${BATCH}/batch-manifest.json`
    || batchEntry.batchManifest.sha256 !== "5e52499d1a5ceef9a15a29f4ca0bf229f085f321f0c68903c6298970b90f4940") throw new Error("Completed batch reference changed");
  const task = execution.tasks.find(row => row.sequence === 151);
  if (!task || task.status !== "COMPLETED" || task.artifacts.proposal?.sha256 !== RIO_GRANDE_PROPOSAL || !task.artifacts.approval
    || task.artifacts.applyReceipt?.location !== `${BATCH}/production-apply/batch-apply-receipt.json#members/4/receipt`) throw new Error("Canonical task binding changed");
  const chronology = await json(CHRONOLOGY), reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
  if (!reference || reference.sourceFiles.length !== 3) throw new Error("Original attribution chain missing");
  const [manifest, approval, receipt] = await Promise.all(reference.sourceFiles.map(async (file: { path: string; fileSha256: string }) => {
    if (sha256Text(await readFile(file.path, "utf8")) !== file.fileSha256) throw new Error("Frozen attribution receipt file changed");
    return json(file.path);
  }));
  const repairReference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmt5tkox30000ddyy1mp0d3yd");
  if (!repairReference || repairReference.sourceFiles.length !== 3) throw new Error("Superseding repair reference missing");
  const [repairManifest, repairApproval, repairReceipt] = await Promise.all(repairReference.sourceFiles.map(async (file: { path: string; fileSha256: string }) => {
    if (sha256Text(await readFile(file.path, "utf8")) !== file.fileSha256) throw new Error("Frozen repair receipt file changed");
    return json(file.path);
  }));
  const dependencies = [CHRONOLOGY, ORIGINAL, PRIOR, EXECUTION, LEDGER, SEED, "prisma/seed-data/funds.manifest.json", "scripts/generate-portfolio-fund-attribution.ts",
    "scripts/portfolio-fund-attribution/schema.ts", task.artifacts.proposal.location, task.artifacts.approval.location,
    batchEntry.batchManifest.path, `${BATCH}/production-apply/batch-apply-receipt.json`, `${BATCH}/seed-attribution-reconciliation-spec-v2.json`,
    `${TASK}/research-decision.json`, `${TASK}/chatgpt-accepted-response.txt`, `${TASK}/source-verification.json`, `${TASK}/chatgpt-transcript.txt`, `${TASK}/chatgpt-attestation.json`, `${TASK}/chatgpt-response-validation.json`, `${TASK}/research-prompt.md`, `${TASK}/locked-v2-task-snapshot.json`,
    ...reference.sourceFiles.map((file: { path: string }) => file.path), ...repairReference.sourceFiles.map((file: { path: string }) => file.path),
    ...["authority.json", "production-snapshot.json", "capture-verification.json", "source-capture.json", "original-filing.pdf", "original-filing.txt", "doe.pdf", "doe.txt", "total.html", "xrg-browser.txt"].map(file => `${EVIDENCE}/${file}`),
    ...["rio-grande-field-authority.ts", "rio-grande-field-authority.test.ts", "audit-rio-grande-field-authority.ts", "capture-rio-grande-authority.mjs"].map(file => `scripts/portco-reconciliation/${file}`)];
  const boundFiles = await Promise.all(dependencies.sort().map(async path => {
    const bytes = await readFile(path);
    if (!execFileSync("git", ["show", `${BASE}:${path}`], { maxBuffer: 40_000_000 }).equals(bytes)) throw new Error(`Protected input changed: ${path}`);
    return { path, sha256: createHash("sha256").update(bytes).digest("hex") };
  }));
  const sourceCapture = await json(`${EVIDENCE}/source-capture.json`);
  if (sourceCapture.sources.length !== 4) throw new Error("Direct source capture cardinality changed");
  for (const source of RIO_GRANDE_SOURCES) {
    const records = sourceCapture.sources.filter((row: { id: string }) => row.id === source.id);
    if (records.length !== 1 || records[0].requestedUrl !== source.url || records[0].finalUrl !== source.url || records[0].httpStatus !== (source.id === "xrg" ? null : 200)
      || records[0].path !== `${EVIDENCE}/${source.file}` || records[0].sha256 !== source.sha256) throw new Error("Direct source capture identity changed");
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
      const image = await loadPrismaCompanyImage(tx, RIO_GRANDE_COMPANY);
      const owners = await tx.ownershipPeriod.findMany({ where: { companyId: RIO_GRANDE_COMPANY }, select: { id: true, companyId: true, fundId: true,
        fundAttribution: true, attributedFundName: true, attributionConfidence: true, attributionRationale: true, isActive: true }, orderBy: { id: "asc" } });
      const funds = await tx.fund.findMany({ where: { id: { in: owners.flatMap(g => g.fundId ? [g.fundId] : []) } }, select: {
        id: true, fundName: true, status: true, manager: { select: { name: true } } }, orderBy: { id: "asc" } });
      const redirects = await tx.companyRedirect.findMany({ where: { OR: [{ companyId: RIO_GRANDE_COMPANY }, { retiredId: RIO_GRANDE_COMPANY }] }, orderBy: { retiredId: "asc" } });
      return { image, owners, funds, redirects };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await db.$disconnect(); }
  const production = JSON.parse(JSON.stringify(captured));
  const proof = proveRioMubadalaFieldAuthority({ rioAuthority: await json(`${EVIDENCE}/authority.json`), chronology, priorAuthority: await json(PRIOR), seed: await json(SEED), seedSpec: await json(`${BATCH}/seed-attribution-reconciliation-spec-v2.json`),
    proposal: await json(task.artifacts.proposal.location), approval: await json(task.artifacts.approval.location), batch: await json(batchEntry.batchManifest.path), batchReceipt: await json(`${BATCH}/production-apply/batch-apply-receipt.json`),
    attribution: { manifest, approval, receipt }, repair: { manifest: repairManifest, approval: repairApproval, receipt: repairReceipt },
    sourceVerification: await json(`${TASK}/source-verification.json`), originalFilingText: await readFile(`${EVIDENCE}/original-filing.txt`, "utf8"), research: await json(`${TASK}/research-decision.json`), originalSnapshot: await json(ORIGINAL), production,
    sources: await Promise.all(RIO_GRANDE_SOURCES.map(async source => ({ id: source.id, bytes: await readFile(`${EVIDENCE}/${source.file}`) }))), filingText: await readFile(`${EVIDENCE}/doe.txt`, "utf8") });
  const report = { ...proof, baseCommit: BASE, executionManifestSha256: execution.manifestSha256, ledgerSha256: ledger.ledgerSha256,
    productionSnapshotSha256: sha256Canonical(production), dependencies: boundFiles, sourceCaptureSha256: sha256Canonical(sourceCapture),
    sourceCaptureReusedWithoutNetwork: true, visualReview: { originalFilingOneBasedPages: [6], method: "Reused the existing complete page6 rendering and visually inspected body and footnotes for this separate Mubadala judgment. MIC is a sovereign investor's wholly owned subsidiary; separate NextDecade Parent ownership is not substituted for project ownership. No new PDF capture or company research." } };
  const reportSha256 = sha256Canonical(report), checkedAt = new Date().toISOString();
  const canonicalDeployment = { id: deployment.id, url: deployment.url, gitSource: deployment.gitSource, aliases: deployment.alias, readyState: deployment.readyState, target: deployment.target };
  const write = (file: string, value: unknown) => writeFile(`${OUT}/${file}`, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  if (phase === "prepare") {
    await write("production-snapshot.json", { capturedAt: checkedAt, target, production, stateSha256: report.productionSnapshotSha256 });
    await write("authority.json", { ...report, reportSha256 });
    await write("capture-verification.json", { checkedAt, canonicalDeployment, target, reportSha256, passed: true, databaseWrites: 0, completionAllowed: false });
  } else {
    const frozen = await json(`${OUT}/authority.json`);
    if (frozen.reportSha256 !== reportSha256 || hashWithoutField(frozen, "reportSha256") !== reportSha256) throw new Error("Frozen field authority/dependency/production proof changed");
    await write("production-release-verification.json", { checkedAt, expectedSha, canonicalDeployment, target, reportSha256,
      productionSnapshotSha256: report.productionSnapshotSha256, passed: true, databaseWrites: 0, completionAllowed: false });
  }
  console.log(JSON.stringify({ phase, reportSha256, reviewedFieldsOutsideOriginal603: proof.additionalFieldsOutsideOriginal603, remaining: proof.remainingCandidateFields, databaseWrites: 0 }));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Authority checkpoint failed"); process.exitCode = 1; });
