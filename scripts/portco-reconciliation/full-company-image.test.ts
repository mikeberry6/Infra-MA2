import { describe, expect, it } from "vitest";
import { companyImageSha256 } from "./artifacts";
import { legacyFullCompanySnapshotToImage } from "./full-company-image";

const NOW = "2026-08-03T12:00:00.000Z";

function legacySnapshot(): Record<string, unknown> {
  return {
    id: "company_1",
    name: "Acme Infrastructure",
    sector: "UTILITIES",
    subsector: "Water",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    description: "Acme owns and operates water infrastructure.",
    companyStatus: "ACTIVE",
    website: null,
    yearFounded: 2000,
    headquarters: "Three-state operating footprint",
    status: "PUBLISHED",
    lastVerifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ownershipPeriods: [{
      id: "owner_1",
      fundId: "fund_1",
      organizationId: "org_1",
      vehicleName: "Acme Fund",
      stake: null,
      investmentYear: 2023,
      exitYear: null,
      isActive: true,
      createdAt: NOW,
      fund: {
        id: "fund_1",
        fundName: "Acme Infrastructure Fund",
        manager: { id: "org_1", name: "Acme Manager" },
      },
      organization: { id: "org_1", name: "Acme Manager" },
    }],
    milestones: [{
      id: "milestone_1",
      date: "2023",
      event: "Acme Manager invested in the company.",
      category: "FINANCING",
      sortDate: NOW,
    }],
    managementRoles: [{
      id: "role_1",
      title: "Chief Executive Officer",
      startDate: "2020-02-03T05:00:00.000Z",
      endDate: null,
      person: { id: "person_1", name: "Ada Example" },
    }],
    citations: [{
      id: "citation_1",
      isPrimary: true,
      purpose: "COMPANY_PROFILE",
      evidenceLabel: "Official profile",
      source: {
        id: "source_1",
        label: "Acme — About",
        url: "https://acme.example.com/",
        type: "WEBSITE",
      },
    }],
    redirects: [],
  };
}

describe("legacy full production company image", () => {
  it("preserves every represented relation while deriving only legacy lifecycle fields", () => {
    const image = legacyFullCompanySnapshotToImage(legacySnapshot());
    expect(image).toMatchObject({
      id: "company_1",
      aliases: [],
      recordStatus: "PUBLISHED",
      pendingOwnershipTransactions: [],
      ownershipPeriods: [{
        id: "owner_1",
        managerName: "Acme Manager",
        organizationName: "Acme Manager",
        fundName: "Acme Infrastructure Fund",
        transactionState: "CLOSED_ACTIVE",
      }],
      milestones: [{ id: "milestone_1", evidenceUrls: [] }],
      managementRoles: [{
        id: "role_1",
        isCurrent: true,
        startDate: "2020-02-03",
        endDate: null,
        evidenceUrls: [],
      }],
      citations: [{ id: "citation_1", isPrimary: true }],
    });
    expect(companyImageSha256(image)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("preserves a legacy HTTP citation so a correction can replace it", () => {
    const legacy = legacySnapshot();
    const citation = (legacy.citations as Array<Record<string, unknown>>)[0];
    (citation.source as Record<string, unknown>).url = "http://acme.example.com/legacy";
    const image = legacyFullCompanySnapshotToImage(legacy);
    expect(image.citations[0].url).toBe("http://acme.example.com/legacy");
  });

  it("rejects non-empty redirects and unattributable ownership", () => {
    const redirected = legacySnapshot();
    redirected.redirects = [{ retiredId: "old_1", reason: "CANONICAL_MERGE", createdAt: NOW }];
    expect(() => legacyFullCompanySnapshotToImage(redirected)).toThrow(/redirects/i);

    const ownerless = legacySnapshot();
    (ownerless.ownershipPeriods as Array<Record<string, unknown>>)[0].fund = null;
    (ownerless.ownershipPeriods as Array<Record<string, unknown>>)[0].organization = null;
    expect(() => legacyFullCompanySnapshotToImage(ownerless)).toThrow(/no attributable manager/i);
  });
});
