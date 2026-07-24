#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  appendFile,
  chmod,
  lstat,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Client } from "pg";
import { logServerFailure, withServerTask } from "../src/lib/server-log.ts";
import { runWithPreservedCleanup } from "../src/lib/task-cleanup.ts";
import {
  NeonRecoveryClient,
  assertCreatedBranchGuard,
  assertDistinctNeonProjectIds,
  assertRedactedRecoveryEvidence,
  assertValidationSourceBranch,
  compareLsn,
  deriveChildDatabaseUrl,
  normalizeLsn,
  normalizeNeonHost,
  parseRecoveryDatabaseTarget,
  requireRecoveryRunIdentity,
  type CreateBranchSpec,
  type CreatedBranchGuard,
  type RecoveryDatabaseTarget,
  type RecoveryRunIdentity,
} from "./neon-recovery-control.ts";

const DEFAULT_STATE = "tmp/recovery/private/state.json";
const DEFAULT_PREPARE_EVIDENCE = "tmp/recovery/public/prepare-evidence.json";
const DEFAULT_CLEANUP_EVIDENCE = "tmp/recovery/public/cleanup-evidence.json";
const STATE_SCHEMA_VERSION = 1;

const FINGERPRINT_TABLES = [
  "_prisma_migrations",
  "Organization",
  "Fund",
  "Company",
  "OwnershipPeriod",
  "Deal",
  "DealParticipant",
  "Milestone",
  "Person",
  "ManagementRole",
  "Source",
  "Citation",
  "PipelineRun",
  "AuditEvent",
] as const;

type TableFingerprint = {
  count: number;
  digest: string;
  table: string;
};

type DatabaseFingerprint = {
  representativeDigest: string;
  representativeKinds: {
    companyWithPrimaryCitation: number;
    dealWithPrimaryCitation: number;
    fundWithSupportingSource: number;
  };
  tables: TableFingerprint[];
};

type RecoveryState = {
  schemaVersion: 1;
  createdAt: string;
  projectId: string;
  validationBranchId: string;
  validationDatabaseName: string;
  run: RecoveryRunIdentity;
  sourceRequest: CreateBranchSpec | null;
  restoredRequest: CreateBranchSpec | null;
  sourceGuard: CreatedBranchGuard | null;
  restoredGuard: CreatedBranchGuard | null;
  restoredEndpointHost: string | null;
  checkpointLsn: string | null;
  mutationLsn: string | null;
  canaryId: string;
  canaryIdSha256: string;
  checkpointFingerprint: DatabaseFingerprint | null;
};

type EnvironmentConfiguration = {
  apiKey: string;
  forbiddenHosts: string[];
  identity: RecoveryRunIdentity;
  productionProjectId: string;
  projectId: string;
  validationBranchId: string;
  validationTarget: RecoveryDatabaseTarget;
};

type CanaryRow = {
  id: string;
  metadata: unknown;
  pipeline: string;
  status: string;
};

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  const values = process.argv.slice(3).filter((argument) => argument.startsWith(prefix));
  if (values.length > 1) throw new Error(`--${name} may be supplied only once.`);
  return values[0]?.slice(prefix.length);
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value || /[\r\n]/.test(value)) throw new Error(`${name} is required.`);
  return value;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function resolveRecoveryPath(value: string): string {
  const root = path.resolve("tmp/recovery");
  const resolved = path.resolve(value);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("Recovery files must remain under tmp/recovery.");
  }
  return resolved;
}

