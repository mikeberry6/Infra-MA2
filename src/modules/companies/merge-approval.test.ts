import { describe, expect, it } from "vitest";
import {
  COMPANY_MERGE_APPROVAL_SCHEMA_VERSION,
  COMPANY_MERGE_APPROVAL_SCOPE,
  assertApprovalMatchesDetectedClusters,
  assertRetiredCompanyCompatibility,
  companyCompatibilityIdentitySha256,
  companyMergeSnapshotSha256,
  mergeApprovalCandidateFromSnapshot,
  parseMergeApproval,
  sha256Text,
  type CompanyMergeSnapshot,
} from "@/modules/companies/merge-approval";

function company(
  id: string,
  overrides: Partial<CompanyMergeSnapshot> = {},
): CompanyMergeSnapshot {
  return {
    id,
    name: id === "company-a" ? "Example Infrastructure" : "Example Infrastructure, Inc.",
    sector: "DIGITAL",
    subsector: "Fiber",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    description: "Company profile",
    companyStatus: "ACTIVE",
    website: "https://example.com",
    yearFounded: 2000,
    headquarters: "New York, NY",
    status: "PUBLISHED",
    lastVerifiedAt: new Date("2026-07-20T12:00:00.000Z"),
    createdAt: new Date("2026-07-01T12:00:00.000Z"),
    updatedAt: new Date("2026-07-21T12:00:00.000Z"),
    ownershipPeriods: [],
    milestones: [],
    managementRoles: [],
    citations: [],
    newsMentions: [],
    redirects: [],
    ...overrides,
  } as CompanyMergeSnapshot;
}

function approvalValue(a = company("company-a"), b = company("company-b")) {
  return {
    schemaVersion: COMPANY_MERGE_APPROVAL_SCHEMA_VERSION,
    scope: COMPANY_MERGE_APPROVAL_SCOPE,
    generatedAt: "2026-07-22T15:00:00.000Z",
    reviewedBy: "Research Owner",
    reviewedAt: "2026-07-22T16:00:00.000Z",
    instructions: ["Retain the generated evidence."],
    clusters: [{
      reviewKey: "1:example-infrastructure",
      proposedCanonicalId: a.id,
      canonicalId: a.id,
      retiredIds: [b.id],
      candidates: [a, b].map(mergeApprovalCandidateFromSnapshot),
    }],
  };
}

const reviewNow = new Date("2026-07-22T17:00:00.000Z");

describe("canonical merge approvals", () => {
  it("binds parsing to exact reviewed bytes and retains generated provenance", () => {
    const value = approvalValue();
    const raw = JSON.stringify(value);
    expect(parseMergeApproval(raw, sha256Text(raw), reviewNow)).toEqual({
      approvalSha256: sha256Text(raw),
      approval: value,
    });
    expect(() => parseMergeApproval(`${raw}\n`, sha256Text(raw), reviewNow)).toThrow(/does not match/);
    expect(() => parseMergeApproval(raw, "not-a-digest", reviewNow)).toThrow(/64-character/);
  });

  it("rejects invalid scope, timestamps, and candidate mappings", () => {
    const badScope = { ...approvalValue(), scope: "PUBLISHED_ONLY" };
    const badScopeRaw = JSON.stringify(badScope);
    expect(() => parseMergeApproval(badScopeRaw, sha256Text(badScopeRaw), reviewNow)).toThrow(/scope/);

    const future = { ...approvalValue(), reviewedAt: "2026-07-22T18:00:00.000Z" };
    const futureRaw = JSON.stringify(future);
    expect(() => parseMergeApproval(futureRaw, sha256Text(futureRaw), reviewNow)).toThrow(/future/);

    const incomplete = approvalValue();
    incomplete.clusters[0].retiredIds = ["company-c"];
    const incompleteRaw = JSON.stringify(incomplete);
    expect(() => parseMergeApproval(incompleteRaw, sha256Text(incompleteRaw), reviewNow)).toThrow(/every and only/);
  });

  it("requires exact live IDs, snapshots, and human-readable candidate evidence", () => {
    const a = company("company-a");
    const b = company("company-b");
    const raw = JSON.stringify(approvalValue(a, b));
    const { approval } = parseMergeApproval(raw, sha256Text(raw), reviewNow);
    const detected = [{
      key: "example-infrastructure",
      candidates: [a, b].map(mergeApprovalCandidateFromSnapshot),
    }];
    expect(() => assertApprovalMatchesDetectedClusters(approval, detected)).not.toThrow();

    const changed = company("company-b", { description: "Changed after review" });
    expect(() => assertApprovalMatchesDetectedClusters(approval, [{
      key: "example-infrastructure",
      candidates: [a, changed].map(mergeApprovalCandidateFromSnapshot),
    }])).toThrow(/changed after review/);

    detected[0].candidates[1] = { ...detected[0].candidates[1], name: "Misleading display name" };
    expect(() => assertApprovalMatchesDetectedClusters(approval, detected)).toThrow(/reviewed evidence changed/);
  });

  it("hashes timestamps and is stable across relation ordering", () => {
    const first = company("company-a", {
      milestones: [
        { id: "m-2", date: "2025", event: "Expanded", category: "EXPANSION", sortDate: new Date("2025-02-01T00:00:00.000Z") },
        { id: "m-1", date: "2020", event: "Founded", category: "FOUNDING", sortDate: new Date("2020-01-01T00:00:00.000Z") },
      ],
    });
    const reordered = company("company-a", { milestones: [...first.milestones].reverse() });
    const timestampChanged = company("company-a", {
      milestones: first.milestones.map((milestone) => milestone.id === "m-1"
        ? { ...milestone, sortDate: new Date("2020-01-02T00:00:00.000Z") }
        : milestone),
    });
    expect(companyMergeSnapshotSha256(reordered)).toBe(companyMergeSnapshotSha256(first));
    expect(companyMergeSnapshotSha256(timestampChanged)).not.toBe(companyMergeSnapshotSha256(first));
  });

  it("rejects tampered or relation-bearing compatibility tombstones on replay", () => {
    const retired = company("company-b");
    const candidate = mergeApprovalCandidateFromSnapshot(retired);
    const evidence = [{
      id: retired.id,
      compatibilityIdentitySha256: companyCompatibilityIdentitySha256(retired),
    }];
    const input = {
      retiredIds: [retired.id],
      candidates: [candidate],
      tombstones: [retired],
      evidence,
    };

    expect(() => assertRetiredCompanyCompatibility(input)).not.toThrow();
    expect(() => assertRetiredCompanyCompatibility({
      ...input,
      tombstones: [company("company-b", { name: "Tampered Company" })],
    })).toThrow(/rollback-sensitive identity/);
    expect(() => assertRetiredCompanyCompatibility({
      ...input,
      tombstones: [company("company-b", {
        ownershipPeriods: [{ id: "ownership-1" } as CompanyMergeSnapshot["ownershipPeriods"][number]],
      })],
    })).toThrow(/regained relations/);
    expect(() => assertRetiredCompanyCompatibility({
      ...input,
      tombstones: [company("company-b", { description: "Tampered scalar" })],
    })).toThrow(/scalar compatibility identity/);
  });
});
