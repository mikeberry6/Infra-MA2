import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";
import { SafeOperationalError } from "../src/lib/safe-error";
import { logServerFailure, withServerTask } from "../src/lib/server-log";
import { runWithPreservedCleanup } from "../src/lib/task-cleanup";
import { adminBootstrapChangedFields } from "../src/modules/operations/admin-bootstrap-audit";
import {
  normalizeAdminEmail,
  validateAdminEmail,
  validateAdminPassword,
} from "./admin-credentials";

const email = normalizeAdminEmail(process.env.ADMIN_EMAIL);
const password = process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME?.trim() || "Administrator";
const connectionString = process.env.DATABASE_URL;

async function main() {
  if (!connectionString) throw new SafeOperationalError("database_url_missing");
  const emailError = validateAdminEmail(email);
  if (emailError) throw new Error(emailError);
  const passwordError = validateAdminPassword(password);
  if (passwordError) throw new Error(passwordError);
  assertMutationDatabaseTargetFromEnv();

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const run = async () => {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction(async (tx) => {
      const before = await tx.user.findUnique({
        where: { email },
        select: {
          email: true,
          name: true,
          passwordHash: true,
          role: true,
        },
      });
      const admin = await tx.user.upsert({
        where: { email },
        update: { name, passwordHash, role: "ADMIN" },
        create: { email, name, passwordHash, role: "ADMIN" },
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
          role: true,
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: admin.id,
          entityType: "User",
          entityId: admin.id,
          action: "ADMIN_BOOTSTRAP",
          changes: {
            changedFields: adminBootstrapChangedFields(before, admin),
          },
          metadata: { email: admin.email },
        },
      });
    }, { isolationLevel: "Serializable" });
    console.log("Administrator account created or rotated.");
  };
  await runWithPreservedCleanup({
    run,
    cleanup: () => prisma.$disconnect(),
    onSuppressedCleanupError: (error) => logServerFailure({
      task: "create_admin",
      operation: "disconnect_database",
    }, error),
  });
}

withServerTask({
  task: "create_admin",
  operation: "create_or_rotate_admin",
}, main).catch(() => {
  process.exitCode = 1;
});
