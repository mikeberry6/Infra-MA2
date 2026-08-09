import { createHash, timingSafeEqual } from "node:crypto";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

/**
 * Serialize JSON deterministically for version-controlled audit artifacts.
 *
 * Object keys are sorted recursively. Array order remains significant because
 * source priority, sponsor lineage, and reviewer order can all carry meaning.
 * Values that JSON would silently discard are rejected instead.
 */
export function canonicalJson(value: unknown): string {
  if (value === null) return "null";

  switch (typeof value) {
    case "string":
    case "boolean":
      return JSON.stringify(value);
    case "number":
      if (!Number.isFinite(value)) {
        throw new Error("Canonical JSON cannot encode a non-finite number");
      }
      return JSON.stringify(value);
    case "undefined":
    case "function":
    case "symbol":
    case "bigint":
      throw new Error(`Canonical JSON cannot encode ${typeof value}`);
    case "object":
      break;
  }

  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

export function sha256Text(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Bytes(value: NodeJS.ArrayBufferView): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Canonical(value: unknown): string {
  return sha256Text(canonicalJson(value));
}

/** Domain separation prevents one artifact type from impersonating another. */
export function hashCanonical(domain: string, value: unknown): string {
  if (domain.trim().length === 0) throw new Error("Hash domain must not be empty");
  return sha256Text(`${domain}\n${canonicalJson(value)}`);
}

export function withoutKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): Record<string, unknown> {
  const omitted = new Set(keys);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !omitted.has(key)));
}

export function digestsEqual(left: string, right: string): boolean {
  if (!SHA256_PATTERN.test(left) || !SHA256_PATTERN.test(right)) return false;
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function assertDigest(expected: string, actual: string, label: string): void {
  if (!digestsEqual(expected, actual)) {
    throw new Error(`${label} hash mismatch: expected ${expected}, received ${actual}`);
  }
}

export const SHA256_REGEX = SHA256_PATTERN;
