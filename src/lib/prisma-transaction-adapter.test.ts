import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("application Prisma adapter", () => {
  it("uses a transaction-capable adapter for atomic application workflows", () => {
    const source = readFileSync(path.join(process.cwd(), "src", "lib", "prisma.ts"), "utf8");
    const nextConfig = readFileSync(path.join(process.cwd(), "next.config.js"), "utf8");

    expect(source).toContain('import { PrismaPg } from "@prisma/adapter-pg"');
    expect(source).toContain("new PrismaPg({ connectionString })");
    expect(source).not.toContain("PrismaNeonHttp");
    expect(nextConfig).toContain('serverExternalPackages: ["@prisma/adapter-pg", "pg"]');
  });
});
