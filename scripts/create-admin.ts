import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME?.trim() || "Administrator";
const connectionString = process.env.DATABASE_URL;

function validatePassword(value: string): string | null {
  if (value.length < 14) return "ADMIN_PASSWORD must contain at least 14 characters.";
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) return "ADMIN_PASSWORD must include upper- and lowercase letters.";
  if (!/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) return "ADMIN_PASSWORD must include a number and a symbol.";
  return null;
}

async function main() {
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  if (!email || !email.includes("@")) throw new Error("ADMIN_EMAIL must be a valid email address.");
  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.$transaction(async (tx) => {
      const admin = await tx.user.upsert({
        where: { email },
        update: { name, passwordHash, role: "ADMIN" },
        create: { email, name, passwordHash, role: "ADMIN" },
        select: { id: true, email: true },
      });
      await tx.auditEvent.create({
        data: {
          actorId: admin.id,
          entityType: "User",
          entityId: admin.id,
          action: "ADMIN_BOOTSTRAP",
          metadata: { email: admin.email },
        },
      });
      return admin;
    });
    console.log(`Administrator account created or rotated for ${user.email}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
