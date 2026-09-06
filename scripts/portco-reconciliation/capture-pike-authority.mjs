/** Capture only the already-cited SEC exhibit; never overwrite evidence. */
import { access, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const OUT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/pike";
const url = "https://www.sec.gov/Archives/edgar/data/1319229/000110465925086822/tm2524750d1_ex99-1.htm";
if (process.cwd() !== ROOT) throw new Error("Explicit permitted worktree required");
for (const file of ["sec-fund-vi.html", "source-capture.json"]) {
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
if (sha256 !== "93edb4077aca3a1c3bf91de53eabc91adf32e27658894d969f074e8917926d43" || bytes.length !== 11522
  || historicalSha256 !== "99e9a0944d5e97cfff0a2284ad81d09b7dfeb8d41befe0a38994ff0569e84b6d" || Buffer.byteLength(historical) !== 11162) throw new Error("Reviewed raw response or historical exhibit changed; no evidence written");
await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/sec-fund-vi.html`, bytes, { flag: "wx" });
await writeFile(`${OUT}/source-capture.json`, `${JSON.stringify({ capturedAt: new Date().toISOString(), sources: [{
  id: "sec-fund-vi", requestedUrl: url, finalUrl: response.url, httpStatus: response.status, contentType: response.headers.get("content-type"),
  path: `${OUT}/sec-fund-vi.html`, byteLength: bytes.length, sha256, historicalWithoutDeliveryScriptsSha256: historicalSha256,
  scope: "Existing September 3, 2025 SEC-filed issuer release; About TransMontaigne expressly connects the exact operating platform and TLP Finance to Fund VI. Not new company or exit research."
}], databaseWrites: 0 }, null, 2)}\n`, { flag: "wx" });
console.log(JSON.stringify({ sha256, byteLength: bytes.length, databaseWrites: 0 }));
