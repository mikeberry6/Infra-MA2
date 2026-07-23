import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MaintenanceMutationContext } from "../src/lib/database-target";

export const DASHBOARD_CUTOVER_SCHEMA_VERSION = 1 as const;

export type DashboardCutoverMode = "report" | "apply" | "rollback";

export function assertDashboardWritesFrozen(
  environment: Record<string, string | undefined> = process.env,
): void {
  if (environment.DASHBOARD_WRITES_ENABLED !== "false") {
    throw new Error("Required configuration: DASHBOARD_WRITES_ENABLED must exactly equal false for dashboard cutover apply or rollback.");
  }
}

export type DashboardCutoverApproval<T> = {
  schemaVersion: typeof DASHBOARD_CUTOVER_SCHEMA_VERSION;
  scope: string;
  migrationName: string;
  migrationStartedAt: string;
  generatedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  instructions: string[];
  items: T[];
};

export function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

export function cutoverMode(): DashboardCutoverMode {
  const apply = process.argv.slice(2).includes("--apply");
  const rollback = process.argv.slice(2).includes("--rollback");
  if (apply && rollback) throw new Error("Choose exactly one of --apply or --rollback.");
  return apply ? "apply" : rollback ? "rollback" : "report";
}

function canonical(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Cutover evidence cannot contain a non-finite number.");
    return value;
  }
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonical(item)]));
  }
  throw new Error("Cutover evidence must contain only JSON values.");
}

