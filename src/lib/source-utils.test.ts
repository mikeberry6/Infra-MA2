import { describe, expect, it } from "vitest";
import {
  dedupeExactPortCoSources,
  formatSourceType,
  getSourceDisplayLabel,
  getSourceHostname,
  groupSourcesByPurpose,
  inferCitationPurpose,
  inferSourceType,
} from "./source-utils";

describe("source-utils", () => {
  it("groups sources by fact-based purpose in scorecard order", () => {
    const groups = groupSourcesByPurpose([
      {
        label: "Business Wire - Financing",
        url: "https://www.businesswire.com/news/home/example",
        purpose: "FINANCING_FILINGS",
      },
      {
        label: "Company - About",
        url: "https://example.com/about",
        purpose: "COMPANY_PROFILE",
      },
      {
        label: "Sponsor - Investment",
        url: "https://sponsor.com/portfolio/company",
        purpose: "OWNERSHIP_INVESTMENT",
      },
    ]);

    expect(groups.map((group) => group.purpose)).toEqual([
      "COMPANY_PROFILE",
      "OWNERSHIP_INVESTMENT",
      "FINANCING_FILINGS",
    ]);
  });

  it("turns legacy investment labels into reader-facing evidence labels", () => {
    expect(
      getSourceDisplayLabel({
        label: "Investment date source - 3i Infrastructure - Amwaste LLC",
        url: "https://www.3i.com/infrastructure/our-portfolio/amwaste/",
      }),
    ).toBe("3i Infrastructure initial investment / ownership");
  });

  it("falls back to the hostname when no useful label exists", () => {
    expect(getSourceDisplayLabel({ label: "", url: "https://www.example.com/about" })).toBe("example.com");
  });

  it("infers source purpose and format from URL and label context", () => {
    expect(
      inferCitationPurpose({
        label: "SEC - FirstEnergy Transmission",
        url: "https://www.sec.gov/Archives/example.htm",
        purpose: "SUPPORTING_CONTEXT",
      }),
    ).toBe("FINANCING_FILINGS");
    expect(
      inferSourceType({
        label: "PR Newswire - Platform launch",
        url: "https://www.prnewswire.com/news-releases/example.html",
        type: "ARTICLE",
      }),
    ).toBe("PRESS_RELEASE");
  });

  it("formats hostnames and source types for compact secondary text", () => {
    expect(getSourceHostname("https://www.3i.com/infrastructure/our-portfolio/amwaste/")).toBe("3i.com");
    expect(formatSourceType("WEBSITE")).toBe("Website");
    expect(formatSourceType(undefined)).toBe("Other");
  });

  it("prunes only exact duplicate label and URL rows", () => {
    const first = { label: "Kkr - Monterra Energy", url: "https://www.kkr.com/businesses/infrastructure" };
    const distinctEvidence = {
      label: "Investment date source - KKR - Monterra Energy",
      url: "https://www.kkr.com/businesses/infrastructure",
    };

    const result = dedupeExactPortCoSources([first, distinctEvidence, { ...first }]);

    expect(result.kept).toEqual([first, distinctEvidence]);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].reason).toMatch(/Exact duplicate/);
  });
});
