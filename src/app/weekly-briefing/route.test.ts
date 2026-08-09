import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const archive = vi.hoisted(() => ({
  listWeeklyBriefingEditions: vi.fn(),
}));

vi.mock("@/modules/briefings/archive", () => archive);

import { GET } from "./route";

const originalBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

describe("weekly briefing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_PATH = "/Infra-MA2";
    archive.listWeeklyBriefingEditions.mockResolvedValue([
      "2026-08-07",
      "2026-07-31",
      "2026-07-24",
    ]);
  });

  afterAll(() => {
    if (originalBasePath === undefined) {
      delete process.env.NEXT_PUBLIC_BASE_PATH;
    } else {
      process.env.NEXT_PUBLIC_BASE_PATH = originalBasePath;
    }
  });

  it("locks the default briefing button to the finalized July 31 email", async () => {
    const response = await GET(
      new Request("https://example.com/Infra-MA2/weekly-briefing"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.com/Infra-MA2/email-format/2026-07-31.html",
    );
  });

  it("redirects an explicitly requested archived edition to its raw email", async () => {
    const response = await GET(
      new Request(
        "https://example.com/Infra-MA2/weekly-briefing?edition=2026-07-24",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://example.com/Infra-MA2/email-format/2026-07-24.html",
    );
  });

  it("returns 404 for an unknown edition", async () => {
    const response = await GET(
      new Request(
        "https://example.com/Infra-MA2/weekly-briefing?edition=2026-06-19",
      ),
    );

    expect(response.status).toBe(404);
  });
});
