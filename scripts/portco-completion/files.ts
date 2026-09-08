import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { type Batch, verifyBatch } from "./batch";
import { checkActualSeedIdentity } from "./seed-identity-files";

export const bytesHash = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");
export function localFile(root: string, path: string) {
  if (isAbsolute(path) || path.split(/[\\/]/).includes("..")) throw Error("Repository-relative evidence required");
  const resolved = realpathSync(resolve(root, path));
  if (relative(realpathSync(root), resolved).startsWith("..")) throw Error("Evidence symlink leaves repository");
  return resolved;
}

/** Report only the file and detector, never the matching secret. Not a substitute for GitHub scanning. */
export function scanPublication(bytes: Buffer | string): string[] {
  const value = bytes.toString();
  return [
    ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ["credential-url", /(?:postgres(?:ql)?|https?):\/\/[^\s/:<>"']+:[^\s/@<>"']+@/i],
    ["github-token", /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/],
    ["mapbox-token", /(?:pk|sk)\.eyJ[A-Za-z0-9_.-]{30,}/],
    ["bearer-token", /(?:Bearer\s+|(?:api[_-]?key|access[_-]?token|secret|password)\s*[=:]\s*["']?)[A-Za-z0-9_./+-]{24,}/i],
  ].filter(([, re]) => (re as RegExp).test(value)).map(([name]) => String(name));
}
/** Evidence already published at the pinned base is read, not republished in this release. */
export function isUnchangedPublishedFile(root: string, base: string, path: string, bytes: Buffer) {
  if (!/^[a-f0-9]{40}$/.test(base)) return false;
  try { return execFileSync("git", ["show", `${base}:${path}`], { cwd: root, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 80_000_000 }).equals(bytes); }
  catch { return false; }
}
export function verifyRedaction(input: { original: Buffer; published: Buffer; originalSha256: string; publishedSha256: string;
  replacements: { literal: string; replacement: string; count: number }[] }) {
  if (bytesHash(input.original) !== input.originalSha256 || bytesHash(input.published) !== input.publishedSha256) throw Error("Redaction hashes differ");
  let text = input.original.toString();
  for (const item of input.replacements) {
    if (!item.literal || item.replacement !== "[REDACTED]" || item.count < 1 || text.split(item.literal).length - 1 !== item.count) throw Error("Redaction count/scope differs");
    text = text.split(item.literal).join(item.replacement);
  }
  if (text !== input.published.toString() || scanPublication(input.published).length) throw Error("Unrecorded redaction or remaining secret");
  // Callers publish only these hashes/counts; never the literal original token.
  return { originalSha256: input.originalSha256, publishedSha256: input.publishedSha256,
    redactionCount: input.replacements.reduce((sum, row) => sum + row.count, 0) };
}
export function checkPacketFiles(root: string, value: unknown): { batch: Batch; files: Map<string, string> } {
  const batch = verifyBatch(value), files = new Map<string, string>();
  const references = [...batch.dependencies, ...batch.decisions.flatMap(d => [...d.evidence, ...d.owners.flatMap(o => o.sources)])];
  for (const reference of references) {
    const bytes = readFileSync(localFile(root, reference.path));
    if (bytesHash(bytes) !== reference.sha256) throw Error(`Stale evidence: ${reference.path}`);
    const findings = scanPublication(bytes);
    if (findings.length && !isUnchangedPublishedFile(root, batch.baseCommit, reference.path, bytes)) throw Error(`Unsafe new publication copy: ${reference.path} (${findings.join(", ")})`);
    files.set(reference.path, reference.sha256);
  }
  if (batch.seedIdentity) checkActualSeedIdentity(root, batch.seedIdentity, files);
  return { batch, files };
}
