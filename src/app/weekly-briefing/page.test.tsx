import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listPublishedBriefingEditions } from "@/modules/briefings/publication";
import { hasVerifiedBriefingMembership } from "@/modules/briefings/membership";
import { getLatestDealDate } from "@/modules/deals/queries";
import WeeklyBriefingPage, { generateMetadata } from "./page";

// Next supplies React.cache to Server Components. Tests render the resulting JSX in jsdom.
vi.mock("react", async importActual => ({ ...await importActual<typeof import("react")>(), cache: (fn: unknown) => fn }));
vi.mock("@/modules/briefings/publication", () => ({ listPublishedBriefingEditions: vi.fn() }));
vi.mock("@/modules/briefings/membership", () => ({ hasVerifiedBriefingMembership: vi.fn() }));
vi.mock("@/modules/deals/queries", () => ({ getLatestDealDate: vi.fn() }));

const props = (edition?: string) => ({ searchParams: Promise.resolve({ edition }) });

describe("native weekly briefing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listPublishedBriefingEditions).mockResolvedValue(["2026-11-21", "2026-10-30"]);
    vi.mocked(hasVerifiedBriefingMembership).mockResolvedValue(false);
    vi.mocked(getLatestDealDate).mockResolvedValue(new Date("2026-10-29T00:00:00Z"));
  });

  it("renders the published issue and its two themes, original story links and YTD tables", async () => {
    const { container } = render(await WeeklyBriefingPage(props()));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Blackstone’s AWS data center deal leads the week");
    expect(screen.getByText(/US\$5bn in aggregate gross asset value/)).toBeInTheDocument();
    expect(screen.getByRole("figure")).toHaveTextContent("Ashburn, Virginia");
    expect(screen.getByRole("region", { name: "Key themes" }).querySelectorAll("p")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "AWS Data Center Campuses | Blackstone" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Source for AWS Data Center Campuses | Blackstone" })).toHaveAttribute("href", expect.stringMatching(/^https:/));
    expect(screen.getAllByRole("table")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "View email version" })).toHaveAttribute("href", "/email-format/latest");
    expect(screen.getByRole("link", { name: "Older edition" })).toHaveAttribute("href", "/weekly-briefing?edition=2026-10-30");
    expect(screen.getByRole("combobox", { name: "Published editions" })).toHaveValue("2026-11-21");
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("reads an explicit archive without a new cover and gates the filtered CTA on verified membership", async () => {
    vi.mocked(hasVerifiedBriefingMembership).mockResolvedValue(true);
    render(await WeeklyBriefingPage(props("2026-10-30")));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Infrastructure Sponsor M&A Activity");
    expect(screen.queryByRole("figure")).toBeNull();
    expect(screen.getByRole("link", { name: "Email for this edition" })).toHaveAttribute("href", "/email-format/2026-10-30.html");
    expect(screen.getByRole("link", { name: "Latest email version" })).toHaveAttribute("href", "/email-format/latest");
    expect(screen.getByRole("link", { name: "Newer edition" })).toHaveAttribute("href", "/weekly-briefing?edition=2026-11-21");
    expect(screen.getByRole("link", { name: "View these deals" })).toHaveAttribute("href", "/tracker?briefing=2026-10-30&via=briefing");
    expect(hasVerifiedBriefingMembership).toHaveBeenCalledWith(expect.objectContaining({ edition: "2026-10-30" }));
    expect(screen.getByText("Latest tracker disclosure")).toHaveTextContent("October 29, 2026");
    const metadata = await generateMetadata(props("2026-10-30"));
    expect(metadata.alternates?.canonical).toEqual(expect.stringMatching(/\/weekly-briefing\?edition=2026-10-30$/));
    expect(metadata.openGraph).toMatchObject({ type: "article" });
  });

  it("keeps editorial-only editions browseable without inventing a tracker date", async () => {
    vi.mocked(getLatestDealDate).mockResolvedValue(null);
    render(await WeeklyBriefingPage(props()));
    expect(screen.queryByRole("link", { name: "View these deals" })).toBeNull();
    expect(screen.getByRole("link", { name: "Browse all deals" })).toHaveAttribute("href", "/tracker");
    expect(screen.queryByText("Latest tracker disclosure")).toBeNull();
  });

  it("validates the latest published edition independently of newer archived files", async () => {
    vi.mocked(listPublishedBriefingEditions).mockResolvedValue(["2026-10-30", "2026-07-24"]);
    const { container } = render(await WeeklyBriefingPage(props()));
    expect(container.querySelector("article")).toHaveAttribute("data-briefing-edition", "2026-10-30");
    expect(within(screen.getByRole("combobox")).getAllByRole("option")).toHaveLength(2);
  });

  it("fails closed on invalid publication defaults while keeping existing dated bookmarks", async () => {
    vi.mocked(listPublishedBriefingEditions).mockRejectedValue(new Error("Invalid approval"));
    await expect(WeeklyBriefingPage(props())).rejects.toThrow("Invalid approval");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      render(await WeeklyBriefingPage(props("2026-07-24")));
      expect(screen.getByRole("link", { name: "Email for this edition" })).toHaveAttribute("href", "/email-format/2026-07-24.html");
      expect(screen.queryByRole("link", { name: "Latest email version" })).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });

  it("returns a 404 for unknown dates", async () => {
    await expect(WeeklyBriefingPage(props("1999-01-01"))).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });
});
