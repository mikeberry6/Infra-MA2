import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortCoDrawer } from "@/components/PortfolioDatabase/PortCoDrawer";
import type { CompanyView, FundStrategyView } from "@/modules/shared/types";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

const company: CompanyView = {
  id: "company-1",
  focusIds: ["company-1"],
  name: "Northstar Fiber",
  investmentFirm: "Example Infrastructure Partners",
  sector: "Digital",
  subsector: "Fiber",
  region: "North America",
  country: "United States",
  countryTags: ["United States"],
  ownershipVehicle: "Example Infrastructure Fund III",
  description: "Northstar Fiber operates carrier-neutral fiber networks across regional markets.",
  status: "Active",
  headquarters: "Denver, Colorado",
  website: "https://example.test/northstar",
  investmentYear: 2023,
  owners: [{
    firm: "Example Infrastructure Partners",
    vehicle: "Example Infrastructure Fund III",
    fundName: "Example Infrastructure Fund III",
    investmentYear: 2023,
    isActive: true,
  }],
  sources: [{ label: "Company profile", url: "https://example.test/source" }],
  milestones: [
    { date: "1896", category: "Founding", event: "Northstar Fiber's predecessor was founded." },
    { date: "2019", category: "Expansion", event: "The network entered a second market." },
    { date: "2020", category: "Expansion", event: "A new metro ring entered service." },
    { date: "2021", category: "Management", event: "A chief operating officer joined." },
    { date: "2022", category: "Expansion", event: "The network expanded regionally." },
    {
      date: "2023",
      category: "Financing",
      event: "Example Infrastructure Partners made its initial investment.",
    },
    { date: "2024", category: "Acquisition", event: "Northstar acquired a local network." },
  ],
  management: [
    { name: "Alex Rivera", title: "Chief Executive Officer" },
    { name: "Morgan Lee", title: "President" },
    { name: "Casey Smith", title: "Vice President, Operations" },
  ],
};

const funds: FundStrategyView[] = [{
  fundName: "Example Infrastructure Fund III",
  strategies: ["Core-Plus", "Value-Add"],
}];

afterEach(() => cleanup());

describe("PortCo scorecard contract", () => {
  it("preserves the ambient header, section order, investment fields, and management filter", () => {
    const { container } = render(
      <PortCoDrawer company={company} funds={funds} onClose={vi.fn()} />,
    );

    const dialog = screen.getByRole("dialog", { name: "Northstar Fiber" });
    expect(dialog).toHaveClass("max-w-lg", "lg:max-w-xl", "xl:max-w-2xl", "bg-[#09090B]");
    const ambientOrbs = container.querySelectorAll<HTMLElement>(".animate-pulse-slow, .animate-pulse-slower");
    expect(ambientOrbs).toHaveLength(2);
    expect(ambientOrbs[0].style.opacity).toBe("0.1");
    expect(ambientOrbs[1].style.opacity).toBe("0.07");
    expect(screen.getByRole("link", { name: "Open Northstar Fiber website" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Company profile" })).toHaveClass("min-h-6", "py-1");

    const sectionHeadings = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
    expect(sectionHeadings).toEqual([
      "Investment Details",
      "Company Overview",
      "Historical Milestones",
      "Key Management",
    ]);

    const investment = screen.getByRole("heading", { name: "Investment Details" }).closest("section");
    expect(investment).not.toBeNull();
    const investmentView = within(investment!);
    for (const value of [
      "Firm",
      "Example Infrastructure Partners",
      "Fund",
      "Example Infrastructure Fund III",
      "Fund Strategy",
      "Core-Plus",
      "Value-Add",
      "Investment Date",
      "2023",
      "Sector",
      "Digital",
      "Subsector",
      "Fiber",
      "Location",
      "Denver, Colorado",
    ]) {
      expect(investmentView.getByText(value)).toBeVisible();
    }
    expect(investmentView.getByText("Core-Plus")).toHaveClass(
      "px-1.5",
      "py-0",
      "text-[10px]",
      "text-[#EDEDED]",
    );

    expect(screen.getByText("Alex Rivera")).toBeVisible();
    expect(screen.getByText("Morgan Lee")).toBeVisible();
    expect(screen.queryByText("Casey Smith")).not.toBeInTheDocument();
  });

  it("sorts milestones newest-first, highlights the initial investment, and initially limits the timeline to six", async () => {
    const user = userEvent.setup();
    render(<PortCoDrawer company={company} funds={funds} onClose={vi.fn()} />);

    const timeline = screen.getByRole("heading", { name: "Historical Milestones" }).closest("section");
    expect(timeline).not.toBeNull();
    const timelineView = within(timeline!);
    const renderedDates = timelineView.getAllByText(/^20\d{2}$/).map((node) => node.textContent);
    expect(renderedDates).toEqual(["2024", "2023", "2022", "2021", "2020", "2019"]);
    expect(timelineView.queryByText("1896")).not.toBeInTheDocument();

    const investmentCallout = timeline!.querySelector('[data-investment-milestone="true"]');
    expect(investmentCallout).not.toBeNull();
    const investmentTag = within(investmentCallout as HTMLElement).getByText("Investment");
    expect(investmentTag).toBeVisible();
    expect(investmentTag).toHaveClass("px-1.5", "py-0", "text-[10px]", "text-[#EDEDED]");

    await user.click(timelineView.getByRole("button", { name: "Show all 7 milestones" }));
    expect(timelineView.getByText("1896")).toBeVisible();
    expect(timelineView.getByRole("button", { name: "Show less" })).toBeVisible();
  });

  it("keeps lazy-detail failure and retry inside the labelled dialog", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(
      <PortCoDrawer
        company={{ ...company, description: "", milestones: [], management: [], sources: [] }}
        funds={funds}
        detailState="error"
        onRetry={retry}
        onClose={vi.fn()}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Latest detail could not be loaded. Showing the list record.");
    const retryButton = within(alert).getByRole("button", { name: "Retry" });
    expect(retryButton).toHaveClass("!text-[#FECACA]");
    await user.click(retryButton);
    expect(retry).toHaveBeenCalledOnce();
  });
});
