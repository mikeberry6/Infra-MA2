import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const MAX_IMPORT_ROWS = 500;
export const IMPORT_PREVIEW_TTL_MS = 10 * 60 * 1000;

export type ImportEntityType = "deals" | "funds" | "portfolio";
export type ImportRowClassification = "create" | "update" | "unchanged" | "quarantine" | "error";

export interface ImportIssue {
  row: number;
  id?: string;
  legacyId?: string;
  fundId?: string;
  fundName?: string;
  name?: string;
  country?: string;
  status?: string;
  existingStatus?: string;
  code: string;
  error: string;
}

export interface ImportPreviewSummary {
  total: number;
  valid: number;
  creates: number;
  updates: number;
  unchanged: number;
  quarantined: number;
}

interface PreviewTokenPayload {
  version: 1;
  actorId: string;
  entityType: ImportEntityType;
  rowsHash: string;
  stateHash: string;
  issuedAt: number;
  expiresAt: number;
}

export class ImportPreviewTokenError extends Error {
  constructor(message = "Import preview token is invalid or expired") {
    super(message);
    this.name = "ImportPreviewTokenError";
  }
}

export class StaleImportPreviewError extends Error {
  constructor() {
    super("Import preview is stale; preview the file again before committing");
    this.name = "StaleImportPreviewError";
  }
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map((item) => canonicalize(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

export function stableImportJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function hashImportValue(value: unknown): string {
  return createHash("sha256").update(stableImportJson(value)).digest("hex");
}

export function sameImportValue(left: unknown, right: unknown): boolean {
  return hashImportValue(left) === hashImportValue(right);
}

function signingKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) throw new ImportPreviewTokenError("Import preview signing is unavailable");
  return createHmac("sha256", secret)
    .update("infrasight:import-preview:v1")
    .digest();
}

function sign(encodedPayload: string): Buffer {
  return createHmac("sha256", signingKey()).update(encodedPayload).digest();
}

export function issueImportPreviewToken({
  actorId,
  entityType,
  rowsHash,
  stateHash,
  now = Date.now(),
}: {
  actorId: string;
  entityType: ImportEntityType;
  rowsHash: string;
  stateHash: string;
  now?: number;
}): string {
  const payload: PreviewTokenPayload = {
    version: 1,
    actorId,
    entityType,
    rowsHash,
    stateHash,
    issuedAt: now,
    expiresAt: now + IMPORT_PREVIEW_TTL_MS,
  };
  const encodedPayload = Buffer.from(stableImportJson(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload).toString("base64url")}`;
}

function parsePayload(encodedPayload: string): PreviewTokenPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    throw new ImportPreviewTokenError();
  }
  if (!parsed || typeof parsed !== "object") throw new ImportPreviewTokenError();
  const payload = parsed as Partial<PreviewTokenPayload>;
  if (
    payload.version !== 1
    || typeof payload.actorId !== "string"
    || !["deals", "funds", "portfolio"].includes(String(payload.entityType))
    || typeof payload.rowsHash !== "string"
    || typeof payload.stateHash !== "string"
    || typeof payload.issuedAt !== "number"
    || typeof payload.expiresAt !== "number"
  ) {
    throw new ImportPreviewTokenError();
  }
  return payload as PreviewTokenPayload;
}

export function verifyImportPreviewToken({
  token,
  actorId,
  entityType,
  rowsHash,
  now = Date.now(),
}: {
  token: string;
  actorId: string;
  entityType: ImportEntityType;
  rowsHash: string;
  now?: number;
}): PreviewTokenPayload {
  const [encodedPayload, encodedSignature, ...extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra.length > 0) throw new ImportPreviewTokenError();

  let suppliedSignature: Buffer;
  try {
    suppliedSignature = Buffer.from(encodedSignature, "base64url");
  } catch {
    throw new ImportPreviewTokenError();
  }
  const expectedSignature = sign(encodedPayload);
  if (
    suppliedSignature.length !== expectedSignature.length
    || !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    throw new ImportPreviewTokenError();
  }

  const payload = parsePayload(encodedPayload);
  if (
    payload.actorId !== actorId
    || payload.entityType !== entityType
    || payload.rowsHash !== rowsHash
    || payload.issuedAt > now + 30_000
    || payload.expiresAt < now
  ) {
    throw new ImportPreviewTokenError();
  }
  return payload;
}

export function assertImportStateHash(expected: string, currentState: unknown): void {
  if (hashImportValue(currentState) !== expected) throw new StaleImportPreviewError();
}

export function duplicateImportIdentityIndexes<T>(
  rows: readonly T[],
  identity: (row: T) => string,
): Set<number> {
  const indexesByIdentity = new Map<string, number[]>();
  rows.forEach((row, index) => {
    const key = identity(row).trim().toLowerCase();
    if (!key) return;
    const indexes = indexesByIdentity.get(key) ?? [];
    indexes.push(index);
    indexesByIdentity.set(key, indexes);
  });
  return new Set(
    Array.from(indexesByIdentity.values())
      .filter((indexes) => indexes.length > 1)
      .flat(),
  );
}

export function summarizeImportClassifications(
  classifications: readonly ImportRowClassification[],
): ImportPreviewSummary {
  const count = (classification: ImportRowClassification) => (
    classifications.filter((value) => value === classification).length
  );
  const errors = count("error");
  return {
    total: classifications.length,
    valid: classifications.length - errors,
    creates: count("create"),
    updates: count("update"),
    unchanged: count("unchanged"),
    quarantined: count("quarantine"),
  };
}
