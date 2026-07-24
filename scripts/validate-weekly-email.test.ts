import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  contrastRatio,
  validateWeeklyEmail,
  type StaticCoverageDeal,
} from "./validate-weekly-email";

const temporaryDirectories: string[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  while (temporaryDirectories.length > 0) {
    rmSync(temporaryDirectories.pop()!, { recursive: true, force: true });
  }
});

type FixtureOptions = {
  firstScale?: number;
  secondScale?: number;
  explicitScale?: boolean;
  overviewColor?: string;
  firstMetadata?: string;
  secondMetadata?: string;
  thirdMetadata?: string;
  firstOverview?: string;
  secondOverview?: string;
  thirdOverview?: string;
  firstUsThemeCategory?: string | null;
  firstUsThemePriority?: number | string | null;
  secondUsThemeCategory?: string;
  secondUsThemePriority?: number | string;
  thirdUsThemeCategory?: string;
  thirdUsThemePriority?: number | string;
  sectorYtdSecondWidth?: number;
  firstTheme?: string;
  finalTheme?: string;
  preheaderSectors?: string;
  previousEditionSectors?: string;
};

function card(options: {
  target: string;
  source: string;
  overview: string;
  metadata: string;
  scale: number;
  explicitScale: boolean;
  overviewColor: string;
  fundIdentity?: string;
  usThemeCategory?: string | null;
  usThemePriority?: number | string | null;
}) {
  const scaleAttributes = options.explicitScale
    ? ` data-scale-kind="economic" data-scale-value="${options.scale}" data-scale-unit="USD-mm"`
    : "";
  const themeAttributes = [
    options.usThemeCategory
      ? ` data-us-theme-category="${options.usThemeCategory}"`
      : "",
    options.usThemePriority !== undefined && options.usThemePriority !== null
      ? ` data-us-theme-priority="${options.usThemePriority}"`
      : "",
  ].join("");
  return `
    <table role="presentation"${scaleAttributes}${themeAttributes}>
      <tr><td style="font-size: 14px; font-weight: 700; color: #442142;">${options.target} | ${options.fundIdentity ?? "GIP"}</td></tr>
      <tr><td style="font-size: 12px; color: #52525B;">${options.metadata}</td></tr>
      <tr><td style="font-size: 12px; color: ${options.overviewColor};">${options.overview}</td></tr>
      <tr><td><a href="${options.source}" style="font-size: 10px; font-weight: 600; color: #5B5563;">Source</a></td></tr>
    </table>`;
}

function ytdTable(heading: string, secondWidth: number) {
  return `
    <table role="presentation">
      <tr><td colspan="3" style="font-size: 14px; font-weight: 700; color: #442142;">${heading}</td></tr>
      <tr>
        <td width="30%" style="font-size: 12px; color: #3F3F46;">Leader</td>
        <td width="55%"><table><tr><td bgcolor="#442142" style="width: 100%;">&nbsp;</td></tr></table></td>
        <td width="15%" style="font-size: 12px; color: #442142;">10</td>
      </tr>
      <tr>
        <td width="30%" style="font-size: 12px; color: #3F3F46;">Second</td>
        <td width="55%"><table><tr><td bgcolor="#442142" style="width: ${secondWidth}%;">&nbsp;</td></tr></table></td>
        <td width="15%" style="font-size: 12px; color: #442142;">5</td>
      </tr>
    </table>`;
}

