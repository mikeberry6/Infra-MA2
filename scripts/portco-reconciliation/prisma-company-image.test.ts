import { describe, expect, it } from "vitest";
import {
  prismaCompanyRowToImage,
  prismaCompanyRowToSnapshot,
  type RawPrismaCompanyImageRow,
} from "./prisma-company-image";
import { assertRelationEvidencePolicy } from "./prisma-apply-store";

function rawCompany(): RawPrismaCompanyImageRow {
  const citation = {
    id: "citation_1",
    source: {
      label: "Official source",
      url: "https://example.com/source",
      type: "PRESS_RELEASE",
    },
    isPrimary: true,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: "Current ownership",
  };
  const join = { citation: { source: { url: citation.source.url } } };
  return {
    id: "company_1",
    name: "Example Infrastructure, LLC",
    aliases: ["Example Infra"],
    sector: "SOCIAL_INFRA",
    subsector: "District energy",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    description: "Example infrastructure operator.",
    companyStatus: "ACTIVE",
    status: "PUBLISHED",
    website: "https://example.com/",
    yearFounded: 2001,
    headquarters: "Chicago, Illinois",
    updatedAt: "2026-08-03T12:00:00.000Z",
    lastVerifiedAt: "2026-08-03T12:00:00.000Z",
    _count: {
      ownershipPeriods: 1,
      pendingOwnershipTransactions: 1,
      milestones: 1,
      managementRoles: 1,
      citations: 1,
      redirects: 0,
    },
    ownershipPeriods: [{
      id: "owner_1",
      vehicleName: "Example Vehicle",
      stake: "75%",
      investmentYear: 2020,
      exitYear: null,
      isActive: true,
      transactionState: "CLOSED_ACTIVE",
      organization: { name: "Sleeve Organization" },
      fund: {
        fundName: "Example Fund I",
        manager: { name: "Canonical Fund Manager" },
      },
    }],
    pendingOwnershipTransactions: [{
      id: "pending_1",
      direction: "EXIT",
      state: "SIGNED_PENDING_EXIT",
      counterpartyName: "Incoming Buyer",
      transactionDescription: "Signed sale pending legal closing.",
      announcedAt: null,
      expectedClosing: "Q4 2026",
      relatedOwnershipPeriodIds: ["owner_1"],
      citations: [join],
    }],
    milestones: [{
      id: "milestone_1",
      date: "2001",
      event: "Example was founded.",
      category: "FOUNDING",
      sortDate: "2001-01-01T00:00:00.000Z",
      citations: [join],
    }],
    managementRoles: [{
      id: "role_1",
      title: "Chief Executive Officer",
      isCurrent: true,
      startDate: "2020-01-01T00:00:00.000Z",
      endDate: null,
      person: { name: "Alex Example" },
      citations: [join],
    }],
    citations: [citation],
  };
}

describe("exact Prisma company image adapter", () => {
  it("round-trips raw persistence enums and every evidence-bearing relation", () => {
    const image = prismaCompanyRowToImage(rawCompany());
    expect(image).toMatchObject({
      aliases: ["Example Infra"],
      sector: "SOCIAL_INFRA",
      region: "NORTH_AMERICA",
      ownershipPeriods: [{
        managerName: "Canonical Fund Manager",
        organizationName: "Sleeve Organization",
      }],
      pendingOwnershipTransactions: [{
        announcedAt: null,
        relatedOwnershipPeriodIds: ["owner_1"],
        evidenceUrls: ["https://example.com/source"],
      }],
      milestones: [{
        category: "FOUNDING",
        evidenceUrls: ["https://example.com/source"],
      }],
      managementRoles: [{
        evidenceUrls: ["https://example.com/source"],
      }],
    });
    expect(prismaCompanyRowToSnapshot(rawCompany()).relationCounts).toEqual(rawCompany()._count);
  });

  it("allows preserved Amwaste-like milestone history without row-level evidence", () => {
    expect(() => assertRelationEvidencePolicy("HISTORICAL_FACT", [])).not.toThrow();
    expect(() => assertRelationEvidencePolicy("PENDING_TRANSACTION", [])).toThrow(/at least one/i);
  });
});
