import "dotenv/config";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { createOpenAiModelClient, readProcessingSettings } from "../src/modules/news-evidence/models";
import { EDGAR_SOURCE_KEY } from "../src/modules/news-evidence/policy";
import { drainNewsWork } from "../src/modules/news-evidence/processing";
import { captureDocument, fetchEdgarCapture, fetchRecentEdgarCaptures, fixtureCapturesSchema, queueVersionForReprocessing } from "../src/modules/news-evidence/source";

const usage = "Use capture-edgar --accession=<number>, capture-recent, reprocess --version-id=<id>, process [--limit=<1–50>], or load-fixtures [--file=<path>].";

class UsageError extends Error {}

function resolveCommand() {
  const { positionals, values } = parseArgs({
    options: {
      accession: { type: "string" },
      delivery: { type: "string" },
      file: { type: "string" },
      limit: { type: "string" },
      "version-id": { type: "string" },
    },
    allowPositionals: true,
  });
  if (positionals.length !== 1) throw new UsageError(usage);
  const [command] = positionals;
  if (command === "reprocess" && Object.keys(values).length === 1 && values["version-id"]) {
    if (!process.env.NEWS_PROCESSING_VERSION?.trim()) throw new UsageError("An explicit NEWS_PROCESSING_VERSION is required for replay.");
    return { command, versionId: values["version-id"] } as const;
  }
  if (values["version-id"] !== undefined) throw new UsageError(usage);
  if (command === "capture-edgar" && values.accession && values.limit === undefined && values.file === undefined) {
    if (!process.env.SEC_USER_AGENT) throw new UsageError("SEC_USER_AGENT is required for EDGAR capture.");
    return { command, accession: values.accession, delivery: values.delivery, userAgent: process.env.SEC_USER_AGENT } as const;
  }
  if (command === "capture-recent" && Object.keys(values).length === 0) {
    if (!process.env.SEC_USER_AGENT) throw new UsageError("SEC_USER_AGENT is required for EDGAR capture.");
    return { command, userAgent: process.env.SEC_USER_AGENT } as const;
  }
  if (command === "process" && values.accession === undefined && values.delivery === undefined && values.file === undefined) {
    if (!process.env.OPENAI_API_KEY?.trim()) throw new UsageError("OPENAI_API_KEY is required for news processing.");
    const limit = values.limit === undefined ? 20 : Number(values.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new UsageError("Processing limit must be an integer between 1 and 50.");
    return { command, limit, apiKey: process.env.OPENAI_API_KEY } as const;
  }
  if (command === "load-fixtures" && values.accession === undefined && values.delivery === undefined && values.limit === undefined) {
    return { command, file: values.file ?? "src/modules/news-evidence/fixtures/newsletter-deliveries.json" } as const;
  }
  throw new UsageError(usage);
}

function publicError(error: unknown): string {
  if (error instanceof UsageError) return error.message;
  if (error instanceof z.ZodError) return "A source response, fixture, or processing setting failed validation.";
  if (error instanceof Prisma.PrismaClientKnownRequestError) return `Database operation failed (${error.code}).`;
  if (error instanceof Error && /^(?:The supplied version|This processing configuration|EDGAR returned|EDGAR response exceeded|EDGAR polling scope|SEC_USER_AGENT|Unexpected issuer in EDGAR|This accession is outside|No filing acceptance|An approved EDGAR)/.test(error.message)) {
    return error.message;
  }
  return "Command failed. Check the staged target, source input and processing settings.";
}

async function main() {
  const input = resolveCommand();
  const settings = readProcessingSettings();
  if (process.env.VERCEL_ENV === "production" || process.env.NEWS_PIPELINE_TARGET !== "staging") {
    throw new UsageError("Set NEWS_PIPELINE_TARGET=staging and use an explicitly verified staging or local database.");
  }
  execFileSync(process.execPath, ["--experimental-strip-types", "scripts/assert-database-target.ts"], { stdio: "inherit" });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const pipeline = input.command === "process" ? "evidence-news-process"
    : input.command === "reprocess" ? "evidence-news-replay"
    : input.command === "load-fixtures" ? "evidence-news-fixtures" : "evidence-news-capture";
  try {
    const { id: runId } = await prisma.pipelineRun.create({
      data: { pipeline, metadata: { command: input.command, settings } }, select: { id: true },
    });
    const metrics = { captured: 0, newVersions: 0, newDeliveries: 0, completed: 0, failed: 0, retryable: 0, lost: 0 };
    let status = "SUCCEEDED";
    let errorSummary: string | undefined;
    try {
      if (input.command === "capture-edgar") {
        const capture = await fetchEdgarCapture({ accession: input.accession, userAgent: input.userAgent, deliveryKey: input.delivery });
        const result = await captureDocument(prisma, capture, settings);
        metrics.captured = 1;
        metrics.newVersions = Number(result.newVersion);
        metrics.newDeliveries = Number(result.newDelivery);
        console.log(JSON.stringify({ event: "news_capture", source: EDGAR_SOURCE_KEY, accession: capture.externalKey, ...result }));
      } else if (input.command === "capture-recent") {
        for await (const capture of fetchRecentEdgarCaptures({ userAgent: input.userAgent })) {
          const result = await captureDocument(prisma, capture, settings);
          metrics.captured++;
          metrics.newVersions += Number(result.newVersion);
          metrics.newDeliveries += Number(result.newDelivery);
        }
      } else if (input.command === "reprocess") {
        const work = await queueVersionForReprocessing(prisma, input.versionId, settings);
        console.log(JSON.stringify({ event: "news_reprocess", versionId: input.versionId, ...work }));
      } else if (input.command === "load-fixtures") {
        const captures = fixtureCapturesSchema.parse(JSON.parse(await readFile(input.file, "utf8")));
        for (const capture of captures) {
          const result = await captureDocument(prisma, capture, settings);
          metrics.captured++;
          metrics.newVersions += Number(result.newVersion);
          metrics.newDeliveries += Number(result.newDelivery);
        }
      } else {
        const model = createOpenAiModelClient(input.apiKey);
        Object.assign(metrics, await drainNewsWork(prisma, { sourceKey: EDGAR_SOURCE_KEY, model, limit: input.limit }));
        if (metrics.failed > 0) {
          status = "FAILED";
          errorSummary = "One or more work items failed. Inspect the staged processing attempts.";
        } else if (metrics.retryable > 0) {
          status = "RETRYABLE";
          errorSummary = "The model or database was temporarily unavailable. Jobs remain queued for retry.";
        }
      }
    } catch (error) {
      status = "FAILED";
      errorSummary = publicError(error);
    }
    await prisma.pipelineRun.update({
      where: { id: runId },
      data: { status, endedAt: new Date(), inserted: metrics.newVersions, updated: metrics.completed,
        skipped: metrics.captured - metrics.newVersions, errorSummary, metadata: { command: input.command, settings, ...metrics } },
    });
    console.log(JSON.stringify({ event: "news_pipeline_run", command: input.command, runId, status, ...metrics, errorSummary }));
    if (status !== "SUCCEEDED") process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(JSON.stringify({ event: "news_evidence_failure", reason: publicError(error) }));
  process.exitCode = 1;
});
