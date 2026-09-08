/** Admit newly identified, already-applied source companies without rewriting the original register. */
import { z } from "zod";
import { bytesHash } from "./files";
import { fileSchema, inventoryExtensionSchema, seal, verifyHash, verifyProgress } from "./batch";
import { verifyExecutionManifest, executionTerminalStatuses } from "../portco-reconciliation/execution-control";
import { verifyBatchExecutionLedger } from "../portco-reconciliation/batch-control";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "../portco-reconciliation/artifacts";
import { sha256Canonical } from "../portco-reconciliation/hash";

type Read = (path: string, expected?: string) => Buffer;
const scopeSchema = z.object({ artifactType: z.literal("PORTCO_GLOBAL_SOURCE_SCOPE_DIAGNOSTIC"),
  inputs: z.array(fileSchema), companies: z.array(z.object({ companyId: z.string(), name: z.string(),
    completedSourceBindings: z.array(z.object({ sequence: z.number(), sourceChainIndex: z.number().int().nonnegative() })),
    diagnosticIssueIndices: z.array(z.number().int().nonnegative()) })) });
const artifactRef = z.object({ location: z.string(), sha256: z.string() });
const lineageSchema = z.object({ sourceManifest: fileSchema, sourceChains: z.array(z.object({ taskId: z.string(),
  proposal: artifactRef, approval: artifactRef, receipt: artifactRef, localReceipt: artifactRef })) });
const diagnosticSchema = z.object({ issues: z.array(z.object({ companyId: z.string(), name: z.string(),
  reviewStatus: z.string(), type: z.string() })) });
const SOURCE = "audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json";
const LEDGER = "audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json";

export function extendInventory(progress: unknown, input: unknown, seedManifestSha256: string, readBytes: Read) {
  const p = verifyProgress(progress), request = verifyHash(inventoryExtensionSchema.parse(input), "extensionSha256");
  if (p.active || p.names.some(n => n.status === "REMAINING" || (n.status === "PARKED" && !n.parkedReview))
    || request.beforeProgressSha256 !== p.progressSha256 || request.seedManifestSha256 !== seedManifestSha256
    || p.inventoryExtensionHistory?.some(r => r.extensionSha256 === request.extensionSha256)) throw Error("Active, unfinished, duplicate or stale inventory extension");
  const read = (ref: z.infer<typeof fileSchema>) => {
    const bytes = readBytes(ref.path, ref.sha256);
    if (bytesHash(bytes) !== ref.sha256) throw Error("Changed inventory evidence bytes");
    return JSON.parse(bytes.toString());
  };
  if (request.sourceManifest.path !== SOURCE || request.sourceLedger.path !== LEDGER) throw Error("Authoritative source paths required");
  const source = verifyExecutionManifest(read(request.sourceManifest)), ledger = verifyBatchExecutionLedger(read(request.sourceLedger));
  if (source.activeTaskId || ledger.activeBatchId || source.tasks.some(t => !executionTerminalStatuses.includes(t.status))) throw Error("Terminal idle source boundary required");
  const scope = scopeSchema.parse(read(request.scope));
  const sources = scope.inputs.filter(f => f.path === SOURCE);
  const lineages = scope.inputs.filter(f => f.path.endsWith("/lineage-checks-v4.json"));
  const diagnostics = scope.inputs.filter(f => f.path.endsWith("/ownership-diagnostic.json"));
  if (sources.length !== 1 || sources[0].sha256 !== request.sourceManifest.sha256 || lineages.length !== 1 || diagnostics.length !== 1) throw Error("Incomplete inventory inputs");
  const lineage = lineageSchema.parse(read(lineages[0])), diagnostic = diagnosticSchema.parse(read(diagnostics[0]));
  if (sha256Canonical(lineage.sourceManifest) !== sha256Canonical(request.sourceManifest)) throw Error("Stale lineage source");
  const chains = lineage.sourceChains.map(c => {
    const task = source.tasks.find(t => t.taskId === c.taskId);
    const proposal = verifyProposal(JSON.parse(readBytes(c.proposal.location).toString()));
    const approval = verifyApproval(JSON.parse(readBytes(c.approval.location).toString()), proposal);
    const [path, fragment] = c.localReceipt.location.split("#");
    let value = read({ path, sha256: c.localReceipt.sha256 });
    for (const key of (fragment ?? "").split("/").filter(Boolean)) value = value[key];
    const receipt = verifyApplyReceipt(value, proposal, approval);
    if (!task || task.status !== "COMPLETED" || proposal.taskId !== task.taskId || receipt.taskIndex !== task.sequence || !proposal.afterImage
      || proposal.proposalSha256 !== task.artifacts.proposal?.sha256 || approval.approvalSha256 !== task.artifacts.approval?.sha256
      || receipt.receiptSha256 !== task.artifacts.applyReceipt?.sha256) throw Error("Invalid completed source chain");
    return { companyId: receipt.companyId, name: proposal.afterImage.name, sequence: task.sequence };
  });
  const completedIds = source.tasks.filter(t => t.status === "COMPLETED").map(t => t.taskId).sort();
  if (sha256Canonical(lineage.sourceChains.map(c => c.taskId).sort()) !== sha256Canonical(completedIds)) throw Error("Incomplete or duplicate source-chain coverage");
  const groups = new Map<string, { companyId: string; name: string; completedSourceBindings: { sequence: number; sourceChainIndex: number }[]; diagnosticIssueIndices: number[] }>();
  diagnostic.issues.forEach((issue, index) => {
    if (issue.reviewStatus !== "OUTSIDE_REVIEW_REGISTER" || issue.type !== "ownerField") return;
    if (!groups.has(issue.companyId)) groups.set(issue.companyId, { companyId: issue.companyId, name: issue.name,
      completedSourceBindings: chains.flatMap((c, i) => c.companyId === issue.companyId ? [{ sequence: c.sequence, sourceChainIndex: i }] : []), diagnosticIssueIndices: [] });
    groups.get(issue.companyId)!.diagnosticIssueIndices.push(index);
  });
  const byId = <T extends {companyId: string}>(rows: T[]) => [...rows].sort((a,b) => a.companyId.localeCompare(b.companyId));
  if (sha256Canonical(byId([...groups.values()])) !== sha256Canonical(byId(scope.companies))) throw Error("Incomplete or altered scope mapping");
  const eligible = [...groups.values()].filter(c => c.completedSourceBindings.length && !p.names.some(n => n.companyId === c.companyId)).map(c => {
    if (c.completedSourceBindings.length !== 1) throw Error("Non-unique completed source identity");
    const original = chains[c.completedSourceBindings[0].sourceChainIndex];
    if (original.name !== c.name) throw Error("Canonical name drift requires separate adjudication");
    return original;
  }).sort((a,b) => a.sequence - b.sequence).slice(0,10);
  if (sha256Canonical(request.additions) !== sha256Canonical(eligible)) throw Error("Complete earliest eligible source group required");
  const { progressSha256: _old, ...content } = p;
  return verifyProgress(seal({ ...content, names: [...p.names, ...eligible.map(n => ({ ...n,
    reviewedEvidence: [request.scope], status: "REMAINING", issue: null, completion: null }))],
    inventoryExtensionHistory: [...(p.inventoryExtensionHistory ?? []), request] }, "progressSha256"));
}
