import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  logServerRequest,
  SERVER_OPERATIONS,
  SERVER_ROUTES,
} from "@/lib/server-log";
import {
  REQUEST_ID_HEADER,
  runWithServerRequestContext,
} from "@/lib/server-request-context";
import {
  collectHealthResult,
  createUnavailableHealthResult,
  type HealthDataSource,
} from "@/app/api/health/health";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const healthDataSource: HealthDataSource = {
  async checkConnectivity() {
    await prisma.$queryRaw`SELECT 1`;
  },
  async readPipelineRuns(pipeline) {
    return prisma.pipelineRun.findMany({
      where: { pipeline },
      orderBy: { startedAt: "desc" },
      take: 100,
      select: {
        status: true,
        startedAt: true,
        endedAt: true,
        metadata: true,
      },
    });
  },
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  return runWithServerRequestContext(request.headers, async ({ requestId }) => {
    const startedAt = performance.now();
    let result;
    try {
      result = await collectHealthResult(healthDataSource);
    } catch (error) {
      result = createUnavailableHealthResult();
      logServerRequest({
        route: SERVER_ROUTES.health,
        operation: SERVER_OPERATIONS.healthRead,
        startedAt,
        status: 503,
        error,
      });
      return healthResponse(result.payload, requestId, 503);
    }

    const status = result.payload.status === "healthy" ? 200 : 503;
    logServerRequest({
      route: SERVER_ROUTES.health,
      operation: SERVER_OPERATIONS.healthRead,
      startedAt,
      status,
      errorClass: result.errorClass,
    });
    return healthResponse(result.payload, requestId, status);
  });
}

function healthResponse(
  payload: Awaited<ReturnType<typeof collectHealthResult>>["payload"],
  requestId: string,
  status: 200 | 503,
): NextResponse {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      [REQUEST_ID_HEADER]: requestId,
    },
  });
}

