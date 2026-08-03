import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Stable JSON for review artifacts. Object keys are sorted recursively while
 * array order remains meaningful. Undefined values and non-finite numbers are
 * rejected so a digest can always be reproduced from serialized JSON.
 */
export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Canonical JSON cannot encode a non-finite number");
    return JSON.stringify(value);
  }
  if (typeof value === "undefined" || typeof value === "function" || typeof value === "symbol") {
    throw new Error(`Canonical JSON cannot encode ${typeof value}`);
  }
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

export function sha256Canonical(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function sha256Text(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashWithoutField(
  value: Record<string, unknown>,
  hashField: string,
): string {
  const copy: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (key !== hashField) copy[key] = item;
  }
  return sha256Canonical(copy);
}

export function digestsEqual(left: string, right: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(left) || !/^[a-f0-9]{64}$/.test(right)) return false;
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function assertArtifactHash(
  artifact: Record<string, unknown>,
  hashField: string,
  label: string,
): void {
  const recorded = artifact[hashField];
  if (typeof recorded !== "string" || !digestsEqual(recorded, hashWithoutField(artifact, hashField))) {
    throw new Error(`${label} hash does not match its canonical contents`);
  }
}
