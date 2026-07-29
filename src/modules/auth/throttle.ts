import { createHmac } from "crypto";
import { isIP } from "net";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const RETENTION_MS = 24 * 60 * 60 * 1000;
const MAX_FAILURES = 5;

type RequestHeaders = Record<string, string | string[] | undefined> | undefined;

function hashKey(scope: "email" | "ip", value: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured");
  return createHmac("sha256", secret)
    .update(`${scope}:${value.trim().toLowerCase()}`)
    .digest("hex");
}

function throttleKeys(email: string, ip?: string | null): string[] {
  const keys = [hashKey("email", email)];
  if (ip) keys.push(hashKey("ip", ip));
  return keys;
}

function headerValue(
  headers: RequestHeaders,
  name: string,
): string | string[] | undefined {
  if (!headers) return undefined;
  const direct = headers[name] ?? headers[name.toLowerCase()];
  if (direct !== undefined) return direct;
  const matchedKey = Object.keys(headers).find((key) => key.toLowerCase() === name);
  return matchedKey ? headers[matchedKey] : undefined;
}

export function requestIp(headers: RequestHeaders): string | null {
  // Vercel documents this as its protected copy of the client forwarding
  // header. Fall back to X-Forwarded-For for local/non-Vercel deployments.
  const forwarded =
    headerValue(headers, "x-vercel-forwarded-for") ??
    headerValue(headers, "x-forwarded-for");
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const candidate = value?.split(",")[0]?.trim() || "";
  return isIP(candidate) ? candidate : null;
}

export async function isLoginThrottled(
  email: string,
  ip?: string | null,
): Promise<boolean> {
  const now = new Date();
  const rows = await prisma.authThrottle.findMany({
    where: { keyHash: { in: throttleKeys(email, ip) } },
    select: { lockedUntil: true },
  });
  return rows.some((row) => row.lockedUntil != null && row.lockedUntil > now);
}

export async function recordFailedLogin(
  email: string,
  ip?: string | null,
): Promise<void> {
  const now = new Date();
  await prisma.authThrottle.deleteMany({
    where: {
      updatedAt: {
        lt: new Date(now.getTime() - RETENTION_MS),
      },
    },
  });

  const lockUntil = new Date(now.getTime() + WINDOW_MS);
  for (const keyHash of throttleKeys(email, ip)) {
    // PrismaNeonHttp intentionally does not support interactive transactions.
    // This single-statement upsert is atomic at the Postgres row level, so
    // simultaneous failures cannot lose increments.
    await prisma.$executeRaw`
      INSERT INTO "AuthThrottle" (
        "keyHash",
        "failedAttempts",
        "windowStartedAt",
        "lockedUntil",
        "updatedAt"
      )
      VALUES (
        ${keyHash},
        1,
        ${now}::timestamp(3),
        NULL,
        ${now}::timestamp(3)
      )
      ON CONFLICT ("keyHash") DO UPDATE SET
        "failedAttempts" = CASE
          WHEN EXCLUDED."windowStartedAt" - "AuthThrottle"."windowStartedAt" >= INTERVAL '15 minutes'
            THEN 1
          ELSE "AuthThrottle"."failedAttempts" + 1
        END,
        "windowStartedAt" = CASE
          WHEN EXCLUDED."windowStartedAt" - "AuthThrottle"."windowStartedAt" >= INTERVAL '15 minutes'
            THEN EXCLUDED."windowStartedAt"
          ELSE "AuthThrottle"."windowStartedAt"
        END,
        "lockedUntil" = CASE
          WHEN EXCLUDED."windowStartedAt" - "AuthThrottle"."windowStartedAt" >= INTERVAL '15 minutes'
            THEN NULL
          WHEN "AuthThrottle"."failedAttempts" + 1 >= ${MAX_FAILURES}
            THEN ${lockUntil}::timestamp(3)
          ELSE NULL
        END,
        "updatedAt" = EXCLUDED."updatedAt"
    `;
  }
}

export async function clearLoginThrottle(email: string): Promise<void> {
  await prisma.authThrottle.deleteMany({
    where: { keyHash: hashKey("email", email) },
  });
}
