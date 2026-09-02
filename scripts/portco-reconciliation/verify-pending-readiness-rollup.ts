#!/usr/bin/env npx tsx
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { z } from "zod";
import { assertArtifactHash, digestsEqual } from "./hash";

const sha256Value = z.string().regex(/^[a-f0-9]{64}$/);
const taskIndexValue = z.number().int().positive();

const rollupBundleSchema = z.strictObject({
  directory: z.string().regex(/^batch-\d{4}-\d{4}$/),
  taskIndices: z.array(taskIndexValue).min(1),
  preparationSummaryByteSha256: sha256Value,
  readinessAuditByteSha256: sha256Value,
  readinessResult: z.string().min(1),
});

const rollupSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_PENDING_RELEASE_READINESS_ROLLUP"),
  authoritative: z.literal(false),
  auditedAt: z.string().min(1),
  sourceManifestSha256: sha256Value,
  requiredCanonicalDeploymentSha: z.string().regex(/^[a-f0-9]{40}$/),
  deploymentGateSatisfied: z.boolean(),
  pendingTaskCount: z.number().int().nonnegative(),
  preparedBundleCount: z.number().int().nonnegative(),
  readinessAuditCount: z.number().int().nonnegative(),
  researchBackedTaskCount: z.number().int().nonnegative(),
  reciprocalOrTargetBoundTaskCount: z.number().int().nonnegative(),
  knownSourceRebindingTaskIndices: z.array(taskIndexValue),
  result: z.string().min(1),
  bundles: z.array(rollupBundleSchema),
  activationRules: z.array(z.string().min(1)).min(1),
});

const manifestSchema = z.object({
  manifestSha256: sha256Value,
  tasks: z.array(z.object({
    sequence: taskIndexValue,
    taskId: z.string().min(1),
    status: z.string().min(1),
  }).passthrough()),
}).passthrough();

const preparationSummarySchema = z.object({
  artifactType: z.literal("PORTCO_RELEASE_BUNDLE_PREPARATION"),
  plannedMembers: z.array(z.object({ taskIndex: taskIndexValue }).passthrough()).min(1),
}).passthrough();

const readinessAuditSchema = z.object({
  artifactType: z.literal("PORTCO_RELEASE_BUNDLE_READINESS_AUDIT"),
  result: z.string().min(1),
  tasks: z.array(z.object({ taskIndex: taskIndexValue }).passthrough()).min(1),
}).passthrough();

export interface PendingReadinessRollupVerificationInput {
  rollupPath: string;
  expectedSha256?: string;
}

export interface PendingReadinessRollupVerification {
  valid: true;
  rollupPath: string;
  rollupByteSha256: string;
  manifestPath: string;
  manifestSha256: string;
  bundleCount: number;
  pendingTaskCount: number;
  firstPendingTaskIndex: number | null;
  lastPendingTaskIndex: number | null;
  knownSourceRebindingTaskCount: number;
}

function sha256Bytes(value: Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function assertSameIndices(actual: number[], expected: number[], label: string): void {
  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    throw new Error(`${label} does not match the authoritative pending-task order`);
  }
}

