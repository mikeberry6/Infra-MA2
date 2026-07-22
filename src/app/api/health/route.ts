import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logServerOperation } from "@/lib/server-log";

const PIPELINES = [
  { name: "NEWS_SCAN", staleAfterHours: 36 },
  { name: "DASHBOARD_SYNC", staleAfterHours: 36 },
] as const;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const generatedAt = new Date();
  const startedAt = performance.now();
  const requestId = request.headers.get("x-request-id");
  try {
    await prisma.$queryRaw`SELECT 1`;
    const pipelines = await Promise.all(PIPELINES.map(async ({ name, staleAfterHours }) => {
      const [latestAttempt, latestSuccess] = await Promise.all([
        prisma.pipelineRun.findFirst({ where: { pipeline: name }, orderBy: { startedAt: "desc" } }),
        prisma.pipelineRun.findFirst({ where: { pipeline: name, status: "SUCCEEDED" }, orderBy: { endedAt: "desc" } }),
      ]);
      const successfulAt = latestSuccess?.endedAt ?? latestSuccess?.startedAt ?? null;
      const stale = !successfulAt || generatedAt.getTime() - successfulAt.getTime() > staleAfterHours * 60 * 60 * 1000;
      return {
        name,
        status: !latestAttempt ? "never-run" : latestAttempt.status === "FAILED" ? "failed" : stale ? "stale" : "healthy",
        lastAttemptAt: latestAttempt?.startedAt.toISOString() ?? null,
        lastSuccessfulAt: successfulAt?.toISOString() ?? null,
      };
    }));
    const degraded = pipelines.some((pipeline) => pipeline.status !== "healthy");
    const status = degraded ? 503 : 200;
    const generationTimeMs = Math.round(performance.now() - startedAt);
    logServerOperation({ route: "/api/health", operation: "health_check", durationMs: generationTimeMs, status, requestId });
    return NextResponse.json({
      status: degraded ? "degraded" : "healthy",
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local",
      database: "connected",
      pipelines,
      generatedAt: generatedAt.toISOString(),
      generationTimeMs,
    }, { status });
  } catch {
    const generationTimeMs = Math.round(performance.now() - startedAt);
    logServerOperation({ route: "/api/health", operation: "health_check", durationMs: generationTimeMs, status: 503, requestId });
    return NextResponse.json({
      status: "unhealthy",
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local",
      database: "unavailable",
      pipelines: [],
      generatedAt: generatedAt.toISOString(),
      generationTimeMs,
    }, { status: 503 });
  }
}
