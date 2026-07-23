import { describe, expect, it } from "vitest";
import {
  findOwnershipFundIssues,
  missingCompanyPublicationFields,
  missingDealPublicationFields,
  missingFundPublicationFields,
  normalizeFundLookup,
} from "./publication-integrity";

describe("publication completeness", () => {
  it("accepts complete deal, fund, and company records", () => {
    expect(missingDealPublicationFields({
      target: "GridCo",
      country: "United States",
      date: new Date("2026-07-01"),
      dealStatus: "ANNOUNCED",
      categories: ["ACQUISITION_BUYOUT"],
      participants: [{ role: "BUYER" }, { role: "SELLER" }],
      sellerDisclosureStatus: "DISCLOSED",
      citations: [{ id: "citation-1" }],
    })).toEqual([]);
    expect(missingFundPublicationFields({
      managerId: "manager-1",
      fundName: "Infrastructure Fund IV",
      strategies: ["CORE_PLUS"],
      fundStatus: "FINANCIAL_CLOSE",
      size: "USD 2.0bn",
      primarySourceUrl: "https://example.com/fund-primary",
      sourceUrls: ["https://example.com/fund"],
      strategyUrl: "",
    })).toEqual([]);
    expect(missingCompanyPublicationFields({
      name: "GridCo",
      country: "United States",
      sector: "UTILITIES",
      description: "An electric utility platform.",
      ownershipPeriods: [{ id: "ownership-1", organizationId: "organization-1" }],
      citations: [{ id: "citation-1" }],
    })).toEqual([]);
  });

  it("reports every missing deal publication field and requires reviewed seller treatment", () => {
    expect(missingDealPublicationFields({
      target: " ",
      country: "",
      date: null,
      dealStatus: null,
      categories: [],
      participants: [],
      sellerDisclosureStatus: "NOT_DISCLOSED",
      sellerDisclosureReason: "too short",
      citations: [],
    })).toEqual([
      "target",
      "country",
      "date",
      "transaction status",
      "category",
      "buyer",
      "seller or reviewed seller-disclosure reason",
      "primary citation",
    ]);
  });

  it("requires an explicit primary fund source and never promotes supporting links", () => {
    expect(missingFundPublicationFields({
      managerId: "manager-1",
      fundName: "Fund",
      strategies: ["CORE"],
      fundStatus: "RAISING",
      size: "TBD",
      primarySourceUrl: null,
      sourceUrls: ["https://example.com/supporting"],
      strategyUrl: "https://example.com/strategy",
    })).toEqual(["valid HTTP(S) primary source"]);
    expect(missingFundPublicationFields({
      managerId: "manager-1",
      fundName: "Fund",
      strategies: ["CORE"],
      fundStatus: "RAISING",
      size: "TBD",
      primarySourceUrl: "javascript:alert(1)",
      sourceUrls: [],
      strategyUrl: "",
    })).toEqual(["valid HTTP(S) primary source"]);
    expect(missingFundPublicationFields({
      managerId: "manager-1",
      fundName: "Fund",
      strategies: ["CORE"],
      fundStatus: "RAISING",
      size: "TBD",
      primarySourceUrl: "https://example.com/primary",
      sourceUrls: ["data:text/html,unsafe"],
      strategyUrl: "",
    })).toEqual(["valid HTTP(S) supporting sources"]);
  });

  it.each(["—", "N/A", "[TBU]", "unknown", "123"])(
    "blocks fund publication for an ambiguous size placeholder: %s",
    (size) => {
      expect(missingFundPublicationFields({
        managerId: "manager-1",
        fundName: "Fund",
        strategies: ["CORE"],
        fundStatus: "RAISING",
        size,
        primarySourceUrl: "https://example.com/primary",
        sourceUrls: [],
        strategyUrl: "",
      })).toEqual(["size basis or explicit TBD"]);
    },
  );

  it("keeps legacy bracketed TBD publishable while inputs migrate to canonical TBD", () => {
    expect(missingFundPublicationFields({
      managerId: "manager-1",
      fundName: "Fund",
      strategies: ["CORE"],
      fundStatus: "RAISING",
      size: "[TBD]",
      primarySourceUrl: "https://example.com/primary",
      sourceUrls: [],
      strategyUrl: "",
    })).toEqual([]);
  });

  it.each(["DRAFT", "IN_REVIEW", "ARCHIVED"])(
    "blocks company publication when its only ownership links a %s fund",
    (status) => {
      expect(missingCompanyPublicationFields({
        name: "GridCo",
        country: "United States",
        sector: "UTILITIES",
        description: "An electric utility platform.",
        ownershipPeriods: [{ fundId: "fund-1", fund: { status } }],
        citations: [{ id: "citation-1" }],
      })).toEqual(["ownership period backed by a published fund or investor organization"]);
    },
  );

  it("blocks an empty ownership row that identifies neither a fund nor an investor", () => {
    expect(missingCompanyPublicationFields({
      name: "GridCo",
      country: "United States",
      sector: "UTILITIES",
      description: "An electric utility platform.",
      ownershipPeriods: [{ id: "ownership-empty", fundId: null, organizationId: null }],
      citations: [{ id: "citation-1" }],
    })).toEqual(["ownership period backed by a published fund or investor organization"]);
  });
});

