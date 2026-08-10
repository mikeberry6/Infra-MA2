import { describe, expect, it } from "vitest";
import {
  ACTIVITY_BAR_BACKGROUND_COLOR,
  CHART_BLOCK_END_MARKER,
  CHART_BLOCK_START_MARKER,
  DIRECT_ACTIVITY_COLOR,
  PORTFOLIO_ACTIVITY_COLOR,
  PORTFOLIO_ACTIVITY_LABEL_COLOR,
  REGION_ACTIVITY_TIE_BREAK_ORDER,
  SECTOR_ACTIVITY_TIE_BREAK_ORDER,
  allocateStackedBarWidths,
  assertOutlookSafeActivityChartMarkup,
  computeNonChartSha256,
  renderActivityChartBlock,
  renderDeterministicActivityEmail,
  replaceDelimitedChartBlock,
} from "./render-charts";

const chartInput = {
  sector: [
    { label: "Digital", direct: 30, portfolio: 20 },
    { label: "Power & ET", direct: 80, portfolio: 20 },
    { label: "Utilities", direct: 1, portfolio: 0 },
  ],
  region: [
    { label: "Europe", direct: 30, portfolio: 20 },
    { label: "North America", direct: 80, portfolio: 20 },
    { label: "Middle East & Africa", direct: 1, portfolio: 0 },
  ],
} as const;

