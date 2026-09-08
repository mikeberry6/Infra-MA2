/** Optional stronger sidecar gate for ten-name batches, inside the existing serializable apply. */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Prisma } from "../../src/generated/prisma/client";
import { type AttributionApplyManifest, verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { verifyExecutionManifest } from "../portco-reconciliation/execution-control";
import { verifyBatchExecutionLedger } from "../portco-reconciliation/batch-control";
import { checkPacketFiles } from "./files";
import { compileBatch, verifyProgress } from "./batch";
import { observeCompanies, observePublishedFundNames } from "./snapshot";
import { EXECUTION_PATH, LEDGER_PATH, PROGRESS_PATH, SEED_PATH } from "./inventory";

export function assertCompleteState(actual: unknown, expected: unknown, label: string) {
  if (sha256Canonical(actual) !== sha256Canonical(expected)) throw Error(`Ten-name ${label} mismatch; freeze, do not retry apply`);
}
export function loadCompletionGuard(manifestPath: string, manifest: AttributionApplyManifest) {
  const dir = dirname(manifestPath), sidecar = join(dir, "completion-batch.json");
  const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
  const progress = existsSync(PROGRESS_PATH) ? verifyProgress(json(PROGRESS_PATH)) : null;
  if (progress?.active && progress.active.batchSha256 !== manifest.ledgerSha256) throw Error("Another ten-name release is active");
  if (!existsSync(sidecar)) {
    if (progress?.active) throw Error("Active ten-name release requires committed sidecar");
    return null; // Older independent attribution workflows keep their existing safeguards.
  }
  if (!progress?.active || progress.active.batchSha256 !== manifest.ledgerSha256 || progress.completedBatchIds.includes(progress.active.batchId)) throw Error("Inactive or consumed ten-name release");
  const { batch, files } = checkPacketFiles(process.cwd(), json(sidecar));
  const execution = verifyExecutionManifest(json(EXECUTION_PATH)), ledger = verifyBatchExecutionLedger(json(LEDGER_PATH));
  if (execution.activeTaskId || ledger.activeBatchId || batch.executionManifestSha256 !== execution.manifestSha256 || batch.sourceLedgerSha256 !== ledger.ledgerSha256) throw Error("Terminal source boundary changed");
  const compiled = compileBatch({ batch, files, snapshot: json(join(dir, "completion-before.json")), seed: json(join(dir, "completion-seed-before.json")) });
  if (compiled.manifest?.manifestSha256 !== manifest.manifestSha256) throw Error("Apply manifest differs from reviewed ten-name decisions");
  if (verifySeedManifest(json(SEED_PATH)).manifestSha256 !== compiled.seed.manifestSha256) throw Error("Published complete seed differs");
  const expected = { companies: compiled.snapshot.companies, funds: compiled.snapshot.funds };
  const projected = { companies: compiled.projected, funds: compiled.snapshot.funds };
  return async (tx: Prisma.TransactionClient, phase: "before" | "after") => {
    if (phase === "before") {
      const applied = await tx.pipelineRun.findFirst({ where: { pipeline: "portfolio-fund-attribution", status: "SUCCESS",
        metadata: { path: ["manifestSha256"], equals: manifest.manifestSha256 } }, select: { id: true } });
      if (applied) throw Error("Ten-name transaction already applied; recover receipt, never replay");
    }
    const actual = await observeCompanies(tx, compiled.batch.decisions.map(d => d.companyId), compiled.snapshot.funds.map(f => f.fundName));
    assertCompleteState(actual, phase === "before" ? expected : projected, phase);
    if (compiled.snapshot.publishedFundNames) {
      assertCompleteState(await observePublishedFundNames(tx), compiled.snapshot.publishedFundNames, `${phase} published fund catalog`);
    }
  };
}
