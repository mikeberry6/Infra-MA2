import { createHmac } from "crypto";
import { isIP } from "net";
import { prisma } from "@/lib/prisma";

const PRUNE_INTERVAL_MS = 60 * 60 * 1000;
const PRUNE_FAILURE_BACKOFF_MS = 5 * 60 * 1000;
const MAX_FAILURES = 5;
let nextPruneAt = 0;

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
  // header. Other deployments must explicitly confirm that their proxy strips
  // and rewrites X-Forwarded-For before it can influence a security control.
  let forwarded: string | string[] | undefined;
  if (process.env.VERCEL === "1") {
    forwarded = headerValue(headers, "x-vercel-forwarded-for");
  } else if (process.env.TRUST_PROXY_HEADERS === "true") {
    forwarded = headerValue(headers, "x-forwarded-for");
  }
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const candidate = value?.split(",")[0]?.trim() || "";
  return isIP(candidate) ? candidate : null;
}

type ReservedThrottleRow = {
  failedAttempts: number;
};

async function maybePruneStaleBuckets(): Promise<void> {
  const now = Date.now();
  if (now < nextPruneAt) return;
  nextPruneAt = now + PRUNE_INTERVAL_MS;
  try {
    await prisma.$executeRaw`
      DELETE FROM "AuthThrottle"
      WHERE "updatedAt" < CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `;
  } catch {
    // Retention maintenance must not turn a transient cleanup failure into an
    // authentication outage or an attacker-controlled retry loop.
    nextPruneAt = now + PRUNE_FAILURE_BACKOFF_MS;
    console.error(JSON.stringify({
      task: "authentication",
      operation: "throttle_retention",
      status: 500,
      errorClassification: "internal_error",
    }));
  }
}

async function reserveThrottleBucket(keyHash: string): Promise<boolean> {
  // PrismaNeonHttp intentionally does not support interactive transactions.
  // Each bucket is reserved with one atomic Postgres upsert so concurrent
  // requests cannot all pass a separate read before incrementing the counter.
  const rows = await prisma.$queryRaw<ReservedThrottleRow[]>`
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
      CURRENT_TIMESTAMP,
      NULL,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("keyHash") DO UPDATE SET
      "failedAttempts" = CASE
        WHEN "AuthThrottle"."lockedUntil" > EXCLUDED."windowStartedAt"
          THEN GREATEST("AuthThrottle"."failedAttempts", ${MAX_FAILURES + 1})
        WHEN EXCLUDED."windowStartedAt" - "AuthThrottle"."windowStartedAt" >= INTERVAL '15 minutes'
          THEN 1
        ELSE "AuthThrottle"."failedAttempts" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "AuthThrottle"."lockedUntil" > EXCLUDED."windowStartedAt"
          THEN "AuthThrottle"."windowStartedAt"
        WHEN EXCLUDED."windowStartedAt" - "AuthThrottle"."windowStartedAt" >= INTERVAL '15 minutes'
          THEN EXCLUDED."windowStartedAt"
        ELSE "AuthThrottle"."windowStartedAt"
      END,
      "lockedUntil" = CASE
        WHEN "AuthThrottle"."lockedUntil" > EXCLUDED."windowStartedAt"
          THEN "AuthThrottle"."lockedUntil"
        WHEN EXCLUDED."windowStartedAt" - "AuthThrottle"."windowStartedAt" >= INTERVAL '15 minutes'
          THEN NULL
        WHEN "AuthThrottle"."failedAttempts" + 1 >= ${MAX_FAILURES}
          THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
        ELSE NULL
      END,
      "updatedAt" = GREATEST("AuthThrottle"."updatedAt", EXCLUDED."updatedAt")
    RETURNING "failedAttempts"
  `;

  return rows.length === 1 && rows[0].failedAttempts <= MAX_FAILURES;
}

async function releaseThrottleBucket(keyHash: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "AuthThrottle"
    SET
      "failedAttempts" = GREATEST("failedAttempts" - 1, 0),
      "lockedUntil" = CASE
        WHEN GREATEST("failedAttempts" - 1, 0) >= ${MAX_FAILURES}
          THEN "lockedUntil"
        ELSE NULL
      END,
      "updatedAt" = GREATEST("updatedAt", CURRENT_TIMESTAMP)
    WHERE "keyHash" = ${keyHash}
  `;
}

export async function reserveLoginAttempt(
  email: string,
  ip?: string | null,
): Promise<boolean> {
  await maybePruneStaleBuckets();
  const [emailKey, ipKey] = throttleKeys(email, ip);

  // Stop at a locked IP before touching the account bucket. If the account is
  // locked, undo only this request's IP reservation. This prevents either
  // bucket from poisoning the other without weakening either ceiling.
  if (ipKey && !(await reserveThrottleBucket(ipKey))) return false;
  let accountAllowed: boolean;
  try {
    accountAllowed = await reserveThrottleBucket(emailKey);
  } catch (error) {
    if (ipKey) {
      try {
        await releaseThrottleBucket(ipKey);
      } catch {
        // The caller still fails closed and emits a generic authentication
        // error. Never replace the original failure or log connection details.
      }
    }
    throw error;
  }
  if (!accountAllowed && ipKey) await releaseThrottleBucket(ipKey);
  return accountAllowed;
}

export async function releaseSuccessfulLogin(
  email: string,
  ip?: string | null,
): Promise<void> {
  const [emailKey, ipKey] = throttleKeys(email, ip);
  await prisma.authThrottle.deleteMany({
    where: { keyHash: emailKey },
  });

  if (ipKey) {
    // Remove only this successful request's IP reservation. Other failures
    // from the same address remain counted.
    await releaseThrottleBucket(ipKey);
  }
}
