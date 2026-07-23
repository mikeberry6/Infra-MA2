import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("authenticated-write E2E deal fixture lifecycle", () => {
  const workflow = readFileSync(
    path.join(process.cwd(), ".github", "workflows", "deploy.yml"),
    "utf8",
  );
  const maintenance = readFileSync(
    path.join(process.cwd(), "tests", "e2e", "deal-fixture-maintenance.ts"),
    "utf8",
  );
  const journey = readFileSync(
    path.join(process.cwd(), "tests", "e2e", "auth-authorization.spec.ts"),
    "utf8",
  );

  it("cleans the guarded validation fixture before visual capture and after browser writes", () => {
    const preflight = workflow.indexOf("Remove stale authenticated-write E2E deal fixtures");
    const visual = workflow.indexOf("Run deterministic visual baselines before mutation journeys");
    const browser = workflow.indexOf(
      "Run end-to-end, axe, keyboard, reduced-motion, and responsive checks",
    );
    const postBrowser = workflow.indexOf("deal-fixture-post-browser-cleanup.json", browser);
    const nextStep = workflow.indexOf(
      "Upload migration, data, and browser evidence",
      postBrowser,
    );

    expect(preflight).toBeGreaterThan(-1);
    expect(visual).toBeGreaterThan(preflight);
    expect(browser).toBeGreaterThan(visual);
    expect(postBrowser).toBeGreaterThan(browser);
    expect(nextStep).toBeGreaterThan(postBrowser);
    expect(workflow.slice(browser, nextStep)).toContain("trap cleanup EXIT");
    expect(workflow.slice(browser, nextStep)).toContain("cleanup_status=${PIPESTATUS[0]}");
  });

  it("fails closed on the database target and deletes only fully validated fixture IDs", () => {
    const targetGuard = maintenance.indexOf("requireIsolatedFixtureTarget();");
    const cleanupCall = maintenance.indexOf("const result = await removeFixtureRows();", targetGuard);
    const lookup = maintenance.indexOf("const fixtures = await tx.deal.findMany");
    const validation = maintenance.indexOf("validateDealFixtureCandidate({", lookup);
    const invalidGuard = maintenance.indexOf("if (invalidFixtures.length > 0)", validation);
    const deletion = maintenance.indexOf("await tx.deal.deleteMany", invalidGuard);

    expect(maintenance).toContain("assertIsolatedE2EDatabase();");
    expect(maintenance).toContain('process.env.TARGET_DATABASE !== "validation"');
    expect(maintenance).toContain("process.env.DATABASE_URL !== process.env.E2E_DATABASE_URL");
    expect(targetGuard).toBeGreaterThan(-1);
    expect(cleanupCall).toBeGreaterThan(targetGuard);
    expect(lookup).toBeGreaterThan(-1);
    expect(validation).toBeGreaterThan(lookup);
    expect(invalidGuard).toBeGreaterThan(validation);
    expect(deletion).toBeGreaterThan(invalidGuard);
    expect(maintenance.slice(deletion, deletion + 160)).toContain(
      "where: { id: { in: fixtureIds } }",
    );
    expect(maintenance).not.toContain("prisma.deal.deleteMany");
  });

  it("discovers orphan E2E sources independently and deletes them only after dependency checks", () => {
    const sourceLookup = maintenance.indexOf("const sources = await tx.source.findMany");
    const sourceValidation = maintenance.indexOf(
      "validateDealFixtureSourceCandidate(source, fixtureIds)",
      sourceLookup,
    );
    const invalidGuard = maintenance.indexOf("if (invalidSources.length > 0)", sourceValidation);
    const dependencyCount = maintenance.indexOf(
      "const remainingSourceCitations",
      invalidGuard,
    );
    const dependencyGuard = maintenance.indexOf(
      "if (remainingSourceCitations !== 0)",
      dependencyCount,
    );
    const sourceDeletion = maintenance.indexOf(
      "await tx.source.deleteMany",
      dependencyGuard,
    );

    expect(sourceLookup).toBeGreaterThan(-1);
    expect(sourceValidation).toBeGreaterThan(sourceLookup);
    expect(invalidGuard).toBeGreaterThan(sourceValidation);
    expect(dependencyCount).toBeGreaterThan(invalidGuard);
    expect(dependencyGuard).toBeGreaterThan(dependencyCount);
    expect(sourceDeletion).toBeGreaterThan(dependencyGuard);
    expect(maintenance.slice(sourceLookup, sourceValidation)).toContain(
      "E2E_DEAL_FIXTURE_SOURCE_LABEL",
    );
    expect(maintenance.slice(sourceLookup, sourceValidation)).toContain(
      "E2E_DEAL_FIXTURE_SOURCE_URL_PREFIXES",
    );
    expect(maintenance.slice(sourceDeletion, sourceDeletion + 220)).toContain(
      "citations: { none: {} }",
    );
  });

  it("tracks create attempts before redirect-sensitive helpers and verifies teardown outcomes", () => {
    const createAttempt = journey.indexOf("createAttempted = true;");
    const create = journey.indexOf("await createDraftDeal(page", createAttempt);
    const deleteAttempt = journey.indexOf("deletionDraftCreateAttempted = true;");
    const deletionCreate = journey.indexOf("await createDraftDeal(page", deleteAttempt);

    expect(createAttempt).toBeGreaterThan(-1);
    expect(create).toBeGreaterThan(createAttempt);
    expect(deleteAttempt).toBeGreaterThan(create);
    expect(deletionCreate).toBeGreaterThan(deleteAttempt);
    expect(journey).toContain("if (createAttempted && !archived)");
    expect(journey).toContain("if (deletionDraftCreateAttempted && !deletionDraftDeleted)");
    expect(journey).toContain("should be absent after cleanup");
    expect(journey).toContain("should be archived after cleanup");
  });
});
