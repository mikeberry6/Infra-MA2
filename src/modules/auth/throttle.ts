import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

function hashKey(scope: "email" | "ip", value: string): string {
  return createHash("sha256").update(`${scope}:${value.trim().toLowerCase()}`).digest("hex");
}

function throttleKeys(email: string, ip?: string | null): string[] {
  const keys = [hashKey("email", email)];
  if (ip) keys.push(hashKey("ip", ip));
  return keys;
}

export function requestIp(headers: Record<string, string | string[] | undefined> | undefined): string | null {
  const forwarded = headers?.["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(",")[0]?.trim() || null;
}

export async function isLoginThrottled(email: string, ip?: string | null): Promise<boolean> {
  const now = new Date();
  const rows = await prisma.authThrottle.findMany({
    where: { keyHash: { in: throttleKeys(email, ip) } },
    select: { lockedUntil: true },
  });
  return rows.some((row) => row.lockedUntil != null && row.lockedUntil > now);
}

export async function recordFailedLogin(email: string, ip?: string | null): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const now = new Date();
    try {
      await prisma.$transaction(async (tx) => {
        for (const keyHash of throttleKeys(email, ip)) {
          const existing = await tx.authThrottle.findUnique({ where: { keyHash } });
          const windowExpired = !existing || now.getTime() - existing.windowStartedAt.getTime() >= WINDOW_MS;
          const failedAttempts = windowExpired ? 1 : existing.failedAttempts + 1;
          const lockedUntil = failedAttempts >= MAX_FAILURES
            ? new Date(now.getTime() + WINDOW_MS)
            : null;

          await tx.authThrottle.upsert({
            where: { keyHash },
            update: {
              failedAttempts,
              windowStartedAt: windowExpired ? now : existing?.windowStartedAt,
              lockedUntil,
            },
            create: { keyHash, failedAttempts, windowStartedAt: now, lockedUntil },
          });
        }
      }, { isolationLevel: "Serializable" });
      return;
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";
      if (code !== "P2034" || attempt === 2) throw error;
    }
  }
}

export async function clearLoginThrottle(email: string, ip?: string | null): Promise<void> {
  await prisma.authThrottle.deleteMany({
    where: { keyHash: { in: throttleKeys(email, ip) } },
  });
}