describe("ownership to fund integrity", () => {
  const funds = [
    { id: "fund-1", fundName: "Brookfield Infrastructure Fund V" },
    { id: "fund-2", fundName: "Global Infrastructure Fund" },
  ];

  it("normalizes punctuation, case, and whitespace only", () => {
    expect(normalizeFundLookup(" Brookfield Infrastructure Fund V, L.P. "))
      .toBe("brookfield infrastructure fund v l p");
  });

  it("accepts a normalized linked vehicle name", () => {
    expect(findOwnershipFundIssues([{
      id: "ownership-1",
      companyId: "company-1",
      vehicleName: "Brookfield Infrastructure Fund V",
      fundId: "fund-1",
      fund: funds[0],
    }], funds)).toEqual([]);
  });

  it("reports broken, mismatched, and uniquely missing fund links", () => {
    expect(findOwnershipFundIssues([
      {
        id: "ownership-broken",
        companyId: "company-1",
        vehicleName: "Brookfield Infrastructure Fund V",
        fundId: "missing-fund",
        fund: null,
      },
      {
        id: "ownership-mismatch",
        companyId: "company-2",
        vehicleName: "Global Infrastructure Fund",
        fundId: "fund-1",
        fund: funds[0],
      },
      {
        id: "ownership-unlinked",
        companyId: "company-3",
        vehicleName: "Brookfield Infrastructure Fund V",
        fundId: null,
        fund: null,
      },
    ], funds).map((issue) => issue.code)).toEqual([
      "BROKEN_FUND_LINK",
      "LINKED_FUND_NAME_MISMATCH",
      "MISSING_FUND_LINK",
    ]);
  });

  it("does not guess when normalized fund names are ambiguous", () => {
    expect(findOwnershipFundIssues([{
      id: "ownership-ambiguous",
      companyId: "company-1",
      vehicleName: "Global Infrastructure Fund",
      fundId: null,
      fund: null,
    }], [
      ...funds,
      { id: "fund-3", fundName: "Global Infrastructure Fund!" },
    ])).toEqual([]);
  });

  it("flags a published ownership linked to a nonpublished Fund", () => {
    expect(findOwnershipFundIssues([{
      id: "ownership-draft",
      companyId: "company-1",
      vehicleName: "Brookfield Infrastructure Fund V",
      fundId: "fund-draft",
      fund: {
        id: "fund-draft",
        fundName: "Brookfield Infrastructure Fund V",
        status: "DRAFT",
      },
    }], [{
      id: "fund-draft",
      fundName: "Brookfield Infrastructure Fund V",
      status: "DRAFT",
    }])).toEqual([expect.objectContaining({
      code: "BROKEN_FUND_LINK",
      message: expect.stringContaining("DRAFT Fund instead of a PUBLISHED Fund"),
    })]);
  });

  it("does not require a link when only a nonpublished Fund matches", () => {
    expect(findOwnershipFundIssues([{
      id: "ownership-free-text",
      companyId: "company-1",
      vehicleName: "Brookfield Infrastructure Fund V",
      fundId: null,
      fund: null,
    }], [{
      id: "fund-draft",
      fundName: "Brookfield Infrastructure Fund V",
      status: "DRAFT",
    }])).toEqual([]);
  });
});
