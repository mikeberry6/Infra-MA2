import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";
import {
  normalizeAdminEmail,
  validateAdminEmail,
  validateAdminPassword,
} from "./admin-credentials";

const connectionString = process.env.DATABASE_URL;
const email = normalizeAdminEmail(process.env.ADMIN_EMAIL);
const password = process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME?.trim() || "Administrator";

async function main() {
  if (!connectionString) throw new Error("DATABASE_URL is required.");

  const emailError = validateAdminEmail(email);
  if (emailError) throw new Error(emailError);

  const passwordError = validateAdminPassword(password);
  if (passwordError) throw new Error(passwordError);
  assertMutationDatabaseTargetFromEnv();

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, role: "ADMIN" },
      create: { email, name, passwordHash, role: "ADMIN" },
    });
    console.log("Administrator account created or rotated.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Administrator bootstrap failed.");
  process.exitCode = 1;
});
