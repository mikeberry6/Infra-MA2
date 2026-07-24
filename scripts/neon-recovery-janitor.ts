#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { withServerTask } from "../src/lib/server-log.ts";
import {
  NeonRecoveryClient,
  RECOVERY_ANNOTATION_KIND,
  RECOVERY_ANNOTATION_RUN,
  RECOVERY_ANNOTATION_SHA,
  assertCreatedBranchGuard,
  assertDistinctNeonProjectIds,
  assertRedactedRecoveryEvidence,
  type CreatedBranchGuard,
  type NeonBranchDetail,
} from "./neon-recovery-control.ts";

const RECOVERY_BRANCH_PREFIX = "infrasight-recovery-";
const RECOVERY_BRANCH_NAME =
  /^infrasight-recovery-(source|restored)-([1-9][0-9]*)-([1-9][0-9]*)$/;
const SAFE_RESOURCE_ID = /^[a-z0-9-]{1,60}$/;
const SAFE_RELEASE_SHA = /^[0-9a-f]{40}$/;
const STALE_AFTER_MS = 2 * 60 * 60 * 1_000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1_000;
const DEFAULT_OUTPUT = "tmp/recovery-janitor/public/summary.json";

type TrustedRecoveryBranch = {
  detail: NeonBranchDetail;
  guard: CreatedBranchGuard;
  createdAtMs: number;
};

type JanitorConfiguration = {
  apiKey: string;
  output: string;
  productionProjectId: string;
  recoveryProjectId: string;
  validationBranchId: string;
};

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  const values = process.argv.slice(2).filter((value) => value.startsWith(prefix));
  if (values.length > 1) throw new Error(`--${name} may be supplied only once.`);
  return values[0]?.slice(prefix.length);
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value || /[\r\n]/.test(value)) throw new Error(`${name} is required.`);
  return value;
}

function configuration(): JanitorConfiguration {
  if (
    process.env.GITHUB_ACTIONS !== "true"
    || !new Set(["schedule", "workflow_dispatch"]).has(
      process.env.GITHUB_EVENT_NAME ?? "",
    )
    || process.env.GITHUB_REF !== "refs/heads/main"
  ) {
    throw new Error("Recovery janitor requires a scheduled or manual protected-main run.");
  }
  const recoveryProjectId = requiredEnvironment("NEON_RECOVERY_PROJECT_ID");
  const productionProjectId = requiredEnvironment("NEON_PRODUCTION_PROJECT_ID");
  const validationBranchId = requiredEnvironment("NEON_VALIDATION_BRANCH_ID");
  assertDistinctNeonProjectIds(recoveryProjectId, productionProjectId);
  if (!SAFE_RESOURCE_ID.test(validationBranchId)) {
    throw new Error("Recovery janitor project or branch configuration is invalid.");
  }
  const output = path.resolve(option("output") ?? DEFAULT_OUTPUT);
  const allowedRoot = path.resolve("tmp/recovery-janitor");
  if (output !== allowedRoot && !output.startsWith(`${allowedRoot}${path.sep}`)) {
    throw new Error("Recovery janitor output must remain under tmp/recovery-janitor.");
  }
  return {
    apiKey: requiredEnvironment("NEON_RECOVERY_API_KEY"),
    output,
    productionProjectId,
    recoveryProjectId,
    validationBranchId,
  };
}

function trustedBranch(
  detail: NeonBranchDetail,
  projectId: string,
  validationBranchId: string,
  nowMs: number,
): TrustedRecoveryBranch | null {
  const { branch, annotation } = detail;
  const name = branch.name.match(RECOVERY_BRANCH_NAME);
  if (!name) return null;
  const [, kind, runId, runAttempt] = name;
  const runKey = `${runId}-${runAttempt}`;
  const releaseSha = annotation[RECOVERY_ANNOTATION_SHA] ?? "";
  const createdAtMs = Date.parse(branch.created_at);
  if (
    branch.project_id !== projectId
    || branch.default
    || branch.protected
    || !branch.parent_id
    || branch.id === branch.parent_id
    || !SAFE_RELEASE_SHA.test(releaseSha)
    || annotation[RECOVERY_ANNOTATION_RUN] !== runKey
    || annotation[RECOVERY_ANNOTATION_KIND] !== kind
    || !Number.isFinite(createdAtMs)
    || createdAtMs > nowMs + MAX_CLOCK_SKEW_MS
    || (kind === "source" && branch.parent_id !== validationBranchId)
    || (kind === "restored" && !branch.parent_lsn)
  ) {
    return null;
  }
  const guard: CreatedBranchGuard = {
    branchId: branch.id,
    branchName: branch.name,
    kind: kind as "source" | "restored",
    parentBranchId: branch.parent_id,
    parentLsn: kind === "restored" ? branch.parent_lsn : undefined,
    projectId,
    releaseSha,
    runKey,
  };
  assertCreatedBranchGuard(detail, guard);
  return { detail, guard, createdAtMs };
}

