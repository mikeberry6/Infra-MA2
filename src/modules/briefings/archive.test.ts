import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractBodyMarkup,
  isWeeklyBriefingEdition,
  listWeeklyBriefingEditions,
  loadWeeklyBriefingDocument,
  rewriteBriefingArchiveLinks,
} from "./archive";

describe("weekly briefing archive", () => {
  it("accepts only canonical dated edition names", () => {
    expect(isWeeklyBriefingEdition("2026-07-31")).toBe(true);
    expect(isWeeklyBriefingEdition("../2026-07-31")).toBe(false);
    expect(isWeeklyBriefingEdition("2026-07-31.html")).toBe(false);
    expect(isWeeklyBriefingEdition("latest")).toBe(false);
  });

  it("extracts trusted body markup and rejects scripts", () => {
    expect(extractBodyMarkup("<html><body><p>Briefing</p></body></html>")).toBe(
      "<p>Briefing</p>",
    );
    expect(() =>
      extractBodyMarkup("<html><body><script>alert(1)</script></body></html>"),
    ).toThrow("unexpectedly contains a script");
  });

  it("rewrites archive navigation and asset links through the app base path", () => {
    const markup =
      '<a href="2026-07-24.html">Prior</a><img src="assets/photo.png" />';
    expect(rewriteBriefingArchiveLinks(markup, "/Infra-MA2")).toBe(
      '<a href="/Infra-MA2/weekly-briefing?edition=2026-07-24">Prior</a><img src="/Infra-MA2/email-format/assets/photo.png" />',
    );
  });

  it("loads the finalized July 25–31 artifact with only its chart block updated", async () => {
    const briefing = await loadWeeklyBriefingDocument({
      edition: "2026-07-31",
      basePath: "/Infra-MA2",
    });

    expect(briefing.sourceHref).toBe(
      "/Infra-MA2/email-format/2026-07-31.html",
    );
    expect(briefing.bodyMarkup.match(/data-scale-rank=/g)).toHaveLength(20);
    expect(briefing.bodyMarkup.match(/>Source<\/a>/g)).toHaveLength(20);
    expect(briefing.bodyMarkup).toContain("Power &amp; ET</td>");
    expect(briefing.bodyMarkup).toContain(">7 Deals</td>");
    expect(briefing.bodyMarkup).toContain(
      "Large-scale transactions set the pace",
    );
    expect(briefing.bodyMarkup).toContain("U.S. deployment included");
    expect(briefing.bodyMarkup).toContain(
      'href="/Infra-MA2/weekly-briefing?edition=2026-07-24"',
    );
  });

  it("preserves the published YTD controls in data-gated Outlook-safe stacks", async () => {
    const { bodyMarkup } = await loadWeeklyBriefingDocument({
      edition: "2026-07-31",
    });
    const parsed = new DOMParser().parseFromString(bodyMarkup, "text/html");
    const charts = Array.from(
      parsed.querySelectorAll<HTMLTableElement>("table[data-activity-chart]"),
    );

    expect(charts).toHaveLength(2);
    expect(charts.map((chart) => chart.dataset.activityChart)).toEqual([
      "sector",
      "region",
    ]);

    const expectedRows = [
      [
        ["Power & ET", 142, 3, 4, 149, 100],
        ["Digital", 67, 4, 0, 71, 48],
        ["Transportation", 64, 3, 1, 68, 46],
        ["Social Infra", 36, 0, 0, 36, 24],
        ["Utilities", 31, 2, 0, 33, 22],
        ["Midstream", 18, 2, 1, 21, 14],
      ],
      [
        ["North America", 146, 4, 2, 152, 100],
        ["Europe", 143, 6, 2, 151, 99],
        ["Asia-Pacific", 50, 3, 2, 55, 36],
        ["Latin America", 15, 0, 0, 15, 10],
        ["Middle East & Africa", 4, 1, 0, 5, 3],
      ],
    ] as const;

    expect(bodyMarkup.match(/Prior YTD \(scope pending\)/g)).toHaveLength(1);
    expect(bodyMarkup).toContain("Jul 25&#8211;31 direct");
    expect(bodyMarkup).toContain("Jul 25&#8211;31 portfolio");

    charts.forEach((chart, chartIndex) => {
      expect(chart.dataset.activityPeriod).toBe("2026-YTD");
      expect(chart.textContent).toContain("YTD");
      expect(chart.querySelector("div, svg, script, [class]")).toBeNull();
      expect(chart.outerHTML).not.toMatch(
        /display:\s*(?:flex|grid)|var\(--|gradient|position:\s*absolute/i,
      );

      const rows = Array.from(
        chart.querySelectorAll<HTMLTableRowElement>("tr[data-activity-row]"),
      );
      const actualRows = rows.map((row) => [
        row.dataset.activityRow,
        Number(row.dataset.pending),
        Number(row.dataset.direct),
        Number(row.dataset.portfolio),
        Number(row.dataset.total),
        Number(row.dataset.originalFill),
      ]);
      expect(actualRows).toEqual(expectedRows[chartIndex]);

      const totals = rows.map((row) => Number(row.dataset.total));
      expect(totals).toEqual([...totals].sort((left, right) => right - left));

      for (const row of rows) {
        const pending = Number(row.dataset.pending);
        const direct = Number(row.dataset.direct);
        const portfolio = Number(row.dataset.portfolio);
        const total = Number(row.dataset.total);
        const originalFill = Number(row.dataset.originalFill);
        expect(pending + direct + portfolio).toBe(total);

        const widths = new Map(
          Array.from(
            row.querySelectorAll<HTMLTableCellElement>(
              "td[data-activity-segment]",
            ),
          ).map((segment) => [
            segment.dataset.activitySegment,
            Number(segment.getAttribute("width")?.replace("%", "")),
          ]),
        );
        const filledWidth =
          (widths.get("pending") ?? 0) +
          (widths.get("direct") ?? 0) +
          (widths.get("portfolio") ?? 0);
        expect(filledWidth).toBe(originalFill);
        expect(widths.get("remainder") ?? 0).toBe(100 - originalFill);
        expect(widths.has("pending")).toBe(pending > 0);
        expect(widths.has("direct")).toBe(direct > 0);
        expect(widths.has("portfolio")).toBe(portfolio > 0);
        expect(
          Array.from(widths.values()).reduce((sum, width) => sum + width, 0),
        ).toBe(100);
      }

      expect(
        rows.reduce((sum, row) => sum + Number(row.dataset.pending), 0),
      ).toBe(358);
      expect(
        rows.reduce((sum, row) => sum + Number(row.dataset.direct), 0),
      ).toBe(14);
      expect(
        rows.reduce((sum, row) => sum + Number(row.dataset.portfolio), 0),
      ).toBe(6);
      expect(
        rows.reduce((sum, row) => sum + Number(row.dataset.total), 0),
      ).toBe(378);

      for (const table of [chart, ...chart.querySelectorAll("table")]) {
        expect(table.getAttribute("role")).toBe("presentation");
        expect(table.getAttribute("cellpadding")).toBe("0");
        expect(table.getAttribute("cellspacing")).toBe("0");
      }
      for (const segment of chart.querySelectorAll<HTMLTableCellElement>(
        "td[data-activity-segment]",
      )) {
        expect(segment.hasAttribute("width")).toBe(true);
        expect(segment.getAttribute("height")).toBe("14");
        expect(segment.hasAttribute("bgcolor")).toBe(true);
        expect(segment.getAttribute("style")).toContain("background-color:");
      }
    });
  });

  it("preserves every byte outside the historical chart section", async () => {
    const markup = await readFile(
      path.join(
        process.cwd(),
        "public",
        "email-format",
        "2026-07-31.html",
      ),
      "utf8",
    );
    const outsideCharts = markup.replace(
      /<!-- YTD STATS -->[\s\S]*?<!-- FOOTER -->/,
      "<!-- YTD STATS OMITTED --><!-- FOOTER -->",
    );

    expect(outsideCharts).not.toBe(markup);
    expect(
      createHash("sha256").update(outsideCharts).digest("hex"),
    ).toBe("0d7dc03d29afbe2fc9b74900be59cc553635069d3de8c9c36029498cb22f94e8");
  });

  it("sorts the current archive newest first", async () => {
    const editions = await listWeeklyBriefingEditions();
    expect(editions[0]).toBe("2026-08-14");
    expect(editions).toContain("2026-02-14");
  });
});
