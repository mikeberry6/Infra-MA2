import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withServerOperation } from "@/lib/server-log";
import { nextDashboardSyncAt } from "@/modules/operations/pipeline-schedules";

const PIPELINES = ["NEWS_SCAN", "DASHBOARD_SYNC"] as const;

const SCHEMA_ERROR_CODES = new Set(["P2021", "P2022", "42P01", "42703"]);

export const dynamic = "force-dynamic";

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

/** Distinguish a reachable-but-unmigrated database from a network failure. */
function isSchemaMismatchError(error: unknown): boolean {
  const root = objectValue(error);
  const cause = objectValue(root?.cause);
  const meta = objectValue(root?.meta);
  const adapterError = objectValue(meta?.driverAdapterError);
  const adapterCause = objectValue(adapterError?.cause);
  const codes = [
    root?.code,
    cause?.code,
    cause?.originalCode,
    meta?.code,
    adapterCause?.code,
    adapterCause?.originalCode,
  ];

  if (codes.some((code) => typeof code === "string" && SCHEMA_ERROR_CODES.has(code))) {
    return true;
  }

  const message = error instanceof Error ? error.message : "";
  return /(?:relation|table|column) .+ does not exist|unknown (?:field|argument)/i.test(message);
}

async function schemaIsReady(): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ ready: boolean }>>`
    SELECT (
      to_regclass('"PipelineRun"') IS NOT NULL
      AND to_regclass('"AuditEvent"') IS NOT NULL
      AND to_regclass('"CompanyRedirect"') IS NOT NULL
      AND to_regclass('"AuthThrottle"') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'Deal'
          AND column_name = 'lastVerifiedAt'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'Fund'
          AND column_name = 'lastVerifiedAt'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'Company'
          AND column_name = 'lastVerifiedAt'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'Citation'
          AND column_name = 'isPrimary'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'Deal'
          AND column_name = 'sellerDisclosureStatus'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'Deal'
          AND column_name = 'sellerDisclosureReason'
      )
    ) AS "ready"
  `;
  return rows[0]?.ready === true;
}

function pipelineIsStale(
  name: (typeof PIPELINES)[number],
  successfulAt: Date | null,
  generatedAt: Date,
): boolean {
  if (!successfulAt) return true;
  if (name === "DASHBOARD_SYNC") {
    return nextDashboardSyncAt(successfulAt).getTime() <= generatedAt.getTime();
  }
  return generatedAt.getTime() - successfulAt.getTime()
    > 36 * 60 * 60 * 1000;
}

export async function GET(request: Request) {
  const generatedAt = new Date();

  return withServerOperation(request, {
    route: "/api/health",
    operation: "health_check",
  }, async ({ elapsedMs }) => {
    const base = {
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local",
      generatedAt: generatedAt.toISOString(),
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      return NextResponse.json({
        status: "unhealthy",
        ...base,
        database: "unavailable",
        pipelines: [],
        generationTimeMs: elapsedMs(),
      }, { status: 503 });
    }

    try {
      if (!(await schemaIsReady())) {
        return NextResponse.json({
          status: "unhealthy",
          ...base,
          database: "connected",
          pipelines: [],
          generationTimeMs: elapsedMs(),
        }, { status: 503 });
      }

      const pipelines = await Promise.all(PIPELINES.map(async (name) => {
        const [latestAttempt, latestSuccess] = await Promise.all([
          prisma.pipelineRun.findFirst({
            where: { pipeline: name },
            orderBy: { startedAt: "desc" },
          }),
          prisma.pipelineRun.findFirst({
            where: { pipeline: name, status: "SUCCEEDED" },
            orderBy: { endedAt: "desc" },
          }),
        ]);
        const successfulAt = latestSuccess?.endedAt ?? latestSuccess?.startedAt ?? null;
        const stale = pipelineIsStale(name, successfulAt, generatedAt);
        return {
          name,
          status: !latestAttempt
            ? "never-run"
            : latestAttempt.status === "FAILED"
              ? "failed"
              : stale
                ? "stale"
                : "healthy",
          lastAttemptAt: latestAttempt?.startedAt.toISOString() ?? null,
          lastSuccessfulAt: successfulAt?.toISOString() ?? null,
        };
      }));
      const degraded = pipelines.some((pipeline) => pipeline.status !== "healthy");

      return NextResponse.json({
        status: degraded ? "degraded" : "healthy",
        ...base,
        database: "connected",
        pipelines,
        generationTimeMs: elapsedMs(),
      }, { status: degraded ? 503 : 200 });
    } catch (error) {
      const schemaMismatch = isSchemaMismatchError(error);
      return NextResponse.json({
        status: "unhealthy",
        ...base,
        database: schemaMismatch ? "connected" : "unavailable",
        pipelines: [],
        generationTimeMs: elapsedMs(),
      }, { status: 503 });
    }
  });
}
