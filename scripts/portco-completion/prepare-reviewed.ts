/** Shared migration adapter for existing field-authority reports. Small JSON overrides only. */
import { z } from "zod";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { activate, compileBatch, nextNames, seal, verifyBatch, verifyHash, verifyProgress, verifySnapshot, type Decision } from "./batch";
import { attributionSnapshot } from "./batch";
import { reviewedInventory, CHRONOLOGY_PATH, EXECUTION_PATH, LEDGER_PATH, SEED_PATH, PROGRESS_PATH } from "./inventory";
import { bytesHash, localFile, scanPublication, checkPacketFiles, isUnchangedPublishedFile } from "./files";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyExecutionManifest } from "../portco-reconciliation/execution-control";
import { verifyBatchExecutionLedger } from "../portco-reconciliation/batch-control";
import { capture } from "./snapshot";

const configSchema = z.strictObject({ batchId: z.string().min(1), asOfDate: z.string(),
  sourceFiles: z.array(z.string()).min(1),
  overrides: z.array(z.strictObject({ companyId: z.string(), rationale: z.string().optional(), parkedIssue: z.string().optional() })) });
const rowSchema = z.object({ companyId: z.string(), ownerId: z.string(), recordId: z.string(),
  current: z.record(z.string(), z.unknown()), recommended: z.record(z.string(), z.unknown()).optional(),
  fieldDecisions: z.array(z.record(z.string(), z.unknown())), additionalFieldDecisions: z.array(z.record(z.string(), z.unknown())).optional() }).passthrough();

