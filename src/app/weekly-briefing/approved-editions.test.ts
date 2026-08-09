import { createHash } from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyManifestPublicationApproval,
  applyRecordReview,
  computeActivityTotals,
  finalizeActivityManifest,
} from "../../../scripts/weekly-briefing-activity/review";
import {
  type ActivityRecord,
  secondReviewRiskKinds,
  WEEKLY_ACTIVITY_METHODOLOGY_VERSION,
  WEEKLY_ACTIVITY_SCHEMA_VERSION,
} from "../../../scripts/weekly-briefing-activity/schema";
import { hashCanonical } from "../../../scripts/weekly-briefing-activity/hash";
import {
  computeNonChartSha256,
  extractProtectedNonChartContent,
  renderManifestActivityEmail,
} from "../../../scripts/weekly-briefing-activity/render-charts";
import {
  type ApprovedWeeklyBriefingEdition,
  computeApprovedWeeklyBriefingIndexSha256,
  computeProtectedNonChartSha256,
  parseApprovedWeeklyBriefingIndex,
  readApprovedWeeklyBriefingIndex,
  resolveLatestApprovedWeeklyBriefingEdition,
} from "./approved-editions";

const legacyEntry: ApprovedWeeklyBriefingEdition = {
  edition: "2026-07-31",
  approval: {
    kind: "LEGACY_BASELINE",
    emailPath: "public/email-format/2026-07-31.html",
    renderedEmailSha256:
      "17ae39249677e8f57db1038641cbb582357576ac6465b92bea2dc3f71c58388e",
    rationale:
      "Finalized historical edition predating the activity-audit publication workflow.",
  },
};

const fixtureSourceEmail =
  "<html><body>Approved copy<!-- YTD STATS -->Unrendered charts<!-- FOOTER -->Approved footer</body></html>";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function buildIndex(entries: ApprovedWeeklyBriefingEdition[]) {
  const base = { schemaVersion: 1 as const, entries };
  return {
    ...base,
    indexSha256: computeApprovedWeeklyBriefingIndexSha256(base),
  };
}

function approvedRecordFixture(): ActivityRecord {
  const record: ActivityRecord = {
    recordId: "INF-2026-001",
    legacyId: "INF-2026-001",
    splitSuffix: null,
    transactionIdentityKey: "primary.example/deal|target-one",
    target: "Target One",
    disposition: "KEEP",
    duplicateOfRecordId: null,
    dispositionRationale: "Distinct in-scope infrastructure transaction.",
    scope: "DIRECT_FUND",
    scopeRationale: "Fund I acts as transaction principal.",
    candidateClassification: null,
    actors: {
      buyers: [{
        name: "Fund I",
        entityKind: "FUND",
        isPrincipal: true,
        sponsorName: "Sponsor One",
        sourceIds: ["transaction"],
      }],
      sellers: [{
        name: "Seller One",
        entityKind: "CORPORATE",
        isPrincipal: true,
        sponsorName: null,
        sourceIds: ["transaction"],
      }],
      jointVentureParticipants: [],
    },
    actingEntity: {
      name: "Fund I",
      entityKind: "FUND",
      side: "BUYER",
      isOperatingCompany: false,
      sourceIds: ["transaction"],
    },
    sponsorLineage: [{
      sponsorName: "Sponsor One",
      entityName: "Fund I",
      relationship: "ADVISER",
      sourceIds: ["transaction"],
      rationale: "Sponsor One advises Fund I.",
    }],
    sector: "Power & ET",
    region: "North America",
    country: "United States",
    announcementDate: "2026-01-08",
    transactionStructure: {
      forms: ["ACQUISITION"],
      details: "Fund acquisition of an operating asset.",
      isExit: false,
      isBundledAnnouncement: false,
      isMixedDirectPortfolio: false,
      newPlatformWithInseparableSeedAcquisition: false,
      primaryOnlyPortfolioCompanyIssuance: false,
    },
    classificationFacts: {
      principalActorKind: "FUND",
      fundVehicleActsAsPrincipal: true,
      portfolioCompanyActsAsPrincipal: false,
      fundSellsOrInvests: true,
      alreadyOwnedOperatingCompany: false,
    },
    secondReviewRisks: [],
    sourceEvidence: [{
      sourceId: "transaction",
      tier: "PRIMARY",
      title: "Fund I acquires Target One",
      publisher: "Sponsor One",
      url: "https://primary.example/deal",
      artifactPath: null,
      publishedAt: "2026-01-08",
      retrievedAt: "2026-08-08",
      purposes: [
        "TRANSACTION",
        "PARTIES",
        "ANNOUNCEMENT_DATE",
        "SECTOR",
        "REGION",
        "TRANSACTION_STRUCTURE",
      ],
      evidenceSummary: "Primary source confirms the transaction facts.",
      fallbackRationale: null,
      contentSha256: null,
    }],
    ownershipEvidence: [],
    priorAuditEvidence: [],
    review: { firstReview: null, secondReview: null },
  };
  return applyRecordReview(record, {
    stage: "FIRST",
    reviewer: "Morgan Smith",
    reviewedAt: "2026-08-08T04:30:00.000Z",
    notes: "Opened the primary evidence and verified scope and disposition.",
    humanAttestation: {
      performedByHuman: true,
      evidenceOpened: true,
      dispositionVerified: true,
      classificationVerified: true,
    },
  });
}

