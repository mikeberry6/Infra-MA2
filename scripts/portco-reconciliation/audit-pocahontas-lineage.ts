/** One-off READ ONLY audit with exclusive evidence outputs. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { baseCompanies, companies } from "../../prisma/seed-data/companies";
import { loadPrismaCompanyImage } from "./prisma-company-image";
import { provePocahontasLineage, POCA_ID, POCA_OLD, POCA_CURRENT, POCA_INTRO } from "./pocahontas-lineage";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { databaseTargetIdentity } from "./snapshot";
import { sha256Canonical, sha256Text, hashWithoutField } from "./hash";

const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const BASE = "69cb3414e17e2864484bfca5db2d302899bb5053";
const OUT = "audits/portco-reconciliation/2026-09-06/pocahontas-lineage";
const CHRONOLOGY = "audits/portco-reconciliation/2026-09-06/attribution-chronology";
const OVERLAYS = "prisma/seed-data/approved-portco-after-images.json";
const EXECUTION = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const LEDGER = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
const PROPOSAL = "audits/portco-reconciliation/2026-08-03/proposals/0357-pocahontas-parkway-v5/proposal.json";
const APPROVAL = "audits/portco-reconciliation/2026-08-03/approvals/0357-pocahontas-parkway-v5.json";
const BATCH = "audits/portco-reconciliation/2026-08-23/batches/batch-0356-0360-v1";
const json = async (path: string) => JSON.parse(await readFile(path, "utf8"));
const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 40_000_000 }).trim();
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);

async function main() {
  const option = (key: string) => process.argv.find((arg) => arg.startsWith(`--${key}=`))?.slice(key.length + 3);
  const phase = option("phase"), expectedSha = option("expected-sha");
  if (process.cwd() !== ROOT || !["prepare", "production-release"].includes(phase ?? "") || !expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error("Explicit permitted worktree, phase and full SHA required");
  if (phase === "prepare" && (expectedSha !== BASE || git("rev-parse", "HEAD") !== BASE || git("rev-parse", "origin/main") !== BASE)) throw new Error("Protected base changed");
  const execution = verifyExecutionManifest(await json(EXECUTION));
  const ledger = verifyBatchExecutionLedger(await json(LEDGER));
  if (execution.activeTaskId || execution.manifestSha256 !== "e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07"
    || ledger.activeBatchId || ledger.ledgerSha256 !== "9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c") throw new Error("Idle terminal boundary changed");
  const task = execution.tasks.find((row) => row.sequence === 357);
  if (!task || task.status !== "COMPLETED" || task.artifacts.proposal?.sha256 !== POCA_CURRENT || task.artifacts.proposal.location !== PROPOSAL) throw new Error("Current source-task binding differs");
  const overlays = await json(OVERLAYS);
  const original = JSON.parse(git("show", `${POCA_INTRO}:${OVERLAYS}`));
  const parent = JSON.parse(git("show", `${POCA_INTRO}^:${OVERLAYS}`));
  execFileSync("git", ["merge-base", "--is-ancestor", POCA_INTRO, BASE]);
  const select = (rows: Array<{ proposalSha256: string }>) => rows.filter((row) => [POCA_OLD, POCA_CURRENT].includes(row.proposalSha256));
  if (select(parent).length || select(original).length !== 2 || !same(select(original), select(overlays))) throw new Error("Protected introduction/unchanged overlay proof differs");
  const oldProposalHistory = git("log", "--all", "--format=%H", `-S${POCA_OLD}`, "--", "audits/portco-reconciliation/2026-08-03/proposals", "audits/portco-reconciliation/2026-08-03/approvals");
  if (oldProposalHistory) throw new Error("Historical old proposal/approval discovered; review instead of asserting absence");
  const dependencies = [];
  for (const path of [EXECUTION, LEDGER, OVERLAYS, PROPOSAL, APPROVAL, `${BATCH}/batch-manifest-v7.json`, `${BATCH}/production-apply/batch-apply-receipt.json`,
    "prisma/seed-data/companies.ts", "prisma/seed-data/approved-portco-after-images.ts", "prisma/seed-data/chicago-seed-state-persistence.ts",
    "scripts/portco-reconciliation/pocahontas-lineage.ts", "scripts/portco-reconciliation/artifacts.ts", "scripts/portco-reconciliation/apply-plan.ts", "scripts/portco-reconciliation/batch-artifacts.ts",
    `${CHRONOLOGY}/chronology.json`, `${CHRONOLOGY}/production-snapshot.json`]) {
    const bytes = await readFile(path, "utf8");
    if (path !== "scripts/portco-reconciliation/pocahontas-lineage.ts"
      && bytes !== execFileSync("git", ["show", `${BASE}:${path}`], { encoding: "utf8", maxBuffer: 40_000_000 })) throw new Error(`Protected dependency differs: ${path}`);
    dependencies.push({ path, sha256: sha256Text(bytes) });
  }
  const vercel = (...args: string[]) => JSON.parse(execFileSync("npx", ["vercel", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 8_000_000 }));
  const alias = vercel("inspect", "https://infra-ma-2.vercel.app", "--json");
  const deployment = vercel("api", `/v13/deployments/${alias.id}`, "--method", "GET");
  if (deployment.readyState !== "READY" || deployment.target !== "production" || deployment.gitSource?.type !== "github"
    || deployment.gitSource?.ref !== "main" || deployment.gitSource.sha !== expectedSha || deployment.meta?.githubCommitSha !== expectedSha
    || !deployment.alias.includes("infra-ma-2.vercel.app")) throw new Error("Canonical protected-main deployment differs");
  const target = databaseTargetIdentity({ connectionString: process.env.DATABASE_URL!, expectedHost: "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech", expectedDatabase: "neondb", label: "production-readonly" });
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  let captured;
  try {
    captured = await db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      const image = await loadPrismaCompanyImage(tx, POCA_ID);
      if (!image) throw new Error("Canonical Pocahontas disappeared");
      const revisions = await tx.companyRevision.findMany({ where: { companyId: POCA_ID }, orderBy: [{ appliedAt: "asc" }, { id: "asc" }] });
      const redirects = await tx.companyRedirect.findMany({ orderBy: { retiredId: "asc" } });
      const ownershipAttribution = await tx.ownershipPeriod.findMany({ where: { companyId: POCA_ID }, select: { id: true, fundId: true, fundAttribution: true, attributedFundName: true, attributionConfidence: true, attributionRationale: true }, orderBy: { id: "asc" } });
      return { image, revisions, redirects, ownershipAttribution };
    }, { isolationLevel: "RepeatableRead", timeout: 90000 });
  } finally { await db.$disconnect(); }
  const production = JSON.parse(JSON.stringify(captured));
  const prior = await json(`${CHRONOLOGY}/production-snapshot.json`);
  const priorReport = await json(`${CHRONOLOGY}/chronology.json`);
  if (hashWithoutField(priorReport, "reportSha256") !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || sha256Canonical(prior.production) !== priorReport.productionSnapshotSha256
    || !same(production.redirects, prior.production.redirects)
    || !same(production.revisions, prior.production.revisions.filter((row: { companyId: string }) => row.companyId === POCA_ID))) throw new Error("Frozen history/redirect state changed");
  const proof = provePocahontasLineage({ baseCompanies, evaluatedCompanies: companies, overlays,
    proposal: await json(PROPOSAL), approval: await json(APPROVAL), batchManifest: await json(`${BATCH}/batch-manifest-v7.json`),
    batchReceipt: await json(`${BATCH}/production-apply/batch-apply-receipt.json`), production });
  const report = { schemaVersion: 1, baseCommit: BASE, executionManifestSha256: execution.manifestSha256, ledgerSha256: ledger.ledgerSha256,
    protectedIntroduction: { commit: POCA_INTRO, parent: git("rev-parse", `${POCA_INTRO}^`), oldAndCurrentFirstPresentTogether: true, exactEntries: select(original), scopedOldProposalHistoryMatches: [] },
    ...proof, productionSnapshotSha256: sha256Canonical(production), dependencies };
  const reportSha256 = sha256Canonical(report);
  const canonicalDeployment = { id: deployment.id, url: deployment.url, gitSource: deployment.gitSource, aliases: deployment.alias, readyState: deployment.readyState, target: deployment.target };
  await mkdir(OUT, { recursive: true });
  const write = (file: string, value: unknown) => writeFile(`${OUT}/${file}`, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  if (phase === "prepare") {
    await write("production-snapshot.json", { capturedAt: new Date().toISOString(), target, production, stateSha256: report.productionSnapshotSha256 });
    await write("lineage-proof.json", { ...report, reportSha256 });
    await write("capture-verification.json", { capturedAt: new Date().toISOString(), canonicalDeployment, target, reportSha256, databaseWrites: 0, completionAllowed: false });
  } else {
    const old = await json(`${OUT}/lineage-proof.json`);
    if (hashWithoutField(old, "reportSha256") !== reportSha256 || old.reportSha256 !== reportSha256) throw new Error("Frozen proof/production/dependencies changed");
    await write("production-release-verification.json", { checkedAt: new Date().toISOString(), expectedSha, canonicalDeployment, target, reportSha256,
      productionSnapshotSha256: report.productionSnapshotSha256, passed: true, productionUnchanged: true, databaseWrites: 0, completionAllowed: false });
  }
  console.log(JSON.stringify({ phase, reportSha256, semanticImageSha256: proof.currentSemanticImageSha256, orderingFootprint: proof.orderingFootprint, databaseWrites: 0, completionAllowed: false }));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Pocahontas lineage audit failed"); process.exitCode = 1; });
