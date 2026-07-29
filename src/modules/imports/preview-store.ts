import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type ImportTransactionClient,
  withImportTransaction,
} from "@/lib/prisma-transaction";

const TOKEN_VERSION = 2;
const TOKEN_TTL_MS = 15 * 60 * 1000;
const COMMITTED_RECEIPT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_CLEANUP_LIMIT = 100;
const MAX_CLEANUP_LIMIT = 500;
const SHA_256_HEX = /^[a-f0-9]{64}$/;

export interface ImportPreviewSummary {
  total: number;
  valid: number;
  creates: number;
  updates: number;
  quarantined: number;
  errors: number;
  unchanged?: number;
  eligible?: number;
}

interface ImportPreviewClaims {
  v: number;
  id: string;
  actorId: string;
  entityType: string;
  payloadHash: string;
  stateHash: string;
  exp: number;
}

export interface CreateStoredImportPreviewInput {
  actorId: string;
  entityType: string;
  fileName?: string | null;
  payload: unknown;
  report: unknown;
  summary: ImportPreviewSummary;
  stateHash: string;
  now?: Date;
}

export interface CreatedStoredImportPreview {
  id: string;
  token: string;
  expiresAt: Date;
  payloadHash: string;
}

export interface ImportCommittedReceipt<TResult = Prisma.JsonValue> {
  previewId: string;
  committedAt: Date;
  auditEventId: string;
  result: TResult;
}

export interface LockedStoredImportPreview<
  TPayload = Prisma.JsonValue,
  TReport = Prisma.JsonValue,
  TSummary = Prisma.JsonValue,
  TResult = Prisma.JsonValue,
> {
  id: string;
  payload: TPayload | null;
  report: TReport | null;
  summary: TSummary;
  stateHash: string;
  payloadHash: string;
  fileName: string | null;
  expiresAt: Date;
  committedReceipt: ImportCommittedReceipt<TResult> | null;
}

