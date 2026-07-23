import { describe, expect, it } from "vitest";
import {
  buildFundSourceLinks,
  dedupeExactPortCoSources,
  formatSourceType,
  getSourceDisplayLabel,
  getSourceHostname,
  groupSourcesByPurpose,
  inferCitationPurpose,
  inferSourceType,
  isHttpUrl,
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

  it("accepts only credential-free absolute HTTP(S) public links", () => {
    expect(isHttpUrl(" https://example.com/source ")).toBe(true);
    expect(isHttpUrl("http://example.com/source")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:text/html,unsafe")).toBe(false);
    expect(isHttpUrl("ftp://example.com/source")).toBe(false);
    expect(isHttpUrl("https://user:secret@example.com/source")).toBe(false);
    expect(isHttpUrl("https://example.com:8443/source")).toBe(false);
    expect(isHttpUrl("https://example.com:443/source")).toBe(true);
    expect(isHttpUrl("/relative/source")).toBe(false);
    expect(isHttpUrl("http://localhost/source")).toBe(false);
    expect(isHttpUrl("http://metadata.google.internal/source")).toBe(false);
    expect(isHttpUrl("http://127.0.0.1/source")).toBe(false);
    expect(isHttpUrl("http://2130706433/source")).toBe(false);
    expect(isHttpUrl("http://10.0.0.2/source")).toBe(false);
    expect(isHttpUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isHttpUrl("http://[::1]/source")).toBe(false);
    for (const host of [
      "192.31.196.1",
      "192.52.193.1",
      "192.88.99.1",
      "192.175.48.1",
      "foo_bar.example.com",
    ]) {
      expect(isHttpUrl(`https://${host}/source`), host).toBe(false);
    }
  });

  it("orders a reviewed Fund primary source before unique public support links", () => {
    expect(buildFundSourceLinks(
      "https://www.brookfield.com/fund",
      [
        "https://www.brookfield.com/fund",
        "https://www.blackrock.com/strategy",
        "javascript:alert(1)",
      ],
    )).toEqual([
      {
        url: "https://www.brookfield.com/fund",
        hostname: "brookfield.com",
        label: "Primary source",
        isPrimary: true,
      },
      {
        url: "https://www.blackrock.com/strategy",
        hostname: "blackrock.com",
        label: "Supporting source 1",
        isPrimary: false,
      },
    ]);
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