async function writeJsonSecure(file: string, value: unknown): Promise<void> {
  const target = resolveRecoveryPath(file);
  await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  try {
    const metadata = await lstat(target);
    if (!metadata.isFile() || metadata.isSymbolicLink()) {
      throw new Error("Refusing to overwrite an unsafe recovery file.");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  await rename(temporary, target);
  await chmod(target, 0o600);
}

async function readState(file: string): Promise<RecoveryState | null> {
  const target = resolveRecoveryPath(file);
  let metadata;
  try {
    metadata = await lstat(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size > 500_000) {
    throw new Error("Recovery private state is unsafe or invalid.");
  }
  const parsed = JSON.parse(await readFile(target, "utf8")) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Recovery private state is invalid.");
  }
  const state = parsed as RecoveryState;
  if (
    state.schemaVersion !== STATE_SCHEMA_VERSION
    || !state.run
    || !/^[0-9a-f]{40}$/.test(state.run.releaseSha)
    || state.run.runKey !== `${state.run.runId}-${state.run.runAttempt}`
    || !/^[a-z0-9-]{1,60}$/.test(state.projectId)
    || !/^[a-z0-9-]{1,60}$/.test(state.validationBranchId)
    || !/^[A-Za-z0-9_.-]{1,63}$/.test(state.validationDatabaseName)
    || !/^[A-Za-z0-9-]{1,160}$/.test(state.canaryId)
    || sha256(state.canaryId) !== state.canaryIdSha256
  ) {
    throw new Error("Recovery private state failed its identity guard.");
  }
  return state;
}

function assertStateForCurrentRun(
  state: RecoveryState,
  identity: RecoveryRunIdentity,
  projectId: string,
  validationBranchId: string,
): void {
  if (
    state.projectId !== projectId
    || state.validationBranchId !== validationBranchId
    || state.run.releaseSha !== identity.releaseSha
    || state.run.runKey !== identity.runKey
    || state.run.sourceBranchName !== identity.sourceBranchName
    || state.run.restoredBranchName !== identity.restoredBranchName
  ) {
    throw new Error("Recovery private state does not belong to this exact run.");
  }
  if (state.sourceRequest && (
    state.sourceRequest.kind !== "source"
    || state.sourceRequest.branchName !== identity.sourceBranchName
    || state.sourceRequest.parentBranchId !== validationBranchId
    || state.sourceRequest.parentLsn !== undefined
    || state.sourceRequest.projectId !== projectId
    || state.sourceRequest.releaseSha !== identity.releaseSha
    || state.sourceRequest.runKey !== identity.runKey
  )) {
    throw new Error("Recovery source request state failed its exact-run guard.");
  }
  if (state.sourceGuard && (
    state.sourceGuard.kind !== "source"
    || state.sourceGuard.branchName !== identity.sourceBranchName
    || state.sourceGuard.parentBranchId !== validationBranchId
    || state.sourceGuard.parentLsn !== undefined
    || state.sourceGuard.projectId !== projectId
    || state.sourceGuard.releaseSha !== identity.releaseSha
    || state.sourceGuard.runKey !== identity.runKey
    || state.sourceGuard.branchId === validationBranchId
  )) {
    throw new Error("Recovery source branch state failed its exact-run guard.");
  }
  if (state.restoredRequest && (
    !state.sourceGuard
    || state.restoredRequest.kind !== "restored"
    || state.restoredRequest.branchName !== identity.restoredBranchName
    || state.restoredRequest.parentBranchId !== state.sourceGuard.branchId
    || state.restoredRequest.parentLsn !== state.checkpointLsn
    || state.restoredRequest.projectId !== projectId
    || state.restoredRequest.releaseSha !== identity.releaseSha
    || state.restoredRequest.runKey !== identity.runKey
  )) {
    throw new Error("Recovery restore request state failed its exact-run guard.");
  }
  if (state.restoredGuard && (
    !state.sourceGuard
    || state.restoredGuard.kind !== "restored"
    || state.restoredGuard.branchName !== identity.restoredBranchName
    || state.restoredGuard.parentBranchId !== state.sourceGuard.branchId
    || state.restoredGuard.parentLsn !== state.checkpointLsn
    || state.restoredGuard.projectId !== projectId
    || state.restoredGuard.releaseSha !== identity.releaseSha
    || state.restoredGuard.runKey !== identity.runKey
    || state.restoredGuard.branchId === validationBranchId
    || state.restoredGuard.branchId === state.sourceGuard.branchId
  )) {
    throw new Error("Recovery restored branch state failed its exact-run guard.");
  }
}

function environmentConfiguration(): EnvironmentConfiguration {
  const identity = requireRecoveryRunIdentity(process.env);
  const projectId = requiredEnvironment("NEON_RECOVERY_PROJECT_ID");
  const productionProjectId = requiredEnvironment("NEON_PRODUCTION_PROJECT_ID");
  const validationBranchId = requiredEnvironment("NEON_VALIDATION_BRANCH_ID");
  assertDistinctNeonProjectIds(projectId, productionProjectId);
  if (!/^[a-z0-9-]{1,60}$/.test(validationBranchId)) {
    throw new Error("Neon project or validation branch identity is invalid.");
  }
  const forbiddenHosts = [
    requiredEnvironment("PRODUCTION_DATABASE_HOST"),
    requiredEnvironment("PRODUCTION_MIGRATION_DATABASE_HOST"),
    requiredEnvironment("DASHBOARD_MIGRATION_DATABASE_HOST"),
  ];
  const validationTarget = parseRecoveryDatabaseTarget({
    connectionString: requiredEnvironment("VALIDATION_DATABASE_URL"),
    expectedHost: requiredEnvironment("VALIDATION_DATABASE_HOST"),
    expectedDatabase: requiredEnvironment("VALIDATION_DATABASE_NAME"),
    forbiddenHosts,
  });
  return {
    apiKey: requiredEnvironment("NEON_RECOVERY_API_KEY"),
    forbiddenHosts,
    identity,
    productionProjectId,
    projectId,
    validationBranchId,
    validationTarget,
  };
}

function newState(configuration: EnvironmentConfiguration): RecoveryState {
  const canaryId = `recovery-exercise-${configuration.identity.runKey}`;
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    projectId: configuration.projectId,
    validationBranchId: configuration.validationBranchId,
    validationDatabaseName: configuration.validationTarget.database,
    run: configuration.identity,
    sourceRequest: null,
    restoredRequest: null,
    sourceGuard: null,
    restoredGuard: null,
    restoredEndpointHost: null,
    checkpointLsn: null,
    mutationLsn: null,
    canaryId,
    canaryIdSha256: sha256(canaryId),
    checkpointFingerprint: null,
  };
}

async function withDatabase<T>(
  connectionString: string,
  run: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 20_000,
    query_timeout: 45_000,
  });
  return runWithPreservedCleanup({
    run: async () => {
      await client.connect();
      await client.query("SET application_name = 'infrasight_recovery_exercise'");
      await client.query("SET statement_timeout = '45s'");
      await client.query("SET lock_timeout = '10s'");
      return run(client);
    },
    cleanup: () => client.end(),
    onSuppressedCleanupError: (error) => logServerFailure({
      task: "neon_recovery_exercise_cleanup",
      operation: "disconnect_database",
    }, error),
  });
}

