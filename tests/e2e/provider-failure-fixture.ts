import { prisma } from "../../src/lib/prisma";
import { assertIsolatedE2EDatabase } from "./isolation-guard";

const NEWS_RUN_ID = "e2e-provider-failure-news";
const NEWS_SUCCESS_RUN_ID = "e2e-provider-failure-news-success";
const DASHBOARD_RUN_ID = "e2e-provider-failure-dashboard";
const DASHBOARD_SOURCE_RUN_ID = "e2e-provider-failure-dashboard-source";

function requireIsolatedFixtureTarget(): void {
  assertIsolatedE2EDatabase();
  if (process.env.TARGET_DATABASE !== "validation") {
    throw new Error("Provider-failure fixture requires TARGET_DATABASE=validation.");
  }
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL !== process.env.E2E_DATABASE_URL) {
    throw new Error("Provider-failure fixture requires DATABASE_URL to equal E2E_DATABASE_URL.");
  }
}

async function removeFixtureRows(): Promise<void> {
  await prisma.$transaction([
    prisma.dashboardSourceRun.deleteMany({
      where: { id: DASHBOARD_SOURCE_RUN_ID },
    }),
    prisma.pipelineRun.deleteMany({
      where: { id: { in: [NEWS_RUN_ID, NEWS_SUCCESS_RUN_ID, DASHBOARD_RUN_ID] } },
    }),
  ]);
}

async function installFixtureRows(): Promise<void> {
  await removeFixtureRows();

  // A slightly future timestamp keeps these deterministic fixture records at
  // the head of otherwise changing validation-branch histories. They are
  // removed immediately after the dedicated browser server stops.
  const startedAt = new Date(Date.now() + 60_000);
  const endedAt = new Date(startedAt.getTime() + 1_000);
  const priorSuccessStartedAt = new Date(startedAt.getTime() - 60_000);
  const priorSuccessEndedAt = new Date(priorSuccessStartedAt.getTime() + 1_000);

  await prisma.$transaction([
    prisma.pipelineRun.create({
      data: {
        id: NEWS_SUCCESS_RUN_ID,
        pipeline: "NEWS_SCAN",
        status: "SUCCEEDED",
        startedAt: priorSuccessStartedAt,
        endedAt: priorSuccessEndedAt,
        metadata: {
          fixture: "provider-failure-e2e",
          sourceCoverage: { attempted: 4, succeeded: 4, failed: 0 },
        },
      },
    }),
    prisma.pipelineRun.create({
      data: {
        id: NEWS_RUN_ID,
        pipeline: "NEWS_SCAN",
        status: "FAILED",
        startedAt,
        endedAt,
        errorSummary: "External provider fixture failure",
        metadata: {
          fixture: "provider-failure-e2e",
          sourceCoverage: { attempted: 4, succeeded: 3, failed: 1 },
        },
      },
    }),
    prisma.pipelineRun.create({
      data: {
        id: DASHBOARD_RUN_ID,
        pipeline: "DASHBOARD_SYNC",
        status: "FAILED",
        startedAt,
        endedAt,
        errorSummary: "External provider fixture failure",
        metadata: { fixture: "provider-failure-e2e" },
      },
    }),
    prisma.dashboardSourceRun.create({
      data: {
        id: DASHBOARD_SOURCE_RUN_ID,
        sourceId: "fred",
        sourceName: "FRED",
        status: "FAILED",
        startedAt,
        endedAt,
        error: "External provider fixture failure",
        metadata: {
          fixture: "provider-failure-e2e",
          requiredMetrics: 1,
          currentRequiredMetrics: 0,
          missingRequiredMetrics: ["vix"],
          staleRequiredMetrics: [],
        },
      },
    }),
  ]);
}

async function main(): Promise<void> {
  requireIsolatedFixtureTarget();
  const operation = process.argv[2];
  if (operation === "setup") {
    await installFixtureRows();
  } else if (operation === "cleanup") {
    await removeFixtureRows();
  } else {
    throw new Error("Usage: provider-failure-fixture.ts <setup|cleanup>");
  }

  console.log(JSON.stringify({
    fixture: "provider-failure-e2e",
    operation,
    status: "succeeded",
    affectedIds: [
      NEWS_RUN_ID,
      NEWS_SUCCESS_RUN_ID,
      DASHBOARD_RUN_ID,
      DASHBOARD_SOURCE_RUN_ID,
    ],
  }));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Provider-failure fixture failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
