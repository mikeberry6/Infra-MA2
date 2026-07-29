import { describe, expect, it } from "vitest";
import type {
  CompanyCleanupApproval,
  CompanyCleanupSnapshot,
  DetectedCompanyCluster,
} from "./canonical-cleanup";
import {
  assertApprovalMatchesAllDetectedClusters,
  cleanupCandidateFromSnapshot,
  COMPANY_CLEANUP_SCHEMA_VERSION,
  COMPANY_CLEANUP_SCOPE,
  parseCompanyCleanupApproval,
  sha256Text,
} from "./canonical-cleanup";

const EMPTY_DELETES = {
  ownershipPeriods: [],
  milestones: [],
  managementRoles: [],
  citations: [],
  newsMentions: [],
};

function companySnapshot(
  id: string,
  name: string,
  overrides: Partial<CompanyCleanupSnapshot> = {},
): CompanyCleanupSnapshot {
  return {
    id,
    name,
    sector: "DIGITAL",
    subsector: "Fiber",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    description: `${name} description`,
    companyStatus: "ACTIVE",
    website: null,
    yearFounded: 2020,
    headquarters: null,
    status: "PUBLISHED",
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    updatedAt: new Date("2026-07-20T00:00:00.000Z"),
    ownershipPeriods: [],
    milestones: [],
    managementRoles: [],
    citations: [],
    newsMentions: [],
    redirects: [],
    ...overrides,
  } as CompanyCleanupSnapshot;
}

function keepSeparateApproval(
  clusters: DetectedCompanyCluster[],
): CompanyCleanupApproval {
  return {
    schemaVersion: COMPANY_CLEANUP_SCHEMA_VERSION,
    scope: COMPANY_CLEANUP_SCOPE,
    generatedAt: "2026-07-20T00:00:00.000Z",
    reviewedAt: "2026-07-21T00:00:00.000Z",
    reviewedBy: "reviewer@example.com",
    instructions: ["Apply only after verifying the exact artifact digest."],
    decisions: clusters.map((cluster, index) => ({
      kind: "KEEP_SEPARATE",
      reviewKey: `cluster-${index + 1}`,
      candidates: cluster.companies.map(cleanupCandidateFromSnapshot),
      rationale: "The reviewed records represent separate legal entities.",
      sources: ["https://example.com/review"],
      explicitRelationDeleteIds: EMPTY_DELETES,
      companyUpdates: [
        {
          id: cluster.companies[0].id,
          changes: { name: `${cluster.companies[0].name} Holdings` },
        },
      ],
    })),
  };
}