function quoteIdentifier(value: string): string {
  if (!FINGERPRINT_TABLES.includes(value as typeof FINGERPRINT_TABLES[number])) {
    throw new Error("Recovery fingerprint table is not allowlisted.");
  }
  return `"${value.replaceAll('"', '""')}"`;
}

async function databaseFingerprint(client: Client): Promise<DatabaseFingerprint> {
  const tables: TableFingerprint[] = [];
  for (const table of FINGERPRINT_TABLES) {
    const identifier = quoteIdentifier(table);
    const result = await client.query<{ count: number; digest: string }>(`
      SELECT
        COUNT(*)::int AS count,
        md5(COALESCE(
          string_agg(md5(to_jsonb(row_value)::text), '' ORDER BY row_value."id"::text),
          ''
        )) AS digest
      FROM ${identifier} AS row_value
    `);
    const row = result.rows[0];
    if (
      !row
      || !Number.isSafeInteger(row.count)
      || row.count < 0
      || !/^[0-9a-f]{32}$/.test(row.digest)
    ) {
      throw new Error("Recovery database fingerprint is invalid.");
    }
    tables.push({ table, count: row.count, digest: row.digest });
  }

  const representatives = await client.query<{
    company_id: string | null;
    company_citation_id: string | null;
    deal_id: string | null;
    deal_citation_id: string | null;
    fund_id: string | null;
  }>(`
    SELECT
      (
        SELECT d."id"
        FROM "Deal" d
        JOIN "Citation" c ON c."dealId" = d."id" AND c."isPrimary" = true
        WHERE d."status" = 'PUBLISHED'
        ORDER BY d."legacyId", c."id"
        LIMIT 1
      ) AS deal_id,
      (
        SELECT c."id"
        FROM "Deal" d
        JOIN "Citation" c ON c."dealId" = d."id" AND c."isPrimary" = true
        WHERE d."status" = 'PUBLISHED'
        ORDER BY d."legacyId", c."id"
        LIMIT 1
      ) AS deal_citation_id,
      (
        SELECT company."id"
        FROM "Company" company
        JOIN "Citation" citation
          ON citation."companyId" = company."id" AND citation."isPrimary" = true
        WHERE company."status" = 'PUBLISHED'
        ORDER BY company."name", company."id", citation."id"
        LIMIT 1
      ) AS company_id,
      (
        SELECT citation."id"
        FROM "Company" company
        JOIN "Citation" citation
          ON citation."companyId" = company."id" AND citation."isPrimary" = true
        WHERE company."status" = 'PUBLISHED'
        ORDER BY company."name", company."id", citation."id"
        LIMIT 1
      ) AS company_citation_id,
      (
        SELECT fund."id"
        FROM "Fund" fund
        WHERE
          fund."status" = 'PUBLISHED'
          AND (
            cardinality(fund."sourceUrls") > 0
            OR fund."strategyUrl" ~ '^https?://'
          )
        ORDER BY fund."legacyId", fund."id"
        LIMIT 1
      ) AS fund_id
  `);
  const representative = representatives.rows[0];
  if (
    !representative
    || !representative.deal_id
    || !representative.deal_citation_id
    || !representative.company_id
    || !representative.company_citation_id
    || !representative.fund_id
  ) {
    throw new Error("Recovery database lacks representative published evidence.");
  }
  return {
    tables,
    representativeDigest: sha256(JSON.stringify(representative)),
    representativeKinds: {
      companyWithPrimaryCitation: 1,
      dealWithPrimaryCitation: 1,
      fundWithSupportingSource: 1,
    },
  };
}

