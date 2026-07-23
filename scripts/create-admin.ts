import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { assertMaintenanceMutationContext } from "../src/lib/database-target";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME?.trim() || "Administrator";
const connectionString = process.env.DATABASE_URL;

export function validateAdminPassword(value: string): string | null {
  if (value.length < 14) return "ADMIN_PASSWORD must contain at least 14 characters.";
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
    return "ADMIN_PASSWORD must include upper- and lowercase letters.";
  }
  if (!/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return "ADMIN_PASSWORD must include a number and a symbol.";
  }
  return null;
}

async function main() {
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  if (!email || !email.includes("@")) throw new Error("ADMIN_EMAIL must be a valid email address.");
  const passwordError = validateAdminPassword(password);
  if (passwordError) throw new Error(passwordError);
  const context = assertMaintenanceMutationContext();

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      });
      const user = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: { name, passwordHash, role: "ADMIN" },
            select: { id: true },
          })
        : await tx.user.create({
            data: { email, name, passwordHash, role: "ADMIN" },
            select: { id: true },
          });

      await tx.auditEvent.create({
        data: {
          actorId: null,
          entityType: "User",
          entityId: user.id,
          action: existing ? "ADMIN_CREDENTIAL_ROTATION" : "ADMIN_BOOTSTRAP",
          changes: {
            changedFields: existing
              ? ["name", "passwordHash", "role"]
              : ["record"],
          },
          metadata: {
            executionChannel: "create-admin-cli",
            targetRole: "ADMIN",
            credentialMaterialRecorded: false,
            targetDatabase: context.targetDatabase,
            releaseSha: context.releaseSha,
            reviewedBy: context.reviewedBy,
            reason: context.reason,
          },
        },
      });
    });
    console.log("Administrator account created or rotated.");
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Administrator creation failed.");
    process.exitCode = 1;
  });
}
