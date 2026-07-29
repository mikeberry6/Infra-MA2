import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const runnerSource = readFileSync(
  resolve(process.cwd(), "prisma/seed-runner.ts"),
  "utf8",
);

describe("seed runner additive safety", () => {
  it("does not delete milestones or overwrite matching funds", () => {
    expect(runnerSource).not.toMatch(/milestone\.deleteMany/);
    expect(runnerSource).not.toMatch(/update:\s*fundPayload/);
  });

  it("does not promote or replace an existing primary citation", () => {
    expect(runnerSource).not.toMatch(/prisma\.citation\.update/);
    expect(runnerSource).toMatch(/isPrimary:\s*!existingPrimary/);
  });
});
