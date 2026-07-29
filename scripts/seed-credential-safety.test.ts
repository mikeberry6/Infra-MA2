import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ordinary database seeding", () => {
  it("does not create or embed administrator credentials", () => {
    const source = [
      readFileSync(resolve(process.cwd(), "prisma/seed.ts"), "utf8"),
      readFileSync(
        resolve(process.cwd(), "prisma/seed-runner.ts"),
        "utf8",
      ),
    ].join("\n");
    expect(source).not.toMatch(/admin123/i);
    expect(source).not.toMatch(/admin@infra-ma2\.com/i);
    expect(source).not.toMatch(/prisma\.user\.(?:create|upsert)/);
  });
});