function expectedCanaryMetadata(state: RecoveryState): Record<string, string> {
  return {
    exercise: "NEON_PITR",
    releaseSha: state.run.releaseSha,
    runKey: state.run.runKey,
  };
}

async function readCanary(client: Client, canaryId: string): Promise<CanaryRow | null> {
  const result = await client.query<CanaryRow>(`
    SELECT "id", "pipeline", "status", "metadata"
    FROM "PipelineRun"
    WHERE "id" = $1
  `, [canaryId]);
  if (result.rowCount === 0) return null;
  if (result.rowCount !== 1) throw new Error("Recovery canary identity is not unique.");
  return result.rows[0];
}

function assertCanary(
  row: CanaryRow | null,
  state: RecoveryState,
  expectedStatus: "CHECKPOINT" | "MUTATED",
): void {
  const expectedMetadata = expectedCanaryMetadata(state);
  const actualMetadata = row?.metadata;
  const metadataMatches = Boolean(
    actualMetadata
    && typeof actualMetadata === "object"
    && !Array.isArray(actualMetadata)
    && Object.keys(actualMetadata).sort().join(",")
      === Object.keys(expectedMetadata).sort().join(",")
    && Object.entries(expectedMetadata).every(
      ([key, value]) => (actualMetadata as Record<string, unknown>)[key] === value,
    ),
  );
  if (
    !row
    || row.id !== state.canaryId
    || row.pipeline !== "RESTORE_EXERCISE"
    || row.status !== expectedStatus
    || !metadataMatches
  ) {
    throw new Error("Recovery canary failed its exact content guard.");
  }
}

