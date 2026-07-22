import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/modules/operations/audit";
import {
  completePipelineRun,
  failPipelineRun,
  startPipelineRun,
  type PipelineCounts,
} from "@/modules/operations/pipeline-runs";

const IMPORT_TRANSACTION_MAX_WAIT_MS = 10_000;
const IMPORT_TRANSACTION_TIMEOUT_MS = 120_000;

interface ImportCommitWork<T> {
  value: T;
  counts: Required<PipelineCounts>;
  auditChanges: Prisma.InputJsonValue;
}

interface ImportCommitOptions<T> {
  pipeline: string;
  entityType: string;
  rowCount: number;
  execute: (tx: Prisma.TransactionClient) => Promise<ImportCommitWork<T>>;
}

export interface ImportCommitResult<T> {
  value: T;
  auditEventId: string;
  pipelineRunId: string;
}

function prismaErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = String((error as { code?: unknown }).code ?? "");
  return /^P\d{4}$/.test(code) ? code : null;
}

/**
 * Convert an arbitrary exception into a useful operational category without
 * persisting credentials, imported row contents, or database values.
 */
export function sanitizeImportError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  const code = prismaErrorCode(error);
  const suffix = code ? ` (${code})` : "";

  if (/timed?\s*out|timeout/i.test(message)) return `Import transaction timed out${suffix}`;
  if (/connect|connection|database.+unavailable|ECONN/i.test(message)) {
    return `Import database connection failed${suffix}`;
  }
  if (/unique constraint|duplicate key/i.test(message)) {
    return `Import database uniqueness conflict${suffix}`;
  }
  if (/foreign key|referential integrity/i.test(message)) {
    return `Import database relationship conflict${suffix}`;
  }
  if (/audit/i.test(message)) return `Import audit write failed${suffix}`;

  return `Import commit failed${suffix}`;
}

/**
 * Run an import as one atomic commit. The PipelineRun is created beforehand so
 * a rolled-back commit can still be marked FAILED, while its SUCCEEDED update
 * is part of the same transaction as all imported rows and the AuditEvent.
 */
export async function commitImport<T>(
  options: ImportCommitOptions<T>,
): Promise<ImportCommitResult<T>> {
  const pipelineRunId = await startPipelineRun(prisma, options.pipeline, {
    rowCount: options.rowCount,
  });

  try {
    return await prisma.$transaction(async (tx) => {
      const work = await options.execute(tx);
      const auditEventId = await recordAuditEvent({
        entityType: options.entityType,
        action: "BULK_IMPORT",
        changes: work.auditChanges,
      }, tx);

      await completePipelineRun(tx, pipelineRunId, work.counts, { auditEventId });

      return {
        value: work.value,
        auditEventId,
        pipelineRunId,
      };
    }, {
      maxWait: IMPORT_TRANSACTION_MAX_WAIT_MS,
      timeout: IMPORT_TRANSACTION_TIMEOUT_MS,
    });
  } catch (error) {
    const summary = sanitizeImportError(error);
    try {
      await failPipelineRun(prisma, pipelineRunId, new Error(summary));
    } catch {
      // Preserve the original commit failure. Monitoring will also surface a
      // RUNNING import that exceeds its freshness contract.
    }
    throw error;
  }
}
