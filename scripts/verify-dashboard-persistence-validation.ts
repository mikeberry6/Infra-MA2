import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target.ts";
import { getSafeErrorDetails } from "../src/lib/safe-error.ts";
import { withServerTask } from "../src/lib/server-log.ts";
import {
  DASHBOARD_METRICS,
  DASHBOARD_SOURCES,
} from "../src/modules/dashboard/catalog.ts";
import { dashboardSignalContentHash } from "../src/modules/dashboard/content-hash.ts";
import {
  DASHBOARD_METHODOLOGY_VERSIONS,
  FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES,
} from "../src/modules/dashboard/methodology-cutover.ts";
import {
  DASHBOARD_SOURCE_REGISTRY,
  type DashboardSourceRegistryEntry,
} from "../src/modules/dashboard/source-registry.ts";
import {
  evaluateDashboardSyncHealth,
  syncDashboard,
  type DashboardSyncPrisma,
  type DashboardSyncSummary,
} from "../src/modules/dashboard/sync.ts";
import type {
  DashboardObservation,
  DashboardProvider,
  DashboardSignal,
  DashboardSource,
} from "../src/modules/dashboard/types.ts";
import {
  completePipelineRun,
  startPipelineRun,
} from "../src/modules/operations/pipeline-runs.ts";

type CheckReport = {
  targetGuard: boolean;
  firstPersistence: boolean;
  pipelineCompletion: boolean;
  pendingSignal: boolean;
  idempotentReplay: boolean;
  transactionRollback: boolean;
};

type AggregateReport = {
  verifier: "dashboard_persistence_validation";
  requiredTarget: "validation";
  status: "passed" | "failed";
  checks: CheckReport;
  fixtureCounts: {
    providers: number;
    observations: number;
    signals: number;
    pipelineAttempts: number;
  };
  disconnected: boolean;
  failureClassification: string | null;
  durationMs: number;
  generatedAt: string;
};

type FixtureSet = {
  providers: DashboardProvider[];
  observations: DashboardObservation[];
  signal: DashboardSignal;
  sourceNames: string[];
};

class ExpectedValidationRollback extends Error {
  constructor() {
    super("Expected validation transaction rollback.");
    this.name = "ExpectedValidationRollback";
  }
}

function invariant(condition: unknown, code: string): asserts condition {
  if (!condition) {
    throw new Error(`Dashboard persistence validation assertion failed: ${code}.`);
  }
}

function requireValidationTarget(): string {
  if (process.env.TARGET_DATABASE !== "validation") {
    throw new Error(
      "Dashboard persistence integration verification requires TARGET_DATABASE=validation.",
    );
  }
  assertMutationDatabaseTargetFromEnv();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Dashboard persistence integration verification requires DATABASE_URL.",
    );
  }
  return connectionString;
}

function fixtureValue(entry: DashboardSourceRegistryEntry): number {
  if (entry.minValue !== undefined && entry.maxValue !== undefined) {
    return entry.minValue + (entry.maxValue - entry.minValue) / 2;
  }
  if (entry.minValue !== undefined) return entry.minValue + 1;
  if (entry.maxValue !== undefined) return entry.maxValue - 1;
  return 1;
}

function fixtureObservations(input: {
  sourceId: string;
  observedAt: string;
  periodEnd: string;
  validationRunId: string;
}): DashboardObservation[] {
  return DASHBOARD_SOURCE_REGISTRY
    .filter((entry) => entry.sourceId === input.sourceId)
    .map((entry) => {
      const metadata: Record<string, unknown> = {
        validationRunId: input.validationRunId,
      };
      if (entry.metricId === "federal_register_infra_notices") {
        Object.assign(metadata, {
          methodologyVersion:
            DASHBOARD_METHODOLOGY_VERSIONS.federalRegisterInfraNotices,
          deduplicatedBy: "document_number",
          documentTypes: [...FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES],
        });
      }
      return {
        metricId: entry.metricId,
        sourceId: input.sourceId,
        observedAt: input.observedAt,
        periodEnd: input.periodEnd,
        value: fixtureValue(entry),
        unit: entry.unit,
        status: "LIVE",
        metadata,
      };
    });
}

