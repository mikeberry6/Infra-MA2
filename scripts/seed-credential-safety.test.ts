import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ordinary database seeding", () => {
  it("contains no bootstrap account and rejects production targets", () => {
    const seed = readFileSync("prisma/seed.ts", "utf8");
    expect(seed).toContain("assertNonProductionSeedTarget()");
    expect(seed).not.toMatch(/admin123|admin@infra-ma2\.com|passwordHash\s*=\s*await bcrypt/i);
    expect(seed).not.toContain("prisma.user.upsert");
  });
});
