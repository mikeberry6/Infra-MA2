import { describe, expect, it } from "vitest";
import {
  isAllowedMilestoneDate,
  isAssetLike,
  liveOwnerCoversSeed,
  normalizeText,
  ownershipVehicleIssueSeverity,
  outcomeForIssues,
  sha256,
  type ReviewIssue,
} from "./lib";

const issue = (overrides: Partial<ReviewIssue>): ReviewIssue => ({
  code: "EXAMPLE",
  severity: "INFO",
  area: "CORE_FIELDS",
  message: "Example",
  ...overrides,
});

describe("portfolio review standards", () => {
  it("selects the highest-priority explicit review outcome", () => {
    expect(
      outcomeForIssues([
        issue({
          code: "SEED_CORE_FIELD_DRIFT",
          severity: "ERROR",
          area: "SEED_SYNC",
        }),
        issue({
          code: "EXACT_DEAL_MATCH_NOT_LINKED",
          severity: "REVIEW",
          area: "DEAL_SYNC",
        }),
        issue({
          code: "AMBIGUOUS_IDENTITY",
          severity: "REVIEW",
          area: "IDENTITY",
        }),
      ]),
    ).toBe("IDENTITY_REVIEW_REQUIRED");
  });

  it("does not let informational enrichment obscure a clean pass", () => {
    expect(outcomeForIssues([])).toBe("PASS");
    expect(outcomeForIssues([issue({ code: "MISSING_WEBSITE" })])).toBe(
      "ENRICHMENT_RECOMMENDED",
    );
  });

  it("routes an unknown investment year to evidence research, not deterministic correction", () => {
    expect(
      outcomeForIssues([
        issue({
          code: "MISSING_INVESTMENT_YEAR",
          severity: "REVIEW",
          area: "OWNERSHIP",
        }),
      ]),
    ).toBe("RESEARCH_REQUIRED");
  });

  it("keeps Rowan's undisclosed vehicle as a warning when its direct owner is identified", () => {
    expect(
      ownershipVehicleIssueSeverity({
        fundId: null,
        organizationId: "quinbrook-organization-id",
      }),
    ).toBe("WARNING");
    expect(
      ownershipVehicleIssueSeverity({ fundId: null, organizationId: null }),
    ).toBe("ERROR");
  });

  it("normalizes display punctuation without conflating token boundaries", () => {
    expect(normalizeText("Hawaiʻi Gas, LLC")).toBe("hawai i gas llc");
    expect(normalizeText("AT&T")).toBe("at and t");
  });

  it("accepts only the portfolio milestone date contract", () => {
    expect(isAllowedMilestoneDate("2026")).toBe(true);
    expect(isAllowedMilestoneDate("Jul 22, 2026")).toBe(true);
    expect(isAllowedMilestoneDate("Q3 2026")).toBe(true);
    expect(isAllowedMilestoneDate("2026-07-22")).toBe(false);
  });

  it("distinguishes operating platforms from stand-alone assets", () => {
    expect(
      isAssetLike(
        "Birdseye Battery Project",
        "Battery storage",
        "A 199 MW project.",
      ),
    ).toBe(true);
    expect(
      isAssetLike(
        "Amwaste",
        "Waste services",
        "The company provides waste services.",
      ),
    ).toBe(false);
  });

  it("creates order-stable fingerprints", () => {
    expect(sha256({ b: 2, a: 1 })).toBe(sha256({ a: 1, b: 2 }));
  });

  it("treats a specific live vehicle as enrichment over an undisclosed seed vehicle", () => {
    const shared = {
      firm: "Axium Infrastructure",
      investmentYear: 2022,
      exitYear: null,
      isActive: true,
    };
    expect(
      liveOwnerCoversSeed({
        live: { ...shared, vehicle: "Axium Infrastructure" },
        seed: { ...shared, vehicle: "n.a." },
      }),
    ).toBe(true);
  });

  it("does not let a generic or different live vehicle hide a specific seed vehicle", () => {
    const shared = {
      firm: "Axium Infrastructure",
      investmentYear: 2022,
      exitYear: null,
      isActive: true,
    };
    expect(
      liveOwnerCoversSeed({
        live: { ...shared, vehicle: "n.a." },
        seed: { ...shared, vehicle: "Axium Managed Funds" },
      }),
    ).toBe(false);
    expect(
      liveOwnerCoversSeed({
        live: { ...shared, vehicle: "Axium Infrastructure" },
        seed: { ...shared, vehicle: "Axium Managed Funds" },
      }),
    ).toBe(false);
  });

  it("requires owner, dates, and status to match even for an undisclosed seed vehicle", () => {
    expect(
      liveOwnerCoversSeed({
        live: {
          firm: "Harrison Street",
          vehicle: "Harrison Street Digital Fund",
          investmentYear: 2024,
          exitYear: null,
          isActive: true,
        },
        seed: {
          firm: "Harrison Street",
          vehicle: "n.a.",
          investmentYear: 2023,
          exitYear: null,
          isActive: true,
        },
      }),
    ).toBe(false);
  });
});