function fixtures(validationRunId: string, now: Date): FixtureSet {
  const observedAt = now.toISOString();
  const periodEnd = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )).toISOString();
  const treasurySource: DashboardSource = {
    ...DASHBOARD_SOURCES.treasury,
    name: `Validation Treasury ${validationRunId}`,
  };
  const federalRegisterSource: DashboardSource = {
    ...DASHBOARD_SOURCES.federalRegister,
    name: `Validation Federal Register ${validationRunId}`,
  };
  const treasuryObservations = fixtureObservations({
    sourceId: treasurySource.id,
    observedAt,
    periodEnd,
    validationRunId,
  });
  const federalRegisterObservations = fixtureObservations({
    sourceId: federalRegisterSource.id,
    observedAt,
    periodEnd,
    validationRunId,
  });
  const signal: DashboardSignal = {
    signalKey: `validation-dashboard-${validationRunId}`,
    section: "policy-regulatory",
    title: "Validation-only dashboard signal",
    summary: "Deterministic validation of review-gated dashboard persistence.",
    direction: "needs_review",
    severity: 1,
    observedAt,
    sourceId: federalRegisterSource.id,
    sourceName: federalRegisterSource.name,
    sourceUrl: "https://www.federalregister.gov/",
    metadata: { validationRunId },
  };
  const providers: DashboardProvider[] = [
    {
      source: treasurySource,
      fetch: async () => ({
        observations: treasuryObservations,
        signals: [],
      }),
    },
    {
      source: federalRegisterSource,
      fetch: async () => ({
        observations: federalRegisterObservations,
        signals: [signal],
      }),
    },
  ];

  return {
    providers,
    observations: [...treasuryObservations, ...federalRegisterObservations],
    signal,
    sourceNames: [treasurySource.name, federalRegisterSource.name],
  };
}

function canonical(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    invariant(Number.isFinite(value), "snapshot_non_finite_number");
    return value;
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonical);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  throw new Error("Dashboard persistence validation snapshot is not JSON-safe.");
}

function stableJson(value: unknown): string {
  return JSON.stringify(canonical(value));
}

async function databaseSnapshot(
  prisma: PrismaClient,
  fixture: FixtureSet,
): Promise<string> {
  const observationKeys = fixture.observations.map((observation) => ({
    metricId: observation.metricId,
    sourceId: observation.sourceId,
    periodEnd: new Date(observation.periodEnd),
  }));
  const [
    metricDefinitionCount,
    observationCount,
    signalCount,
    sourceRunCount,
    pipelineRunCount,
    definitions,
    observations,
    signals,
    sourceRuns,
  ] = await Promise.all([
    prisma.dashboardMetricDefinition.count(),
    prisma.dashboardObservation.count(),
    prisma.dashboardSignal.count(),
    prisma.dashboardSourceRun.count(),
    prisma.pipelineRun.count(),
    prisma.dashboardMetricDefinition.findMany({
      where: { id: { in: DASHBOARD_METRICS.map((metric) => metric.id) } },
      orderBy: { id: "asc" },
    }),
    prisma.dashboardObservation.findMany({
      where: { OR: observationKeys },
      orderBy: [{ metricId: "asc" }, { sourceId: "asc" }, { periodEnd: "asc" }],
    }),
    prisma.dashboardSignal.findMany({
      where: { signalKey: fixture.signal.signalKey },
      orderBy: { id: "asc" },
    }),
    prisma.dashboardSourceRun.findMany({
      where: { sourceName: { in: fixture.sourceNames } },
      orderBy: [{ sourceName: "asc" }, { startedAt: "asc" }, { id: "asc" }],
    }),
  ]);

  return stableJson({
    counts: {
      metricDefinitionCount,
      observationCount,
      signalCount,
      sourceRunCount,
      pipelineRunCount,
    },
    definitions,
    observations,
    signals,
    sourceRuns,
  });
}

