import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  type ImportTransactionClient,
  withImportTransaction,
} from "@/lib/prisma-transaction";
import { revalidateAppData } from "@/lib/revalidation";
import {
  isAuthorizationError,
  requireAdminIdentity,
} from "@/modules/auth/guards";
import { recordImportAuditEvent } from "./audit";
import {
  classifyDealImport,
  commitDealImport,
  prepareDealRows,
  type PreparedDealImport,
} from "./deals";
import {
  hashImportValue,
  ImportConflictError,
  summarizeImportReport,
  type ImportClassification,
  type ImportEntityType,
  type ImportReportRow,
  type ImportSummary,
} from "./domain";
import { IMPORT_CONTRACTS } from "./contracts";
import {
  classifyFundImport,
  commitFundImport,
  prepareFundRows,
  type PreparedFundImport,
} from "./funds";
import {
  classifyCompanyImport,
  commitCompanyImport,
  prepareCompanyRows,
  type PreparedCompanyImport,
} from "./portfolio";
import {
  createStoredImportPreview,
  ImportPreviewError,
  lockStoredImportPreview,
  markStoredImportPreviewCommitted,
} from "./preview-store";
import {
  type ImportRequestRowError,
  type ImportRequestRow,
  isImportRequestError,
  normalizeContractRow,
  parseImportRequest,
} from "./request";

interface StoredImportPayload {
  version: 2;
  format: "csv" | "json";
  rows: Record<string, unknown>[];
  rowErrors: ImportRequestRowError[];
  totalRows: number;
}

interface PublicCommitResult {
  imported: number;
  created: number;
  updated: number;
  unchanged: number;
  quarantined: number;
  auditEventId: string;
}

type AnyPrepared =
  | PreparedDealImport
  | PreparedFundImport
  | PreparedCompanyImport;
type AnyClassification = ImportClassification<AnyPrepared>;
type ImportClient = typeof prisma | ImportTransactionClient;
const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{1,128}$/;

function importRequestId(request: NextRequest): string {
  const supplied = request.headers.get("x-request-id");
  return supplied && SAFE_REQUEST_ID.test(supplied)
    ? supplied
    : randomUUID();
}

async function classifyRows(
  entityType: ImportEntityType,
  client: ImportClient,
  rows: Record<string, unknown>[],
  rowErrors: ImportRequestRowError[] = [],
  totalRows = rows.length + rowErrors.length,
): Promise<AnyClassification> {
  let classification: AnyClassification;
  switch (entityType) {
    case "deals": {
      const prepared = prepareDealRows(rows);
      classification = await classifyDealImport(
        client as Parameters<typeof classifyDealImport>[0],
        prepared,
      ) as AnyClassification;
      break;
    }
    case "funds": {
      const prepared = prepareFundRows(rows);
      classification = await classifyFundImport(
        client as Parameters<typeof classifyFundImport>[0],
        prepared,
      ) as AnyClassification;
      break;
    }
    case "portfolio": {
      const prepared = prepareCompanyRows(rows);
      classification = await classifyCompanyImport(
        client as Parameters<typeof classifyCompanyImport>[0],
        prepared,
      ) as AnyClassification;
      break;
    }
  }
  if (rowErrors.length === 0 && totalRows === rows.length) {
    return classification;
  }
  const report = [
    ...classification.report,
    ...rowErrors.map((error) => ({
      row: error.row,
      identifier: "",
      disposition: "error" as const,
      code: error.code,
      message: error.message,
    })),
  ].sort((left, right) => left.row - right.row);
  return {
    ...classification,
    report,
    summary: summarizeImportReport(
      totalRows,
      classification.prepared.length,
      report,
    ),
  };
}

async function mutateRows(
  entityType: ImportEntityType,
  tx: ImportTransactionClient,
  classification: AnyClassification,
) {
  switch (entityType) {
    case "deals":
      return commitDealImport(
        tx,
        classification as ImportClassification<PreparedDealImport>,
      );
    case "funds":
      return commitFundImport(
        tx,
        classification as ImportClassification<PreparedFundImport>,
      );
    case "portfolio":
      return commitCompanyImport(
        tx,
        classification as ImportClassification<PreparedCompanyImport>,
      );
  }
}