describe("weekly briefing stacked-chart rendering", () => {
  it("preserves absolute magnitude and uses largest-remainder allocation", () => {
    expect(
      allocateStackedBarWidths({
        direct: 1,
        portfolio: 2,
        leadingTotal: 7,
      }),
    ).toEqual({ filled: 43, direct: 14, portfolio: 29, remainder: 57 });

    expect(
      allocateStackedBarWidths({
        direct: 1,
        portfolio: 1,
        leadingTotal: 3,
      }),
    ).toEqual({ filled: 67, direct: 34, portfolio: 33, remainder: 33 });
  });

  it("renders sorted, Outlook-safe sector and region charts with one legend", () => {
    const markup = renderActivityChartBlock(chartInput);
    const parsed = new DOMParser().parseFromString(markup, "text/html");
    const charts = Array.from(
      parsed.querySelectorAll<HTMLTableElement>("table[data-activity-chart]"),
    );

    expect(charts).toHaveLength(2);
    expect(markup.match(/data-activity-legend=/g)).toHaveLength(1);
    expect(markup.match(/>Direct fund activity</g)).toHaveLength(1);
    expect(markup.match(/>Portfolio-company activity</g)).toHaveLength(1);
    expect(markup).toContain(`bgcolor="${DIRECT_ACTIVITY_COLOR}"`);
    expect(markup).toContain(`bgcolor="${PORTFOLIO_ACTIVITY_COLOR}"`);
    expect(markup).toContain(`bgcolor="${ACTIVITY_BAR_BACKGROUND_COLOR}"`);
    expect(markup).not.toMatch(/<div|<svg|<script|class=|display:\s*(flex|grid)/i);
    expect(markup).not.toContain("white-space: nowrap");
    expect(
      Array.from(
        parsed.querySelectorAll(
          "table[data-activity-chart], table[data-activity-legend]",
        ),
      ).map((table) =>
        table.hasAttribute("data-activity-legend")
          ? "legend"
          : table.getAttribute("data-activity-chart")),
    ).toEqual(["sector", "region", "legend"]);

    for (const table of parsed.querySelectorAll("table")) {
      expect(table.getAttribute("role")).toBe("presentation");
      expect(table.getAttribute("cellpadding")).toBe("0");
      expect(table.getAttribute("cellspacing")).toBe("0");
    }

    const sectorRows = Array.from(
      charts[0].querySelectorAll<HTMLTableRowElement>(
        "tr[data-activity-row]",
      ),
    );
    expect(sectorRows.map((row) => row.dataset.activityRow)).toEqual([
      "Power & ET",
      "Digital",
      "Utilities",
    ]);

    for (const row of [...sectorRows, ...charts[1].querySelectorAll<HTMLTableRowElement>("tr[data-activity-row]")]) {
      const segments = Array.from(
        row.querySelectorAll<HTMLTableCellElement>(
          "td[data-activity-segment]",
        ),
      );
      const widths = segments.map((segment) =>
        Number(segment.getAttribute("width")?.replace("%", "")),
      );
      expect(widths.reduce((sum, width) => sum + width, 0)).toBe(100);
      expect(
        segments
          .filter(
            (segment) => segment.dataset.activitySegment !== "remainder",
          )
          .reduce(
            (sum, segment) =>
              sum +
              Number(segment.getAttribute("width")?.replace("%", "")),
            0,
          ),
      ).toBe(Number(row.dataset.originalFill));
      expect(row.getAttribute("aria-label")).toContain("direct fund activity");
      expect(row.getAttribute("aria-label")).toContain(
        "portfolio-company activity",
      );
      const stackLabelTables = row.querySelectorAll(
        "table[data-activity-stack-labels]",
      );
      expect(stackLabelTables).toHaveLength(1);
      const directLabel = row.querySelector<HTMLElement>(
        '[data-activity-stack-label="direct"]',
      );
      const portfolioLabel = row.querySelector<HTMLElement>(
        '[data-activity-stack-label="portfolio"]',
      );
      expect(directLabel?.dataset.activityCount).toBe(row.dataset.direct);
      expect(portfolioLabel?.dataset.activityCount).toBe(
        row.dataset.portfolio,
      );
      expect(directLabel?.textContent?.replace(/\s+/g, " ")).toBe(
        `${row.dataset.direct} Direct`,
      );
      expect(portfolioLabel?.textContent?.replace(/\s+/g, " ")).toBe(
        `${row.dataset.portfolio} Portfolio`,
      );
      expect(directLabel?.querySelector("span")?.getAttribute("style"))
        .toContain(`color: ${DIRECT_ACTIVITY_COLOR}`);
      expect(portfolioLabel?.querySelector("span")?.getAttribute("style"))
        .toContain(`color: ${PORTFOLIO_ACTIVITY_LABEL_COLOR}`);
      expect(
        segments.some((segment) =>
          segment.querySelector("[data-activity-stack-label]")),
      ).toBe(false);
      for (const segment of segments) {
        expect(segment.getAttribute("height")).toBe("14");
        expect(segment.hasAttribute("bgcolor")).toBe(true);
        expect(segment.getAttribute("style")).toContain("background-color:");
      }
    }
  });

  it("uses the original leading-row scale rather than normalizing every row", () => {
    const markup = renderActivityChartBlock(chartInput);
    const parsed = new DOMParser().parseFromString(markup, "text/html");
    const sectorRows = Array.from(
      parsed.querySelectorAll<HTMLTableRowElement>(
        'table[data-activity-chart="sector"] tr[data-activity-row]',
      ),
    );

    expect(
      sectorRows.map((row) => [
        row.dataset.activityRow,
        Number(row.dataset.originalFill),
      ]),
    ).toEqual([
      ["Power & ET", 100],
      ["Digital", 50],
      ["Utilities", 1],
    ]);
  });

  it("uses explicit deterministic tie-breaks independent of caller order", () => {
    const sectorMarkup = renderActivityChartBlock({
      sector: [
        "Social Infra",
        "Utilities",
        "Power & ET",
        "Midstream",
        "Transportation",
        "Digital",
      ].map((label) => ({ label, direct: 1, portfolio: 1 })),
      region: [{ label: "North America", direct: 6, portfolio: 6 }],
    });
    const sectorDocument = new DOMParser().parseFromString(
      sectorMarkup,
      "text/html",
    );
    expect(
      Array.from(
        sectorDocument.querySelectorAll<HTMLTableRowElement>(
          'table[data-activity-chart="sector"] tr[data-activity-row]',
        ),
      ).map((row) => row.dataset.activityRow),
    ).toEqual([...SECTOR_ACTIVITY_TIE_BREAK_ORDER]);

    const regionMarkup = renderActivityChartBlock({
      sector: [{ label: "Power & ET", direct: 5, portfolio: 5 }],
      region: [
        "Middle East & Africa",
        "Latin America",
        "Europe",
        "Asia-Pacific",
        "North America",
      ].map((label) => ({ label, direct: 1, portfolio: 1 })),
    });
    const regionDocument = new DOMParser().parseFromString(
      regionMarkup,
      "text/html",
    );
    expect(
      Array.from(
        regionDocument.querySelectorAll<HTMLTableRowElement>(
          'table[data-activity-chart="region"] tr[data-activity-row]',
        ),
      ).map((row) => row.dataset.activityRow),
    ).toEqual([...REGION_ACTIVITY_TIE_BREAK_ORDER]);
  });

  it("replaces only the delimited chart block when the surrounding hash matches", () => {
    const source = `<html><body><p>Keep this exactly.</p>\n${CHART_BLOCK_START_MARKER}\n<old-chart />\n${CHART_BLOCK_END_MARKER}\n<footer>Also unchanged.</footer></body></html>`;
    const expectedNonChartSha256 = computeNonChartSha256(source);
    const chartMarkup = renderActivityChartBlock(chartInput);

    const result = replaceDelimitedChartBlock({
      sourceHtml: source,
      chartMarkup,
      expectedNonChartSha256,
    });

    expect(result.nonChartSha256).toBe(expectedNonChartSha256);
    expect(computeNonChartSha256(result.html)).toBe(expectedNonChartSha256);
    expect(result.html).toContain("<p>Keep this exactly.</p>");
    expect(result.html).toContain("<footer>Also unchanged.</footer>");
    expect(result.html).not.toContain("<old-chart />");
  });

  it("renders idempotent bytes and exposes chart tampering as a mismatch", () => {
    const source = `<html><body>${CHART_BLOCK_START_MARKER}<old />${CHART_BLOCK_END_MARKER}</body></html>`;
    const expectedNonChartSha256 = computeNonChartSha256(source);
    const rendered = renderDeterministicActivityEmail({
      sourceHtml: source,
      charts: chartInput,
      expectedNonChartSha256,
    }).html;
    expect(
      renderDeterministicActivityEmail({
        sourceHtml: rendered,
        charts: chartInput,
        expectedNonChartSha256,
      }).html,
    ).toBe(rendered);

    const tampered = rendered.replace('data-direct="80"', 'data-direct="79"');
    expect(tampered).not.toBe(rendered);
    expect(
      renderDeterministicActivityEmail({
        sourceHtml: tampered,
        charts: chartInput,
        expectedNonChartSha256,
      }).html,
    ).toBe(rendered);
  });

  it("fails closed for stale non-chart content or unsafe markup", () => {
    const source = `${CHART_BLOCK_START_MARKER}<old />${CHART_BLOCK_END_MARKER}`;
    const expectedNonChartSha256 = computeNonChartSha256(source);
    const edited = `Editorial change${source}`;

    expect(() =>
      replaceDelimitedChartBlock({
        sourceHtml: edited,
        chartMarkup: renderActivityChartBlock(chartInput),
        expectedNonChartSha256,
      }),
    ).toThrow("non-chart hash mismatch");

    expect(() =>
      assertOutlookSafeActivityChartMarkup(
        '<div data-activity-legend="true"><table data-activity-chart="sector"></table><table data-activity-chart="region"></table></div>',
      ),
    ).toThrow("not Outlook-safe");
  });

  it("rejects sector and region grand-total mismatches by constituent", () => {
    expect(() =>
      renderActivityChartBlock({
        sector: chartInput.sector,
        region: [{ label: "Europe", direct: 111, portfolio: 39 }],
      }),
    ).toThrow(
      "sector and region charts must reconcile to the same direct and portfolio grand totals",
    );
  });

  it("rejects invalid rows and ambiguous delimiters", () => {
    expect(() =>
      renderActivityChartBlock({
        sector: [{ label: "Digital", direct: 0, portfolio: 0 }],
        region: chartInput.region,
      }),
    ).toThrow("must contain at least one deal");

    expect(() =>
      computeNonChartSha256(
        `${CHART_BLOCK_START_MARKER}${CHART_BLOCK_START_MARKER}${CHART_BLOCK_END_MARKER}`,
      ),
    ).toThrow("exactly one delimited chart block");
  });
});
