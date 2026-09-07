/** Preserve the failed Node response and capture the same public PDF with ordinary curl. */
import { access, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-07/attribution-field-authority/saavi";
if (process.cwd() !== root) throw Error("Wrong worktree");
for (const file of ["cofece-recovered.pdf", "cofece-curl-capture.json"]) {
  try { await access(`${out}/${file}`); } catch (e) { if (e.code === "ENOENT") continue; throw e; }
  throw Error(`Frozen output exists: ${file}`);
}
const initial = JSON.parse(await readFile(`${out}/source-capture.json`, "utf8"));
const prior = initial.sources.find(s => s.id === "cofece");
if (!prior || prior.bytes !== 0 || prior.httpStatus !== null || !prior.retrievalError) throw Error("No failed raw response to recover");
const marker = "\n__SAAVI_HTTP_METADATA__";
const result = execFileSync("curl", ["--silent", "--show-error", "--location", "--connect-timeout", "10", "--max-time", "45", "--write-out", `${marker}%{http_code}\t%{url_effective}\t%{content_type}`, prior.requestedUrl], { maxBuffer: 5000000 });
const boundary = result.lastIndexOf(Buffer.from(marker));
if (boundary < 0) throw Error("HTTP metadata missing");
const body = result.subarray(0, boundary);
const [status, finalUrl, mediaType] = result.subarray(boundary + marker.length).toString("utf8").split("\t");
if (status !== "200" || finalUrl !== prior.requestedUrl || !body.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw Error("Unexpected PDF recovery response");
const capture = { capturedAt: new Date().toISOString(), id: "cofece-recovered", method: "ORDINARY_CURL_RAW_RESPONSE", requestedUrl: prior.requestedUrl, finalUrl, httpStatus: 200, mediaType, bytes: body.length, sha256: createHash("sha256").update(body).digest("hex"), historicalSha256: prior.historicalSha256, matchesHistoricalBytes: createHash("sha256").update(body).digest("hex") === prior.historicalSha256, path: `${out}/cofece-recovered.pdf`, preservedFailedCapture: `${out}/source-capture.json`, databaseWrites: 0 };
await writeFile(capture.path, body, { flag: "wx" });
await writeFile(`${out}/cofece-curl-capture.json`, JSON.stringify(capture, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify(capture));