function parseStoredPayload(
  value: unknown,
  entityType: ImportEntityType,
): StoredImportPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Partial<StoredImportPayload>;
  if (
    candidate.version !== 2
    || (candidate.format !== "csv" && candidate.format !== "json")
    || !Array.isArray(candidate.rows)
    || candidate.rows.length > 500
    || !Array.isArray(candidate.rowErrors)
    || !Number.isInteger(candidate.totalRows)
    || (candidate.totalRows ?? 0) < 1
    || (candidate.totalRows ?? 0) > 500
    || candidate.rows.length + candidate.rowErrors.length
      !== candidate.totalRows
  ) {
    return null;
  }
  try {
    const rows = candidate.rows.map((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        throw new ImportPreviewError();
      }
      return normalizeContractRow(
        row as ImportRequestRow,
        IMPORT_CONTRACTS[entityType],
        "json",
      );
    });
    const rowErrors = candidate.rowErrors.map((error) => {
      if (
        !error
        || typeof error !== "object"
        || Array.isArray(error)
        || !Number.isInteger(error.row)
        || error.row < 1
        || typeof error.code !== "string"
        || ![
          "INVALID_JSON_ROW",
          "INVALID_IMPORT_FIELDS",
          "INVALID_IMPORT_VALUE",
        ].includes(error.code)
        || typeof error.message !== "string"
        || error.message.length < 1
        || error.message.length > 1_000
        || Object.keys(error).some(
          (key) => !["row", "code", "message"].includes(key),
        )
      ) {
        throw new ImportPreviewError();
      }
      return {
        row: error.row,
        code: error.code as ImportRequestRowError["code"],
        message: error.message,
      };
    });
    const rowNumbers = [
      ...rows.map((row) => row.__row),
      ...rowErrors.map((error) => error.row),
    ];
    const firstRow = candidate.format === "csv" ? 2 : 1;
    const lastRow = firstRow + candidate.totalRows - 1;
    if (
      new Set(rowNumbers).size !== candidate.totalRows
      || rowNumbers.some(
        (row) =>
          !Number.isInteger(row)
          || row < firstRow
          || row > lastRow,
      )
    ) {
      throw new ImportPreviewError();
    }
    return {
      version: 2,
      format: candidate.format,
      rows,
      rowErrors,
      totalRows: candidate.totalRows,
    };
  } catch {
    return null;
  }
}

function samePreview(
  current: AnyClassification,
  stored: {
    report: ImportReportRow[];
    summary: ImportSummary;
    stateHash: string;
  },
): boolean {
  return current.stateHash === stored.stateHash
    && hashImportValue(current.report) === hashImportValue(stored.report)
    && hashImportValue(current.summary) === hashImportValue(stored.summary);
}

function safeImportLog(
  entityType: ImportEntityType,
  operation: "preview" | "commit",
  requestId: string,
  error: unknown,
) {
  const prismaCode =
    error
    && typeof error === "object"
    && "code" in error
    && /^P\d{4}$/.test(String((error as { code?: unknown }).code ?? ""))
      ? String((error as { code?: unknown }).code)
      : undefined;
  console.error(JSON.stringify({
    event: "import_failure",
    entityType,
    operation,
    requestId,
    errorType: error instanceof Error ? error.name : "UnknownError",
    ...(prismaCode ? { prismaCode } : {}),
  }));
}