async function createApprovedManifestFixture(repositoryRoot: string) {
  const runRelative = "audits/weekly-briefing-activity/2026-08-07";
  const runDirectory = path.join(repositoryRoot, runRelative);
  await mkdir(path.join(runDirectory, "inputs"), { recursive: true });
  const frozenKinds = [
    "ARCHIVED_ISSUES",
    "SEED",
    "PRODUCTION_SNAPSHOT",
    "GIT_HISTORY_SNAPSHOT",
    "PRIOR_FLOW_THROUGH_AUDIT",
  ] as const;
  const frozenInputs = [];
  for (const kind of frozenKinds) {
    const relativePath = `${runRelative}/inputs/${kind.toLowerCase()}.json`;
    const recordCount = kind === "SEED" ? 1 : 0;
    const raw = JSON.stringify({
      kind,
      ...(kind === "PRODUCTION_SNAPSHOT" ? { status: "CAPTURED" } : {}),
      recordCount,
      records: kind === "SEED" ? [{ legacyId: "INF-2026-001" }] : [],
    });
    await writeFile(path.join(repositoryRoot, relativePath), raw);
    frozenInputs.push({
      inputArtifactId: kind.toLowerCase(),
      kind,
      path: relativePath,
      sha256: sha256(raw),
      recordCount,
      capturedAt: "2026-08-08T04:00:00.000Z",
      gitCommit: null,
      notes: `${kind} fixture`,
    });
  }
  const protectedRelativePath =
    `${runRelative}/inputs/protected-non-chart.html`;
  const protectedRaw = extractProtectedNonChartContent(fixtureSourceEmail);
  await writeFile(path.join(repositoryRoot, protectedRelativePath), protectedRaw);
  frozenInputs.push({
    inputArtifactId: "protected-non-chart-email",
    kind: "OTHER",
    path: protectedRelativePath,
    sha256: sha256(protectedRaw),
    recordCount: 1,
    capturedAt: "2026-08-08T04:00:00.000Z",
    gitCommit: null,
    notes: "Exact protected fixture email content outside the chart block.",
  });
  const policyRelativePath = `${runRelative}/review-policy.json`;
  const policyWithoutHash = {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_POLICY",
    methodologyVersion: WEEKLY_ACTIVITY_METHODOLOGY_VERSION,
    cutoff: "2026-08-07",
    adoptedAt: "2026-08-08T04:00:00.000Z",
    authorizationScope: "METHODOLOGY_DIRECTION_NOT_RECORD_APPROVAL",
    classificationBasis: "VERIFIED_LEGAL_ACTING_ENTITY",
    scopeRules: {
      directPrincipalKinds: [
        "FUND",
        "ADVISED_VEHICLE",
        "CO_INVESTMENT_VEHICLE",
        "NON_OPERATING_ACQUISITION_SPV",
      ],
      portfolioPrincipalKinds: ["OPERATING_PORTFOLIO_COMPANY", "OPERATING_PLATFORM"],
      portfolioRequiresDateValidPriorOwnership: true,
      fundExitIsDirect: true,
      operatingCompanyAssetSaleIsPortfolio: true,
      newPlatformWithInseparableSeedIsDirect: true,
      primaryOnlyPortfolioIssuanceIsPortfolioUnlessFundActs: true,
      categoryLabelsNeverDetermineScope: true,
    },
    firstReviewRequiredForEveryCandidate: true,
    secondReviewRiskKinds: [...secondReviewRiskKinds],
    categoryOnlySecondReviewTriggers: [],
    mixedTransactionPrecedence: "COUNT_ONCE_AS_DIRECT_RETAIN_BOTH_ATTRIBUTIONS",
    evidenceThreshold: "TRANSACTION_AND_PARTY_EVIDENCE_PLUS_DATE_VALID_OWNERSHIP_FOR_PORTFOLIO",
    riskEvidence: {
      conflictsRequireTwoDistinctQualifiedLocators: true,
      duplicateSourceLocatorsCountOnce: true,
      everyPrincipalActorRequiresTransactionAndPartyEvidence: true,
    },
    batchApproval: {
      allowed: true,
      recordLevelEvidenceRequired: true,
      recordLevelNotesRequired: true,
      recordLevelReviewedInputHashRequired: true,
    },
    finalControl: "EVIDENCE_DERIVED_NOT_FORCED_TO_393_OR_398",
  };
  const policyRaw = JSON.stringify({
    ...policyWithoutHash,
    policySha256: hashCanonical("weekly-briefing-activity-review-policy-v2", policyWithoutHash),
  });
  await writeFile(path.join(repositoryRoot, policyRelativePath), policyRaw);
  frozenInputs.push({
    inputArtifactId: "risk-based-review-policy",
    kind: "OTHER",
    path: policyRelativePath,
    sha256: sha256(policyRaw),
    recordCount: 1,
    capturedAt: "2026-08-08T04:00:00.000Z",
    gitCommit: null,
    notes: "Risk-based review policy fixture.",
  });
  const records = [approvedRecordFixture()];
  const totals = computeActivityTotals(records);
  const draft = finalizeActivityManifest({
    schemaVersion: WEEKLY_ACTIVITY_SCHEMA_VERSION,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_MANIFEST",
    methodologyVersion: WEEKLY_ACTIVITY_METHODOLOGY_VERSION,
    cutoffDate: "2026-08-07",
    generatedAt: "2026-08-08T04:00:00.000Z",
    updatedAt: "2026-08-08T04:00:00.000Z",
    status: "DRAFT",
    expectedCandidateCount: 1,
    controls: {
      publishedTotal: 393,
      correctedControlHypothesisTotal: 398,
      finalApprovedTotal: null,
    },
    frozenInputs,
    records,
    totals,
    publicationApproval: null,
  });
  const approved = applyManifestPublicationApproval(draft, {
    reviewer: "Alex Morgan",
    approvedAt: "2026-08-08T05:00:00.000Z",
    notes: "Reviewed publication gates for the route fixture.",
    humanAttestation: {
      performedByHuman: true,
      allRecordGatesReviewed: true,
      totalsReconciled: true,
      publicationAuthorized: true,
    },
  });
  return { draft, approved, runDirectory, runRelative };
}

