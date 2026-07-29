import type { Prisma } from "@/generated/prisma/client";
import type { ImportTransactionClient } from "@/lib/prisma-transaction";
import {
  hashImportValue,
  type ImportEntityType,
  type ImportReportRow,
  type ImportSummary,
} from "./domain";
import type { ImportMutationResult } from "./deals";

const MAX_RETAINED_REPORT_ROWS = 500;
const MAX_AUDIT_IDENTIFIER_LENGTH = 200;
const MAX_AUDIT_CODE_LENGTH = 80;

export async function recordImportAuditEvent(
  tx: ImportTransactionClient,
  input: {
    actorId: string;
    previewId: string;
    entityType: ImportEntityType;
    payloadHash: string;
    summary: ImportSummary;
    result: ImportMutationResult;
    report: ImportReportRow[];
  },
): Promise<string> {
  const retainedReport = input.report
    .slice(0, MAX_RETAINED_REPORT_ROWS)
    .map((row) => ({
      row: row.row,
      identifier: row.identifier.slice(0, MAX_AUDIT_IDENTIFIER_LENGTH),
      disposition: row.disposition,
      ...(row.code
        ? { code: row.code.slice(0, MAX_AUDIT_CODE_LENGTH) }
        : {}),
    }));
  const event = await tx.auditEvent.create({
    data: {
      actorId: input.actorId,
      entityType: "ImportBatch",
      entityId: input.previewId,
      action: "IMPORT_COMMIT",
      changes: {
        changedFields: input.result.changedFields,
        created: input.result.created,
        updated: input.result.updated,
        unchanged: input.result.unchanged,
        quarantined: input.result.quarantined,
      } satisfies Prisma.InputJsonValue,
      metadata: {
        importEntityType: input.entityType,
        payloadHash: input.payloadHash,
        totalRows: input.summary.total,
        validRows: input.summary.valid,
        validationErrors: input.summary.errors,
        reportHash: hashImportValue(input.report),
        retainedReport,
        retainedReportRows: retainedReport.length,
        reportTruncated: input.report.length > retainedReport.length,
      } satisfies Prisma.InputJsonValue,
    },
    select: { id: true },
  });
  return event.id;
}
