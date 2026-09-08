/** One-time migration of existing reviewed packets; no new company research. */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { bytesHash } from "./files";
import { seal, verifyHash, verifyProgress } from "./batch";
import { verifyExecutionManifest } from "../portco-reconciliation/execution-control";

export const CHRONOLOGY_PATH = "audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json";
export const EXECUTION_PATH = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
export const LEDGER_PATH = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";
export const SEED_PATH = "prisma/seed-data/ownership-attributions.manifest.json";
export const PROGRESS_PATH = "audits/portco-reconciliation/2026-09-08/completion/progress.json";
export function reviewedInventory() {
  const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
  const execution = verifyExecutionManifest(read(EXECUTION_PATH));
  const chronology = read(CHRONOLOGY_PATH);
  verifyHash(chronology, "reportSha256");
  const allFiles = execFileSync("git", ["ls-files", "audits/portco-reconciliation/*/attribution-field-authority/*/authority*.json"], { encoding: "utf8" }).trim().split("\n");
  const files = allFiles.filter(path => !path.endsWith("/authority.json") || !allFiles.includes(path.replace("/authority.json", "/authority-v2.json")));
  const reports = files.map(path => { const value = read(path); verifyHash(value, "reportSha256"); return { path, sha256: bytesHash(readFileSync(path)), value }; });
  const companies = new Map<string, { name: string; sequence: number }>();
  for (const candidate of chronology.candidates as { companyId: string; name: string; proposalSha256: string }[]) {
    const matches = execution.tasks.filter(t => t.artifacts.proposal?.sha256 === candidate.proposalSha256 && t.status === "COMPLETED");
    if (matches.length !== 1) throw Error(`Canonical completed source task not unique: ${candidate.companyId}`);
    const previous = companies.get(candidate.companyId);
    if (previous && (previous.name !== candidate.name || previous.sequence !== matches[0].sequence)) throw Error("Conflicting canonical company identity");
    companies.set(candidate.companyId, { name: candidate.name, sequence: matches[0].sequence });
  }
  const names = [...companies].map(([companyId, value]) => ({ companyId, ...value,
    reviewedEvidence: reports.filter(r => r.value.companyId === companyId || r.value.rows?.some((row: { companyId: string }) => row.companyId === companyId))
      .map(({ path, sha256 }) => ({ path, sha256 })), status: "REMAINING", issue: null, completion: null })).sort((a, b) => a.sequence - b.sequence);
  return verifyProgress(seal({ schemaVersion: 1, artifactType: "PORTCO_COMPLETION_PROGRESS",
    universe: { path: CHRONOLOGY_PATH, sha256: bytesHash(readFileSync(CHRONOLOGY_PATH)) }, names,
    active: null, completedBatchIds: [], consumedReceiptHashes: [] }, "progressSha256"));
}
