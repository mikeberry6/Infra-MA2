/** Historical audit tests must reproduce frozen inputs, not tomorrow's corrected seed. */
import { readFileSync as read } from "node:fs";
import { bytesHash } from "./files";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";

const SEED = "prisma/seed-data/ownership-attributions.manifest.json";
const FROZEN = "audits/portfolio-fund-attribution/2026-09-08/scoped/portco-completion-001/completion-seed-before.json";
const BYTES = "c3b8d505c6cd8c9c1db16a01b93c0cb8f3d394b74919afa3048d458dc4c3467f";
export function readHistoricalAuditFileSync(path: string): Buffer;
export function readHistoricalAuditFileSync(path: string, encoding: "utf8"): string;
export function readHistoricalAuditFileSync(path: string, encoding?: "utf8"): Buffer | string {
  const historicalTest = path === "scripts/portco-reconciliation/rio-grande-field-authority.test.ts";
  const bytes = read(path === SEED ? FROZEN : historicalTest ? FROZEN.replace("completion-seed-before.json", "rio-grande-test-before.txt") : path);
  if (historicalTest && bytesHash(bytes) !== "62596182315c7c2b116a866c1412871d4a72bbb6eb18e07a8f885bc8c93b628a") throw Error("Frozen historical test fixture corrupted");
  if (path === SEED) {
    if (bytesHash(bytes) !== BYTES || verifySeedManifest(JSON.parse(bytes.toString())).manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257") throw Error("Frozen historical seed fixture corrupted");
  }
  return encoding ? bytes.toString(encoding) : bytes;
}
