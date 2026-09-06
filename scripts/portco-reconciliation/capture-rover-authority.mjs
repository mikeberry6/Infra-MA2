/** Capture only the already-cited SEC exhibit; never overwrite evidence. */
import { access, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const OUT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/rover";
const url = "https://www.sec.gov/Archives/edgar/data/2031750/000162828026029840/aci-20260428.htm";
if (process.cwd() !== ROOT) throw new Error("Explicit permitted worktree required");
for (const file of ["aci-20260428.html", "source-capture.json"]) {
  try { await access(`${OUT}/${file}`); } catch (error) { if (error.code === "ENOENT") continue; throw error; }
  throw new Error(`Frozen output exists: ${file}`);
}
const response = await fetch(url, { headers: { "User-Agent": "Infra-MA2 source-verification research" }, signal: AbortSignal.timeout(60000) });
if (response.status !== 200 || response.url !== url) throw new Error(`Exact SEC source unavailable: HTTP ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
const sha256 = createHash("sha256").update(bytes).digest("hex");
// The reviewed response adds SEC delivery scripts. Preserve every raw byte;
// independently prove removal of only script/noscript elements exactly restores
// the historical August exhibit hash, not merely a similar text extraction.
const historical = bytes.toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
const historicalSha256 = createHash("sha256").update(historical).digest("hex");
if (sha256 !== "af35a1c89973eff0df796d83695d1e8118195c68ba38f91f98a71851c5799a44" || bytes.length !== 36177
  || historicalSha256 !== "40bc64b55a39e864f746e171234f0d95d01be9f8eccbdce030cfdefda270350e" || Buffer.byteLength(historical) !== 35817) throw new Error("Reviewed raw response or historical exhibit changed; no evidence written");
await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/aci-20260428.html`, bytes, { flag: "wx" });
await writeFile(`${OUT}/source-capture.json`, `${JSON.stringify({ capturedAt: new Date().toISOString(), sources: [{
  id: "aci-20260428", requestedUrl: url, finalUrl: response.url, httpStatus: response.status, contentType: response.headers.get("content-type"),
  path: `${OUT}/aci-20260428.html`, byteLength: bytes.length, sha256, historicalWithoutDeliveryScriptsSha256: historicalSha256,
  scope: "Existing ACI Form 8-K, April 28 event / May 4, 2026 signature, Item 2.03. Full filing reviewed; disclosed fund acquisition of canonical BCP Renaissance vehicles. 49.9% is a holding-company interest, not 32.4% of operating Rover. No new company research or loan-economics finding."
}], databaseWrites: 0 }, null, 2)}\n`, { flag: "wx" });
console.log(JSON.stringify({ sha256, byteLength: bytes.length, databaseWrites: 0 }));
