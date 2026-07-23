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
  sectorYtdSecondWidth?: number;
};

function card(options: {
  target: string;
  source: string;
  overview: string;
  metadata: string;
  scale: number;
  explicitScale: boolean;
  overviewColor: string;
}) {
  const scaleAttributes = options.explicitScale
    ? ` data-scale-kind="economic" data-scale-value="${options.scale}" data-scale-unit="USD-mm"`
    : "";
  return `
    <table role="presentation"${scaleAttributes}>
      <tr><td style="font-size: 14px; font-weight: 700; color: #442142;">${options.target} | Example Infrastructure</td></tr>
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
    sectorYtdSecondWidth = 50,
  } = options;
  return `<!doctype html>
  <html><body style="background-color: #FFFFFF;">
    <table role="presentation"><tr><td>
      <!-- KEY THEMES -->
      <table role="presentation"><tr><td>
        <div style="font-size: 14px; font-weight: 700; color: #B4A87D;">KEY THEMES</div>
        <table role="presentation" style="font-size: 12px; color: #4B5563;">
          <tr><td>Economic deployment led the period with two reviewed transactions.</td></tr>
          <tr><td>U.S. deployment included Alpha Energy and its operating solar portfolio.</td></tr>
        </table>
      </td></tr></table>

      <!-- POWER &amp; ET (2 Deals) -->
      ${card({
        target: "Alpha Energy",
        source: "https://example.com/alpha",
        overview: "Example Infrastructure agreed to acquire Alpha Energy for US$200 million in a reviewed transaction.",
        metadata: firstMetadata,
        scale: firstScale,
        explicitScale,
        overviewColor,
      })}
      ${card({
        target: "Beta Energy",
        source: "https://example.com/beta",
        overview: "Example Infrastructure agreed to acquire Beta Energy for US$100 million in a reviewed transaction.",
        metadata: "Example Infrastructure (Buyout) · Wind · Canada",
        scale: secondScale,
        explicitScale,
        overviewColor: "#3F3F46",
      })}

      <!-- DIGITAL (1 Deal) -->
      ${card({
        target: "Gamma Fiber",
        source: "https://example.com/gamma",
        overview: "Example Infrastructure acquired Gamma Fiber for US$50 million to expand a regional fiber network.",
        metadata: "Example Infrastructure (Bolt-On) · Fiber · Europe",
        scale: 50,
        explicitScale,
        overviewColor: "#3F3F46",
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
  { target: "Alpha Energy", sector: "Power & ET", sourceUrl: "https://example.com/alpha" },
  { target: "Beta Energy", sector: "Power & ET", sourceUrl: "https://example.com/beta" },
  { target: "Gamma Fiber", sector: "Digital", sourceUrl: "https://example.com/gamma" },
];

function errorCodes(report: Awaited<ReturnType<typeof validateWeeklyEmail>>) {
  return report.findings.filter((finding) => finding.severity === "error").map((finding) => finding.code);
}

describe("weekly email validation", () => {
  it("accepts a structurally complete, ordered, AA-compliant issue", async () => {
    const report = await validateWeeklyEmail({
      issuePath: "/tmp/2026-07-17.html",
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
    expect(missing.summary).toMatchObject({ linksRequested: 1, linksSkipped: 2 });

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
