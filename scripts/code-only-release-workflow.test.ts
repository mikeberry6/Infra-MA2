import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/release-code-only.yml"),
  "utf8",
);

describe("code-only production workflow", () => {
  it("retains protected-main, build, approval, candidate, smoke, and rollback evidence gates", () => {
    expect(workflow).toContain("environment: production");
    expect(workflow).toContain("PROMOTE-CODE-ONLY");
    expect(workflow).toContain("refs/heads/main");
    expect(workflow).toContain("verify-release-provenance.ts");
    expect(workflow).toContain("--required-check=build");
    expect(workflow).toContain("git merge-base --is-ancestor");
    expect(workflow).toContain("verify-vercel-deployment.ts");
    expect(workflow).toContain("--require-immutable-url");
    expect(workflow).toContain("release-smoke.mjs");
    expect(workflow).toContain("vercel@51.7.0 promote");
    expect(workflow).toContain("current-production-before-promotion.json");
    expect(workflow).toContain("promoted-production.json");
    expect(workflow).toContain("actions/upload-artifact@");
  });

  it("rejects schema changes without importing unrelated data and pipeline gates", () => {
    expect(workflow).toContain("prisma/schema.prisma prisma/migrations prisma.config.ts");
    expect(workflow).not.toContain("DATABASE_URL");
    expect(workflow).not.toContain("prisma migrate");
    expect(workflow).not.toContain("dashboard:verify");
    expect(workflow).not.toContain("verify-dashboard-health");
    expect(workflow).not.toContain("FRED_API_KEY");
    expect(workflow).not.toContain("EIA_API_KEY");
    expect(workflow).not.toContain("SAM_API_KEY");
  });
});
