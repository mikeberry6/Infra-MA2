import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withServerOperation } from "@/lib/server-log";
import {
  classifyCriticalPipeline,
  pipelineHealthPasses,
} from "@/app/api/health/pipeline-health";

const PIPELINES = ["NEWS_SCAN", "DASHBOARD_SYNC"] as const;

const SCHEMA_ERROR_CODES = new Set(["P2021", "P2022", "42P01", "42703"]);
const RELEASE_SHA = /^[0-9a-f]{40}$/;

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
} as const;

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function releaseVersion(value = process.env.VERCEL_GIT_COMMIT_SHA): string {
  const candidate = value?.trim() ?? "";
  return RELEASE_SHA.test(candidate) ? candidate.slice(0, 12) : "local";
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
          AND table_name = 'Fund'
          AND column_name = 'primarySourceUrl'
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

export async function GET(request: Request) {
  const generatedAt = new Date();

  return withServerOperation(request, {
    route: "/api/health",
    operation: "health_check",
  }, async ({ elapsedMs, markFailure }) => {
    const base = {
      version: releaseVersion(),
      generatedAt: generatedAt.toISOString(),
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      markFailure(error, 503);
      return NextResponse.json({
        status: "unhealthy",
        ...base,
        database: "unavailable",
        pipelines: [],
        generationTimeMs: elapsedMs(),
      }, { status: 503, headers: NO_STORE_HEADERS });
    }

    try {
      if (!(await schemaIsReady())) {
        return NextResponse.json({
          status: "unhealthy",
          ...base,
          database: "connected",
          pipelines: [],
          generationTimeMs: elapsedMs(),
        }, { status: 503, headers: NO_STORE_HEADERS });
      }

      const pipelines = await Promise.all(PIPELINES.map(async (name) => {
        const rows = await prisma.pipelineRun.findMany({
          where: { pipeline: name },
          orderBy: { startedAt: "desc" },
          take: 100,
          select: {
            id: true,
            status: true,
            startedAt: true,
            endedAt: true,
            metadata: true,
          },
        });
        return classifyCriticalPipeline(name, rows, generatedAt);
      }));
      const degraded = pipelines.some((pipeline) => !pipelineHealthPasses(pipeline));

      return NextResponse.json({
        status: degraded ? "degraded" : "healthy",
        ...base,
        database: "connected",
        pipelines,
        generationTimeMs: elapsedMs(),
      }, { status: degraded ? 503 : 200, headers: NO_STORE_HEADERS });
    } catch (error) {
      markFailure(error, 503);
      const schemaMismatch = isSchemaMismatchError(error);
      return NextResponse.json({
        status: "unhealthy",
        ...base,
        database: schemaMismatch ? "connected" : "unavailable",
        pipelines: [],
        generationTimeMs: elapsedMs(),
      }, { status: 503, headers: NO_STORE_HEADERS });
    }
  });
}