async function runPipelineAttempt(
  tx: Prisma.TransactionClient,
  fixture: FixtureSet,
  validationRunId: string,
  attempt: number,
): Promise<{ id: string; summary: DashboardSyncSummary }> {
  const metadata = {
    validationRunId,
    validationAttempt: attempt,
  };
  const id = await startPipelineRun(tx, "DASHBOARD_SYNC", metadata);
  const summary = await syncDashboard(
    tx as unknown as DashboardSyncPrisma,
    {
      providers: fixture.providers,
      refreshWindow: new Date().toISOString().slice(0, 10),
    },
  );
  const health = evaluateDashboardSyncHealth(summary);
  invariant(health.healthy, `attempt_${attempt}_health`);
  invariant(
    summary.sources.length === fixture.providers.length
      && summary.sources.every((source) => source.status === "SUCCESS"),
    `attempt_${attempt}_source_status`,
  );
  await completePipelineRun(
    tx,
    id,
    {
      updated:
        summary.totals.observationsUpserted + summary.totals.signalsUpserted,
      skipped: summary.totals.skippedSources,
    },
    {
      ...metadata,
      sources: summary.sources.length,
      failedSources: summary.totals.failedSources,
      enabledSourceFailureRate: health.failureRate,
    },
  );
  return { id, summary };
}

async function verifyInsideTransaction(
  tx: Prisma.TransactionClient,
  fixture: FixtureSet,
  validationRunId: string,
  checks: CheckReport,
  pipelineRunIds: string[],
): Promise<never> {
  const first = await runPipelineAttempt(tx, fixture, validationRunId, 1);
  pipelineRunIds.push(first.id);

  const observationWhere = {
    OR: fixture.observations.map((observation) => ({
      metricId: observation.metricId,
      sourceId: observation.sourceId,
      periodEnd: new Date(observation.periodEnd),
    })),
  };
  const firstObservations = await tx.dashboardObservation.findMany({
    where: observationWhere,
    select: { id: true, sourceRunId: true, status: true },
  });
  const firstSourceRuns = await tx.dashboardSourceRun.findMany({
    where: { sourceName: { in: fixture.sourceNames } },
    select: { id: true, sourceName: true, status: true },
  });
  const firstSignal = await tx.dashboardSignal.findUnique({
    where: {
      signalKey_observedAt_sourceId: {
        signalKey: fixture.signal.signalKey,
        observedAt: new Date(fixture.signal.observedAt),
        sourceId: fixture.signal.sourceId,
      },
    },
  });
  invariant(
    firstObservations.length === fixture.observations.length
      && firstObservations.every(
        (observation) => observation.status === "LIVE" && observation.sourceRunId,
      ),
    "first_observation_persistence",
  );
  invariant(
    firstSourceRuns.length === fixture.providers.length
      && firstSourceRuns.every((sourceRun) => sourceRun.status === "SUCCESS"),
    "first_source_run_persistence",
  );
  checks.firstPersistence = true;

  const firstPipeline = await tx.pipelineRun.findUnique({
    where: { id: first.id },
  });
  invariant(
    firstPipeline?.status === "SUCCEEDED"
      && firstPipeline.endedAt instanceof Date
      && firstPipeline.updated
        === first.summary.totals.observationsUpserted
          + first.summary.totals.signalsUpserted
      && firstPipeline.skipped === 0,
    "first_pipeline_completion",
  );
  checks.pipelineCompletion = true;

  const expectedHash = dashboardSignalContentHash(fixture.signal);
  invariant(
    firstSignal?.reviewStatus === "PENDING"
      && firstSignal.reviewedAt === null
      && firstSignal.reviewedById === null
      && firstSignal.reviewedContentHash === null
      && firstSignal.contentHash === expectedHash
      && firstSignal.sourceRunId !== null
      && firstSourceRuns.some((sourceRun) => sourceRun.id === firstSignal.sourceRunId),
    "first_signal_review_gate",
  );
  checks.pendingSignal = true;

  const replay = await runPipelineAttempt(tx, fixture, validationRunId, 2);
  pipelineRunIds.push(replay.id);
  const [
    replayObservations,
    replaySignals,
    replaySourceRuns,
    completedPipelines,
  ] = await Promise.all([
    tx.dashboardObservation.findMany({
      where: observationWhere,
      select: { id: true, sourceRunId: true, status: true },
    }),
    tx.dashboardSignal.findMany({
      where: { signalKey: fixture.signal.signalKey },
    }),
    tx.dashboardSourceRun.findMany({
      where: { sourceName: { in: fixture.sourceNames } },
      select: { id: true, status: true },
    }),
    tx.pipelineRun.findMany({
      where: { id: { in: pipelineRunIds } },
      select: { id: true, status: true, endedAt: true },
    }),
  ]);
  invariant(
    replayObservations.length === fixture.observations.length
      && replaySignals.length === 1
      && replaySignals[0]?.reviewStatus === "PENDING"
      && replaySignals[0]?.contentHash === expectedHash
      && replaySourceRuns.length === fixture.providers.length * 2
      && replaySourceRuns.every((sourceRun) => sourceRun.status === "SUCCESS")
      && completedPipelines.length === 2
      && completedPipelines.every(
        (pipeline) =>
          pipeline.status === "SUCCEEDED" && pipeline.endedAt instanceof Date,
      ),
    "idempotent_replay",
  );
  checks.idempotentReplay = true;

  throw new ExpectedValidationRollback();
}