function fixtureHtml(options: FixtureOptions = {}) {
  const {
    firstScale = 200,
    secondScale = 100,
    explicitScale = true,
    overviewColor = "#3F3F46",
    firstMetadata = "Example Infrastructure (Buyout) · Solar · United States",
    secondMetadata = "Example Infrastructure (Buyout) · Wind · Canada",
    thirdMetadata = "Example Infrastructure (Bolt-On) · Fiber · Europe",
    firstOverview = "Example Infrastructure agreed to acquire Alpha Energy for US$200 million in a reviewed transaction.",
    secondOverview = "Example Infrastructure agreed to acquire Beta Energy for US$100 million in a reviewed transaction.",
    thirdOverview = "Example Infrastructure acquired Gamma Fiber for US$50 million to expand a regional fiber network.",
    firstUsThemeCategory = "operating-asset",
    firstUsThemePriority = 1,
    secondUsThemeCategory,
    secondUsThemePriority,
    thirdUsThemeCategory,
    thirdUsThemePriority,
    sectorYtdSecondWidth = 50,
    firstTheme = "Economic deployment led the period with two reviewed transactions.",
    finalTheme = "U.S. deployment included Alpha Energy and its operating solar portfolio.",
    preheaderSectors = "Power &amp; ET and Digital",
    previousEditionSectors = "Power &amp; ET 2, Digital 1",
  } = options;
  return `<!doctype html>
  <html><body style="background-color: #FFFFFF;">
    <div style="display: none;">
      Weekly Briefing &#8211; Infrastructure Sponsor M&amp;A &#8211; 3 deals across ${preheaderSectors} &#8211; July 18&#8211;24, 2026
    </div>
    <!-- Previous Editions:
      - July 18 &#8211; July 24, 2026: 3 deals (${previousEditionSectors})
      - July 11 &#8211; July 17, 2026: 4 deals (Power &amp; ET 2, Digital 1, Transportation 1)
    -->
    <table role="presentation"><tr><td>
      <!-- KEY THEMES -->
      <table role="presentation"><tr><td>
        <div style="font-size: 14px; font-weight: 700; color: #B4A87D;">KEY THEMES</div>
        <table role="presentation" style="font-size: 12px; color: #4B5563;">
          <tr><td>${firstTheme}</td></tr>
          <tr><td>${finalTheme}</td></tr>
        </table>
      </td></tr></table>

      <!-- POWER &amp; ET (2 Deals) -->
      ${card({
        target: "Alpha Energy",
        source: "https://example.com/alpha",
        overview: firstOverview,
        metadata: firstMetadata,
        scale: firstScale,
        explicitScale,
        overviewColor,
        usThemeCategory: firstUsThemeCategory,
        usThemePriority: firstUsThemePriority,
      })}
      ${card({
        target: "Beta Energy",
        source: "https://example.com/beta",
        overview: secondOverview,
        metadata: secondMetadata,
        scale: secondScale,
        explicitScale,
        overviewColor: "#3F3F46",
        usThemeCategory: secondUsThemeCategory,
        usThemePriority: secondUsThemePriority,
      })}

      <!-- DIGITAL (1 Deal) -->
      ${card({
        target: "Gamma Fiber",
        source: "https://example.com/gamma",
        overview: thirdOverview,
        metadata: thirdMetadata,
        scale: 50,
        explicitScale,
        overviewColor: "#3F3F46",
        usThemeCategory: thirdUsThemeCategory,
        usThemePriority: thirdUsThemePriority,
      })}

      ${ytdTable("Deal Count By Sector (YTD)", sectorYtdSecondWidth)}
      ${ytdTable("Deal Count By Region (YTD)", 50)}

      <!-- FOOTER -->
      <table role="presentation" style="font-size: 12px; color: #3F3F46;">
        <tr><td>For additional context on any of the above deals, please reach out.</td></tr>
        <tr><td><a href="mailto:research@example.com" style="font-size: 12px; color: #1E3A5F;">research@example.com</a></td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

const coverage: StaticCoverageDeal[] = [
  { target: "Alpha Energy", sector: "Power & ET", country: "United States", sourceUrl: "https://example.com/alpha" },
  { target: "Beta Energy", sector: "Power & ET", country: "Canada", sourceUrl: "https://example.com/beta" },
  { target: "Gamma Fiber", sector: "Digital", country: "Germany", sourceUrl: "https://example.com/gamma" },
];

function withCoverageCountry(target: string, country: string): StaticCoverageDeal[] {
  return coverage.map((deal) => deal.target === target ? { ...deal, country } : deal);
}

function errorCodes(report: Awaited<ReturnType<typeof validateWeeklyEmail>>) {
  return report.findings.filter((finding) => finding.severity === "error").map((finding) => finding.code);
}

describe("weekly email validation", () => {
  it("accepts a structurally complete, ordered, AA-compliant issue under the forward editorial contract", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml(),
      coverageDeals: coverage,
      requireStaticCoverage: true,
    });

    expect(report.status).toBe("valid");
    expect(report.exitCode).toBe(0);
    expect(report.summary).toMatchObject({
      deals: 3,
      sectors: 2,
      sources: 3,
      staticCoverageMatched: 3,
    });
    expect(errorCodes(report)).toEqual([]);
  });

  it("requires a recognized infrastructure fund title suffix and a controlled transaction label", async () => {
    const html = fixtureHtml({
      firstMetadata: "Example Infrastructure (Joint Control Acquisition) · Solar · United States",
    }).replace("Alpha Energy | GIP", "Alpha Energy | Alpha Operating Company");
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html,
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toEqual(expect.arrayContaining([
      "card-title-fund",
      "transaction-label",
    ]));
  });

  it("does not allow a portfolio company to bypass the fund-only title rule in parentheses", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml().replace("Alpha Energy | GIP", "Alpha Energy | GIP (via ClearGen)"),
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toContain("card-title-fund");
  });

  it("requires the canonical GSAM sponsor name", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstTheme: "Goldman Sachs Asset Management deployed capital into reviewed infrastructure transactions.",
      }),
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toContain("canonical-gsam");
  });

  it("requires preheader and previous-edition sectors to follow activity ordering", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        preheaderSectors: "Digital and Power &amp; ET",
        previousEditionSectors: "Digital 1, Power &amp; ET 2",
      }),
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toEqual(expect.arrayContaining([
      "preheader-sector-order",
      "previous-editions-sector-order",
    ]));
  });

  it("applies the fixed tie-break to previous-edition sector summaries", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        previousEditionSectors: "Power &amp; ET 1, Transportation 1, Digital 1",
      }),
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toContain("previous-editions-sector-order");
  });

  it("rejects unknown, duplicate, omitted, and arithmetically inconsistent summary sectors", async () => {
    const cases = [
      {
        sectors: "Power &amp; ET 2, Healthcare 1",
        code: "previous-editions-sectors",
      },
      {
        sectors: "Power &amp; ET 1, Power &amp; ET 1, Digital 1",
        code: "previous-editions-sectors",
      },
      {
        sectors: "Power &amp; ET 2",
        code: "previous-editions-total",
      },
    ];
    for (const testCase of cases) {
      const report = await validateWeeklyEmail({
        issuePath: "/tmp/2026-07-24.html",
        html: fixtureHtml({ previousEditionSectors: testCase.sectors }),
        coverageDeals: coverage,
      });
      expect(errorCodes(report)).toContain(testCase.code);
    }

    const wrongTotal = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml().replace(
        "2026: 3 deals (Power &amp; ET 2, Digital 1)",
        "2026: 4 deals (Power &amp; ET 2, Digital 1)",
      ),
      coverageDeals: coverage,
    });
    expect(errorCodes(wrongTotal)).toContain("previous-editions-total");
  });

  it("requires the preheader total and complete sector list to match active sections", async () => {
    const wrongTotal = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml().replace("3 deals across", "2 deals across"),
      coverageDeals: coverage,
    });
    expect(errorCodes(wrongTotal)).toContain("preheader-deal-count");

    const unknownSector = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({ preheaderSectors: "Power &amp; ET, Digital, and Healthcare" }),
      coverageDeals: coverage,
    });
    expect(errorCodes(unknownSector)).toEqual(expect.arrayContaining([
      "preheader-sectors",
      "preheader-sector-order",
    ]));
  });

  it("requires U.S. deployment and named U.S. transactions in the final theme paragraph", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstTheme: "U.S. deployment included Alpha Energy and Beta Energy.",
        finalTheme: "International deployment provided a contrast through reviewed Canadian assets.",
      }),
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toEqual(expect.arrayContaining([
      "us-deployment-final-theme",
      "us-deployment-named-transactions",
    ]));
  });

  it("requires the priority-1 U.S. transaction rather than an arbitrarily named weaker deal", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        secondMetadata: "Example Infrastructure (Buyout) · Wind · United States",
        secondUsThemeCategory: "operating-asset",
        secondUsThemePriority: 2,
        finalTheme: "U.S. deployment included Beta Energy and its operating wind portfolio.",
      }),
      coverageDeals: withCoverageCountry("Beta Energy", "United States"),
    });

    expect(errorCodes(report)).toContain("us-deployment-named-transactions");
  });

  it("requires priority-1 representatives from every U.S. transaction category", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        secondMetadata: "Example Infrastructure (Platform Launch) · Wind · United States",
        secondUsThemeCategory: "platform",
        secondUsThemePriority: 1,
        thirdMetadata: "Example Infrastructure (Portfolio Company Acquisition) · Fiber · USA",
        thirdUsThemeCategory: "portfolio-company",
        thirdUsThemePriority: 1,
        finalTheme: "U.S. deployment included Alpha Energy and Beta Energy.",
      }),
      coverageDeals: withCoverageCountry("Beta Energy", "United States")
        .map((deal) => deal.target === "Gamma Fiber" ? { ...deal, country: "USA" } : deal),
    });

    expect(errorCodes(report)).toContain("us-deployment-named-transactions");
    expect(report.findings.find((finding) =>
      finding.code === "us-deployment-named-transactions"
    )?.message).toContain("portfolio-company “Gamma Fiber”");
  });

  it("rejects missing, inconsistent, or scale-inverted U.S. theme priority metadata", async () => {
    const missing = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstUsThemeCategory: null,
        firstUsThemePriority: null,
      }),
      coverageDeals: coverage,
    });
    expect(errorCodes(missing)).toEqual(expect.arrayContaining([
      "us-theme-category",
    ]));

    const inverted = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstUsThemePriority: 2,
        secondMetadata: "Example Infrastructure (Buyout) · Wind · United States",
        secondUsThemeCategory: "operating-asset",
        secondUsThemePriority: 1,
        finalTheme: "U.S. deployment included Beta Energy.",
      }),
      coverageDeals: withCoverageCountry("Beta Energy", "United States"),
    });
    expect(errorCodes(inverted)).toEqual(expect.arrayContaining([
      "us-theme-priority-order",
    ]));
  });

  it("uses structured country and U.S. overview evidence when metadata is globally scoped", async () => {
    const structured = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstMetadata: "Example Infrastructure (Buyout) · Solar · North America",
        finalTheme: "International deployment provided a contrast through reviewed assets.",
      }),
      coverageDeals: coverage,
    });
    expect(errorCodes(structured)).toContain("us-deployment-final-theme");

    const overviewFallback = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstMetadata: "Example Infrastructure (Buyout) · Solar · North America / Global",
        firstOverview: "Example Infrastructure acquired a U.S. Gulf Coast solar portfolio in a reviewed transaction.",
        finalTheme: "International deployment provided a contrast through reviewed assets.",
      }),
      coverageDeals: coverage.map((deal) =>
        deal.target === "Alpha Energy" ? { ...deal, country: "North America / Global" } : deal
      ),
    });
    expect(errorCodes(overviewFallback)).toContain("us-deployment-final-theme");
  });

  it("blocks forward publication when country coverage remains regionally ambiguous", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstMetadata: "Example Infrastructure (Buyout) · Solar · North America / Global",
        firstOverview: "Example Infrastructure acquired Alpha Energy for US$200 million in a reviewed transaction.",
        firstUsThemeCategory: null,
        firstUsThemePriority: null,
        finalTheme: "International deployment provided a contrast through reviewed assets.",
      }),
      coverageDeals: coverage.map((deal) =>
        deal.target === "Alpha Energy" ? { ...deal, country: "North America / Global" } : deal
      ),
    });

    expect(errorCodes(report)).toContain("us-country-ambiguous");
  });

  it("blocks forward publication when matched coverage omits country and metadata stays regional", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstMetadata: "Example Infrastructure (Buyout) · Solar · North America",
        firstOverview: "Example Infrastructure agreed to acquire Alpha Energy for $200 million.",
        firstUsThemeCategory: null,
        firstUsThemePriority: null,
        finalTheme: "Deployment included reviewed infrastructure transactions.",
      }),
      coverageDeals: coverage.map((deal) =>
        deal.target === "Alpha Energy" ? { ...deal, country: undefined } : deal
      ),
    });

    expect(errorCodes(report)).toContain("us-country-ambiguous");
  });

  it("treats a specific non-U.S. country alongside a regional label as non-U.S.", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstMetadata: "Example Infrastructure (Buyout) · Solar · North America / Canada",
        firstUsThemeCategory: null,
        firstUsThemePriority: null,
        finalTheme: "Canadian deployment included Alpha Energy.",
      }),
      coverageDeals: coverage.map((deal) =>
        deal.target === "Alpha Energy" ? { ...deal, country: "North America / Canada" } : deal
      ),
    });

    expect(errorCodes(report)).not.toContain("us-country-ambiguous");
    expect(errorCodes(report)).not.toContain("us-deployment-final-theme");
  });

  it("uses target and sector identity before a shared source URL when matching coverage", async () => {
    const sharedSource = "https://example.com/shared-announcement";
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstMetadata: "Example Infrastructure (Buyout) · Solar · North America",
        firstOverview: "Example Infrastructure acquired Alpha Energy for $200 million.",
        finalTheme: "International deployment provided a contrast through reviewed assets.",
      })
        .replace("https://example.com/alpha", sharedSource)
        .replace("https://example.com/beta", sharedSource),
      coverageDeals: [
        { ...coverage[1], sourceUrl: sharedSource },
        { ...coverage[0], sourceUrl: sharedSource },
        coverage[2],
      ],
      requireStaticCoverage: true,
    });

    expect(report.summary.staticCoverageMatched).toBe(3);
    expect(errorCodes(report)).toContain("us-deployment-final-theme");
    expect(errorCodes(report)).not.toEqual(expect.arrayContaining([
      "static-coverage",
      "missing-current-week-deal",
    ]));
  });

  it("requires one distinct email card for every current-week coverage record", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml(),
      coverageDeals: [
        ...coverage,
        {
          target: "Alpha Energy Holdings",
          sector: "Power & ET",
          country: "Canada",
          sourceUrl: "https://example.com/alpha-holdings",
        },
      ],
      requireStaticCoverage: true,
    });

    expect(report.summary.staticCoverageMatched).toBe(3);
    expect(errorCodes(report)).toContain("missing-current-week-deal");
    expect(report.findings.find((finding) =>
      finding.code === "missing-current-week-deal"
    )?.message).toContain("Alpha Energy Holdings");
  });

  it("does not use a shared source fallback across incompatible sectors", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml(),
      coverageDeals: coverage.map((deal) =>
        deal.target === "Gamma Fiber"
          ? { ...deal, target: "Different Asset", sector: "Power & ET" }
          : deal
      ),
      requireStaticCoverage: true,
    });

    expect(report.summary.staticCoverageMatched).toBe(2);
    expect(errorCodes(report)).toEqual(expect.arrayContaining([
      "static-coverage",
      "missing-current-week-deal",
    ]));
  });

  it("rejects explicit U.S. card copy that contradicts a non-U.S. coverage country", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstMetadata: "Example Infrastructure (Buyout) · Solar · United States",
      }),
      coverageDeals: coverage.map((deal) =>
        deal.target === "Alpha Energy" ? { ...deal, country: "Canada" } : deal
      ),
    });

    expect(errorCodes(report)).toContain("us-country-conflict");
  });

  it("rejects malformed U.S. marker attributes on non-U.S. cards", async () => {
    for (const priority of ["bogus", -1]) {
      const report = await validateWeeklyEmail({
        issuePath: "/tmp/2026-07-24.html",
        html: fixtureHtml({
          secondUsThemePriority: priority,
        }),
        coverageDeals: coverage,
      });

      expect(errorCodes(report)).toContain("us-theme-marker-non-us");
    }
  });

  it("does not treat negated U.S. geography as positive U.S. evidence", async () => {
    for (const location of [
      "non-U.S.",
      "Non-U.S.",
      "non‑U.S.",
      "non–U.S.",
      "non-United States",
      "ex-United States",
      "outside the United States",
      "Outside the U.S.",
    ]) {
      const exactCountry = await validateWeeklyEmail({
        issuePath: "/tmp/2026-07-24.html",
        html: fixtureHtml({
          firstMetadata: `Example Infrastructure (Buyout) · Solar · ${location}`,
          firstUsThemeCategory: null,
          firstUsThemePriority: null,
          finalTheme: "International deployment remained focused on Canadian assets.",
        }),
        coverageDeals: coverage.map((deal) =>
          deal.target === "Alpha Energy" ? { ...deal, country: "Canada" } : deal
        ),
      });
      expect(errorCodes(exactCountry)).not.toEqual(expect.arrayContaining([
        "us-country-conflict",
        "us-deployment-final-theme",
      ]));

      const regionalCountry = await validateWeeklyEmail({
        issuePath: "/tmp/2026-07-24.html",
        html: fixtureHtml({
          firstMetadata: `Example Infrastructure (Buyout) · Solar · ${location}`,
          firstUsThemeCategory: null,
          firstUsThemePriority: null,
          finalTheme: "International deployment reflected regional activity.",
        }),
        coverageDeals: coverage.map((deal) =>
          deal.target === "Alpha Energy" ? { ...deal, country: "North America / Global" } : deal
        ),
      });
      expect(errorCodes(regionalCountry)).toContain("us-country-ambiguous");
      expect(errorCodes(regionalCountry)).not.toContain("us-country-conflict");
    }
  });

  it("does not mistake U.S. currency or sponsor wording for asset geography", async () => {
    for (const overview of [
      "Example Infrastructure acquired Alpha Energy for consideration stated in U.S. dollars.",
      "Example Infrastructure acquired Alpha Energy for US $200 million.",
      "A U.S.-based sponsor acquired Alpha Energy, a Canadian solar portfolio.",
      "A U.S.‑based sponsor acquired Alpha Energy, a Canadian solar portfolio.",
      "A U.S.-based infrastructure sponsor acquired Alpha Energy, a Canadian solar portfolio.",
      "A U.S.-based private equity firm acquired Alpha Energy, a Canadian solar portfolio.",
      "A U.S.-based company acquired Alpha Energy, a Canadian solar portfolio.",
      "A U.S.-based operator acquired Alpha Energy, a Canadian solar portfolio.",
      "A U.S.-based developer acquired Alpha Energy, a Canadian solar portfolio.",
      "A sponsor based in the U.S. acquired Alpha Energy, a Canadian solar portfolio.",
      "The acquisition used U.S.-dollar-denominated financing for Alpha Energy in Canada.",
    ]) {
      const report = await validateWeeklyEmail({
        issuePath: "/tmp/2026-07-24.html",
        html: fixtureHtml({
          firstMetadata: "Example Infrastructure (Buyout) · Solar · Canada",
          firstOverview: overview,
          firstUsThemeCategory: null,
          firstUsThemePriority: null,
          finalTheme: "International deployment remained focused on Canadian assets.",
        }),
        coverageDeals: coverage.map((deal) =>
          deal.target === "Alpha Energy" ? { ...deal, country: "Canada" } : deal
        ),
      });

      expect(errorCodes(report)).not.toEqual(expect.arrayContaining([
        "us-country-conflict",
        "us-deployment-final-theme",
        "us-theme-category",
      ]));
    }
  });

  it("preserves the pre-cutover U.S. metadata contract", async () => {
    const explicitCountry = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml({
        finalTheme: "International deployment provided a contrast through reviewed assets.",
      }),
      coverageDeals: coverage.map((deal) =>
        deal.target === "Alpha Energy" ? { ...deal, country: "Canada" } : deal
      ),
    });
    expect(errorCodes(explicitCountry)).toContain("us-deployment");

    const formerlyUnrecognizedAbbreviation = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml({
        firstMetadata: "Example Infrastructure (Buyout) · Solar · USA",
        finalTheme: "International deployment provided a contrast through reviewed assets.",
      }),
      coverageDeals: coverage,
    });
    expect(errorCodes(formerlyUnrecognizedAbbreviation)).not.toContain("us-deployment");
  });

  it("recognizes US and USA location abbreviations without mistaking US$ values for geography", async () => {
    for (const location of ["US", "USA"]) {
      const report = await validateWeeklyEmail({
        issuePath: "/tmp/2026-07-24.html",
        html: fixtureHtml({
          firstMetadata: `Example Infrastructure (Buyout) · Solar · ${location}`,
          finalTheme: "International deployment provided a contrast through reviewed assets.",
        }),
        coverageDeals: coverage.map((deal) =>
          deal.target === "Alpha Energy" ? { ...deal, country: undefined } : deal
        ),
      });
      expect(errorCodes(report)).toContain("us-deployment-final-theme");
    }

    const currencyOnly = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({
        firstMetadata: "Example Infrastructure (Buyout) · Solar · Canada",
        firstUsThemeCategory: null,
        firstUsThemePriority: null,
        finalTheme: "International deployment remained focused on Canadian assets.",
      }),
      coverageDeals: coverage.map((deal) =>
        deal.target === "Alpha Energy" ? { ...deal, country: "Canada" } : deal
      ),
    });
    expect(errorCodes(currencyOnly)).not.toEqual(expect.arrayContaining([
      "us-deployment-final-theme",
      "us-theme-category",
    ]));
  });

  it("enforces complete card metadata and static current-week coverage", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml({ firstMetadata: "Incomplete metadata" }),
      coverageDeals: coverage.slice(1),
      requireStaticCoverage: true,
    });

    expect(errorCodes(report)).toEqual(expect.arrayContaining(["card-metadata", "static-coverage"]));
  });

  it("rejects an email that omits a qualifying current-week deal", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml(),
      coverageDeals: [
        ...coverage,
        {
          target: "Delta Transit",
          sector: "Transportation",
          sourceUrl: "https://example.com/delta",
        },
      ],
      requireStaticCoverage: true,
    });

    expect(errorCodes(report)).toContain("missing-current-week-deal");
  });

  it("identifies a card whose required Source link is missing", async () => {
    const html = fixtureHtml().replace(
      '<a href="https://example.com/alpha" style="font-size: 10px; font-weight: 600; color: #5B5563;">Source</a>',
      "Source unavailable",
    );
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html,
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toContain("missing-source");
  });

  it("enforces explicit within-sector economic scale ordering", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml({ firstScale: 100, secondScale: 200 }),
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toContain("scale-value-order");
  });

  it("uses warnings, not false certainty, when legacy cards lack scale metadata", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml({ explicitScale: false }),
      coverageDeals: coverage,
    });

    expect(report.status).toBe("valid");
    expect(report.findings).toContainEqual(expect.objectContaining({
      severity: "warning",
      code: "inferred-scale",
    }));
  });

  it("requires explicit scale evidence for issues published after the cutover", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html: fixtureHtml({ explicitScale: false }),
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toContain("missing-scale-metadata");
  });

  it("requires scale evidence even when an active sector has only one deal", async () => {
    const html = fixtureHtml().replace(
      ' data-scale-kind="economic" data-scale-value="50" data-scale-unit="USD-mm"',
      "",
    );
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-24.html",
      html,
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toContain("missing-scale-metadata");
  });

  it("checks YTD descending rows and recalculated bar widths", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml({ sectorYtdSecondWidth: 40 }),
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toContain("ytd-width");
  });

  it("computes WCAG contrast for readable mobile email copy", async () => {
    expect(contrastRatio("#3F3F46", "#FFFFFF")).toBeGreaterThan(4.5);
    expect(contrastRatio("#AAAAAA", "#FFFFFF")).toBeLessThan(4.5);

    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml({ overviewColor: "#AAAAAA" }),
      coverageDeals: coverage,
    });
    expect(errorCodes(report)).toContain("contrast");
  });

  it("treats definitive missing sources as errors and offline failures as warnings", async () => {
    const missingFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 }));
    const missing = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml(),
      coverageDeals: coverage,
      linkCheck: { enabled: true, fetchImpl: missingFetch, maxLinks: 1 },
    });
    expect(errorCodes(missing)).toContain("broken-source");
    expect(missing.summary).toMatchObject({ linksRequested: 3, linksSkipped: 0 });
    expect(missingFetch).toHaveBeenCalledTimes(3);

    const offlineFetch = vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"));
    const offline = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml(),
      coverageDeals: coverage,
      linkCheck: { enabled: true, fetchImpl: offlineFetch, maxLinks: 1 },
    });
    expect(offline.status).toBe("valid");
    expect(offline.findings).toContainEqual(expect.objectContaining({
      severity: "warning",
      code: "inconclusive-source",
    }));
    expect(offlineFetch).toHaveBeenCalledTimes(3);
  });

  it("checks every unique HTTP(S) anchor while preserving Source-specific findings", async () => {
    const html = fixtureHtml().replace(
      '<a href="mailto:research@example.com" style="font-size: 12px; color: #1E3A5F;">research@example.com</a>',
      [
        '<a href="https://example.com/about#team">About</a>',
        '<a href="https://example.com/previous">Previous edition</a>',
        '<a href="https://example.com/about#contact">About duplicate</a>',
        '<a href="mailto:research@example.com">research@example.com</a>',
      ].join(" · "),
    );
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);
      return new Response(null, { status: url === "https://example.com/previous" ? 410 : 200 });
    });
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html,
      coverageDeals: coverage,
      linkCheck: { enabled: true, fetchImpl },
    });

    expect(errorCodes(report)).toContain("broken-link");
    expect(errorCodes(report)).not.toContain("broken-source");
    expect(report.summary).toMatchObject({ linksRequested: 5, linksSkipped: 0 });
    expect(fetchImpl).toHaveBeenCalledTimes(5);
    expect(new Set(fetchImpl.mock.calls.map((call) => String(call[0])))).toEqual(new Set([
      "https://example.com/alpha",
      "https://example.com/beta",
      "https://example.com/gamma",
      "https://example.com/about",
      "https://example.com/previous",
    ]));
  });

  it("shares one timeout budget between a HEAD request and its fallback GET", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation(async (_input, init) =>
      new Response(null, { status: init?.method === "HEAD" ? 405 : 200 })
    );
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html: fixtureHtml(),
      coverageDeals: coverage,
      linkCheck: { enabled: true, fetchImpl, maxLinks: 1 },
    });

    expect(report.status).toBe("valid");
    expect(fetchImpl).toHaveBeenCalledTimes(6);
    expect(fetchImpl.mock.calls.map((call) => call[1]?.method)).toEqual([
      "HEAD",
      "HEAD",
      "HEAD",
      "GET",
      "GET",
      "GET",
    ]);
    for (let index = 0; index < 3; index += 1) {
      const head = fetchImpl.mock.calls[index];
      const get = fetchImpl.mock.calls.slice(3).find((call) => call[0] === head?.[0]);
      expect(get?.[1]?.signal).toBe(head?.[1]?.signal);
    }
  });

  it("checks every editorial Source even when the non-Source link-count cap is reached", async () => {
    const html = fixtureHtml().replace(
      '<html><body style="background-color: #FFFFFF;">',
      '<html><body style="background-color: #FFFFFF;"><a href="https://example.com/navigation">Navigation</a>',
    );
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 200 }));
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html,
      coverageDeals: coverage,
      linkCheck: { enabled: true, fetchImpl, maxLinks: 1 },
    });

    expect(report.status).toBe("valid");
    expect(report.summary).toMatchObject({ linksRequested: 3, linksSkipped: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(new Set(fetchImpl.mock.calls.map((call) => String(call[0])))).toEqual(new Set([
      "https://example.com/alpha",
      "https://example.com/beta",
      "https://example.com/gamma",
    ]));
  });

  it("fails publication when the network budget leaves Source links unchecked", async () => {
    const extraSources = Array.from({ length: 3 }, (_, index) =>
      `<a href="https://example.com/extra-${index + 1}">Source</a>`
    ).join("");
    const html = fixtureHtml().replace("</body>", `${extraSources}</body>`);
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation(async () => {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 10));
      return new Response(null, { status: 200 });
    });
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html,
      coverageDeals: coverage,
      linkCheck: {
        enabled: true,
        fetchImpl,
        maxLinks: 1,
        budgetMs: 2,
        timeoutMs: 100,
      },
    });

    expect(report.status).toBe("invalid");
    expect(errorCodes(report)).toContain("source-link-budget");
    expect(report.summary.linksSkipped).toBeGreaterThan(0);
  });

  it("rejects malformed non-Source HTTP(S) anchors without enabling network checks", async () => {
    const html = fixtureHtml().replace(
      '<a href="mailto:research@example.com" style="font-size: 12px; color: #1E3A5F;">research@example.com</a>',
      '<a href="https://">Broken navigation link</a> · <a href="http://">Source</a>',
    );
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html,
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toContain("invalid-link");
    expect(report.findings.filter((finding) => finding.code === "invalid-link")).toHaveLength(2);
    expect(report.summary).toMatchObject({ linksRequested: 0, linksSkipped: 0 });
  });

  it("keeps malformed deal-card Sources on the specific Source-integrity finding", async () => {
    const html = fixtureHtml().replace("https://example.com/alpha", "https://");
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
      html,
      coverageDeals: coverage,
    });

    expect(errorCodes(report)).toContain("invalid-source");
    expect(errorCodes(report)).not.toContain("invalid-link");
  });

  it("returns documented CLI exit codes for valid, invalid, and usage-error runs", () => {
    const directory = mkdtempSync(join(tmpdir(), "weekly-validator-"));
    temporaryDirectories.push(directory);
    const validPath = join(directory, "valid.html");
    const invalidPath = join(directory, "invalid.html");
    writeFileSync(validPath, fixtureHtml());
    writeFileSync(invalidPath, fixtureHtml({ sectorYtdSecondWidth: 40 }));
    const script = resolve(process.cwd(), "scripts", "validate-weekly-email.ts");
    const run = (args: string[]) => spawnSync(
      process.execPath,
      ["--experimental-strip-types", script, ...args, "--no-static-coverage"],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    expect(run([validPath]).status).toBe(0);
    expect(run([invalidPath]).status).toBe(1);
    expect(run(["--unknown-option"]).status).toBe(2);
  }, 20_000);
});
