import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type PipelineClient = Pick<PrismaClient, "pipelineRun">;

export interface PipelineCounts {
  inserted?: number;
  updated?: number;
  skipped?: number;
}

function errorSummary(error: unknown): string {
  const value = error instanceof Error ? error.message : String(error);
  return value.replace(/\s+/g, " ").trim().slice(0, 500);
}

export async function startPipelineRun(
  client: PipelineClient,
  pipeline: string,
  metadata?: Prisma.InputJsonValue,
): Promise<string> {
  const run = await client.pipelineRun.create({
    data: { pipeline, status: "RUNNING", metadata },
    select: { id: true },
  });
  return run.id;
}

export async function completePipelineRun(
  client: PipelineClient,
  id: string,
  counts: PipelineCounts = {},
  metadata?: Prisma.InputJsonValue,
): Promise<void> {
  await client.pipelineRun.update({
    where: { id },
    data: {
      status: "SUCCEEDED",
      endedAt: new Date(),
      inserted: counts.inserted ?? 0,
      updated: counts.updated ?? 0,
      skipped: counts.skipped ?? 0,
      ...(metadata === undefined ? {} : { metadata }),
    },
  });
}

export async function failPipelineRun(
  client: PipelineClient,
  id: string,
  error: unknown,
  counts: PipelineCounts = {},
  metadata?: Prisma.InputJsonValue,
): Promise<void> {
  await client.pipelineRun.update({
    where: { id },
    data: {
      status: "FAILED",
      endedAt: new Date(),
      errorSummary: errorSummary(error),
      inserted: counts.inserted ?? 0,
      updated: counts.updated ?? 0,
      skipped: counts.skipped ?? 0,
      ...(metadata === undefined ? {} : { metadata }),
    },
  });
}