export class ImportPreviewError extends Error {
  constructor(
    message = "Import preview is invalid, expired, changed, or unavailable. Preview the file again.",
  ) {
    super(message);
    this.name = "ImportPreviewError";
  }
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new ImportPreviewError("Import preview contains a non-finite number.");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new ImportPreviewError(
        "Import preview contains a non-JSON object.",
      );
    }
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(",")}}`;
  }
  throw new ImportPreviewError("Import preview contains an unsupported value.");
}

function inputJson(value: unknown, label: string): Prisma.InputJsonValue {
  const normalized = JSON.parse(canonicalJson(value)) as Prisma.InputJsonValue | null;
  if (normalized === null) {
    throw new ImportPreviewError(`${label} must be a JSON object or array.`);
  }
  return normalized;
}

export function hashImportPayload(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function hashImportPreviewState(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function tokenSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "NEXTAUTH_SECRET of at least 32 characters is required for import previews.",
    );
  }
  return secret;
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sign(encodedClaims: string): string {
  return createHmac("sha256", tokenSecret())
    .update(encodedClaims)
    .digest("base64url");
}

function safeEqual(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length
    && timingSafeEqual(actualBytes, expectedBytes);
}

function parseToken(token: string): ImportPreviewClaims {
  if (token.length > 4_096) throw new ImportPreviewError();
  const [encodedClaims, signature, extra] = token.split(".");
  if (
    !encodedClaims
    || !signature
    || extra
    || !/^[A-Za-z0-9_-]+$/.test(encodedClaims)
    || !/^[A-Za-z0-9_-]{43}$/.test(signature)
    || !safeEqual(signature, sign(encodedClaims))
  ) {
    throw new ImportPreviewError();
  }

  try {
    const claims = JSON.parse(
      Buffer.from(encodedClaims, "base64url").toString("utf8"),
    ) as Partial<ImportPreviewClaims>;
    if (
      claims.v !== TOKEN_VERSION
      || typeof claims.id !== "string"
      || !claims.id
      || typeof claims.actorId !== "string"
      || !claims.actorId
      || typeof claims.entityType !== "string"
      || !claims.entityType
      || typeof claims.payloadHash !== "string"
      || !SHA_256_HEX.test(claims.payloadHash)
      || typeof claims.stateHash !== "string"
      || !SHA_256_HEX.test(claims.stateHash)
      || typeof claims.exp !== "number"
      || !Number.isSafeInteger(claims.exp)
    ) {
      throw new ImportPreviewError();
    }
    return claims as ImportPreviewClaims;
  } catch (error) {
    if (error instanceof ImportPreviewError) throw error;
    throw new ImportPreviewError();
  }
}

function safeFileName(value: string | null | undefined): string | null {
  if (!value) return null;
  const leaf = value.trim().split(/[\\/]/).pop()?.trim() ?? "";
  return leaf ? leaf.slice(0, 255) : null;
}

type PreviewCleanupClient = Pick<PrismaClient, "importPreview">;

export async function cleanupStoredImportPreviews(options: {
  client?: PreviewCleanupClient;
  now?: Date;
  limit?: number;
} = {}): Promise<number> {
  const client = options.client ?? prisma;
  const now = options.now ?? new Date();
  const limit = Math.max(
    1,
    Math.min(MAX_CLEANUP_LIMIT, Math.trunc(options.limit ?? DEFAULT_CLEANUP_LIMIT)),
  );
  const committedBefore = new Date(
    now.getTime() - COMMITTED_RECEIPT_RETENTION_MS,
  );

  const stale = await client.importPreview.findMany({
    where: {
      OR: [
        { committedAt: null, expiresAt: { lt: now } },
        { committedAt: { lt: committedBefore } },
      ],
    },
    select: { id: true },
    orderBy: { expiresAt: "asc" },
    take: limit,
  });
  if (stale.length === 0) return 0;

  const deleted = await client.importPreview.deleteMany({
    where: { id: { in: stale.map(({ id }) => id) } },
  });
  return deleted.count;
}

export async function createStoredImportPreview(
  input: CreateStoredImportPreviewInput,
): Promise<CreatedStoredImportPreview> {
  if (!input.actorId.trim() || !input.entityType.trim()) {
    throw new ImportPreviewError();
  }
  if (!SHA_256_HEX.test(input.stateHash)) {
    throw new ImportPreviewError("Import preview state hash is invalid.");
  }

  const now = input.now ?? new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);
  const id = randomUUID();
  const payload = inputJson(input.payload, "Import payload");
  const report = inputJson(input.report, "Import report");
  const summary = inputJson(input.summary, "Import summary");
  const payloadHash = hashImportPayload(payload);
  const claims: ImportPreviewClaims = {
    v: TOKEN_VERSION,
    id,
    actorId: input.actorId,
    entityType: input.entityType,
    payloadHash,
    stateHash: input.stateHash,
    exp: expiresAt.getTime(),
  };
  const encodedClaims = Buffer.from(canonicalJson(claims)).toString("base64url");
  const token = `${encodedClaims}.${sign(encodedClaims)}`;

  try {
    await cleanupStoredImportPreviews({ now });
  } catch {
    // Cleanup is bounded, opportunistic housekeeping. A transient cleanup
    // failure must not prevent an administrator from creating a new preview.
  }

  await withImportTransaction((tx) => tx.importPreview.create({
    data: {
      id,
      tokenHash: tokenHash(token),
      actorId: input.actorId,
      entityType: input.entityType,
      payloadHash,
      summary,
      payload,
      report,
      stateHash: input.stateHash,
      fileName: safeFileName(input.fileName),
      expiresAt,
    },
  }));

  return { id, token, expiresAt, payloadHash };
}

interface StoredImportPreviewRow {
  id: string;
  tokenHash: string;
  actorId: string;
  entityType: string;
  payloadHash: string;
  summary: Prisma.JsonValue;
  expiresAt: Date;
  consumedAt: Date | null;
  payload: Prisma.JsonValue | null;
  report: Prisma.JsonValue | null;
  stateHash: string | null;
  fileName: string | null;
  committedAt: Date | null;
  auditEventId: string | null;
  result: Prisma.JsonValue | null;
}

/**
 * Verify the signed claims and lock the authoritative preview row. This helper
 * intentionally performs no mutation: the caller may validate current state
 * and then commit data plus `markStoredImportPreviewCommitted` atomically.
 */
export async function lockStoredImportPreview<
  TPayload = Prisma.JsonValue,
  TReport = Prisma.JsonValue,
  TSummary = Prisma.JsonValue,
  TResult = Prisma.JsonValue,
>(
  tx: ImportTransactionClient,
  input: {
    token: string | undefined;
    actorId: string;
    entityType: string;
    now?: Date;
  },
): Promise<LockedStoredImportPreview<TPayload, TReport, TSummary, TResult>> {
  if (!input.token) throw new ImportPreviewError();
  const claims = parseToken(input.token);
  if (
    !safeEqual(claims.actorId, input.actorId)
    || !safeEqual(claims.entityType, input.entityType)
  ) {
    throw new ImportPreviewError();
  }

  const rows = await tx.$queryRaw<StoredImportPreviewRow[]>`
    SELECT
      "id",
      "tokenHash",
      "actorId",
      "entityType",
      "payloadHash",
      "summary",
      "expiresAt" AT TIME ZONE 'UTC' AS "expiresAt",
      "consumedAt" AT TIME ZONE 'UTC' AS "consumedAt",
      "payload",
      "report",
      "stateHash",
      "fileName",
      "committedAt" AT TIME ZONE 'UTC' AS "committedAt",
      "auditEventId",
      "result"
    FROM "ImportPreview"
    WHERE "id" = ${claims.id}
    FOR UPDATE
  `;
  const row = rows[0];
  if (
    !row
    || !safeEqual(row.tokenHash, tokenHash(input.token))
    || !safeEqual(row.actorId, input.actorId)
    || !safeEqual(row.entityType, input.entityType)
    || !safeEqual(row.payloadHash, claims.payloadHash)
    || !row.stateHash
    || !safeEqual(row.stateHash, claims.stateHash)
    || row.expiresAt.getTime() !== claims.exp
  ) {
    throw new ImportPreviewError();
  }

  let committedReceipt: ImportCommittedReceipt<TResult> | null = null;
  if (row.committedAt) {
    if (!row.auditEventId || row.result === null) {
      throw new ImportPreviewError();
    }
    committedReceipt = {
      previewId: row.id,
      committedAt: row.committedAt,
      auditEventId: row.auditEventId,
      result: row.result as TResult,
    };
  } else {
    if (
      row.payload === null
      || row.report === null
      || !safeEqual(hashImportPayload(row.payload), claims.payloadHash)
    ) {
      throw new ImportPreviewError();
    }
    const now = input.now ?? new Date();
    if (
      row.consumedAt
      || claims.exp <= now.getTime()
      || row.expiresAt.getTime() <= now.getTime()
    ) {
      throw new ImportPreviewError();
    }
  }

  return {
    id: row.id,
    payload: row.payload as TPayload | null,
    report: row.report as TReport | null,
    summary: row.summary as TSummary,
    stateHash: row.stateHash,
    payloadHash: row.payloadHash,
    fileName: row.fileName,
    expiresAt: row.expiresAt,
    committedReceipt,
  };
}

export async function markStoredImportPreviewCommitted<TResult>(
  tx: ImportTransactionClient,
  input: {
    id: string;
    auditEventId: string;
    result: TResult;
    committedAt?: Date;
  },
): Promise<ImportCommittedReceipt<TResult>> {
  const committedAt = input.committedAt ?? new Date();
  const result = inputJson(input.result, "Import result");
  const updated = await tx.importPreview.updateMany({
    where: { id: input.id, committedAt: null },
    data: {
      consumedAt: committedAt,
      committedAt,
      auditEventId: input.auditEventId,
      result,
      payload: Prisma.DbNull,
      report: Prisma.DbNull,
      fileName: null,
    },
  });
  if (updated.count !== 1) throw new ImportPreviewError();

  return {
    previewId: input.id,
    committedAt,
    auditEventId: input.auditEventId,
    result: result as TResult,
  };
}
