import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const TOKEN_VERSION = 1;
const TOKEN_TTL_MS = 15 * 60 * 1000;

export interface ImportPreviewSummary {
  total: number;
  valid: number;
  creates: number;
  updates: number;
  unchanged: number;
  quarantined: number;
  errors: number;
  stateHash?: string;
}

interface ImportPreviewClaims {
  v: number;
  id: string;
  actorId: string;
  entityType: string;
  payloadHash: string;
  summary: ImportPreviewSummary;
  exp: number;
}

export class ImportPreviewTokenError extends Error {
  constructor(message = "Import preview is missing, expired, changed, or already used. Preview the file again.") {
    super(message);
    this.name = "ImportPreviewTokenError";
  }
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new ImportPreviewTokenError("Import payload contains a non-finite number.");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(",")}}`;
  }
  throw new ImportPreviewTokenError("Import payload contains an unsupported value.");
}

export function hashImportPayload(items: Record<string, unknown>[]): string {
  return createHash("sha256").update(canonicalJson(items)).digest("hex");
}

export function hashImportPreviewState(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function tokenSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("NEXTAUTH_SECRET of at least 32 characters is required for import previews.");
  }
  return secret;
}

function sign(encodedClaims: string): string {
  return createHmac("sha256", tokenSecret()).update(encodedClaims).digest("base64url");
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sameSignature(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

function parseToken(token: string): ImportPreviewClaims {
  const [encodedClaims, signature, extra] = token.split(".");
  if (!encodedClaims || !signature || extra || !sameSignature(signature, sign(encodedClaims))) {
    throw new ImportPreviewTokenError();
  }
  try {
    const claims = JSON.parse(Buffer.from(encodedClaims, "base64url").toString("utf8")) as ImportPreviewClaims;
    if (
      claims.v !== TOKEN_VERSION
      || !claims.id
      || !claims.actorId
      || !claims.entityType
      || !claims.payloadHash
      || !claims.summary
      || !Number.isFinite(claims.exp)
    ) {
      throw new ImportPreviewTokenError();
    }
    return claims;
  } catch (error) {
    if (error instanceof ImportPreviewTokenError) throw error;
    throw new ImportPreviewTokenError();
  }
}

export async function createImportPreviewToken(options: {
  actorId: string;
  entityType: string;
  items: Record<string, unknown>[];
  summary: ImportPreviewSummary;
}): Promise<string> {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  const claims: ImportPreviewClaims = {
    v: TOKEN_VERSION,
    id,
    actorId: options.actorId,
    entityType: options.entityType,
    payloadHash: hashImportPayload(options.items),
    summary: options.summary,
    exp: expiresAt.getTime(),
  };
  const encodedClaims = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const token = `${encodedClaims}.${sign(encodedClaims)}`;

  await prisma.importPreview.create({
    data: {
      id,
      tokenHash: tokenHash(token),
      actorId: options.actorId,
      entityType: options.entityType,
      payloadHash: claims.payloadHash,
      summary: options.summary as unknown as Prisma.InputJsonValue,
      expiresAt,
    },
  });
  return token;
}

export async function consumeImportPreviewToken(options: {
  token: string | undefined;
  actorId: string;
  entityType: string;
  items: Record<string, unknown>[];
  summary: ImportPreviewSummary;
}): Promise<void> {
  if (!options.token) throw new ImportPreviewTokenError();
  const claims = parseToken(options.token);
  const payloadHash = hashImportPayload(options.items);
  const summaryMatches = canonicalJson(claims.summary) === canonicalJson(options.summary);
  if (
    claims.actorId !== options.actorId
    || claims.entityType !== options.entityType
    || claims.payloadHash !== payloadHash
    || !summaryMatches
    || claims.exp <= Date.now()
  ) {
    throw new ImportPreviewTokenError();
  }

  const consumed = await prisma.importPreview.updateMany({
    where: {
      id: claims.id,
      tokenHash: tokenHash(options.token),
      actorId: options.actorId,
      entityType: options.entityType,
      payloadHash,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { consumedAt: new Date() },
  });
  if (consumed.count !== 1) throw new ImportPreviewTokenError();
}