describe("parseCompanyCleanupApproval", () => {
  it("requires the exact reviewed approval-file SHA-256", () => {
    const cluster = {
      key: "acme",
      companies: [
        companySnapshot("company-a", "Acme LLC"),
        companySnapshot("company-b", "Acme Inc."),
      ],
    };
    const raw = JSON.stringify(keepSeparateApproval([cluster]));
    const reviewedDigest = sha256Text(raw);

    const parsed = parseCompanyCleanupApproval(
      raw,
      reviewedDigest,
      new Date("2026-07-22T00:00:00.000Z"),
    );

    expect(parsed.approvalSha256).toBe(reviewedDigest);
    expect(parsed.approval.decisions).toHaveLength(1);
    expect(() =>
      parseCompanyCleanupApproval(
        `${raw}\n`,
        reviewedDigest,
        new Date("2026-07-22T00:00:00.000Z"),
      )).toThrow("does not match the reviewed digest");
  });

  it("binds an explicit primary-citation resolution to a merge", () => {
    const companies = [
      companySnapshot("company-a", "Acme LLC", {
        citations: [
          {
            id: "citation-a",
            sourceId: "source-a",
            purpose: "COMPANY_PROFILE",
            evidenceLabel: "Acme profile",
            source: {
              id: "source-a",
              label: "Acme",
              url: "https://example.com/acme",
              type: "WEBSITE",
            },
          },
        ],
      }),
      companySnapshot("company-b", "Acme Inc.", {
        citations: [
          {
            id: "citation-b",
            sourceId: "source-b",
            purpose: "COMPANY_PROFILE",
            evidenceLabel: "Acme Inc. profile",
            source: {
              id: "source-b",
              label: "Acme Inc.",
              url: "https://example.com/acme-inc",
              type: "WEBSITE",
            },
          },
        ],
      }),
    ];
    const approval: CompanyCleanupApproval = {
      ...keepSeparateApproval([{ key: "acme", companies }]),
      decisions: [
        {
          kind: "MERGE",
          reviewKey: "acme",
          candidates: companies.map(cleanupCandidateFromSnapshot),
          canonicalId: "company-a",
          retiredIds: ["company-b"],
          canonicalUpdates: {},
          citationPrimaryResolution: {
            keepPrimaryId: "citation-a",
            demotePrimaryIds: ["citation-b"],
          },
          rationale: "The reviewed records are one legal entity.",
          sources: ["https://example.com/review"],
          explicitRelationDeleteIds: EMPTY_DELETES,
        },
      ],
    };
    const raw = JSON.stringify(approval);
    const parsed = parseCompanyCleanupApproval(
      raw,
      sha256Text(raw),
      new Date("2026-07-22T00:00:00.000Z"),
    );

    expect(parsed.approval.decisions[0]).toMatchObject({
      citationPrimaryResolution: {
        keepPrimaryId: "citation-a",
        demotePrimaryIds: ["citation-b"],
      },
    });

    const mergeDecision = approval.decisions[0];
    if (mergeDecision.kind !== "MERGE") {
      throw new Error("Expected merge decision");
    }
    approval.decisions[0] = {
      ...mergeDecision,
      citationPrimaryResolution: {
        keepPrimaryId: "citation-a",
        demotePrimaryIds: ["citation-a"],
      },
    };
    const invalidRaw = JSON.stringify(approval);
    expect(() =>
      parseCompanyCleanupApproval(
        invalidRaw,
        sha256Text(invalidRaw),
        new Date("2026-07-22T00:00:00.000Z"),
      )).toThrow("cannot also be demoted");
  });
});

describe("assertApprovalMatchesAllDetectedClusters", () => {
  it("rejects a reviewed snapshot when attached evidence changes", () => {
    const original = companySnapshot("company-a", "Acme LLC", {
      milestones: [
        {
          id: "milestone-a",
          date: "2025",
          event: "Initial investment",
          category: "FINANCING",
          sortDate: new Date("2025-01-01T00:00:00.000Z"),
        },
      ],
    });
    const peer = companySnapshot("company-b", "Acme Inc.");
    const approval = keepSeparateApproval([
      { key: "acme", companies: [original, peer] },
    ]);
    const changed = companySnapshot("company-a", "Acme LLC", {
      milestones: [
        {
          id: "milestone-a",
          date: "2025",
          event: "Initial investment and recapitalization",
          category: "FINANCING",
          sortDate: new Date("2025-01-01T00:00:00.000Z"),
        },
      ],
    });

    expect(() =>
      assertApprovalMatchesAllDetectedClusters(approval, [
        { key: "acme", companies: [changed, peer] },
      ])).toThrow("attached evidence changed after review");
  });

  it("rejects an approval that omits any live duplicate cluster", () => {
    const first = {
      key: "acme",
      companies: [
        companySnapshot("company-a", "Acme LLC"),
        companySnapshot("company-b", "Acme Inc."),
      ],
    };
    const second = {
      key: "beta",
      companies: [
        companySnapshot("company-c", "Beta LLC"),
        companySnapshot("company-d", "Beta Inc."),
      ],
    };
    const incompleteApproval = keepSeparateApproval([first]);

    expect(() =>
      assertApprovalMatchesAllDetectedClusters(
        incompleteApproval,
        [first, second],
      )).toThrow(
      "Approval covers 1 decisions but the database contains 2 duplicate clusters",
    );
  });
});
