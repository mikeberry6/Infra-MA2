// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET as getLatestEmail } from "@/app/email-format/latest/route";
import { NextRequest } from "next/server";
import { listWeeklyBriefingEditions } from "./archive";
import { getLatestPublishedBriefingEdition, listPublishedBriefingEditions } from "./publication";

describe("weekly briefing publication", () => {
  it("uses the finalized editorial inventory beyond the older chart-workflow approval", async () => {
    const latest = await getLatestPublishedBriefingEdition();
    expect(await listPublishedBriefingEditions()).toContain("2026-11-07");
    expect(latest >= "2026-11-07").toBe(true);

    const response = await getLatestEmail(new NextRequest("https://example.test/email-format/latest"));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!, "https://example.test").pathname).toMatch(
      new RegExp(`/email-format/${latest}\\.html$`),
    );
  });

  it("does not advance for an unlisted HTML edition", async () => {
    const editions = await listWeeklyBriefingEditions();
    const published = await listPublishedBriefingEditions(["2099-12-31", ...editions]);
    expect(published[0]).toBe(await getLatestPublishedBriefingEdition());
    expect(published).not.toContain("2099-12-31");
  });

  it("fails closed if the finalized issue is absent", async () => {
    const editions = await listWeeklyBriefingEditions();
    await expect(listPublishedBriefingEditions(editions.filter((edition) => edition !== "2026-11-07")))
      .rejects.toThrow("missing from the archive");
  });
});
