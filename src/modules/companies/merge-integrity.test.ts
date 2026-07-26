import { describe, expect, it } from "vitest";
import type { CompanyMergeSnapshot } from "@/modules/companies/merge-approval";
import { planCompanyMerge } from "@/modules/companies/merge-integrity";

function company(id: string, overrides: Partial<CompanyMergeSnapshot> = {}): CompanyMergeSnapshot {
  return {
    id,
    name: `Company ${id}`,
    sector: "DIGITAL",
    subsector: "Fiber",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: [],
    description: "Profile",
    companyStatus: "ACTIVE",
    website: null,
    yearFounded: null,
    headquarters: null,
    status: "PUBLISHED",
    lastVerifiedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-07-22T00:00:00.000Z"),
    ownershipPeriods: [],
    milestones: [],
    managementRoles: [],
    citations: [],
    newsMentions: [],
    redirects: [],
    ...overrides,
  } as CompanyMergeSnapshot;
}

function citation(id: string, overrides: Partial<CompanyMergeSnapshot["citations"][number]> = {}) {
  return {
    id,
    sourceId: "source-1",
    isPrimary: false,
    purpose: "COMPANY_PROFILE",
    evidenceLabel: null,
    source: { id: "source-1", label: "Source", url: "https://example.com/source", type: "PRESS_RELEASE" },
    ...overrides,
  } as CompanyMergeSnapshot["citations"][number];
}

describe("company merge integrity planning", () => {
  it("preserves distinct citation meanings and rehomes every news mention", () => {
    const canonical = company("canonical", { citations: [citation("citation-a")] });
    const retired = company("retired", {
      citations: [citation("citation-b", { purpose: "OWNERSHIP_INVESTMENT" })],
      newsMentions: [{
        id: "mention-1",
        newsItemId: "news-1",
        mentionType: "COMPANY",
        label: "Company",
        confidence: "HIGH",
        reason: null,
        fundId: null,
        organizationId: null,
        dealId: null,
        createdAt: new Date("2026-07-22T00:00:00.000Z"),
      }],
    });
    const plan = planCompanyMerge([canonical, retired], canonical.id);
    expect(plan.citations).toEqual({ moveIds: ["citation-b"], deleteExactDuplicateIds: [] });
    expect(plan.newsMentionIds).toEqual(["mention-1"]);
  });

  it("deduplicates only materially equivalent relations", () => {
    const canonical = company("canonical", { citations: [citation("citation-a")] });
    const retired = company("retired", { citations: [citation("citation-b")] });
    expect(planCompanyMerge([canonical, retired], canonical.id).citations).toEqual({
      moveIds: [],
      deleteExactDuplicateIds: ["citation-b"],
    });
  });

  it("fails closed on ambiguous ownership, milestone, management, and citation collisions", () => {
    const ownership = (id: string, stake: string) => ({
      id,
      fundId: "fund-1",
      organizationId: "org-1",
      vehicleName: "Fund I",
      stake,
      investmentYear: 2020,
      exitYear: null,
      isActive: true,
      createdAt: new Date("2020-01-01T00:00:00.000Z"),
    } as CompanyMergeSnapshot["ownershipPeriods"][number]);
    expect(() => planCompanyMerge([
      company("canonical", { ownershipPeriods: [ownership("ownership-a", "Majority")] }),
      company("retired", { ownershipPeriods: [ownership("ownership-b", "Minority")] }),
    ], "canonical")).toThrow(/OwnershipPeriod collision/);

    const milestone = (id: string, category: "FOUNDING" | "FINANCING") => ({
      id,
      date: "2020",
      event: "Company established",
      category,
      sortDate: new Date("2020-01-01T00:00:00.000Z"),
    } as CompanyMergeSnapshot["milestones"][number]);
    expect(() => planCompanyMerge([
      company("canonical", { milestones: [milestone("milestone-a", "FOUNDING")] }),
      company("retired", { milestones: [milestone("milestone-b", "FINANCING")] }),
    ], "canonical")).toThrow(/Milestone collision/);

    const role = (id: string, title: string) => ({
      id,
      personId: "person-1",
      title,
      startDate: null,
      endDate: null,
      person: { id: "person-1", name: "Executive" },
    } as CompanyMergeSnapshot["managementRoles"][number]);
    expect(() => planCompanyMerge([
      company("canonical", { managementRoles: [role("role-a", "Chief Executive Officer")] }),
      company("retired", { managementRoles: [role("role-b", "President")] }),
    ], "canonical")).toThrow(/ManagementRole collision/);

    expect(() => planCompanyMerge([
      company("canonical", { citations: [citation("citation-a")] }),
      company("retired", { citations: [citation("citation-b", { isPrimary: true })] }),
    ], "canonical")).toThrow(/Citation collision/);
  });

  it("backfills only one unambiguous value and records a deterministic tag union", () => {
    const canonical = company("canonical", { description: "", countryTags: ["US"] });
    const retired = company("retired", {
      description: "Reviewed profile",
      website: "https://example.com",
      countryTags: ["North America", "US"],
    });
    expect(planCompanyMerge([canonical, retired], canonical.id).scalarUpdates).toEqual({
      description: "Reviewed profile",
      website: "https://example.com",
      countryTags: ["US", "North America"],
    });
    expect(() => planCompanyMerge([
      canonical,
      retired,
      company("retired-2", { description: "Conflicting profile" }),
    ], canonical.id)).toThrow(/conflicting non-blank values/);
  });
});
