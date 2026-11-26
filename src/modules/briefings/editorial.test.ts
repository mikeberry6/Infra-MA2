// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";
import { type Issue, sourceKey } from "../../../scripts/briefing-deals/archive";
import { parseEditorialBriefing } from "./editorial";

const inventory: { issues: Issue[] } = JSON.parse(readFileSync("audits/briefing-deals/archive.json", "utf8"));
const clean = (text: string | null) => (text ?? "").replace(/\s+/g, " ").trim();

describe("editorial presentation matches each original dated email", () => {
  it.each(inventory.issues)("$edition", (published) => {
    const html = readFileSync(path.join("public", published.archivePath), "utf8");
    const { document } = parseHTML(html);
    const { cards, themes, charts, title, ...identity } = parseEditorialBriefing(published.edition, html);

    expect(title).toBe(document.querySelector("title")!.textContent!.trim());
    // The inventory pins the approved paragraphs, coverage dates, hash and editorial ordering.
    const inventoryCards = cards.map(({ authoredFact, ...card }) => {
      if (authoredFact) expect(card.description).toContain(authoredFact);
      return { ...card, sourceUrl: sourceKey(card.sourceUrl) };
    });
    expect({ ...identity, cards: inventoryCards }).toEqual(published);
    const publishedSources = Array.from(document.querySelectorAll("a"))
      .filter((link) => clean(link.textContent) === "Source")
      .map((link) => link.getAttribute("href"));
    expect(cards.map((card) => card.sourceUrl)).toEqual(publishedSources.map((url) => url === "#" ? "" : url));

    const themeLabel = Array.from(document.querySelectorAll("div")).find((div) => clean(div.textContent) === "KEY THEMES");
    const themeBox = themeLabel!.nextElementSibling!;
    const themeCells = Array.from(themeBox.querySelectorAll("td"));
    const paragraphs = themeCells.length ? themeCells : [themeBox];
    expect(themes.map((runs) => clean(runs.map((run) => run.text).join(""))))
      .toEqual(paragraphs.map((paragraph) => clean(paragraph.textContent)));
    for (const [index, paragraph] of paragraphs.entries()) {
      const emphasized = Array.from(paragraph.querySelectorAll("strong, b, span"))
        .filter((el) => el.matches("strong, b") || /font-weight:\s*700/.test(el.getAttribute("style") ?? ""));
      expect(clean(themes[index].filter((run) => run.bold).map((run) => run.text).join("")))
        .toBe(clean(emphasized.map((el) => el.textContent).join("")));
    }

    for (const kind of ["sector", "region"] as const) {
      const title = `deal count by ${kind} (ytd)`;
      const heading = Array.from(document.querySelectorAll("td")).find((cell) => clean(cell.textContent).toLowerCase() === title);
      const chart = heading!.closest("table")!;
      const publishedCounts = Array.from(chart.querySelectorAll("td:last-child"))
        .filter((cell) => /^\d+$/.test(clean(cell.textContent)));
      expect(charts[kind].length).toBeGreaterThan(0);
      expect(charts[kind]).toEqual(publishedCounts.map((cell) => {
        const row = cell.parentElement!;
        const series = (key: string) => row.hasAttribute(key) ? Number(row.getAttribute(key)) : null;
        return {
          label: clean(row.firstElementChild!.textContent),
          total: Number(clean(cell.textContent)),
          direct: series("data-direct"),
          portfolio: series("data-portfolio"),
          pending: series("data-pending"),
        };
      }));
    }
  });
});
