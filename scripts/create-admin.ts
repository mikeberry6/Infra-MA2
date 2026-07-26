import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";

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
  assertMutationDatabaseTargetFromEnv();

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
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

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Administrator creation failed.");
    process.exitCode = 1;
  });
}