async function main(): Promise<void> {
  const startedAt = performance.now();
  const validationRunId = randomUUID().replace(/-/g, "");
  const fixture = fixtures(validationRunId, new Date());
  const checks: CheckReport = {
    targetGuard: false,
    firstPersistence: false,
    pipelineCompletion: false,
    pendingSignal: false,
    idempotentReplay: false,
    transactionRollback: false,
  };
  const pipelineRunIds: string[] = [];
  let disconnected = false;
  let prisma: PrismaClient | null = null;
  let primaryFailure: unknown;

  try {
    const connectionString = requireValidationTarget();
    checks.targetGuard = true;
    prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
    const before = await databaseSnapshot(prisma, fixture);

    try {
      await prisma.$transaction(
        (tx) =>
          verifyInsideTransaction(
            tx,
            fixture,
            validationRunId,
            checks,
            pipelineRunIds,
          ),
        { maxWait: 10_000, timeout: 30_000 },
      );
      throw new Error(
        "Dashboard persistence validation transaction unexpectedly committed.",
      );
    } catch (error) {
      if (!(error instanceof ExpectedValidationRollback)) throw error;
    }

    const [after, residualPipelineRuns] = await Promise.all([
      databaseSnapshot(prisma, fixture),
      prisma.pipelineRun.count({ where: { id: { in: pipelineRunIds } } }),
    ]);
    invariant(before === after, "transaction_rollback_snapshot");
    invariant(residualPipelineRuns === 0, "transaction_rollback_pipeline_runs");
    checks.transactionRollback = true;
  } catch (error) {
    primaryFailure = error;
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect();
        disconnected = true;
      } catch (error) {
        primaryFailure ??= error;
      }
    }

    const report: AggregateReport = {
      verifier: "dashboard_persistence_validation",
      requiredTarget: "validation",
      status: primaryFailure === undefined ? "passed" : "failed",
      checks,
      fixtureCounts: {
        providers: fixture.providers.length,
        observations: fixture.observations.length,
        signals: 1,
        pipelineAttempts: 2,
      },
      disconnected,
      failureClassification: primaryFailure === undefined
        ? null
        : getSafeErrorDetails(primaryFailure)?.classification ?? "internal_error",
      durationMs: Math.round(performance.now() - startedAt),
      generatedAt: new Date().toISOString(),
    };
    console.log(JSON.stringify(report));
  }

  if (primaryFailure !== undefined) throw primaryFailure;
}

withServerTask(
  {
    task: "dashboard_persistence_validation",
    operation: "verify_real_database_persistence",
  },
  main,
).catch(() => {
  process.exitCode = 1;
});
