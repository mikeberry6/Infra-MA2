import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { formatSafeErrorSummary } from "@/lib/safe-error";

type PipelineClient = Pick<PrismaClient, "pipelineRun">;

export interface PipelineCounts {
  inserted?: number;
  updated?: number;
  skipped?: number;
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
      errorSummary: formatSafeErrorSummary(error),
      inserted: counts.inserted ?? 0,
      updated: counts.updated ?? 0,
      skipped: counts.skipped ?? 0,
      ...(metadata === undefined ? {} : { metadata }),
    },
  });
}
