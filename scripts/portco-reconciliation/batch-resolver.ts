import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import {
  verifyBatchTerminalDecision,
  verifyPortCoBatchManifest,
  type PortCoBatchManifest,
  type ResolvedBatchMember,
} from "./batch-artifacts";
import { verifyApproval, verifyDatasetSnapshot, verifyProposal } from "./artifacts";
import { digestsEqual } from "./hash";
import { assertTaskSnapshotFresh, verifyExecutionTaskSnapshot } from "./execution-control";

function safePath(repositoryRoot: string, artifactPath: string): string {
  const root = resolve(repositoryRoot);
  const absolute = resolve(root, artifactPath);
  const normalized = relative(root, absolute);
  if (!normalized || normalized.startsWith("..") || normalized.includes("\\")) {
    throw new Error(`Batch artifact is outside the repository: ${artifactPath}`);
  }
  return absolute;
}

async function json(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8"));
}

async function byteSha256(path: string): Promise<string> {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function verifyTerminalLineage(repositoryRoot: string, decision: ReturnType<typeof verifyBatchTerminalDecision>): Promise<void> {
  for (const [label, reference] of [
    ["task snapshot", decision.taskSnapshot],
    ["research decision", decision.researchDecision],
    ["source verification", decision.sourceVerification],
  ] as const) {
    const observed = await byteSha256(safePath(repositoryRoot, reference.path));
    if (!digestsEqual(observed, reference.sha256)) {
      throw new Error(`Terminal ${label} byte hash mismatch for ${decision.taskId}`);
    }
  }
}

export async function resolveBatchMembers(
  repositoryRoot: string,
  manifestInput: PortCoBatchManifest,
): Promise<ResolvedBatchMember[]> {
  const manifest = verifyPortCoBatchManifest(manifestInput);
  const members: ResolvedBatchMember[] = [];
  for (const member of manifest.members) {
    if (member.kind === "TERMINAL") {
      const decision = verifyBatchTerminalDecision(
        await json(safePath(repositoryRoot, member.decision.path)),
      );
      if (!digestsEqual(decision.decisionSha256, member.decision.sha256)) {
        throw new Error(`Terminal decision hash mismatch for ${member.taskId}`);
      }
      await verifyTerminalLineage(repositoryRoot, decision);
      members.push({ kind: "TERMINAL", decision, path: member.decision.path });
      continue;
    }
    const proposal = verifyProposal(await json(safePath(repositoryRoot, member.proposal.path)));
    const approval = verifyApproval(
      await json(safePath(repositoryRoot, member.authorization.path)),
      proposal,
    );
    const snapshot = verifyDatasetSnapshot(
      await json(safePath(repositoryRoot, member.productionSnapshot.path)),
    );
    const lockedTaskSnapshot = verifyExecutionTaskSnapshot(
      await json(safePath(repositoryRoot, member.taskSnapshot.path)),
    );
    const observedTaskSnapshot = verifyExecutionTaskSnapshot(
      await json(safePath(repositoryRoot, member.observedTaskSnapshot.path)),
    );
    assertTaskSnapshotFresh(lockedTaskSnapshot, observedTaskSnapshot);
    if (snapshot.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
      throw new Error(`Batch member ${member.taskId} does not reference a production snapshot`);
    }
    if (!digestsEqual(proposal.proposalSha256, member.proposal.sha256)
      || !digestsEqual(approval.approvalSha256, member.authorization.sha256)
      || !digestsEqual(snapshot.snapshotSha256, member.productionSnapshot.sha256)
      || !digestsEqual(lockedTaskSnapshot.taskSnapshotSha256, member.taskSnapshot.sha256)
      || !digestsEqual(observedTaskSnapshot.taskSnapshotSha256, member.observedTaskSnapshot.sha256)
      || !digestsEqual(await byteSha256(safePath(repositoryRoot, member.researchDecision.path)), member.researchDecision.sha256)
      || !digestsEqual(await byteSha256(safePath(repositoryRoot, member.sourceVerification.path)), member.sourceVerification.sha256)) {
      throw new Error(`Batch artifact reference hash mismatch for ${member.taskId}`);
    }
    members.push({
      kind: "MUTATION",
      proposal,
      approval,
      productionSnapshot: snapshot,
      lockedTaskSnapshot,
      observedTaskSnapshot,
      paths: {
        proposal: member.proposal.path,
        authorization: member.authorization.path,
        productionSnapshot: member.productionSnapshot.path,
        taskSnapshot: member.taskSnapshot.path,
        observedTaskSnapshot: member.observedTaskSnapshot.path,
        researchDecision: member.researchDecision.path,
        sourceVerification: member.sourceVerification.path,
      },
      byteHashes: {
        researchDecision: member.researchDecision.sha256,
        sourceVerification: member.sourceVerification.sha256,
      },
      supersededTaskIds: member.supersededTaskIds,
    });
  }
  return members;
}

export async function verifyBatchRootArtifacts(
  repositoryRoot: string,
  manifestInput: PortCoBatchManifest,
): Promise<void> {
  const manifest = verifyPortCoBatchManifest(manifestInput);
  const executionManifest = await json(safePath(repositoryRoot, manifest.sourceExecutionManifest.path));
  const normalization = await json(safePath(repositoryRoot, manifest.researchHashNormalization.path));
  if (!executionManifest || typeof executionManifest !== "object"
    || (executionManifest as { manifestSha256?: unknown }).manifestSha256 !== manifest.sourceExecutionManifest.sha256) {
    throw new Error("Batch source execution manifest hash mismatch");
  }
  if (!normalization || typeof normalization !== "object"
    || (normalization as { normalizationSha256?: unknown }).normalizationSha256 !== manifest.researchHashNormalization.sha256) {
    throw new Error("Batch research hash-normalization artifact mismatch");
  }
}
