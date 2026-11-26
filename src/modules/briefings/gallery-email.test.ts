// @vitest-environment node
import { readFileSync } from "node:fs";
import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";
import { parseEditorialBriefing } from "./editorial";
import { readGalleryEmailExtras, renderGalleryEmail, type GalleryLayout } from "./gallery-email";

const origin = "https://briefings.example";
const layouts: GalleryLayout[] = ["executive", "digest", "research"];
const clean = (text: string | null) => (text ?? "").replace(/\s+/g, " ").trim();

function load(edition: string) {
  const html = readFileSync(`public/email-format/${edition}.html`, "utf8");
  return { issue: parseEditorialBriefing(edition, html), extras: readGalleryEmailExtras(html, origin) };
}

describe.each(["2026-11-21", "2026-07-31", "2026-05-09"])("email layouts for %s", (date) => {
  const { issue, extras } = load(date);
  it.each(layouts)("%s preserves the original stories, theme emphasis, chart values, legend and destinations", (layout) => {
    const html = renderGalleryEmail(issue, layout, origin, extras);
    const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
    const root = document.body.firstElementChild!;
    expect(root.tagName).toBe("TABLE");
    expect(root.getAttribute("width")).toBe("600");
    expect(root.getAttribute("data-email-layout")).toBe(layout);
    expect(root.querySelector("img, script, style, button, svg, iframe")).toBeNull();
    const groups = Array.from(root.querySelectorAll("[data-weekly-sector]"));
    expect(groups.map((el) => el.getAttribute("data-weekly-sector"))).toEqual([...new Set(issue.cards.map((c) => c.sector || "Other infrastructure"))]);
    for (const group of groups) expect(group.getAttribute("style")).toContain("border:1px solid");
    const stories = Array.from(root.querySelectorAll("[data-deal-id]"));
    expect(stories.map((el) => el.getAttribute("data-deal-id"))).toEqual(issue.cards.map((c) => c.key));
    expect(stories.length).toBe(date === "2026-11-21" ? 14 : issue.cards.length);
    for (const [i, story] of stories.entries()) {
      const card = issue.cards[i];
      expect(story.querySelector("h3")?.textContent).toBe(card.title);
      expect(Array.from(story.querySelectorAll("p")).map((p) => p.textContent).slice(0, 2)).toEqual([card.metadata, card.description]);
      expect(story.querySelector("a")?.getAttribute("href") ?? "").toBe(card.sourceUrl ? new URL(card.sourceUrl, origin).href : "");
    }
    const emphasis = Array.from(root.querySelectorAll("strong")).map((el) => el.textContent);
    expect(emphasis).toEqual(issue.themes.flat().filter((r) => r.bold).map((r) => r.text));
    for (const theme of issue.themes) expect(clean(root.textContent)).toContain(clean(theme.map((r) => r.text).join("")));
    for (const kind of ["sector", "region"] as const) {
      const rows = Array.from(root.querySelectorAll(`[data-activity-chart="${kind}"] [data-activity-row]`));
      expect(rows.map((r) => r.getAttribute("data-activity-row"))).toEqual(issue.charts[kind].map((r) => r.label));
      rows.forEach((row, i) => {
        const data = issue.charts[kind][i];
        expect(Number(row.lastElementChild?.textContent)).toBe(data.total);
        for (const key of ["direct", "portfolio", "pending"] as const) {
          const count = row.querySelector(`[data-activity-stack-label="${key}"]`);
          if (data[key] === null) expect(count).toBeNull();
          else expect(count?.getAttribute("data-activity-count")).toBe(String(data[key]));
        }
        const widths = Array.from(row.querySelectorAll("[data-activity-segment]")).map((seg) => parseFloat(seg.getAttribute("width")!));
        expect(widths.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 3);
      });
    }
    for (const label of extras.legend) expect(root.querySelector("[data-activity-legend]")?.textContent).toContain(label);
    const archived = parseHTML(readFileSync(`public/email-format/${date}.html`, "utf8")).document;
    const links = Array.from(root.querySelectorAll("a"), (a) => a.getAttribute("href"));
    for (const link of Array.from(archived.querySelectorAll("a[href]"))) {
      const href = link.getAttribute("href")!;
      if (href !== "#") expect(links).toContain(new URL(href, `${origin}/email-format/`).href);
    }
  });
});

it("renders the single-table July 17 footer only once", () => {
  const { issue, extras } = load("2026-07-17");
  const { document } = parseHTML(renderGalleryEmail(issue, "digest", origin, extras));
  expect(document.documentElement.textContent?.match(/This briefing tracks/g)).toHaveLength(1);
  expect(document.querySelectorAll('a[href^="mailto:"]')).toHaveLength(1);
});

it("escapes published text and omits an unusable source", () => {
  const { issue } = load("2026-11-21");
  const changed = { ...issue, cards: [{ ...issue.cards[0], title: "Target <Co> | A&B", sourceUrl: "javascript:void(0)" }] };
  const { document } = parseHTML(renderGalleryEmail(changed, "executive", origin));
  const card = document.querySelector("[data-deal-id]")!;
  expect(card.querySelector("h3")?.textContent).toBe("Target <Co> | A&B");
  expect(card.querySelector("a,co")).toBeNull();
});
