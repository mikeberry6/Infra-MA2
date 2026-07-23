import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ordinary database seeding", () => {
  it("contains no bootstrap account and rejects production targets", () => {
    const seed = readFileSync("prisma/seed.ts", "utf8");
    expect(seed).toContain("assertNonProductionSeedTarget()");
    expect(seed).not.toMatch(/admin123|admin@infra-ma2\.com|passwordHash\s*=\s*await bcrypt/i);
    expect(seed).not.toContain("prisma.user.upsert");
  });

  it("keeps Deal publication fields inside Deal creation", () => {
    const seed = readFileSync("prisma/seed.ts", "utf8");
    const organizationCreate = seed.match(
      /prisma\.organization\.upsert\([\s\S]*?orgIdMap\.set/,
    )?.[0];
    const dealCreate = seed.match(
      /prisma\.deal\.upsert\([\s\S]*?dealIdMap\.set/,
    )?.[0];

    expect(organizationCreate).toBeDefined();
    expect(organizationCreate).not.toContain("deal.");
    expect(organizationCreate).not.toContain("sellerDisclosureStatus");
    expect(organizationCreate).toContain('status: "PUBLISHED"');

    expect(dealCreate).toBeDefined();
    expect(dealCreate).toContain("sellerDisclosureStatus:");
    expect(dealCreate).toContain('status: deal.sourceUrl ? "PUBLISHED" : "DRAFT"');
  });

  it("atomically audits administrator bootstrap and credential rotation without credential material", () => {
    const createAdmin = readFileSync("scripts/create-admin.ts", "utf8");

    expect(createAdmin).toContain("await prisma.$transaction(async (tx) =>");
    expect(createAdmin).toContain('action: existing ? "ADMIN_CREDENTIAL_ROTATION" : "ADMIN_BOOTSTRAP"');
    expect(createAdmin).toContain("await tx.auditEvent.create");
    expect(createAdmin).toContain("actorId: null");
    expect(createAdmin).toContain("credentialMaterialRecorded: false");
    expect(createAdmin).toContain("const context = assertMaintenanceMutationContext()");
    expect(createAdmin).toContain("reviewedBy: context.reviewedBy");
    expect(createAdmin).toContain("reason: context.reason");
    const auditBlock = createAdmin.match(/await tx\.auditEvent\.create\([\s\S]*?\n\s*\}\);/)?.[0] ?? "";
    expect(auditBlock).not.toContain("passwordHash,");
    expect(auditBlock).not.toContain("password,");
  });
});