async function createCheckpoint(
  client: Client,
  state: RecoveryState,
): Promise<{ fingerprint: DatabaseFingerprint; lsn: string }> {
  if (await readCanary(client, state.canaryId)) {
    throw new Error("Recovery canary already exists on the ephemeral source branch.");
  }
  await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
  try {
    await client.query(`
      INSERT INTO "PipelineRun" (
        "id",
        "pipeline",
        "status",
        "startedAt",
        "endedAt",
        "inserted",
        "updated",
        "skipped",
        "errorSummary",
        "metadata",
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, 'RESTORE_EXERCISE', 'CHECKPOINT', NOW(), NOW(), 0, 0, 0, NULL, $2::jsonb, NOW(), NOW())
    `, [state.canaryId, JSON.stringify(expectedCanaryMetadata(state))]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  assertCanary(await readCanary(client, state.canaryId), state, "CHECKPOINT");
  const lsnResult = await client.query<{ lsn: string }>(
    "SELECT pg_current_wal_lsn()::text AS lsn",
  );
  const lsn = normalizeLsn(lsnResult.rows[0]?.lsn ?? "");
  return { fingerprint: await databaseFingerprint(client), lsn };
}

async function mutateAfterCheckpoint(
  client: Client,
  state: RecoveryState,
): Promise<string> {
  const result = await client.query(`
    UPDATE "PipelineRun"
    SET "status" = 'MUTATED', "updatedAt" = NOW()
    WHERE "id" = $1 AND "status" = 'CHECKPOINT'
  `, [state.canaryId]);
  if (result.rowCount !== 1) throw new Error("Recovery canary mutation was not exact.");
  assertCanary(await readCanary(client, state.canaryId), state, "MUTATED");
  const lsnResult = await client.query<{ lsn: string }>(
    "SELECT pg_current_wal_lsn()::text AS lsn",
  );
  const lsn = normalizeLsn(lsnResult.rows[0]?.lsn ?? "");
  if (!state.checkpointLsn || compareLsn(lsn, state.checkpointLsn) <= 0) {
    throw new Error("Recovery canary mutation did not advance the WAL position.");
  }
  return lsn;
}

async function validateRestoredDatabase(
  restoredConnectionString: string,
  sourceConnectionString: string,
  state: RecoveryState,
): Promise<void> {
  if (!state.checkpointFingerprint) {
    throw new Error("Recovery checkpoint fingerprint is missing.");
  }
  await withDatabase(restoredConnectionString, async (restored) => {
    assertCanary(await readCanary(restored, state.canaryId), state, "CHECKPOINT");
    const restoredFingerprint = await databaseFingerprint(restored);
    if (
      JSON.stringify(restoredFingerprint) !== JSON.stringify(state.checkpointFingerprint)
    ) {
      throw new Error("Restored database does not exactly match the checkpoint fingerprint.");
    }
  });
  await withDatabase(sourceConnectionString, async (source) => {
    assertCanary(await readCanary(source, state.canaryId), state, "MUTATED");
  });
}

async function assertValidationControlPlane(
  client: NeonRecoveryClient,
  configuration: EnvironmentConfiguration,
): Promise<void> {
  const project = await client.getProject(configuration.projectId);
  if (project.history_retention_seconds < 60) {
    throw new Error("Neon history retention is insufficient for a PITR exercise.");
  }
  const detail = await client.getBranch(
    configuration.projectId,
    configuration.validationBranchId,
  );
  if (!detail) throw new Error("Validation source branch was not found.");
  assertValidationSourceBranch({
    branch: detail.branch,
    expectedBranchId: configuration.validationBranchId,
    expectedProjectId: configuration.projectId,
  });
  const endpoints = (await client.listEndpoints(
    configuration.projectId,
    configuration.validationBranchId,
  )).filter((endpoint) => endpoint.type === "read_write");
  if (
    endpoints.length !== 1
    || endpoints[0].branch_id !== configuration.validationBranchId
    || endpoints[0].project_id !== configuration.projectId
    || endpoints[0].host !== configuration.validationTarget.host
  ) {
    throw new Error("Validation database credential is not bound to the allowlisted branch.");
  }
}

async function persistState(statePath: string, state: RecoveryState): Promise<void> {
  await writeJsonSecure(statePath, state);
}

async function cleanupCreatedBranches(
  client: NeonRecoveryClient,
  state: RecoveryState,
): Promise<Array<{
  alreadyDeleted: boolean;
  branchId: string | null;
  deleted: true;
  kind: string;
  reconciled: boolean;
}>> {
  const results: Array<{
    alreadyDeleted: boolean;
    branchId: string | null;
    deleted: true;
    kind: string;
    reconciled: boolean;
  }> = [];
  if (state.restoredGuard) {
    results.push({
      ...await client.deleteCreatedBranch(state.restoredGuard),
      reconciled: false,
    });
  } else if (state.restoredRequest) {
    results.push(await client.deleteReconciledBranch(state.restoredRequest));
  }
  if (state.sourceGuard) {
    results.push({
      ...await client.deleteCreatedBranch(state.sourceGuard),
      reconciled: false,
    });
  } else if (state.sourceRequest) {
    results.push(await client.deleteReconciledBranch(state.sourceRequest));
  }
  return results;
}

async function exportRestoredEnvironment(
  restoredUrl: string,
  restoredHost: string,
): Promise<void> {
  const environmentFile = requiredEnvironment("GITHUB_ENV");
  if (!path.isAbsolute(environmentFile)) {
    throw new Error("GITHUB_ENV must be an absolute runner-owned path.");
  }
  if (/[\r\n]/.test(restoredUrl) || /[\r\n]/.test(restoredHost)) {
    throw new Error("Refusing unsafe restored environment output.");
  }
  const password = new URL(restoredUrl).password;
  process.stdout.write(`::add-mask::${password}\n`);
  process.stdout.write(`::add-mask::${restoredUrl}\n`);
  process.stdout.write(`::add-mask::${restoredHost}\n`);
  await appendFile(
    environmentFile,
    [
      `DATABASE_URL=${restoredUrl}`,
      `EXPECTED_DATABASE_HOST=${restoredHost}`,
      `EXPECTED_DATABASE_NAME=${requiredEnvironment("VALIDATION_DATABASE_NAME")}`,
      "",
    ].join("\n"),
    { encoding: "utf8" },
  );
}

async function prepare(): Promise<void> {
  const statePath = option("state") ?? DEFAULT_STATE;
  const evidencePath = option("evidence") ?? DEFAULT_PREPARE_EVIDENCE;
  const configuration = environmentConfiguration();
  const client = new NeonRecoveryClient({ apiKey: configuration.apiKey });
  const existingState = await readState(statePath);
  if (existingState) {
    assertStateForCurrentRun(
      existingState,
      configuration.identity,
      configuration.projectId,
      configuration.validationBranchId,
    );
    throw new Error("Recovery state already exists; run guarded cleanup before retrying.");
  }
  const state = newState(configuration);
  let prepared = false;
  try {
    await assertValidationControlPlane(client, configuration);

    const sourceRequest: CreateBranchSpec = {
      branchName: configuration.identity.sourceBranchName,
      kind: "source",
      parentBranchId: configuration.validationBranchId,
      projectId: configuration.projectId,
      releaseSha: configuration.identity.releaseSha,
      requestedAt: new Date().toISOString(),
      runKey: configuration.identity.runKey,
    };
    // Persist the exact request before the non-idempotent POST. If the runner
    // is cancelled after Neon accepts it but before the response is stored,
    // the always-run cleanup step can reconcile only this annotated branch.
    state.sourceRequest = sourceRequest;
    await persistState(statePath, state);
    const source = await client.createBranchReconciled(sourceRequest);
    state.sourceGuard = source.guard;
    await persistState(statePath, state);
    const sourceUrl = deriveChildDatabaseUrl({
      parent: configuration.validationTarget,
      childHost: source.endpoint.host,
      forbiddenHosts: [
        configuration.validationTarget.host,
        ...configuration.forbiddenHosts,
      ],
    });

    const checkpoint = await withDatabase(
      sourceUrl,
      (database) => createCheckpoint(database, state),
    );
    state.checkpointLsn = checkpoint.lsn;
    state.checkpointFingerprint = checkpoint.fingerprint;
    await persistState(statePath, state);
    state.mutationLsn = await withDatabase(
      sourceUrl,
      (database) => mutateAfterCheckpoint(database, state),
    );
    await persistState(statePath, state);

    const restoreRequest: CreateBranchSpec = {
      branchName: configuration.identity.restoredBranchName,
      kind: "restored",
      parentBranchId: source.branch.id,
      parentLsn: checkpoint.lsn,
      projectId: configuration.projectId,
      releaseSha: configuration.identity.releaseSha,
      requestedAt: new Date().toISOString(),
      runKey: configuration.identity.runKey,
    };
    state.restoredRequest = restoreRequest;
    await persistState(statePath, state);
    const restored = await client.createBranchReconciled(restoreRequest);
    state.restoredGuard = restored.guard;
    state.restoredEndpointHost = restored.endpoint.host;
    await persistState(statePath, state);
    const restoredUrl = deriveChildDatabaseUrl({
      parent: configuration.validationTarget,
      childHost: restored.endpoint.host,
      forbiddenHosts: [
        configuration.validationTarget.host,
        source.endpoint.host,
        ...configuration.forbiddenHosts,
      ],
    });
    await validateRestoredDatabase(restoredUrl, sourceUrl, state);

    const verifiedAt = new Date().toISOString();
    const evidence = {
      schemaVersion: STATE_SCHEMA_VERSION,
      exercise: "NEON_PITR",
      status: "RESTORED_AND_VERIFIED",
      runKey: state.run.runKey,
      releaseSha: state.run.releaseSha,
      projectId: state.projectId,
      nonProductionProjectGuard: state.projectId !== configuration.productionProjectId,
      validationBranchId: state.validationBranchId,
      sourceBranchId: source.branch.id,
      restoredBranchId: restored.branch.id,
      sourceCreateReconciled: source.reconciled,
      restoreCreateReconciled: restored.reconciled,
      recoveryPoint: {
        kind: "LSN",
        checkpointLsn: state.checkpointLsn,
        mutationLsn: state.mutationLsn,
      },
      canary: {
        identitySha256: state.canaryIdSha256,
        checkpointStatus: "CHECKPOINT",
        postCheckpointStatus: "MUTATED",
        restoredStatus: "CHECKPOINT",
      },
      fidelity: state.checkpointFingerprint,
      requestedAt: restoreRequest.requestedAt,
      verifiedAt,
      recoveryTimeMs: Date.parse(verifiedAt) - Date.parse(restoreRequest.requestedAt),
    };
    assertRedactedRecoveryEvidence(evidence);
    await writeJsonSecure(evidencePath, evidence);
    await exportRestoredEnvironment(restoredUrl, restored.endpoint.host);
    prepared = true;
    console.log("Neon PITR exercise branch is ready for read-only application verification.");
  } catch (error) {
    try {
      await cleanupCreatedBranches(client, state);
    } catch (cleanupError) {
      logServerFailure({
        task: "neon_recovery_exercise_cleanup",
        operation: "cleanup_failed_prepare",
      }, cleanupError);
    }
    throw error;
  } finally {
    if (!prepared) {
      // Preserve guarded branch IDs for a later `cleanup` invocation if the
      // best-effort in-process cleanup was interrupted or could not complete.
      try {
        await persistState(statePath, state);
      } catch (stateError) {
        logServerFailure({
          task: "neon_recovery_exercise_cleanup",
          operation: "preserve_cleanup_state",
        }, stateError);
      }
    }
  }
}

async function assertTarget(): Promise<void> {
  const statePath = option("state") ?? DEFAULT_STATE;
  const configuration = environmentConfiguration();
  const state = await readState(statePath);
  if (!state || !state.restoredGuard || !state.restoredEndpointHost) {
    throw new Error("Prepared restored-branch state is required.");
  }
  assertStateForCurrentRun(
    state,
    configuration.identity,
    configuration.projectId,
    configuration.validationBranchId,
  );
  const target = parseRecoveryDatabaseTarget({
    connectionString: requiredEnvironment("DATABASE_URL"),
    expectedHost: state.restoredEndpointHost,
    expectedDatabase: state.validationDatabaseName,
    forbiddenHosts: [
      configuration.validationTarget.host,
      ...configuration.forbiddenHosts,
    ],
  });
  if (
    target.host !== state.restoredEndpointHost
    || target.database !== state.validationDatabaseName
  ) {
    throw new Error("Restored database target failed its private-state binding.");
  }
  const client = new NeonRecoveryClient({ apiKey: configuration.apiKey });
  const detail = await client.getBranch(state.projectId, state.restoredGuard.branchId);
  if (!detail) throw new Error("Prepared restored branch no longer exists.");
  assertCreatedBranchGuard(detail, state.restoredGuard);
  const endpoints = (await client.listEndpoints(
    state.projectId,
    state.restoredGuard.branchId,
  )).filter((endpoint) => endpoint.type === "read_write");
  if (
    endpoints.length !== 1
    || endpoints[0].host !== target.host
    || endpoints[0].branch_id !== state.restoredGuard.branchId
  ) {
    throw new Error("Restored database URL is not bound to the guarded endpoint.");
  }
  await withDatabase(requiredEnvironment("DATABASE_URL"), async (database) => {
    assertCanary(await readCanary(database, state.canaryId), state, "CHECKPOINT");
    if (
      !state.checkpointFingerprint
      || JSON.stringify(await databaseFingerprint(database))
        !== JSON.stringify(state.checkpointFingerprint)
    ) {
      throw new Error("Restored database changed after PITR verification.");
    }
  });
  console.log("Restored Neon target and checkpoint fidelity are still exact.");
}

async function cleanup(): Promise<void> {
  const statePath = option("state") ?? DEFAULT_STATE;
  const evidencePath = option("evidence") ?? DEFAULT_CLEANUP_EVIDENCE;
  const configuration = environmentConfiguration();
  const state = await readState(statePath);
  if (!state) {
    const evidence = {
      schemaVersion: STATE_SCHEMA_VERSION,
      exercise: "NEON_PITR",
      status: "NO_CREATED_BRANCHES",
      runKey: configuration.identity.runKey,
      releaseSha: configuration.identity.releaseSha,
      cleanedAt: new Date().toISOString(),
      branches: [],
    };
    assertRedactedRecoveryEvidence(evidence);
    await writeJsonSecure(evidencePath, evidence);
    return;
  }
  assertStateForCurrentRun(
    state,
    configuration.identity,
    configuration.projectId,
    configuration.validationBranchId,
  );
  const client = new NeonRecoveryClient({ apiKey: configuration.apiKey });
  const branches = await cleanupCreatedBranches(client, state);
  const evidence = {
    schemaVersion: STATE_SCHEMA_VERSION,
    exercise: "NEON_PITR",
    status: "CREATED_BRANCHES_DELETED",
    runKey: state.run.runKey,
    releaseSha: state.run.releaseSha,
    cleanedAt: new Date().toISOString(),
    branches,
  };
  assertRedactedRecoveryEvidence(evidence);
  await writeJsonSecure(evidencePath, evidence);
  await rm(resolveRecoveryPath(statePath), { force: true });
  console.log(`Guarded cleanup completed for ${branches.length} recovery branch(es).`);
}

export async function main(): Promise<void> {
  const operation = process.argv[2];
  if (!new Set(["prepare", "assert-target", "cleanup"]).has(operation ?? "")) {
    throw new Error("Operation must be prepare, assert-target, or cleanup.");
  }
  if (operation === "prepare") await prepare();
  else if (operation === "assert-target") await assertTarget();
  else await cleanup();
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  withServerTask(
    {
      task: "neon_recovery_exercise",
      operation: process.argv[2] ?? "invalid_operation",
    },
    main,
  ).catch(() => {
    process.exitCode = 1;
  });
}
