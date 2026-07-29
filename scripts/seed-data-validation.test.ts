import { describe, expect, it } from "vitest";
import {
  validateCanonicalSeedData,
  validateSeedData,
  type SeedDataInput,
} from "../prisma/seed-data-validation";
import type { Deal } from "../prisma/seed-data/deals";
import type { Fund } from "../prisma/seed-data/funds";
import type { PortCo } from "../prisma/seed-data/portco-types";

const validDeal: Deal = {
  id: "INF-TEST-001",
  title: "Test buyer acquires Test Target",
  target: "Test Target",
  buyer: "Test Buyer",
  seller: "Test Seller",
  sector: "Digital",
  subsector: "Data Centers",
  region: "North America",
  category: ["Acquisition (Buyout)"],
  date: "2026-07-29T00:00:00Z",
  description: "A test transaction.",
  targetDescription: "A test infrastructure company.",
  sourceName: "Test Company",
  sourceUrl: "https://example.com/deal",
  enterpriseValue: null,
  equityValue: null,
  stake: "100%",
  status: "Announced",
  closingDate: null,
  financialAdvisorBuyer: null,
  financialAdvisorSeller: null,
  legalAdvisorBuyer: null,
  legalAdvisorSeller: null,
  country: "United States",
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: null,
};

const validFund: Fund = {
  id: "FUND-TEST-001",
  managerName: "Test Manager",
  fundName: "Test Infrastructure Fund",
  ticker: null,
  investmentStrategy: "Invests in test infrastructure.",
  sourceUrls: ["https://example.com/fund"],
  size: "$1B",
  sizeUsdMm: 1000,
  vintage: "2026",
  strategies: ["Core"],
  structure: "Closed-End",
  status: "Financial Close",
  sectors: ["Digital"],
  regions: ["North America"],
  portfolioCompanies: [],
  strategyUrl: "https://example.com/strategy",
};

const validCompany: PortCo = {
  name: "Test Company",
  investmentFirm: "Test Manager",
  sector: "Digital",
  subsector: "Data Centers",
  region: "North America",
  country: "United States",
  ownershipVehicle: "Test Infrastructure Fund",
  description: "A test portfolio company.",
  status: "Active",
  countryTags: ["United States"],
  investmentYear: 2026,
  milestones: [
    {
      date: "Jul 2026",
      event: "Test Manager invested in Test Company.",
      category: "Financing",
    },
  ],
  management: [{ name: "Test Executive", title: "Chief Executive Officer" }],
  sources: [
    {
      label: "Test Company",
      url: "https://example.com/company",
      type: "WEBSITE",
      purpose: "COMPANY_PROFILE",
    },
  ],
};

function validInput(): SeedDataInput {
  return {
    deals: [structuredClone(validDeal)],
    funds: [structuredClone(validFund)],
    companies: [structuredClone(validCompany)],
  };
}

describe("validateSeedData", () => {
  it("accepts a mechanically seedable manifest deterministically", () => {
    const first = validateSeedData(validInput());
    const second = validateSeedData(validInput());

    expect(first.errors).toEqual([]);
    expect(first.contentHash).toBe(second.contentHash);
    expect(first.counts).toMatchObject({
      companies: 1,
      deals: 1,
      funds: 1,
      managementRoles: 1,
      ownershipPeriods: 1,
    });
  });

  it("detects duplicate keys, unmapped enums, invalid dates, and bad URLs", () => {
    const input = validInput();
    input.deals = [
      input.deals[0],
      {
        ...structuredClone(validDeal),
        sector: "Unknown sector" as Deal["sector"],
        date: "not-a-date",
        sourceUrl: "javascript:alert(1)",
      },
    ];
    input.funds = [
      input.funds[0],
      { ...structuredClone(validFund), fundName: validFund.fundName },
    ];
    input.companies = [
      input.companies[0],
      structuredClone(validCompany),
    ];

    const report = validateSeedData(input);
    const messages = report.errors.map(
      (diagnostic) => diagnostic.message,
    );

    expect(messages.some((message) => /Duplicate legacy ID/.test(message))).toBe(
      true,
    );
    expect(messages.some((message) => /Duplicate fund name/.test(message))).toBe(
      true,
    );
    expect(
      messages.some((message) => /Duplicate name\/country key/.test(message)),
    ).toBe(true);
    expect(messages.some((message) => /Unmapped sector/.test(message))).toBe(
      true,
    );
    expect(messages.some((message) => /Invalid deal date/.test(message))).toBe(
      true,
    );
    expect(
      messages.some((message) => /valid HTTP\(S\) URL/.test(message)),
    ).toBe(true);
  });

  it("permits an explicitly source-less draft but rejects a partial source", () => {
    const draftInput = validInput();
    draftInput.deals = [
      { ...draftInput.deals[0], sourceName: "", sourceUrl: "" },
    ];
    const draftReport = validateSeedData(draftInput);
    expect(draftReport.errors).toEqual([]);
    expect(
      draftReport.warnings.some((diagnostic) =>
        /classifies this deal as a draft/.test(diagnostic.message),
      ),
    ).toBe(true);

    const partialInput = validInput();
    partialInput.deals = [
      { ...partialInput.deals[0], sourceName: "", sourceUrl: "https://example.com" },
    ];
    expect(
      validateSeedData(partialInput).errors.some((diagnostic) =>
        /both be present or both be absent/.test(diagnostic.message),
      ),
    ).toBe(true);
  });

  it("preserves distinct evidence citations that share one source URL", () => {
    const input = validInput();
    input.companies = [
      {
        ...input.companies[0],
        sources: [
          {
            label: "Shared source",
            url: "https://example.com/shared",
            type: "PRESS_RELEASE",
            purpose: "COMPANY_PROFILE",
            evidenceLabel: "Company profile evidence",
          },
          {
            label: "Shared source",
            url: "https://example.com/shared",
            type: "PRESS_RELEASE",
            purpose: "OWNERSHIP_INVESTMENT",
            evidenceLabel: "Investment evidence",
          },
        ],
      },
    ];

    const report = validateSeedData(input);
    expect(report.errors).toEqual([]);
    expect(report.counts.sources).toBe(3);
    expect(report.counts.citations).toBe(3);
  });
});

describe("canonical seed manifest", () => {
  it("has no hard seedability errors and covers every database", () => {
    const report = validateCanonicalSeedData();

    expect(report.errors).toEqual([]);
    expect(report.counts.companies).toBeGreaterThan(1000);
    expect(report.counts.deals).toBeGreaterThan(300);
    expect(report.counts.funds).toBe(179);
  });
});
