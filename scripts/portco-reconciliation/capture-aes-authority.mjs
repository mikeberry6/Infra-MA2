/** Exclusive retrieval of existing task154 sources; no database access. */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes";
const task = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0154-the-aes-corporation/attempt-1";
if (process.cwd() !== root || execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== "d0eec989f20d6e73ff1877c7f4757a5d1adb0af1") throw Error("Wrong protected base/worktree");
const bytes = await readFile(`${task}/source-verification.json`);
if (createHash("sha256").update(bytes).digest("hex") !== "81d4d594256fa855cc61ebaaf5ba4d3d047f14e6cbb934f00b02f52c22238b6a") throw Error("Historical source scope changed");
const historical = JSON.parse(bytes.toString("utf8"));
const proposal = JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/proposals/0154-the-aes-corporation-v2/proposal.json", "utf8"));
const ids = ["agreement", "vote", "q2-note", "ny-review", "annual", "certificate"];
if (historical.sources.length !== ids.length || proposal.proposalSha256 !== "8a442316a28ed122c37919a8acb6aee1df60a79cc696a71e4ad7cd21f079c2ad") throw Error("Canonical scope changed");
const sources = historical.sources.map((s, i) => ({ id: ids[i], url: s.url, file: `${ids[i]}.html`, historicalSha256: s.contentSha256, historicalHttpStatus: s.httpStatus }));
const additionalIds = ["company", "announcement", "syndicated-announcement"];
const additions = proposal.afterImage.citations.filter(c => !sources.some(s => s.url === c.url));
if (additions.length !== additionalIds.length) throw Error("Additional canonical source scope changed");
for (const [i, source] of additions.entries()) sources.push({ id: additionalIds[i], url: source.url, file: `${additionalIds[i]}.html`, historicalSha256: null, historicalHttpStatus: null });
await mkdir(out, { recursive: true });
for (const file of ["source-capture.json", ...sources.map(s => s.file)]) {
  try { await access(`${out}/${file}`); } catch (e) { if (e.code === "ENOENT") continue; throw e; }
  throw Error(`Frozen output exists: ${file}`);
}
const responses = await Promise.all(sources.map(async s => {
  let body = Buffer.alloc(0), httpStatus = null, finalUrl = s.url, mediaType = null, retrievalError = null;
  try {
    const r = await fetch(s.url, { signal: AbortSignal.timeout(45000), headers: { "User-Agent": "Infra-MA2 attribution audit (mikeberry6 on GitHub)" } });
    body = Buffer.from(await r.arrayBuffer()); httpStatus = r.status; finalUrl = r.url; mediaType = r.headers.get("content-type");
  } catch (e) { retrievalError = e instanceof Error ? `${e.name}: ${e.message}` : "Retrieval failed"; }
  const sha256 = createHash("sha256").update(body).digest("hex");
  return { id: s.id, requestedUrl: s.url, finalUrl, httpStatus, mediaType, bytes: body.length, sha256, historicalSha256: s.historicalSha256, historicalHttpStatus: s.historicalHttpStatus, matchesHistoricalBytes: s.historicalSha256 === null ? null : sha256 === s.historicalSha256, retrievalError, path: `${out}/${s.file}`, body };
}));
for (const r of responses) await writeFile(r.path, r.body, { flag: "wx" });
const result = { capturedAt: new Date().toISOString(), method: "ORDINARY_HTTP_RAW_RESPONSE", sources: responses.map(({ body, ...r }) => r), databaseWrites: 0 };
await writeFile(`${out}/source-capture.json`, JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify(result));