async function main() {
  if (process.cwd() !== "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair") throw Error("Explicit permitted worktree required");
  const option = (key: string) => { const value = process.argv.find(v => v.startsWith(`--${key}=`))?.slice(key.length + 3); if (!value) throw Error(`--${key} required`); return value; };
  const configPath = option("config"), output = option("output"), baseCommit = option("expected-sha");
  const read = (p: string) => JSON.parse(readFileSync(localFile(process.cwd(), p), "utf8"));
  const config = configSchema.parse(read(configPath));
  const reuseSha = process.argv.find(v => v.startsWith("--reuse-snapshot-sha="))?.split("=")[1];
  const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" }).trim();
  if (git("rev-parse", "origin/main") !== baseCommit) throw Error("Fresh protected main required");
  // Refuse an output directory before opening a production connection.
  try { await access(output); if (!reuseSha) throw Error("Prepared directory already exists; recover its snapshot offline, never recapture"); }
  catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
  let progress;
  try { progress = verifyProgress(JSON.parse(await readFile(PROGRESS_PATH, "utf8"))); }
  catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; progress = reviewedInventory(); }
  const selected = nextNames(progress), seed = verifySeedManifest(read(SEED_PATH));
  if (selected.some(n => !n.reviewedEvidence.length)) throw Error("This adapter only reuses completed authority reports; use decisionSchema for new reviews");
  const execution = verifyExecutionManifest(read(EXECUTION_PATH)), ledger = verifyBatchExecutionLedger(read(LEDGER_PATH));
  if (execution.activeTaskId || ledger.activeBatchId) throw Error("Source boundary must remain idle");
  const refs = new Map<string, string>();
  const bind = (path: string, expected?: string) => {
    const bytes = readFileSync(localFile(process.cwd(), path)), sha256 = bytesHash(bytes);
    if (expected && expected !== sha256) throw Error(`Stale bound file: ${path}`);
    if (scanPublication(bytes).length && !isUnchangedPublishedFile(process.cwd(), baseCommit, path, bytes)) throw Error(`New publication scan failed: ${path}`);
    refs.set(path, sha256); return { path, sha256 };
  };
  [EXECUTION_PATH, LEDGER_PATH, CHRONOLOGY_PATH, configPath].forEach(p => bind(p));
  const sourceByHash = new Map(config.sourceFiles.map(p => { const ref = bind(p); return [ref.sha256, ref]; }));
  const packets = selected.map(name => {
    if (name.reviewedEvidence.length !== 1) throw Error(`Multiple authority packets need explicit combination: ${name.name}`);
    const ref = name.reviewedEvidence[0], report = read(ref.path); verifyHash(report, "reportSha256"); bind(ref.path, ref.sha256);
    for (const d of report.dependencies as { path: string; sha256: string }[]) {
      // Seed gets a frozen before copy, not a dependency on the later patched live seed path.
      if (d.path === SEED_PATH) { if (bytesHash(readFileSync(SEED_PATH)) !== d.sha256) throw Error("Reviewed seed changed; re-adjudicate dependency"); }
      else bind(d.path, d.sha256);
    }
    const oldPath = join(dirname(ref.path), "production-snapshot.json"); bind(oldPath);
    const old = read(oldPath);
    if (sha256Canonical(old.production) !== old.stateSha256 || old.stateSha256 !== report.productionSnapshotSha256) throw Error("Authority snapshot differs");
    const rows = z.array(rowSchema).parse(report.rows).filter(r => r.companyId === name.companyId);
    if (!rows.length) throw Error("Reviewed company rows missing");
    const override = config.overrides.find(o => o.companyId === name.companyId);
    if (!override?.parkedIssue) for (const row of rows) {
      for (const field of [...row.fieldDecisions, ...(row.additionalFieldDecisions ?? [])]) {
        const hash = String(field.primarySourceSha256 ?? field.sourcePdfSha256 ?? "");
        if (!sourceByHash.has(hash)) throw Error(`Missing reused source bytes for ${name.name}`);
      }
      const existing = seed.records.find(r => r.recordId === row.recordId);
      if (!existing) throw Error(`Existing seed record missing: ${row.recordId}`);
    }
    return { name, ref, report, old, rows, override };
  });
  // All local packet/dependency/source checks have passed. Exactly one scoped READ ONLY capture.
  const snapshot = reuseSha ? verifySnapshot(read(join(output, "completion-before.json"))) : await capture(selected.map(n => n.companyId), [], baseCommit);
  if (snapshot.baseCommit !== baseCommit || (reuseSha && snapshot.snapshotSha256 !== reuseSha)) throw Error("Frozen snapshot recovery binding differs");
  await mkdir(output, { recursive: true });
  const write = async (name: string, value: unknown) => writeFile(join(output, name), `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  if (!reuseSha) {
    await write("completion-before.json", snapshot);
    await write("completion-seed-before.json", seed);
  } else if (verifySeedManifest(read(join(output, "completion-seed-before.json"))).manifestSha256 !== seed.manifestSha256) throw Error("Frozen seed changed during recovery");
  bind(join(output, "completion-seed-before.json"));
  const decisions: Decision[] = packets.map(({ name, ref, report, old, rows, override }) => {
    const fresh = snapshot.companies.find(c => c.image.id === name.companyId)!;
    const prior = old.production.images.find((i: { id: string }) => i.id === name.companyId);
    if (sha256Canonical(prior) !== sha256Canonical(fresh.image)) throw Error(`Changed canonical company dependency: ${name.name}; retained snapshot, review offline`);
    for (const r of rows) if (sha256Canonical(r.current) !== sha256Canonical(fresh.owners.find(o => o.id === r.ownerId)?.state)) throw Error(`Changed attribution before-image: ${name.name}`);
    const issue = override?.parkedIssue ?? null;
    const owners: Decision["owners"] = issue ? [] : rows.map(row => {
      const original = fresh.owners.find(o => o.id === row.ownerId)!, record = seed.records.find(r => r.recordId === row.recordId)!;
      const desired = { ...original.state, ...(row.recommended ?? {}) };
      const fields = [...row.fieldDecisions, ...(row.additionalFieldDecisions ?? [])];
      for (const f of fields) {
        const key = f.field === "fundName" ? "linkedFundName" : String(f.field);
        if (Object.hasOwn(f, "recommended")) (desired as Record<string, unknown>)[key] = f.recommended;
        else if (Object.hasOwn(f, "productionValue")) (desired as Record<string, unknown>)[key] = f.productionValue;
      }
      if (override?.rationale) desired.attributionRationale = override.rationale;
      if (!desired.attributionRationale) throw Error(`Missing exact supported rationale: ${name.name}`);
      const sourceUrls = [...new Set(fields.map(f => String(f.primarySourceUrl ?? f.sourceUrl ?? report.primarySourceUrl)))];
      const sourceHashes = [...new Set(fields.map(f => String(f.primarySourceSha256 ?? f.sourcePdfSha256 ?? report.sourcePdfSha256)))];
      if (sourceUrls.length !== 1 || sourceHashes.length !== 1) throw Error(`Owner needs a single reviewed primary: ${name.name}`);
      const source = sourceByHash.get(sourceHashes[0])!;
      return { ownerId: row.ownerId, seedRecordId: row.recordId, expectedSeedSha256: sha256Canonical(record), expectedOwnerSha256: sha256Canonical(original),
        desired: { ...desired, attributionRationale: desired.attributionRationale },
        productionChange: sha256Canonical(original.state) === sha256Canonical(desired) ? "NONE" : "SUBSTANTIVE_ATTRIBUTION",
        reason: override?.rationale ? "Issuer-confirmed existing fund link contradicts stale no-fund-match rationale. Preserve all economic and ownership facts." : String(report.interpretation ?? "Persist the exact reviewed attribution decision; preserve documented exceptions."),
        sources: [{ ...source, url: sourceUrls[0], primary: true }] };
    });
    const productionChanges = owners.some(o => o.productionChange !== "NONE");
    const seedChanges = owners.some(o => { const record = seed.records.find(r => r.recordId === o.seedRecordId)!;
      const { linkedFundName, ...metadata } = o.desired;
      return sha256Canonical(record) !== sha256Canonical({ ...record, ...metadata, targetLinkedFundName: linkedFundName, evidenceUrls: o.sources.map(s => s.url) }); });
    return { companyId: name.companyId, name: name.name, sequence: name.sequence, classification: issue ? "PARKED" : productionChanges ? "ATTRIBUTION_CORRECTION" : seedChanges ? "SEED_ONLY" : "NO_CHANGE",
      expectedCompanySha256: sha256Canonical(fresh), evidence: [ref], owners, issue,
      preservedOwnerIds: fresh.owners.filter(o => !owners.some(p => p.ownerId === o.id)).map(o => o.id) };
  });
  const batch = verifyBatch(seal({ schemaVersion: 1, artifactType: "PORTCO_COMPLETION_BATCH", batchId: config.batchId, baseCommit, asOfDate: config.asOfDate,
    executionManifestSha256: execution.manifestSha256, sourceLedgerSha256: ledger.ledgerSha256, progressSha256: progress.progressSha256,
    seedManifestSha256: seed.manifestSha256, snapshotSha256: snapshot.snapshotSha256, targetFingerprint: snapshot.targetFingerprint,
    dependencies: [...refs].map(([path, sha256]) => ({ path, sha256 })).sort((a,b) => a.path.localeCompare(b.path)), decisions }, "batchSha256"));
  const checked = checkPacketFiles(process.cwd(), batch), compiled = compileBatch({ batch, snapshot, seed, files: checked.files });
  await write("completion-batch.json", batch);
  await write("production-snapshot.json", attributionSnapshot(snapshot, batch.asOfDate));
  await write("expected-after-images.json", compiled.projected);
  await write("seed-manifest.json", compiled.seed);
  if (compiled.manifest) await write("apply-manifest.json", compiled.manifest);
  await write("progress-before.json", progress);
  await write("progress-active.json", activate(progress, batch));
  console.log(JSON.stringify({ names: decisions.map(d => ({ name: d.name, classification: d.classification })), mutations: compiled.manifest?.expectedMutationCount ?? 0,
    seedManifestSha256: compiled.seed.manifestSha256, databaseWrites: 0 }, null, 2));
}
main().catch(e => { console.error(e instanceof Error ? e.message : "Preparation failed"); process.exitCode = 1; });