function errorResponse(
  entityType: ImportEntityType,
  operation: "preview" | "commit",
  requestId: string,
  error: unknown,
) {
  if (isAuthorizationError(error)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (isImportRequestError(error)) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  if (error instanceof ImportPreviewError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  if (error instanceof ImportConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  safeImportLog(entityType, operation, requestId, error);
  return NextResponse.json(
    {
      error:
        operation === "preview"
          ? "The import preview could not be created"
          : "The import could not be committed",
      requestId,
    },
    { status: 500 },
  );
}

async function readCommitToken(request: NextRequest): Promise<string> {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  if (contentType !== "application/json") {
    throw new ImportPreviewError(
      "Import confirmation must contain the preview token.",
    );
  }
  const declaredLength = request.headers.get("content-length");
  if (
    declaredLength !== null
    && (
      !/^\d+$/.test(declaredLength.trim())
      || Number(declaredLength) > 16_384
    )
  ) {
    throw new ImportPreviewError();
  }
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await request.arrayBuffer());
  } catch {
    throw new ImportPreviewError();
  }
  if (bytes.byteLength === 0 || bytes.byteLength > 16_384) {
    throw new ImportPreviewError();
  }
  let body: unknown;
  try {
    body = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
  } catch {
    throw new ImportPreviewError();
  }
  if (
    !body
    || typeof body !== "object"
    || Array.isArray(body)
    || typeof (body as { token?: unknown }).token !== "string"
  ) {
    throw new ImportPreviewError();
  }
  return (body as { token: string }).token;
}

export async function previewImport(
  request: NextRequest,
  entityType: ImportEntityType,
) {
  const requestId = importRequestId(request);
  try {
    const identity = await requireAdminIdentity();
    const parsed = await parseImportRequest(request, {
      bodyKey: IMPORT_CONTRACTS[entityType].bodyKey,
      contract: IMPORT_CONTRACTS[entityType],
    });
    const normalizedRows = parsed.rows.map((row) =>
      normalizeContractRow(row, IMPORT_CONTRACTS[entityType], "json")
    );
    const candidatePayload: StoredImportPayload = {
      version: 2,
      format: parsed.format,
      rows: normalizedRows,
      rowErrors: parsed.rowErrors ?? [],
      totalRows: parsed.totalRows ?? normalizedRows.length,
    };
    const payload = parseStoredPayload(candidatePayload, entityType);
    if (!payload) throw new ImportPreviewError();
    const classification = await classifyRows(
      entityType,
      prisma,
      payload.rows,
      payload.rowErrors,
      payload.totalRows,
    );
    const stored = await createStoredImportPreview({
      actorId: identity.id,
      entityType,
      fileName: parsed.fileName,
      payload,
      report: classification.report,
      summary: classification.summary,
      stateHash: classification.stateHash,
    });
    return NextResponse.json({
      preview: true,
      token: stored.token,
      expiresAt: stored.expiresAt.toISOString(),
      summary: classification.summary,
      report: classification.report,
    });
  } catch (error) {
    return errorResponse(entityType, "preview", requestId, error);
  }
}

export async function commitImport(
  request: NextRequest,
  entityType: ImportEntityType,
) {
  const requestId = importRequestId(request);
  try {
    const identity = await requireAdminIdentity();
    const token = await readCommitToken(request);
    const response = await withImportTransaction(async (tx) => {
      const locked = await lockStoredImportPreview<
        StoredImportPayload,
        ImportReportRow[],
        ImportSummary,
        PublicCommitResult
      >(tx, {
        token,
        actorId: identity.id,
        entityType,
      });
      if (locked.committedReceipt) {
        return {
          ...locked.committedReceipt.result,
          auditEventId: locked.committedReceipt.auditEventId,
          idempotent: true,
        };
      }
      const storedPayload = parseStoredPayload(locked.payload, entityType);
      if (!storedPayload || !locked.report) {
        throw new ImportPreviewError();
      }

      const current = await classifyRows(
        entityType,
        tx,
        storedPayload.rows,
        storedPayload.rowErrors,
        storedPayload.totalRows,
      );
      if (
        !samePreview(current, {
          report: locked.report,
          summary: locked.summary,
          stateHash: locked.stateHash,
        })
      ) {
        throw new ImportConflictError();
      }
      if (current.summary.eligible === 0) {
        throw new ImportConflictError(
          "This preview contains no eligible changes to import.",
        );
      }

      const mutation = await mutateRows(entityType, tx, current);
      const auditEventId = await recordImportAuditEvent(tx, {
        actorId: identity.id,
        previewId: locked.id,
        entityType,
        payloadHash: locked.payloadHash,
        summary: current.summary,
        result: mutation,
        report: current.report,
      });
      const result: PublicCommitResult = {
        imported: mutation.imported,
        created: mutation.created,
        updated: mutation.updated,
        unchanged: mutation.unchanged,
        quarantined: mutation.quarantined,
        auditEventId,
      };
      await markStoredImportPreviewCommitted(tx, {
        id: locked.id,
        auditEventId,
        result,
      });
      return result;
    });

    try {
      revalidateAppData();
    } catch (error) {
      safeImportLog(entityType, "commit", requestId, error);
    }
    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(entityType, "commit", requestId, error);
  }
}