function assertUnique(values: number[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} contains duplicate task indices`);
}

function readJson(path: string): { bytes: Buffer; value: unknown } {
  const bytes = readFileSync(path);
  return { bytes, value: JSON.parse(bytes.toString("utf8")) };
}

export function verifyPendingReadinessRollup(
  input: PendingReadinessRollupVerificationInput,
): PendingReadinessRollupVerification {
  const rollupPath = resolve(input.rollupPath);
  const rollupArtifact = readJson(rollupPath);
  const rollupByteSha256 = sha256Bytes(rollupArtifact.bytes);
  if (input.expectedSha256 && !digestsEqual(rollupByteSha256, input.expectedSha256)) {
    throw new Error("Readiness rollup byte hash does not match --expected-sha256");
  }

  const rollup = rollupSchema.parse(rollupArtifact.value);
  const preparationRoot = dirname(rollupPath);
  const executionRoot = dirname(preparationRoot);
  const manifestPath = resolve(executionRoot, "manifest.json");
  const manifest = manifestSchema.parse(readJson(manifestPath).value);
  assertArtifactHash(manifest as Record<string, unknown>, "manifestSha256", "Execution manifest");
  if (!digestsEqual(rollup.sourceManifestSha256, manifest.manifestSha256)) {
    throw new Error("Rollup source manifest hash does not match the execution manifest");
  }

  if (rollup.preparedBundleCount !== rollup.bundles.length) {
    throw new Error("Prepared bundle count does not match the rollup bundle list");
  }
  if (rollup.readinessAuditCount !== rollup.bundles.length) {
    throw new Error("Readiness audit count does not match the rollup bundle list");
  }
  if (rollup.researchBackedTaskCount + rollup.reciprocalOrTargetBoundTaskCount !== rollup.pendingTaskCount) {
    throw new Error("Research-backed and reciprocal task counts do not sum to the pending count");
  }

  const flattenedTaskIndices: number[] = [];
  const seenDirectories = new Set<string>();
  for (const bundle of rollup.bundles) {
    if (seenDirectories.has(bundle.directory)) throw new Error(`Duplicate rollup bundle directory: ${bundle.directory}`);
    seenDirectories.add(bundle.directory);
    const bundleRoot = resolve(preparationRoot, bundle.directory);
    if (dirname(bundleRoot) !== preparationRoot) throw new Error(`Unsafe rollup bundle directory: ${bundle.directory}`);

    const preparation = readJson(resolve(bundleRoot, "preparation-summary.json"));
    if (!digestsEqual(sha256Bytes(preparation.bytes), bundle.preparationSummaryByteSha256)) {
      throw new Error(`${bundle.directory} preparation summary byte hash mismatch`);
    }
    const summary = preparationSummarySchema.parse(preparation.value);
    const summaryIndices = summary.plannedMembers.map((member) => member.taskIndex);
    assertSameIndices(summaryIndices, bundle.taskIndices, `${bundle.directory} preparation members`);

    const auditArtifact = readJson(resolve(bundleRoot, "release-readiness-audit.json"));
    if (!digestsEqual(sha256Bytes(auditArtifact.bytes), bundle.readinessAuditByteSha256)) {
      throw new Error(`${bundle.directory} readiness audit byte hash mismatch`);
    }
    const audit = readinessAuditSchema.parse(auditArtifact.value);
    if (audit.result !== bundle.readinessResult) {
      throw new Error(`${bundle.directory} readiness result mismatch`);
    }
    assertSameIndices(
      audit.tasks.map((task) => task.taskIndex),
      bundle.taskIndices,
      `${bundle.directory} readiness tasks`,
    );
    flattenedTaskIndices.push(...bundle.taskIndices);
  }

  assertUnique(flattenedTaskIndices, "Rollup bundle coverage");
  const pendingTaskIndices = manifest.tasks
    .filter((task) => task.status === "PENDING")
    .map((task) => task.sequence);
  assertSameIndices(flattenedTaskIndices, pendingTaskIndices, "Rollup bundle coverage");
  if (rollup.pendingTaskCount !== pendingTaskIndices.length) {
    throw new Error("Rollup pending count does not match the execution manifest");
  }

  assertUnique(rollup.knownSourceRebindingTaskIndices, "Known source rebindings");
  const pendingSet = new Set(pendingTaskIndices);
  for (const taskIndex of rollup.knownSourceRebindingTaskIndices) {
    if (!pendingSet.has(taskIndex)) throw new Error(`Source rebinding task ${taskIndex} is not pending`);
  }

  return {
    valid: true,
    rollupPath: relative(process.cwd(), rollupPath) || rollupPath,
    rollupByteSha256,
    manifestPath: relative(process.cwd(), manifestPath) || manifestPath,
    manifestSha256: manifest.manifestSha256,
    bundleCount: rollup.bundles.length,
    pendingTaskCount: pendingTaskIndices.length,
    firstPendingTaskIndex: pendingTaskIndices[0] ?? null,
    lastPendingTaskIndex: pendingTaskIndices.at(-1) ?? null,
    knownSourceRebindingTaskCount: rollup.knownSourceRebindingTaskIndices.length,
  };
}

function options(argv: string[]): Map<string, string> {
  return new Map(argv.map((argument) => {
    const separator = argument.indexOf("=");
    if (!argument.startsWith("--") || separator < 0) throw new Error(`Expected --name=value, received ${argument}`);
    return [argument.slice(2, separator), argument.slice(separator + 1)];
  }));
}

function main(): void {
  const values = options(process.argv.slice(2));
  const rollupPath = values.get("rollup")?.trim();
  if (!rollupPath) throw new Error("--rollup=... is required");
  const verification = verifyPendingReadinessRollup({
    rollupPath,
    expectedSha256: values.get("expected-sha256")?.trim() || undefined,
  });
  console.log(JSON.stringify(verification, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
