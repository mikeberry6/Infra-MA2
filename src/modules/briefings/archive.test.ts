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

  it("uses reconciled Outlook-safe absolute stacks for the reviewed week", async () => {
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
        ["Power & ET", 3, 4, 7],
        ["Digital", 4, 0, 4],
        ["Transportation", 3, 1, 4],
        ["Midstream", 2, 1, 3],
        ["Utilities", 2, 0, 2],
      ],
      [
        ["Europe", 6, 2, 8],
        ["North America", 4, 2, 6],
        ["Asia-Pacific", 3, 2, 5],
        ["Middle East & Africa", 1, 0, 1],
      ],
    ] as const;

    charts.forEach((chart, chartIndex) => {
      expect(chart.dataset.activityPeriod).toBe("2026-07-25/2026-07-31");
      expect(chart.textContent).toContain("Direct investment");
      expect(chart.textContent).toContain("Portfolio-level activity");
      expect(chart.textContent).not.toContain("YTD");
      expect(chart.querySelector("div, svg, script, [class]")).toBeNull();
      expect(chart.outerHTML).not.toMatch(
        /display:\s*(?:flex|grid)|var\(--|gradient|position:\s*absolute/i,
      );

      const rows = Array.from(
        chart.querySelectorAll<HTMLTableRowElement>("tr[data-activity-row]"),
      );
      const actualRows = rows.map((row) => [
        row.dataset.activityRow,
        Number(row.dataset.direct),
        Number(row.dataset.portfolio),
        Number(row.dataset.total),
      ]);
      expect(actualRows).toEqual(expectedRows[chartIndex]);

      const totals = rows.map((row) => Number(row.dataset.total));
      expect(totals).toEqual([...totals].sort((left, right) => right - left));
      const leaderTotal = Math.max(...totals);

      for (const row of rows) {
        const direct = Number(row.dataset.direct);
        const portfolio = Number(row.dataset.portfolio);
        const total = Number(row.dataset.total);
        expect(direct + portfolio).toBe(total);
        expect(row.textContent).toContain(
          `${direct} direct · ${portfolio} portfolio`,
        );

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
        const filledWidth = Math.round((total / leaderTotal) * 100);
        const directWidth = Math.round((direct / leaderTotal) * 100);
        expect(widths.get("direct") ?? 0).toBe(directWidth);
        expect(widths.get("portfolio") ?? 0).toBe(
          filledWidth - directWidth,
        );
        expect(widths.get("remainder") ?? 0).toBe(100 - filledWidth);
        expect(
          Array.from(widths.values()).reduce((sum, width) => sum + width, 0),
        ).toBe(100);
      }

      expect(
        rows.reduce((sum, row) => sum + Number(row.dataset.direct), 0),
      ).toBe(14);
      expect(
        rows.reduce((sum, row) => sum + Number(row.dataset.portfolio), 0),
      ).toBe(6);

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
    expect(editions[0]).toBe("2026-08-07");
    expect(editions).toContain("2026-02-14");
  });
});
