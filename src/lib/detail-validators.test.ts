import { describe, expect, it } from "vitest";
import { isCompanyDetail, isDealDetail, isFundDetail } from "./detail-validators";

const deal = {
  id: "deal-id",
  legacyId: "DEAL-1",
  title: "Title",
  target: "Target",
  buyer: "Buyer",
  seller: "Seller",
  sector: "Digital",
  subsector: "Fiber",
  region: "North America",
  category: ["Acquisition (Buyout)"],
  date: "2026-07-22",
  sourceName: "Source",
  sourceUrl: "https://example.com",
  status: "Announced",
  country: "United States",
  description: "Description",
  targetDescription: "Target description",
  enterpriseValue: null,
  equityValue: null,
  stake: null,
  closingDate: null,
  financialAdvisorBuyer: null,
  financialAdvisorSeller: null,
  legalAdvisorBuyer: null,
  legalAdvisorSeller: null,
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: null,
};

const portfolioCompany = {
  name: "Company",
  sector: "Digital",
  region: "North America",
  country: "United States",
  isActive: true,
};

const fund = {
  id: "fund-id",
  legacyId: "FUND-1",
  managerName: "Manager",
  fundName: "Fund",
  size: "$1B",
  sizeUsdMm: 1000,
  vintage: "2026",
  strategies: ["Core"],
  status: "Investing",
  sectors: ["Digital"],
  ticker: null,
  investmentStrategy: "Strategy",
  sourceUrls: ["https://example.com"],
  primarySourceUrl: "https://example.com",
  structure: "Closed-End",
  regions: ["North America"],
  portfolioCompanies: [portfolioCompany],
  managerPortfolioCompanies: [{
    company: portfolioCompany,
    fundName: "Fund",
    strategies: ["Core"],
  }],
  strategyUrl: "https://example.com/strategy",
};

const company = {
  id: "company-id",
  focusIds: ["PORTCO-1"],
  name: "Company",
  investmentFirm: "Manager",
  sector: "Digital",
  subsector: "Fiber",
  region: "North America",
  country: "United States",
  ownershipVehicle: "Fund",
  status: "Active",
  countryTags: ["United States"],
  investmentYear: 2026,
  owners: [{
    firm: "Manager",
    vehicle: "Fund",
    investmentYear: 2026,
    isActive: true,
  }],
  description: "Description",
  milestones: [{ date: "2026", event: "Invested", category: "Financing" }],
  management: [{ name: "A. Executive", title: "Chief Executive Officer" }],
  sources: [{ label: "Source", url: "https://example.com" }],
};

describe("detail entity validators", () => {
  it("accepts complete detail entities", () => {
    expect(isDealDetail(deal)).toBe(true);
    expect(isFundDetail(fund)).toBe(true);
    expect(isCompanyDetail(company)).toBe(true);
  });

  it("rejects list-only shells and malformed nested data", () => {
    const { description: _description, ...dealListItem } = deal;
    expect(isDealDetail(dealListItem)).toBe(false);
    expect(isFundDetail({ ...fund, managerPortfolioCompanies: [{ company: {} }] })).toBe(false);
    expect(isCompanyDetail({ ...company, sources: [{ label: "Source" }] })).toBe(false);
  });
});