describe("approved weekly briefing index", () => {
  it("keeps July 31 as a hash-bound legacy baseline", async () => {
    const index = await readApprovedWeeklyBriefingIndex();
    expect(index.entries).toEqual([legacyEntry]);
    expect(index.indexSha256).toBe(
      computeApprovedWeeklyBriefingIndexSha256(index),
    );
    expect(
      resolveLatestApprovedWeeklyBriefingEdition({
        index,
        archivedEditions: ["2026-08-07", "2026-07-31"],
      }),
    ).toBe("2026-07-31");
  });

  it("chooses the newest provenance-bound entry independent of index order", () => {
    const audited: ApprovedWeeklyBriefingEdition = {
      edition: "2026-08-07",
      approval: {
        kind: "AUDIT_MANIFEST",
        manifestPath:
          "audits/weekly-briefing-activity/2026-08-07/manifest.json",
        manifestSha256: "a".repeat(64),
        emailPath: "public/email-format/2026-08-07.html",
        renderedEmailSha256: "b".repeat(64),
        protectedNonChartSha256: "c".repeat(64),
        outlookQaPath:
          "audits/weekly-briefing-activity/2026-08-07/outlook-qa-approval.json",
        outlookQaSha256: "d".repeat(64),
      },
    };
    const index = buildIndex([legacyEntry, audited]);

    expect(
      resolveLatestApprovedWeeklyBriefingEdition({
        index,
        archivedEditions: ["2026-08-07", "2026-07-31"],
      }),
    ).toBe("2026-08-07");
  });

  it("rejects semantic index tampering unless the canonical hash matches", () => {
    const index = buildIndex([legacyEntry]);
    const tampered = structuredClone(index);
    tampered.entries[0].approval = {
      ...legacyEntry.approval,
      rationale: "Unreviewed replacement rationale",
    };

    expect(() =>
      parseApprovedWeeklyBriefingIndex(JSON.stringify(tampered)),
    ).toThrow("index hash mismatch");
  });

  it("reserves the legacy escape hatch for the July 31 baseline", () => {
    const invalidLegacy = {
      ...legacyEntry,
      edition: "2026-08-07",
    } as ApprovedWeeklyBriefingEdition;
    const index = buildIndex([invalidLegacy]);

    expect(() =>
      parseApprovedWeeklyBriefingIndex(JSON.stringify(index)),
    ).toThrow("Only 2026-07-31 may use LEGACY_BASELINE");
  });

  it("rejects invalid dates, duplicates, empty indexes, and missing artifacts", () => {
    expect(() =>
      parseApprovedWeeklyBriefingIndex(
        JSON.stringify({
          schemaVersion: 1,
          entries: [],
          indexSha256: "a".repeat(64),
        }),
      ),
    ).toThrow("at least one entry");

    const duplicateIndex = buildIndex([legacyEntry, legacyEntry]);
    expect(() =>
      parseApprovedWeeklyBriefingIndex(JSON.stringify(duplicateIndex)),
    ).toThrow("duplicate editions");

    expect(() =>
      resolveLatestApprovedWeeklyBriefingEdition({
        index: buildIndex([
          {
            edition: "2026-08-07",
            approval: {
              kind: "AUDIT_MANIFEST",
              manifestPath:
                "audits/weekly-briefing-activity/2026-08-07/manifest.json",
              manifestSha256: "a".repeat(64),
              emailPath: "public/email-format/2026-08-07.html",
              renderedEmailSha256: "b".repeat(64),
              protectedNonChartSha256: "c".repeat(64),
              outlookQaPath:
                "audits/weekly-briefing-activity/2026-08-07/outlook-qa-approval.json",
              outlookQaSha256: "d".repeat(64),
            },
          },
        ]),
        archivedEditions: ["2026-07-31"],
      }),
    ).toThrow("missing from the archive");
  });

  it("verifies the approved manifest, frozen inputs, rendered email, and protected copy", async () => {
    const repositoryRoot = await mkdtemp(
      path.join(os.tmpdir(), "briefing-index-"),
    );
    const emailDirectory = path.join(repositoryRoot, "public", "email-format");
    await mkdir(emailDirectory, { recursive: true });
    const { draft, approved, runDirectory } =
      await createApprovedManifestFixture(repositoryRoot);
    const manifestPath = path.join(runDirectory, "manifest.json");
    const emailPath = path.join(emailDirectory, "2026-08-07.html");
    const indexPath = path.join(emailDirectory, "approved-editions.json");
    const sourceEmail = fixtureSourceEmail;
    const protectedNonChartSha256 = computeProtectedNonChartSha256(sourceEmail);
    const emailRaw = renderManifestActivityEmail({
      sourceHtml: sourceEmail,
      manifest: approved,
      expectedNonChartSha256: protectedNonChartSha256,
    }).html;
    expect(computeProtectedNonChartSha256(emailRaw)).toBe(
      computeNonChartSha256(emailRaw),
    );
    await writeFile(manifestPath, JSON.stringify(approved, null, 2));
    await writeFile(emailPath, emailRaw);
    const qaRelativePath =
      "audits/weekly-briefing-activity/2026-08-07/outlook-qa-approval.json";
    const qaPath = path.join(repositoryRoot, qaRelativePath);
    const qaRaw = JSON.stringify({
      schemaVersion: 1,
      artifactType: "WEEKLY_BRIEFING_OUTLOOK_QA_APPROVAL",
      edition: "2026-08-07",
      manifestSha256: approved.manifestSha256,
      renderedEmailSha256: sha256(emailRaw),
      protectedNonChartSha256,
      reviewer: "Alex Morgan",
      reviewedAt: "2026-08-08T06:00:00.000Z",
      notes: "Verified all responsive widths and both Outlook desktop checks.",
      humanAttestation: {
        performedByHuman: true,
        exactRenderedEmailReviewed: true,
        viewport320Passed: true,
        viewport375Passed: true,
        viewport600Passed: true,
        desktopViewportPassed: true,
        outlookDesktopCopyPastePassed: true,
        outlookDesktopSendToSelfPassed: true,
        approvedForCutover: true,
      },
    });
    await writeFile(qaPath, qaRaw);

    const auditedEntry: ApprovedWeeklyBriefingEdition = {
      edition: "2026-08-07",
      approval: {
        kind: "AUDIT_MANIFEST",
        manifestPath:
          "audits/weekly-briefing-activity/2026-08-07/manifest.json",
        manifestSha256: approved.manifestSha256,
        emailPath: "public/email-format/2026-08-07.html",
        renderedEmailSha256: sha256(emailRaw),
        protectedNonChartSha256,
        outlookQaPath: qaRelativePath,
        outlookQaSha256: sha256(qaRaw),
      },
    };
    const index = buildIndex([auditedEntry]);
    await writeFile(indexPath, JSON.stringify(index));

    await expect(
      readApprovedWeeklyBriefingIndex(indexPath, repositoryRoot),
    ).resolves.toEqual(index);

    await writeFile(
      manifestPath,
      JSON.stringify({
        ...approved,
        controls: { ...approved.controls, publishedTotal: 394 },
      }),
    );
    await expect(
      readApprovedWeeklyBriefingIndex(indexPath, repositoryRoot),
    ).rejects.toThrow("manifest is not publishable");

    await writeFile(manifestPath, JSON.stringify(draft));
    const draftIndex = buildIndex([
      {
        ...auditedEntry,
        approval: { ...auditedEntry.approval, manifestSha256: draft.manifestSha256 },
      },
    ]);
    await writeFile(indexPath, JSON.stringify(draftIndex));
    await expect(
      readApprovedWeeklyBriefingIndex(indexPath, repositoryRoot),
    ).rejects.toThrow("MANIFEST_NOT_APPROVED");

    await writeFile(manifestPath, JSON.stringify(approved));
    const editedEmail = emailRaw.replace("Approved copy", "Changed copy");
    await writeFile(emailPath, editedEmail);
    const editedIndex = buildIndex([
      {
        ...auditedEntry,
        approval: {
          ...auditedEntry.approval,
          renderedEmailSha256: sha256(editedEmail),
        },
      },
    ]);
    await writeFile(indexPath, JSON.stringify(editedIndex));
    await expect(
      readApprovedWeeklyBriefingIndex(indexPath, repositoryRoot),
    ).rejects.toThrow("Protected non-chart hash mismatch");

    const chartEditedEmail = emailRaw.replace(
      'data-direct="1"',
      'data-direct="999"',
    );
    expect(computeProtectedNonChartSha256(chartEditedEmail)).toBe(
      protectedNonChartSha256,
    );
    const chartEditedQaRaw = JSON.stringify({
      ...JSON.parse(qaRaw),
      renderedEmailSha256: sha256(chartEditedEmail),
    });
    await writeFile(emailPath, chartEditedEmail);
    await writeFile(qaPath, chartEditedQaRaw);
    const chartEditedIndex = buildIndex([{
      ...auditedEntry,
      approval: {
        ...auditedEntry.approval,
        renderedEmailSha256: sha256(chartEditedEmail),
        outlookQaSha256: sha256(chartEditedQaRaw),
      },
    }]);
    await writeFile(indexPath, JSON.stringify(chartEditedIndex));
    await expect(
      readApprovedWeeklyBriefingIndex(indexPath, repositoryRoot),
    ).rejects.toThrow("does not byte-for-byte match the deterministic manifest render");

    await writeFile(emailPath, emailRaw);
    await writeFile(qaPath, `${qaRaw}\n`);
    await writeFile(indexPath, JSON.stringify(index));
    await expect(
      readApprovedWeeklyBriefingIndex(indexPath, repositoryRoot),
    ).rejects.toThrow("Outlook QA artifact hash mismatch");
  });
});
