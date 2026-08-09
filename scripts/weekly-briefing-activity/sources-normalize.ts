import { createHash } from "node:crypto";

export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Canonical JSON cannot encode non-finite numbers");
    return JSON.stringify(value);
  }
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value !== "object" || value === undefined) {
    throw new Error(`Canonical JSON cannot encode ${typeof value}`);
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

export function sha256Text(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Canonical(value: unknown): string {
  return sha256Text(canonicalJson(value));
}

export function normalizeTarget(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSourceUrl(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw || raw === "#") return null;

  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    parsed.protocol = "https:";
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(?:utm_|fbclid$|gclid$|mc_)/i.test(key)) parsed.searchParams.delete(key);
    }
    parsed.searchParams.sort();
    parsed.pathname = parsed.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return raw.toLowerCase().replace(/\/$/, "");
  }
}

export function cutoffInstant(cutoff: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoff)) throw new Error(`Invalid cutoff date: ${cutoff}`);
  return Date.parse(`${cutoff}T23:59:59.999Z`);
}