export function classifyRecoveryBranches({
  details,
  now,
  projectId,
  validationBranchId,
}: {
  details: NeonBranchDetail[];
  now: Date;
  projectId: string;
  validationBranchId: string;
}): {
  trusted: TrustedRecoveryBranch[];
  stale: TrustedRecoveryBranch[];
  untrustedCount: number;
} {
  const nowMs = now.getTime();
  if (!Number.isFinite(nowMs)) throw new Error("Recovery janitor clock is invalid.");
  const trusted: TrustedRecoveryBranch[] = [];
  let untrustedCount = 0;
  for (const detail of details) {
    const candidate = trustedBranch(
      detail,
      projectId,
      validationBranchId,
      nowMs,
    );
    if (candidate) trusted.push(candidate);
    else untrustedCount += 1;
  }

  const byId = new Map(trusted.map((candidate) => [
    candidate.detail.branch.id,
    candidate,
  ]));
  const relationshipVerified = trusted.filter((candidate) => {
    if (candidate.guard.kind !== "restored") return true;
    const parent = byId.get(candidate.guard.parentBranchId);
    return Boolean(
      parent
      && parent.guard.kind === "source"
      && parent.guard.runKey === candidate.guard.runKey
      && parent.guard.releaseSha === candidate.guard.releaseSha,
    );
  });
  untrustedCount += trusted.length - relationshipVerified.length;

  return {
    trusted: relationshipVerified,
    stale: relationshipVerified.filter(
      ({ createdAtMs }) => nowMs - createdAtMs >= STALE_AFTER_MS,
    ),
    untrustedCount,
  };
}

async function writeReport(output: string, value: unknown): Promise<void> {
  assertRedactedRecoveryEvidence(value);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
}

export async function main(): Promise<void> {
  const config = configuration();
  const client = new NeonRecoveryClient({ apiKey: config.apiKey });
  const project = await client.getProject(config.recoveryProjectId);
  if (project.id !== config.recoveryProjectId) {
    throw new Error("Recovery janitor project identity changed.");
  }
  const branches = await client.listBranchesWithPrefix(
    config.recoveryProjectId,
    RECOVERY_BRANCH_PREFIX,
  );
  const details = (await Promise.all(
    branches.map((branch) => client.getBranch(config.recoveryProjectId, branch.id)),
  )).filter((detail): detail is NeonBranchDetail => detail !== null);
  const now = new Date();
  const classified = classifyRecoveryBranches({
    details,
    now,
    projectId: config.recoveryProjectId,
    validationBranchId: config.validationBranchId,
  });
  if (classified.untrustedCount > 0) {
    await writeReport(config.output, {
      schemaVersion: 1,
      janitor: "NEON_RECOVERY",
      status: "UNTRUSTED_BRANCHES_SKIPPED",
      nonProductionProjectGuard: true,
      scanned: details.length,
      trusted: classified.trusted.length,
      stale: classified.stale.length,
      deleted: 0,
      deferred: 0,
      untrusted: classified.untrustedCount,
      generatedAt: now.toISOString(),
    });
    throw new Error("Recovery janitor found untrusted branches under the reserved prefix.");
  }

  const staleRestored = classified.stale
    .filter((candidate) => candidate.guard.kind === "restored");
  const staleSource = classified.stale
    .filter((candidate) => candidate.guard.kind === "source");
  const deleted = new Set<string>();
  for (const candidate of staleRestored) {
    await client.deleteCreatedBranch(candidate.guard);
    deleted.add(candidate.guard.branchId);
  }

  let deferred = 0;
  for (const candidate of staleSource) {
    const remainingChild = classified.trusted.some((other) =>
      other.guard.parentBranchId === candidate.guard.branchId
      && !deleted.has(other.guard.branchId));
    if (remainingChild) {
      deferred += 1;
      continue;
    }
    await client.deleteCreatedBranch(candidate.guard);
    deleted.add(candidate.guard.branchId);
  }

  await writeReport(config.output, {
    schemaVersion: 1,
    janitor: "NEON_RECOVERY",
    status: deferred === 0 ? "CLEAN" : "DEFERRED_DEPENDENCIES",
    nonProductionProjectGuard:
      config.recoveryProjectId !== config.productionProjectId,
    scanned: details.length,
    trusted: classified.trusted.length,
    stale: classified.stale.length,
    deleted: deleted.size,
    deferred,
    untrusted: 0,
    generatedAt: now.toISOString(),
  });
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  withServerTask({
    task: "neon_recovery_janitor",
    operation: "delete_stale_annotated_branches",
  }, main).catch(() => {
    process.exitCode = 1;
  });
}
