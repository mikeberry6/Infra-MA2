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

  it("loads the finalized July 25–31 artifact without changing its editorial controls", async () => {
    const document = await loadWeeklyBriefingDocument({
      edition: "2026-07-31",
      basePath: "/Infra-MA2",
    });

    expect(document.sourceHref).toBe(
      "/Infra-MA2/email-format/2026-07-31.html",
    );
    expect(document.bodyMarkup.match(/data-scale-rank=/g)).toHaveLength(20);
    expect(document.bodyMarkup.match(/>Source<\/a>/g)).toHaveLength(20);
    expect(document.bodyMarkup).toContain("Power &amp; ET</td>");
    expect(document.bodyMarkup).toContain(">7 Deals</td>");
    expect(document.bodyMarkup).toContain(">149</td>");
    expect(document.bodyMarkup).toContain(">152</td>");
    expect(document.bodyMarkup).toContain(
      "Large-scale transactions set the pace",
    );
    expect(document.bodyMarkup).toContain("U.S. deployment included");
    expect(document.bodyMarkup).toContain(
      'href="/Infra-MA2/weekly-briefing?edition=2026-07-24"',
    );
  });

  it("sorts the current archive newest first", async () => {
    const editions = await listWeeklyBriefingEditions();
    expect(editions[0]).toBe("2026-07-31");
    expect(editions).toContain("2026-02-14");
  });
});
