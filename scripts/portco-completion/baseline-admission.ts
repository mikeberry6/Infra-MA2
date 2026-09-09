/** Explicit baseline-only admission. No source tasks, seed or database writes. */
import { z } from "zod";
import { baselineAdmissionSchema, baselineInputsSchema, seal, verifyHash, verifyProgress } from "./batch";
import { bytesHash } from "./files";
import { verifyBaselineIdentities } from "./baseline-provenance";
import { verifyExecutionManifest } from "../portco-reconciliation/execution-control";
import { verifyBatchExecutionLedger } from "../portco-reconciliation/batch-control";
import { canonicalLedgerSchema } from "../portco-reconciliation/schema";
import { sha256Canonical } from "../portco-reconciliation/hash";

type Read = (path: string, expected?: string) => Buffer;
const base = "audits/portco-reconciliation/2026-08-03/";
const paths = { sourceManifest: base + "execution-v1/manifest.json",
  sourceLedger: "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json",
  originalLedger: base + "ledger-run-v4-repo-only/ledger.json",
  productionDataset: base + "snapshots/production-snapshot.json", seedDataset: base + "snapshots/seed-snapshot.json" };
const diagnosticSchema = z.object({ artifactType: z.literal("PORTCO_CLOSEOUT_OWNERSHIP_DIAGNOSTIC"),
  issues: z.array(z.object({ type: z.string(), companyId: z.string(), name: z.string(), reviewStatus: z.string() })) });
// Immutable historical candidate scope published on protected main 53a5838739d48d6dec6bc2693c522efc93b6efd5.
// This anchor prevents a rehashed partial diagnostic from silently skipping earlier names.
// It is NOT proof of current ownership: fresh complete images and sources remain mandatory.
export const baselineDiagnostic = {
  path: "audits/portco-reconciliation/2026-09-08/completion/closeout-v1/ownership-diagnostic.json",
  sha256: "0e89d5ee202c0c5fd73ca38f142cc84fbbcab0a98504ce4394fa8e2dfba735b4",
};
export const baselineScope = {
  path: "audits/portco-reconciliation/2026-09-08/completion/closeout-v1/baseline-scope-bindings.json",
  sha256: "ed94a5ba7b05ce9b25d2d45ba108d93f27abda4d25904f42bb9e8da56b2b3549",
};

export function baselineInputRefs(request: z.infer<typeof baselineAdmissionSchema>) {
  const { sourceManifest, sourceLedger, originalLedger, productionDataset, seedDataset, diagnostic, scope } = request;
  return { sourceManifest, sourceLedger, originalLedger, productionDataset, seedDataset, diagnostic, scope };
}

export function baselineCandidates(input: unknown, readBytes: Read) {
  const refs = baselineInputsSchema.parse(input);
  if (refs.diagnostic.path !== baselineDiagnostic.path || refs.diagnostic.sha256 !== baselineDiagnostic.sha256) throw Error("Exact published baseline scope required");
  if (refs.scope.path !== baselineScope.path || refs.scope.sha256 !== baselineScope.sha256) throw Error("Exact published baseline scope required");
  for (const [key, path] of Object.entries(paths)) if (refs[key as keyof typeof paths].path !== path) throw Error("Authoritative baseline paths required");
  const read = (ref: {path: string; sha256: string}) => {
    const bytes = readBytes(ref.path, ref.sha256);
    if (bytesHash(bytes) !== ref.sha256) throw Error("Changed baseline evidence bytes");
    return JSON.parse(bytes.toString());
  };
  const source = verifyExecutionManifest(read(refs.sourceManifest)), sourceLedger = verifyBatchExecutionLedger(read(refs.sourceLedger));
  if (sourceLedger.activeBatchId) throw Error("Idle source batch ledger required");
  const ledger = canonicalLedgerSchema.parse(read(refs.originalLedger)), diagnostic = diagnosticSchema.parse(read(refs.diagnostic));
  const companies = new Map<string, {companyId: string; name: string}>();
  for (const issue of diagnostic.issues) {
    if (issue.type !== "ownerField" || issue.reviewStatus !== "OUTSIDE_REVIEW_REGISTER") continue;
    const previous = companies.get(issue.companyId);
    if (previous && previous.name !== issue.name) throw Error("Conflicting diagnostic identity");
    companies.set(issue.companyId, {companyId: issue.companyId, name: issue.name});
  }
  // The older global diagnostic also includes names already handled before this scope was frozen.
  // Admit only the explicitly adjudicated remaining identity scope; do not broaden dispositions.
  const scope = z.object({ companies: z.array(z.object({ companyId: z.string(), name: z.string() })).min(1) }).parse(read(refs.scope));
  const targets = scope.companies.map(target => {
    if (companies.get(target.companyId)?.name !== target.name) throw Error("Baseline scope diagnostic identity differs");
    return target;
  });
  const identities = verifyBaselineIdentities({ source, ledger, production: read(refs.productionDataset), seed: read(refs.seedDataset), targets });
  if (ledger.censusRows.some((r,i) => i > 0 && r.managerIndex < ledger.censusRows[i-1].managerIndex)) throw Error("Original census source order changed");
  const sourceMax = Math.max(...source.tasks.map(t => t.sequence));
  return identities.map(identity => ({ companyId: identity.companyId, name: identity.name,
    // These are explicit baseline ordering slots, not original execution task numbers.
    sequence: sourceMax + 1 + identity.order[2] + (identity.order[0] ? ledger.censusRows.length : 0),
    order: identity.order, identitySha256: sha256Canonical(identity) }));
}

export function admitBaselines(progress: unknown, input: unknown, seedManifestSha256: string, readBytes: Read) {
  const p = verifyProgress(progress), request = verifyHash(baselineAdmissionSchema.parse(input), "admissionSha256");
  if (p.active || p.names.some(n => n.status === "REMAINING" || (n.status === "PARKED" && !n.parkedReview))
    || p.progressSha256 !== request.beforeProgressSha256 || request.seedManifestSha256 !== seedManifestSha256
    || p.baselineAdmissionHistory?.some(r => r.admissionSha256 === request.admissionSha256)) throw Error("Active, unfinished, duplicate or stale baseline admission");
  const refs = baselineInputRefs(request);
  const eligible = baselineCandidates(refs, readBytes).filter(r => !p.names.some(n => n.companyId === r.companyId)).slice(0, 10);
  if (sha256Canonical(eligible) !== sha256Canonical(request.additions) || eligible.some(r => p.names.some(n => n.sequence === r.sequence))) throw Error("Complete earliest baseline group and distinct ordering slots required");
  const { progressSha256: _old, ...content } = p;
  return verifyProgress(seal({ ...content, baselineAdmissionHistory: [...(p.baselineAdmissionHistory ?? []), request],
    names: [...p.names, ...eligible.map(r => ({ companyId: r.companyId, name: r.name, sequence: r.sequence,
      baseline: {admissionSha256: request.admissionSha256, identitySha256: r.identitySha256, order: r.order},
      reviewedEvidence: [], status: "REMAINING", issue: null, completion: null }))] }, "progressSha256"));
}
