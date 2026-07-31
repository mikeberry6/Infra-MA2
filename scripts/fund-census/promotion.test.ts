import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  loadFundEvidenceManifest,
  loadFundManifest,
  snapshotChangedFields,
  validateFundRefreshCandidate,
  validateFundEvidenceManifest,
} from "../fund-refresh/lib";
import {
  applyPromotionBatch,
  buildPromotionPlan,
  type AggregateArtifact,
  type PromotionPolicy,
} from "./promotion";
import { REPO_ROOT } from "./lib";

function loadPlan() {
  const runDirectory = path.join(
    REPO_ROOT,
    "audits/fund-census/2026-07-29",
  );
  return buildPromotionPlan({
    aggregate: JSON.parse(
      fs.readFileSync(path.join(runDirectory, "aggregate.json"), "utf8"),
    ) as AggregateArtifact,
    baselineManifest: loadFundManifest(),
    policy: JSON.parse(
      fs.readFileSync(
        path.join(runDirectory, "implementation-policy.json"),
        "utf8",
      ),
    ) as PromotionPolicy,
    companySeedSource: fs.readFileSync(
      path.join(REPO_ROOT, "prisma/seed-data/companies.ts"),
      "utf8",
    ),
  });
}

describe("reviewed fund census promotion", () => {
  it("locks the reviewed scope and six safe batches", () => {
    const plan = loadPlan();
    expect(plan.summary).toMatchObject({
      baselineFunds: 179,
      additions: 21,
      excludedAdditions: 37,
      corrections: 88,
      finalFunds: 200,
      suppressedStrategyChanges: 14,
      suppressedEvergreenChanges: 12,
      deferredRenames: 9,
      knownOwnershipReferences: 64,
      currentSeedOwnershipReferences: 63,
      ownershipReferenceDrift: -1,
    });
    expect(plan.summary.batches.map((batch) => batch.actionable)).toEqual([
      17,
      19,
      20,
      20,
      20,
      13,
    ]);
    expect(plan.summary.batches.every((batch) => batch.changeRatio <= 0.1))
      .toBe(true);
  });

  it("assigns stable IDs and applies the addition threshold only to creates", () => {
    const plan = loadPlan();
    const creates = plan.candidates.filter(
      (candidate) => candidate.action === "CREATE",
    );
    expect(creates.map((candidate) => candidate.legacyId)).toEqual(
      Array.from(
        { length: 21 },
        (_, index) => `FUND-${151 + index}`,
      ),
    );
    expect(creates.every((candidate) => candidate.sizeGate?.eligible)).toBe(
      true,
    );
    expect(
      plan.candidates.filter((candidate) => candidate.action === "UPDATE"),
    ).toHaveLength(88);
  });

  it("preserves existing strategy badges and original Evergreen values", () => {
    const plan = loadPlan();
    const updates = plan.candidates.filter(
      (candidate) => candidate.action === "UPDATE",
    );
    for (const candidate of updates) {
      expect(candidate.after.strategies).toEqual(
        candidate.before?.strategies,
      );
      for (const field of ["vintage", "structure", "fundStatus"] as const) {
        if (String(candidate.before?.[field]).includes("Evergreen")) {
          expect(candidate.after[field]).toEqual(candidate.before?.[field]);
        }
      }
    }
  });

  it("defers all nine ownership-linked renames without dropping corrections", () => {
    const plan = loadPlan();
    expect(
      plan.ownershipRenameDeferrals.map((item) => item.legacyId),
    ).toEqual([
      "FUND-002",
      "FUND-030",
      "FUND-063",
      "FUND-071",
      "FUND-073",
      "FUND-092",
      "FUND-097",
      "FUND-099A",
      "FUND-110",
    ]);
    for (const deferral of plan.ownershipRenameDeferrals) {
      const candidate = plan.candidates.find(
        (item) => item.legacyId === deferral.legacyId,
      );
      expect(candidate?.after.fundName).toBe(deferral.currentFundName);
      expect(candidate?.suppressedFields).toContain("fundName");
      expect(candidate?.changedFields.length).toBeGreaterThan(0);
    }
  });

  it("materializes the first two batches to 196 and then 200 funds", () => {
    const plan = loadPlan();
    const baselineManifest = loadFundManifest();
    const baselineEvidence = loadFundEvidenceManifest();
    const first = applyPromotionBatch({
      plan,
      batch: 1,
      manifest: baselineManifest,
      evidenceManifest: baselineEvidence,
    });
    expect(first.manifest.funds).toHaveLength(196);
    const second = applyPromotionBatch({
      plan,
      batch: 2,
      manifest: first.manifest,
      evidenceManifest: first.evidenceManifest,
    });
    expect(second.manifest.funds).toHaveLength(200);
  });

  it("materializes all six batches without evidence-manifest drift", () => {
    const plan = loadPlan();
    let state = {
      manifest: loadFundManifest(),
      evidenceManifest: loadFundEvidenceManifest(),
    };
    for (let batch = 1; batch <= 6; batch += 1) {
      state = applyPromotionBatch({
        plan,
        batch,
        manifest: state.manifest,
        evidenceManifest: state.evidenceManifest,
      });
    }
    expect(state.manifest.funds).toHaveLength(200);
    expect(
      validateFundEvidenceManifest(state.evidenceManifest).filter(
        (issue) => issue.severity === "error",
      ),
    ).toEqual([]);
    for (const candidate of plan.candidates) {
      const record = state.manifest.funds.find(
        (fund) => fund.id === candidate.legacyId,
      );
      expect(record?.fundName).toBe(candidate.after.fundName);
    }
  });

  it("matches the executable candidate diff contract and exposes evidence blockers", () => {
    const plan = loadPlan();
    const blockingCodes = new Set<string>();
    for (const candidate of plan.candidates) {
      expect(candidate.changedFields).toEqual(
        snapshotChangedFields(candidate.before, candidate.after),
      );
      const validation = validateFundRefreshCandidate({
        action: candidate.action,
        identity: {
          legacyId: candidate.legacyId,
          managerName: candidate.after.managerName,
          fundName: candidate.after.fundName,
        },
        before: candidate.before,
        after: candidate.after,
        changedFields: candidate.changedFields,
        evidence: candidate.evidence,
        confidence: candidate.confidence,
        unresolvedQuestions: [],
        ownershipLinkImpact: {
          matchedOwnershipPeriodCount: 0,
          matchedOwnershipVehicles: [],
          linkedOwnershipPeriodCount: 0,
          linkedCompanyIds: [],
          mutationProposed: false,
          notes:
            "Promotion preflight only; live ownership is supplied when "
            + "the executable proposal is generated.",
        },
      });
      expect(validation.zodIssues).toBeUndefined();
      expect(
        validation.issues.map((issue) => issue.code),
      ).not.toContain("FIELD_DIFF_MISMATCH");
      for (const issue of validation.issues) {
        if (issue.severity === "error") blockingCodes.add(issue.code);
      }
    }
    expect([...blockingCodes].sort()).toEqual(expect.arrayContaining([
      "FORM_D_COMMITTED_CAPITAL",
      "INVALID_VINTAGE",
      "SIZE_DISPLAY_UNCLASSIFIED",
      "UNSUPPORTED_FIELD",
    ]));
  });
});
