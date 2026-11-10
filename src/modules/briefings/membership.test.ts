// @vitest-environment node
import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { parseIssue } from "../../../scripts/briefing-deals/archive";
import { hasVerifiedBriefingMembership } from "./membership";

const database = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { briefingIssue: database } }));

const edition = "2026-11-07";

describe("briefing deal membership", () => {
  it("requires the exact current archive hash, ordered card keys and published deal records", async () => {
    const html = await readFile(`public/email-format/${edition}.html`, "utf8");
    const archive = parseIssue(edition, html);
    const issue = {
      archivePath: archive.archivePath,
      contentHash: archive.contentHash,
      deals: archive.cards.map(({ key, position }) => ({
        cardKey: key,
        position,
        dealId: key,
        deal: { status: "PUBLISHED" },
      })),
    };

    database.findUnique.mockResolvedValueOnce(issue);
    await expect(hasVerifiedBriefingMembership(edition, html)).resolves.toBe(true);

    database.findUnique.mockResolvedValueOnce({ ...issue, contentHash: "stale" });
    await expect(hasVerifiedBriefingMembership(edition, html)).resolves.toBe(false);

    database.findUnique.mockResolvedValueOnce({ ...issue, deals: issue.deals.slice(1) });
    await expect(hasVerifiedBriefingMembership(edition, html)).resolves.toBe(false);

    const duplicateDeal = { ...issue.deals[0], dealId: issue.deals[1].dealId };
    database.findUnique.mockResolvedValueOnce({ ...issue, deals: [duplicateDeal, ...issue.deals.slice(1)] });
    await expect(hasVerifiedBriefingMembership(edition, html)).resolves.toBe(false);

    const unpublished = { ...issue.deals[0], deal: { status: "DRAFT" } };
    database.findUnique.mockResolvedValueOnce({ ...issue, deals: [unpublished, ...issue.deals.slice(1)] });
    await expect(hasVerifiedBriefingMembership(edition, html)).resolves.toBe(false);
  });
});