export function stableJson(value: unknown): string {
  return JSON.stringify(canonical(value));
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function snapshotSha256(value: unknown): string {
  return sha256(stableJson(value));
}

export function buildApproval<T>(input: {
  scope: string;
  migrationName: string;
  migrationStartedAt: Date;
  instructions: string[];
  items: T[];
}): DashboardCutoverApproval<T> {
  const generatedAt = input.migrationStartedAt.toISOString();
  return {
    schemaVersion: DASHBOARD_CUTOVER_SCHEMA_VERSION,
    scope: input.scope,
    migrationName: input.migrationName,
    migrationStartedAt: generatedAt,
    generatedAt,
    reviewedBy: null,
    reviewedAt: null,
    instructions: input.instructions,
    items: input.items,
  };
}

function parseTimestamp(value: unknown, label: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be a valid ISO-8601 timestamp.`);
  }
  if (new Date(value).toISOString() !== value) {
    throw new Error(`${label} must be a canonical UTC ISO-8601 timestamp.`);
  }
  return value;
}

export function parseReviewedApproval<T>(
  value: unknown,
  scope: string,
  migrationName: string,
  parseItems: (items: unknown[]) => T[],
  now = new Date(),
): DashboardCutoverApproval<T> & { reviewedBy: string; reviewedAt: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Approval must be an object.");
  const raw = value as Record<string, unknown>;
  if (raw.schemaVersion !== DASHBOARD_CUTOVER_SCHEMA_VERSION) throw new Error("Unsupported dashboard cutover approval schema.");
  if (raw.scope !== scope || raw.migrationName !== migrationName) throw new Error("Approval scope or migration does not match this operation.");
  const migrationStartedAt = parseTimestamp(raw.migrationStartedAt, "migrationStartedAt");
  const generatedAt = parseTimestamp(raw.generatedAt, "generatedAt");
  if (generatedAt !== migrationStartedAt) throw new Error("Cutover approval generation must be bound to the migration timestamp.");
  if (typeof raw.reviewedBy !== "string" || !raw.reviewedBy.trim()) throw new Error("reviewedBy is required.");
  const reviewedBy = raw.reviewedBy.trim();
  const reviewedAt = parseTimestamp(raw.reviewedAt, "reviewedAt");
  if (Date.parse(reviewedAt) < Date.parse(generatedAt)) throw new Error("reviewedAt cannot predate generation.");
  if (Date.parse(reviewedAt) > now.getTime() + 300_000) throw new Error("reviewedAt cannot be in the future.");
  if (!Array.isArray(raw.instructions) || raw.instructions.some((item) => typeof item !== "string")) {
    throw new Error("Approval instructions must remain an array of strings.");
  }
  if (!Array.isArray(raw.items)) throw new Error("Approval items must be an array.");
  const items = parseItems(raw.items);
  return {
    schemaVersion: DASHBOARD_CUTOVER_SCHEMA_VERSION,
    scope,
    migrationName,
    migrationStartedAt,
    generatedAt,
    reviewedBy,
    reviewedAt,
    instructions: raw.instructions as string[],
    items,
  };
}

export function assertApprovalContext(
  approval: { reviewedBy: string },
  context: MaintenanceMutationContext,
): void {
  if (approval.reviewedBy !== context.reviewedBy) {
    throw new Error("MUTATION_REVIEWED_BY must exactly match the committed approval reviewer.");
  }
}

export async function writeApprovalReport(output: string | undefined, value: unknown): Promise<void> {
  if (!output) throw new Error("Report mode requires --output=<reviewer-neutral JSON path>.");
  const resolved = path.resolve(output);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  const items = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>).items
    : undefined;
  console.log(JSON.stringify({ reportWritten: true, items: Array.isArray(items) ? items.length : 0 }));
}

export async function loadCommittedApproval(input: {
  approvalFile?: string;
  expectedSha256?: string;
  releaseSha: string;
}): Promise<{ value: unknown; approvalSha256: string; repositoryPath: string }> {
  if (!input.approvalFile) throw new Error("Mutation requires --approval-file=<committed audits/approvals JSON file>.");
  if (!/^[a-f0-9]{64}$/.test(input.expectedSha256 ?? "")) {
    throw new Error("Mutation requires --approval-sha256=<exact lowercase SHA-256>.");
  }
  const resolved = path.resolve(input.approvalFile);
  const relative = path.relative(process.cwd(), resolved).split(path.sep).join("/");
  if (!relative.startsWith("audits/approvals/") || relative.includes("..") || !relative.endsWith(".json")) {
    throw new Error("Approval file must be a committed audits/approvals/*.json path.");
  }
  if ((await lstat(resolved)).isSymbolicLink()) throw new Error("Approval file cannot be a symbolic link.");
  const raw = await readFile(resolved);
  const approvalSha256 = sha256(raw);
  if (approvalSha256 !== input.expectedSha256) throw new Error("Approval SHA-256 does not match the reviewed file bytes.");
  let committed: Buffer;
  try {
    committed = execFileSync("git", ["show", `${input.releaseSha}:${relative}`], {
      cwd: process.cwd(),
      encoding: "buffer",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    throw new Error("Approval file is not committed at RELEASE_SHA.");
  }
  if (!raw.equals(committed)) throw new Error("Approval file bytes differ from the committed RELEASE_SHA version.");
  let value: unknown;
  try {
    value = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new Error("Approval file is not valid JSON.");
  }
  return { value, approvalSha256, repositoryPath: relative };
}

export function auditMetadata(input: {
  approval: { schemaVersion: number; scope: string; reviewedBy: string; reviewedAt: string };
  approvalSha256: string;
  approvalFile: string;
  context: MaintenanceMutationContext;
  script: string;
}) {
  return {
    source: input.script,
    approvalFile: input.approvalFile,
    approvalSha256: input.approvalSha256,
    approvalSchemaVersion: input.approval.schemaVersion,
    approvalScope: input.approval.scope,
    approvalReviewedBy: input.approval.reviewedBy,
    approvalReviewedAt: input.approval.reviewedAt,
    executedBy: input.context.reviewedBy,
    mutationReason: input.context.reason,
    releaseSha: input.context.releaseSha,
    targetDatabase: input.context.targetDatabase,
  };
}

export function exactAuditExists(
  audits: Array<{ metadata: unknown }>,
  approvalSha256: string,
): boolean {
  return audits.some(({ metadata }) => Boolean(
    metadata
    && typeof metadata === "object"
    && !Array.isArray(metadata)
    && (metadata as Record<string, unknown>).approvalSha256 === approvalSha256,
  ));
}
