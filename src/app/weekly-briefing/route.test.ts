import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const archive = vi.hoisted(() => ({
  listWeeklyBriefingEditions: vi.fn(),
  loadWeeklyBriefingDocument: vi.fn(),
}));
const publication = vi.hoisted(() => ({
  listPublishedBriefingEditions: vi.fn(),
}));
const membership = vi.hoisted(() => ({
  hasVerifiedBriefingMembership: vi.fn(),
}));

vi.mock("@/modules/briefings/archive", () => archive);
vi.mock("@/modules/briefings/publication", () => publication);
vi.mock("@/modules/briefings/membership", () => membership);

import { GET } from "./route";

const originalBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

describe("weekly briefing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    archive.loadWeeklyBriefingDocument.mockResolvedValue({ bodyMarkup: "<p>Briefing content</p>", headStyles: "<style>p{color:purple}</style>" });
    process.env.NEXT_PUBLIC_BASE_PATH = "/Infra-MA2";
    archive.listWeeklyBriefingEditions.mockResolvedValue([
      "2026-08-07",
      "2026-07-31",
      "2026-07-24",
    ]);
    publication.listPublishedBriefingEditions.mockResolvedValue(["2026-07-31", "2026-07-24"]);
    membership.hasVerifiedBriefingMembership.mockResolvedValue(false);
  });

  afterAll(() => {
    if (originalBasePath === undefined) {
      delete process.env.NEXT_PUBLIC_BASE_PATH;
    } else {
      process.env.NEXT_PUBLIC_BASE_PATH = originalBasePath;
    }
  });

  it("uses the latest approved edition without advancing to a newer HTML file", async () => {
    const response = await GET(
      new Request("https://example.com/Infra-MA2/weekly-briefing"),
    );

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("/Infra-MA2/email-format/2026-07-31.html");
    expect(html).toContain('<option value="2026-07-31" selected>');
    expect(html).toContain('href="/Infra-MA2/weekly-briefing?edition=2026-07-24">Older edition');
    expect(html).not.toContain('<option value="2026-08-07">');
    expect(publication.listPublishedBriefingEditions).toHaveBeenCalledWith([
      "2026-08-07", "2026-07-31", "2026-07-24",
    ]);
  });

  it("advances when the approved index advances", async () => {
    publication.listPublishedBriefingEditions.mockResolvedValue(["2026-08-07", "2026-07-31"]);

    const response = await GET(
      new Request("https://example.com/Infra-MA2/weekly-briefing"),
    );

    expect(await response.text()).toContain(
      "/Infra-MA2/email-format/2026-08-07.html",
    );
  });

  it("frames an explicitly requested archive without modifying the email", async () => {
    const response = await GET(
      new Request(
        "https://example.com/Infra-MA2/weekly-briefing?edition=2026-07-24",
      ),
    );

    expect(await response.text()).toContain(
      "/Infra-MA2/email-format/2026-07-24.html",
    );
  });

  it("links to issue-filtered deals through the configured base path", async () => {
    membership.hasVerifiedBriefingMembership.mockResolvedValue(true);
    const response = await GET(new Request("https://example.com/Infra-MA2/weekly-briefing?edition=2026-07-24"));
    const html = await response.text();
    expect(html).toContain('href="/Infra-MA2/tracker?briefing=2026-07-24&amp;via=briefing"');
    expect(html).toContain("View these deals");
    expect(html).toContain("srcdoc=");
    expect(html).toContain("Briefing content");
    expect(html).toContain('sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"');
  });

  it("labels the edition editorial-only without verified deal membership", async () => {
    const response = await GET(new Request("https://example.com/Infra-MA2/weekly-briefing?edition=2026-07-24"));
    const html = await response.text();
    expect(html).toContain("Editorial edition · deal list unavailable");
    expect(html).not.toContain("/tracker?briefing=");
  });

  it("returns 404 for an unknown edition", async () => {
    const response = await GET(
      new Request(
        "https://example.com/Infra-MA2/weekly-briefing?edition=2026-06-19",
      ),
    );

    expect(response.status).toBe(404);
  });

  it("fails closed when the approval index cannot be validated", async () => {
    publication.listPublishedBriefingEditions.mockRejectedValue(
      new Error("stale approval"),
    );

    const response = await GET(
      new Request("https://example.com/Infra-MA2/weekly-briefing"),
    );

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe(
      "Weekly briefing approval index is invalid",
    );
  });
});
